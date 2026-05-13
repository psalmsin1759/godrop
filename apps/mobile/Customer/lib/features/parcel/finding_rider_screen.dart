import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/common_models.dart';
import '../../shared/models/delivery_models.dart';
import '../../shared/models/order_models.dart';
import 'models/parcel_location.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../orders/models/active_order.dart';
import '../orders/bloc/order_cubit.dart';

enum _Phase { placing, searching, riderFound, error }

class FindingRiderScreen extends StatefulWidget {
  final ParcelRouteData? routeData;
  const FindingRiderScreen({super.key, this.routeData});

  @override
  State<FindingRiderScreen> createState() => _FindingRiderScreenState();
}

class _FindingRiderScreenState extends State<FindingRiderScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _shimmer;
  _Phase _phase = _Phase.placing;
  String? _orderId;
  Map<String, dynamic>? _riderData;
  String? _errorMessage;
  WebSocketChannel? _channel;
  StreamSubscription? _wsSub;
  StreamSubscription? _fcmSub;
  Timer? _pollTimer;
  String? _confirmationCode;
  bool _cancelling = false;

  String get _vehicleLabel {
    final label = widget.routeData?.vehicleLabel ?? '';
    return label.isNotEmpty ? '$label delivery' : 'Parcel delivery';
  }

  String get _vehicleType => widget.routeData?.vehicleLabel ?? 'Parcel';

  String get _displayPrice {
    final kobo = widget.routeData?.quotedTotalKobo;
    if (kobo == null) return '';
    final naira = kobo / 100;
    final formatted = naira.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]},',
        );
    return '₦$formatted';
  }

  ParcelLocation get _pickup =>
      widget.routeData?.pickup ??
      const ParcelLocation(lat: 6.4524, lng: 3.4754, name: 'Lekki Phase 1');

  ParcelLocation get _dropoff =>
      widget.routeData?.dropoff ??
      const ParcelLocation(lat: 6.4281, lng: 3.4219, name: 'Victoria Island');

  double get _distanceKm {
    const r = 6371.0;
    final dLat = (_dropoff.lat - _pickup.lat) * pi / 180;
    final dLng = (_dropoff.lng - _pickup.lng) * pi / 180;
    final sinDLat = sin(dLat / 2);
    final sinDLng = sin(dLng / 2);
    final a = sinDLat * sinDLat +
        cos(_pickup.lat * pi / 180) *
            cos(_dropoff.lat * pi / 180) *
            sinDLng *
            sinDLng;
    return r * 2 * atan2(sqrt(a), sqrt(1 - a));
  }

  Set<Marker> get _markers => {
        Marker(
          markerId: const MarkerId('pickup'),
          position: LatLng(_pickup.lat, _pickup.lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        ),
        Marker(
          markerId: const MarkerId('dropoff'),
          position: LatLng(_dropoff.lat, _dropoff.lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        ),
      };

  Set<Polyline> get _polylines => {
        Polyline(
          polylineId: const PolylineId('route'),
          points: [
            LatLng(_pickup.lat, _pickup.lng),
            LatLng(_dropoff.lat, _dropoff.lng),
          ],
          color: GodropColors.blue,
          width: 4,
          patterns: [PatternItem.dash(20), PatternItem.gap(10)],
        ),
      };

  void _onMapCreated(GoogleMapController ctrl) {
    final minLat = min(_pickup.lat, _dropoff.lat);
    final maxLat = max(_pickup.lat, _dropoff.lat);
    final minLng = min(_pickup.lng, _dropoff.lng);
    final maxLng = max(_pickup.lng, _dropoff.lng);
    ctrl.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat - 0.01, minLng - 0.01),
          northeast: LatLng(maxLat + 0.01, maxLng + 0.01),
        ),
        80,
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _shimmer = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _placeOrder();
  }

  @override
  void dispose() {
    _shimmer.dispose();
    _wsSub?.cancel();
    _channel?.sink.close();
    _pollTimer?.cancel();
    _fcmSub?.cancel();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    try {
      final service = ParcelService(DioClient.instance);
      final routeData = widget.routeData;
      final response = await service.placeOrder(ParcelOrderBody(
        pickup: LocationPoint(
          lat: _pickup.lat,
          lng: _pickup.lng,
          address: _pickup.name,
        ),
        dropoff: LocationPoint(
          lat: _dropoff.lat,
          lng: _dropoff.lng,
          address: _dropoff.name,
        ),
        vehicleTypeId: routeData?.vehicleTypeId,
        packageDescription:
            routeData?.packageDescription.isNotEmpty == true
                ? routeData!.packageDescription
                : 'Parcel delivery',
        paymentMethod: routeData?.paymentMethod ?? 'cash',
        recipientName: routeData?.recipientName.isNotEmpty == true
            ? routeData!.recipientName
            : 'Recipient',
        recipientPhone: routeData?.recipientPhone.isNotEmpty == true
            ? routeData!.recipientPhone
            : '+234',
      ));

      if (!mounted) return;
      final orderId = response.order['id'] as String?;
      _confirmationCode = response.order['confirmationCode'] as String?;
      if (orderId == null) {
        setState(() {
          _phase = _Phase.error;
          _errorMessage = 'Failed to place order. Please try again.';
        });
        return;
      }

      setState(() {
        _orderId = orderId;
        _phase = _Phase.searching;
      });
      _connectWebSocket();
    } on DioException catch (e) {
      if (!mounted) return;
      setState(() {
        _phase = _Phase.error;
        _errorMessage = _parseDioError(e);
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _phase = _Phase.error;
        _errorMessage = 'Failed to place order. Please try again.';
      });
    }
  }

  static Uri _wsUri(String orderId) {
    if (kDebugMode) {
      final host = Platform.isAndroid ? '10.0.2.2' : 'localhost';
      return Uri.parse('ws://$host:4000/ws/orders/$orderId/tracking');
    }
    return Uri.parse('wss://godrop-production.up.railway.app/ws/orders/$orderId/tracking');
  }

  void _connectWebSocket() {
    final orderId = _orderId!;
    debugPrint('[WS/Customer] Connecting to ${_wsUri(orderId)}');
    _channel = WebSocketChannel.connect(_wsUri(orderId));
    _wsSub = _channel!.stream.listen(
      _onWsMessage,
      onError: (e) {
        debugPrint('[WS/Customer] Error: $e');
        if (mounted && _phase == _Phase.searching) _checkOrderStatus();
      },
      onDone: () {
        debugPrint('[WS/Customer] Connection closed');
        if (mounted && _phase == _Phase.searching) _checkOrderStatus();
      },
    );
    _startPolling();
    _listenFcm();
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (_phase == _Phase.searching) {
        debugPrint('[FindingRider] Poll check for order $_orderId');
        _checkOrderStatus();
      } else {
        _pollTimer?.cancel();
      }
    });
  }

  void _listenFcm() {
    _fcmSub?.cancel();
    _fcmSub = FirebaseMessaging.onMessage.listen((message) {
      final type = message.data['type'];
      debugPrint('[PUSH/Customer] FindingRider received | type=$type');
      if (type == 'ORDER_ACCEPTED' && mounted && _phase == _Phase.searching) {
        _checkOrderStatus();
      }
    });
  }

  void _onWsMessage(dynamic raw) {
    if (!mounted || _phase != _Phase.searching) return;
    final Map<String, dynamic> msg;
    try {
      msg = jsonDecode(raw as String) as Map<String, dynamic>;
    } catch (_) { return; }

    final type = msg['type'] as String?;
    final status = msg['status'] as String?;
    debugPrint('[WS/Customer] Message | type=$type | status=$status');

    if (type != 'STATUS_UPDATE') return;

    if (status == 'ACCEPTED') {
      _stopSearch();
      setState(() {
        _riderData = msg['rider'] as Map<String, dynamic>? ?? {};
        _phase = _Phase.riderFound;
      });
    } else if (status == 'CANCELLED' || status == 'FAILED') {
      _stopSearch();
      setState(() {
        _phase = _Phase.error;
        _errorMessage = 'The order could not be fulfilled. Please try again.';
      });
    }
  }

  void _stopSearch() {
    _pollTimer?.cancel();
    _fcmSub?.cancel();
    _wsSub?.cancel();
    _channel?.sink.close();
  }

  Future<void> _checkOrderStatus() async {
    final orderId = _orderId;
    if (orderId == null || _phase != _Phase.searching) return;
    try {
      final service = OrdersService(DioClient.instance);
      final response = await service.getOrder(orderId);
      if (!mounted || _phase != _Phase.searching) return;

      final status = response.order.status;
      final rider = response.rider;
      debugPrint('[FindingRider] Poll result | status=$status | hasRider=${rider != null}');

      if (status == 'ACCEPTED' && rider != null) {
        _stopSearch();
        setState(() {
          _riderData = rider;
          _phase = _Phase.riderFound;
        });
      } else if (status == 'CANCELLED' || status == 'FAILED') {
        _stopSearch();
        setState(() {
          _phase = _Phase.error;
          _errorMessage = 'The order could not be fulfilled. Please try again.';
        });
      }
    } catch (e) {
      debugPrint('[FindingRider] Poll error: $e');
      // transient — keep polling
    }
  }

  Future<void> _cancelOrder() async {
    if (_cancelling) return;
    setState(() => _cancelling = true);
    _stopSearch();

    final orderId = _orderId;
    if (orderId != null) {
      try {
        final service = OrdersService(DioClient.instance);
        await service.cancelOrder(orderId, const CancelOrderBody(reason: 'Customer cancelled'));
      } catch (_) {}
    }

    if (!mounted) return;
    context.go('/home');
  }

  void _onTrackOrder() {
    final rider = _riderData!;
    final firstName = rider['firstName'] as String? ?? '';
    final lastName = rider['lastName'] as String? ?? '';
    final phone = rider['phone'] as String? ?? '';
    final name = '$firstName $lastName'.trim();

    final order = ActiveOrderData(
      riderName: name.isEmpty ? 'Your Rider' : name,
      riderRating: 0.0,
      riderTrips: 0,
      riderVehicleNo: phone,
      riderDistance: '',
      pickup: _pickup,
      dropoff: _dropoff,
      vehicleIndex: 0,
      confirmationCode: _confirmationCode,
    );
    context.read<OrderCubit>().placeOrder(order);
    context.go('/orders');
  }

  String _parseDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final msg = data['error'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return 'Something went wrong. Please try again.';
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Stack(
        children: [
          // Full-screen map
          Positioned.fill(
            child: GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(
                  (_pickup.lat + _dropoff.lat) / 2,
                  (_pickup.lng + _dropoff.lng) / 2,
                ),
                zoom: 12,
              ),
              onMapCreated: _onMapCreated,
              markers: _markers,
              polylines: _polylines,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
            ),
          ),
          // Top status card
          Positioned(
            top: topPad + 12,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Row(
                children: [
                  _buildStatusDot(),
                  const SizedBox(width: 12),
                  Expanded(child: _buildStatusText()),
                ],
              ),
            ),
          ),
          // Bottom card
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPad + 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildOrderSummaryRow(),
                  const SizedBox(height: 16),
                  _buildBottomContent(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusDot() {
    if (_phase == _Phase.riderFound) {
      return Container(
        width: 8,
        height: 8,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: GodropColors.success,
        ),
      );
    }
    if (_phase == _Phase.error) {
      return Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.red.shade600,
        ),
      );
    }
    return AnimatedBuilder(
      animation: _shimmer,
      builder: (_, __) => Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Color.lerp(
            GodropColors.blue,
            GodropColors.orange,
            _shimmer.value,
          )!,
        ),
      ),
    );
  }

  Widget _buildStatusText() {
    switch (_phase) {
      case _Phase.placing:
        return const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Placing your order...',
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink,
                  fontSize: 15),
            ),
            Text(
              'Just a moment',
              style: TextStyle(fontSize: 12, color: GodropColors.slate),
            ),
          ],
        );
      case _Phase.searching:
        return const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Finding the nearest rider...',
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink,
                  fontSize: 15),
            ),
            Text(
              'Notifying riders nearby · Usually under 30s',
              style: TextStyle(fontSize: 12, color: GodropColors.slate),
            ),
          ],
        );
      case _Phase.riderFound:
        return const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Rider found!',
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink,
                  fontSize: 15),
            ),
            Text(
              'Your rider is on the way',
              style: TextStyle(fontSize: 12, color: GodropColors.slate),
            ),
          ],
        );
      case _Phase.error:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Something went wrong',
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink,
                  fontSize: 15),
            ),
            Text(
              _errorMessage ?? 'Please try again.',
              style: const TextStyle(fontSize: 12, color: GodropColors.slate),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        );
    }
  }

  Widget _buildOrderSummaryRow() {
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: GodropColors.blue,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(
            Icons.inventory_2_rounded,
            color: Colors.white,
            size: 22,
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _displayPrice.isNotEmpty
                    ? '$_vehicleLabel · $_displayPrice'
                    : _vehicleLabel,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink,
                  fontSize: 15,
                ),
              ),
              Text(
                '${_pickup.name.split(',').first} → ${_dropoff.name.split(',').first} · ${_distanceKm.toStringAsFixed(1)} km',
                style: const TextStyle(fontSize: 12, color: GodropColors.slate),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBottomContent() {
    switch (_phase) {
      case _Phase.placing:
        return Column(
          children: [
            const Divider(height: 1, color: GodropColors.divider),
            const SizedBox(height: 20),
            const Center(
              child: CircularProgressIndicator(
                color: GodropColors.blue,
                strokeWidth: 2.5,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Submitting your order...',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: GodropColors.slate),
            ),
            const SizedBox(height: 20),
            _cancelButton(
              label: 'Go back',
              onPressed: () => context.go('/parcel/vehicle'),
            ),
          ],
        );

      case _Phase.searching:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Divider(height: 1, color: GodropColors.divider),
            const SizedBox(height: 8),
            AnimatedBuilder(
              animation: _shimmer,
              builder: (_, __) => const LinearProgressIndicator(
                value: null,
                backgroundColor: GodropColors.border,
                color: GodropColors.orange,
                minHeight: 3,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Searching riders within 3 km...',
              style: TextStyle(fontSize: 12, color: GodropColors.slate),
            ),
            const SizedBox(height: 16),
            _cancelling
                ? const Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                          color: GodropColors.orange, strokeWidth: 2),
                    ),
                  )
                : _cancelButton(
                    label: 'Cancel request',
                    onPressed: _cancelOrder,
                  ),
          ],
        );

      case _Phase.riderFound:
        final rider = _riderData!;
        final firstName = rider['firstName'] as String? ?? '';
        final lastName = rider['lastName'] as String? ?? '';
        final phone = rider['phone'] as String? ?? '';
        final name = '$firstName $lastName'.trim();

        return Column(
          children: [
            const Divider(height: 1, color: GodropColors.divider),
            const SizedBox(height: 12),
            _RiderFoundCard(
              name: name.isEmpty ? 'Your Rider' : name,
              phone: phone,
              vehicleType: _vehicleType,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _onTrackOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: GodropColors.blue,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Track Order',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                ),
              ),
            ),
          ],
        );

      case _Phase.error:
        return Column(
          children: [
            const Divider(height: 1, color: GodropColors.divider),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.error_outline_rounded,
                      color: Colors.red.shade600, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _errorMessage ?? 'Something went wrong.',
                      style: TextStyle(
                          fontSize: 13, color: Colors.red.shade700),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _cancelButton(
              label: 'Go back',
              onPressed: () => context.go('/home'),
            ),
          ],
        );
    }
  }

  Widget _cancelButton({required String label, required VoidCallback onPressed}) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: GodropColors.border, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: GodropColors.orange,
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
    );
  }
}

// ── Rider found card ──────────────────────────────────────────────────────────

class _RiderFoundCard extends StatelessWidget {
  final String name;
  final String phone;
  final String vehicleType;

  const _RiderFoundCard({
    required this.name,
    required this.phone,
    required this.vehicleType,
  });

  @override
  Widget build(BuildContext context) {
    final initials = _initials(name);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.background,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.success.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(
              color: GodropColors.ink,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initials,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: GodropColors.ink,
                  ),
                ),
                if (phone.isNotEmpty)
                  Text(
                    phone,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.slate),
                  ),
                Text(
                  vehicleType,
                  style: const TextStyle(fontSize: 11, color: GodropColors.mute),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: GodropColors.success.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_rounded,
              color: GodropColors.success,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}';
    if (parts[0].isNotEmpty) return parts[0][0];
    return '?';
  }
}
