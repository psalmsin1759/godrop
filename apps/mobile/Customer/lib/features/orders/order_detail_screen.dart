import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' show min, max;
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../app/theme.dart';
import '../../shared/api/client/dio_client.dart';

class OrderDetailScreen extends StatefulWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Map<String, dynamic>? _order;
  Map<String, dynamic>? _rider;
  List<Map<String, dynamic>> _timeline = [];
  bool _loading = true;
  String? _error;

  WebSocketChannel? _wsChannel;
  StreamSubscription? _wsSub;
  StreamSubscription? _fcmSub;
  Timer? _pollTimer;

  static Uri _wsUri(String orderId) {
    if (kDebugMode) {
      final host = Platform.isAndroid ? '10.0.2.2' : 'localhost';
      return Uri.parse('ws://$host:4000/ws/orders/$orderId/tracking');
    }
    return Uri.parse('wss://godrop-production.up.railway.app/ws/orders/$orderId/tracking');
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _connectRealtime() {
    _wsChannel = WebSocketChannel.connect(_wsUri(widget.orderId));
    _wsSub = _wsChannel!.stream.listen(
      _onWsMessage,
      onError: (_) {
        debugPrint('[WS/Customer] OrderDetail error | order=${widget.orderId}');
        if (mounted) _silentReload();
      },
      onDone: () {
        debugPrint('[WS/Customer] OrderDetail closed | order=${widget.orderId}');
        if (mounted) _silentReload();
      },
    );
    debugPrint('[WS/Customer] OrderDetail connected | order=${widget.orderId}');

    _fcmSub = FirebaseMessaging.onMessage.listen((message) {
      final type = message.data['type'] as String?;
      final orderId = message.data['orderId'] as String?;
      debugPrint('[PUSH/Customer] OrderDetail received | type=$type | orderId=$orderId');
      if (orderId == widget.orderId && mounted) _silentReload();
    });

    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 8), (_) {
      if (mounted) _silentReload();
    });
  }

  void _onWsMessage(dynamic raw) {
    if (!mounted) return;
    final Map<String, dynamic> msg;
    try {
      msg = jsonDecode(raw as String) as Map<String, dynamic>;
    } catch (_) { return; }
    final type = msg['type'] as String?;
    final status = msg['status'] as String?;
    debugPrint('[WS/Customer] OrderDetail message | type=$type | status=$status');
    if (type == 'STATUS_UPDATE') _silentReload();
  }

  Future<void> _silentReload() async {
    try {
      final res = await DioClient.instance.get('/orders/${widget.orderId}');
      if (!mounted) return;
      final data = res.data as Map<String, dynamic>;
      final order = data['order'] as Map<String, dynamic>?;
      setState(() {
        _order = order;
        _rider = data['rider'] as Map<String, dynamic>?;
        _timeline = (data['timeline'] as List? ?? [])
            .map((e) => e as Map<String, dynamic>)
            .toList();
      });
      final status = (order?['status'] as String? ?? '').toUpperCase();
      if ({'DELIVERED', 'CANCELLED', 'FAILED'}.contains(status)) {
        _pollTimer?.cancel();
      }
      debugPrint('[OrderDetail] Silent reload | status=$status');
    } catch (_) {
      // transient — silently ignore
    }
  }

  @override
  void dispose() {
    _wsSub?.cancel();
    _wsChannel?.sink.close();
    _fcmSub?.cancel();
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await DioClient.instance.get('/orders/${widget.orderId}');
      final data = res.data as Map<String, dynamic>;
      final order = data['order'] as Map<String, dynamic>?;
      setState(() {
        _order = order;
        _rider = data['rider'] as Map<String, dynamic>?;
        _timeline = (data['timeline'] as List? ?? [])
            .map((e) => e as Map<String, dynamic>)
            .toList();
        _loading = false;
      });
      debugPrint('[OrderDetail] Loaded order ${widget.orderId} | status=${order?['status']}');

      // Connect realtime only while the order is still in flight
      final status = (order?['status'] as String? ?? '').toUpperCase();
      final isActive = {'PENDING','ACCEPTED','PREPARING','READY_FOR_PICKUP','PICKED_UP','IN_TRANSIT'}.contains(status);
      if (isActive && _wsChannel == null) _connectRealtime();
    } on DioException catch (e) {
      final msg = (e.response?.data as Map<String, dynamic>?)?['error'];
      setState(() { _error = msg is String ? msg : 'Failed to load order.'; _loading = false; });
    } catch (e) {
      setState(() { _error = 'Failed to load order.'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5)),
      );
    }
    if (_error != null || _order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Order Details')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded, color: GodropColors.mute, size: 40),
              const SizedBox(height: 12),
              Text(_error ?? 'Order not found', style: const TextStyle(color: GodropColors.mute)),
              const SizedBox(height: 16),
              TextButton(
                onPressed: _load,
                child: const Text('Retry', style: TextStyle(color: GodropColors.blue)),
              ),
            ],
          ),
        ),
      );
    }

    final order = _order!;
    final status = (order['status'] as String? ?? '').toUpperCase();
    final isActive = {'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT'}
        .contains(status);

    final pickupAddress = order['pickupAddress'] as String? ?? '';
    final dropoffAddress = order['dropoffAddress'] as String? ?? '';
    final pickupLat = (order['pickupLat'] as num?)?.toDouble() ?? 6.4524;
    final pickupLng = (order['pickupLng'] as num?)?.toDouble() ?? 3.4754;
    final dropoffLat = (order['dropoffLat'] as num?)?.toDouble() ?? 6.4281;
    final dropoffLng = (order['dropoffLng'] as num?)?.toDouble() ?? 3.4219;
    final confirmationCode = order['confirmationCode'] as String?;
    final trackingCode = order['trackingCode'] as String? ?? '';
    final totalKobo = (order['totalKobo'] as num?)?.toInt() ?? 0;
    final paymentMethod = order['paymentMethod'] as String? ?? '';

    final riderFirstName = _rider?['firstName'] as String? ?? '';
    final riderLastName = _rider?['lastName'] as String? ?? '';
    final riderPhone = _rider?['phone'] as String? ?? '';
    final riderName = '$riderFirstName $riderLastName'.trim();
    final riderInitials = _initials(riderName);

    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Stack(
        children: [
          // Map
          Positioned.fill(
            child: GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(
                  (pickupLat + dropoffLat) / 2,
                  (pickupLng + dropoffLng) / 2,
                ),
                zoom: 12,
              ),
              onMapCreated: (ctrl) {
                final minLat = min(pickupLat, dropoffLat);
                final maxLat = max(pickupLat, dropoffLat);
                final minLng = min(pickupLng, dropoffLng);
                final maxLng = max(pickupLng, dropoffLng);
                ctrl.animateCamera(CameraUpdate.newLatLngBounds(
                  LatLngBounds(
                    southwest: LatLng(minLat - 0.01, minLng - 0.01),
                    northeast: LatLng(maxLat + 0.01, maxLng + 0.01),
                  ),
                  80,
                ));
              },
              markers: {
                Marker(
                  markerId: const MarkerId('pickup'),
                  position: LatLng(pickupLat, pickupLng),
                  icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
                  infoWindow: InfoWindow(title: pickupAddress.split(',').first),
                ),
                Marker(
                  markerId: const MarkerId('dropoff'),
                  position: LatLng(dropoffLat, dropoffLng),
                  icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
                  infoWindow: InfoWindow(title: dropoffAddress.split(',').first),
                ),
              },
              polylines: {
                Polyline(
                  polylineId: const PolylineId('route'),
                  points: [LatLng(pickupLat, pickupLng), LatLng(dropoffLat, dropoffLng)],
                  color: GodropColors.blue,
                  width: 4,
                  patterns: [PatternItem.dash(20), PatternItem.gap(10)],
                ),
              },
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
            ),
          ),

          // Back button + status chip
          Positioned(
            top: topPad + 12,
            left: 16,
            child: GestureDetector(
              onTap: () => context.pop(),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 8, offset: const Offset(0, 2))],
                ),
                child: const Icon(Icons.arrow_back_rounded, size: 20, color: GodropColors.ink),
              ),
            ),
          ),
          Positioned(
            top: topPad + 12,
            left: 72,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2))],
              ),
              child: Row(
                children: [
                  Icon(
                    isActive ? Icons.directions_bike_rounded : Icons.check_circle_outline_rounded,
                    size: 16,
                    color: isActive ? GodropColors.blue : GodropColors.success,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      _statusLabel(status),
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: GodropColors.ink),
                    ),
                  ),
                  Text(
                    '#$trackingCode',
                    style: const TextStyle(fontSize: 12, color: GodropColors.mute),
                  ),
                ],
              ),
            ),
          ),

          // Bottom sheet
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: RefreshIndicator(
              onRefresh: _load,
              color: GodropColors.blue,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Container(
                  padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPad + 20),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Rider info (only when assigned)
                      if (_rider != null) ...[
                        Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: const BoxDecoration(color: GodropColors.ink, shape: BoxShape.circle),
                              child: Center(
                                child: Text(
                                  riderInitials,
                                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(riderName.isEmpty ? 'Your Rider' : riderName,
                                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                                  if (riderPhone.isNotEmpty)
                                    Text(riderPhone, style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
                                ],
                              ),
                            ),
                            _ActionBtn(icon: Icons.phone_rounded),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Divider(height: 1, color: GodropColors.border),
                        const SizedBox(height: 16),
                      ],

                      // Confirmation code
                      if (confirmationCode != null && confirmationCode.isNotEmpty) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                          decoration: BoxDecoration(
                            color: GodropColors.orange.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: GodropColors.orange.withValues(alpha: 0.3)),
                          ),
                          child: Column(
                            children: [
                              const Text('Give this code to your rider',
                                  style: TextStyle(fontSize: 12, color: GodropColors.slate)),
                              const SizedBox(height: 6),
                              Text(
                                confirmationCode,
                                style: const TextStyle(
                                  fontSize: 36,
                                  fontWeight: FontWeight.w800,
                                  color: GodropColors.orange,
                                  letterSpacing: 8,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Route
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: GodropColors.background,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          children: [
                            _routeRow(Icons.radio_button_on_rounded, GodropColors.blue, 'Pickup', pickupAddress),
                            const Padding(
                              padding: EdgeInsets.only(left: 7),
                              child: SizedBox(width: 1, height: 12, child: ColoredBox(color: GodropColors.border)),
                            ),
                            _routeRow(Icons.location_on_rounded, GodropColors.error, 'Dropoff', dropoffAddress),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Order summary
                      Row(
                        children: [
                          const Icon(Icons.receipt_long_rounded, size: 14, color: GodropColors.mute),
                          const SizedBox(width: 6),
                          Text(
                            '${_fmtKobo(totalKobo)} · $paymentMethod',
                            style: const TextStyle(fontSize: 13, color: GodropColors.slate),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Order items
                      _OrderItemsSection(order: order),
                      const SizedBox(height: 16),

                      // Status timeline
                      if (_timeline.isNotEmpty) ...[
                        const Text('Timeline',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                        const SizedBox(height: 12),
                        ..._timeline.asMap().entries.map((entry) {
                          final event = entry.value;
                          final isLast = entry.key == _timeline.length - 1;
                          final evStatus = event['status'] as String? ?? '';
                          final description = event['description'] as String?;
                          final createdAt = event['createdAt'] as String? ?? '';
                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                children: [
                                  Container(
                                    width: 10,
                                    height: 10,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isLast ? GodropColors.blue : GodropColors.border,
                                    ),
                                  ),
                                  if (!isLast)
                                    Container(width: 1.5, height: 28, color: GodropColors.border),
                                ],
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(evStatus,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                                      if (description != null)
                                        Text(description,
                                            style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                                      Text(_fmtDate(createdAt),
                                          style: const TextStyle(fontSize: 11, color: GodropColors.mute)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          );
                        }),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _routeRow(IconData icon, Color color, String label, String address) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 14),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10, color: GodropColors.mute)),
              Text(address, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: GodropColors.ink)),
            ],
          ),
        ),
      ],
    );
  }

  String _statusLabel(String status) {
    return switch (status) {
      'PENDING'           => 'Waiting for confirmation',
      'ACCEPTED'          => 'Rider assigned',
      'PREPARING'         => 'Order being prepared',
      'READY_FOR_PICKUP'  => 'Ready for pickup',
      'PICKED_UP'         => 'Order picked up',
      'IN_TRANSIT'        => 'Rider on the way',
      'DELIVERED'         => 'Delivered',
      'CANCELLED'         => 'Cancelled',
      'FAILED'            => 'Delivery failed',
      _                   => status,
    };
  }

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final m = dt.minute.toString().padLeft(2, '0');
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      return '${months[dt.month - 1]} ${dt.day} · $h:$m $period';
    } catch (_) {
      return '';
    }
  }

  String _initials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2 && parts[1].isNotEmpty) return '${parts[0][0]}${parts[1][0]}';
    if (parts[0].isNotEmpty) return parts[0][0];
    return '?';
  }
}

class _OrderItemsSection extends StatelessWidget {
  final Map<String, dynamic> order;
  const _OrderItemsSection({required this.order});

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  @override
  Widget build(BuildContext context) {
    final items = (order['items'] as List? ?? []).map((e) => e as Map<String, dynamic>).toList();
    if (items.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Items', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: GodropColors.ink)),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(color: GodropColors.background, borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Column(
            children: items.asMap().entries.map((entry) {
              final item = entry.value;
              final isLast = entry.key == items.length - 1;
              final name = item['name'] as String? ?? '';
              final qty = item['quantity'] as int? ?? 1;
              final price = item['unitPriceKobo'] as int? ?? 0;
              final total = item['totalKobo'] as int? ?? (qty * price);
              final notes = item['notes'] as String?;
              return Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 24, height: 24,
                          decoration: BoxDecoration(color: GodropColors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                          child: Center(child: Text('$qty', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: GodropColors.blue))),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(name, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: GodropColors.ink)),
                              if (notes != null && notes.isNotEmpty)
                                Text(notes, style: const TextStyle(fontSize: 11, color: GodropColors.mute)),
                            ],
                          ),
                        ),
                        Text(_fmtKobo(total), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                      ],
                    ),
                  ),
                  if (!isLast) const Divider(height: 1, color: GodropColors.border),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  const _ActionBtn({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: GodropColors.blue.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(icon, size: 18, color: GodropColors.blue),
    );
  }
}
