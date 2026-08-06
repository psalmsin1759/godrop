import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' show min, max;
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../app/theme.dart';
import '../../shared/api/client/dio_client.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/widgets/godrop_button.dart';

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
    return Uri.parse(
        'wss://godrop-production.up.railway.app/ws/orders/$orderId/tracking');
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
        debugPrint(
            '[WS/Customer] OrderDetail closed | order=${widget.orderId}');
        if (mounted) _silentReload();
      },
    );
    debugPrint('[WS/Customer] OrderDetail connected | order=${widget.orderId}');

    _fcmSub = FirebaseMessaging.onMessage.listen((message) {
      final type = message.data['type'] as String?;
      final orderId = message.data['orderId'] as String?;
      debugPrint(
          '[PUSH/Customer] OrderDetail received | type=$type | orderId=$orderId');
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
    } catch (_) {
      return;
    }
    final type = msg['type'] as String?;
    final status = msg['status'] as String?;
    debugPrint(
        '[WS/Customer] OrderDetail message | type=$type | status=$status');
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
    setState(() {
      _loading = true;
      _error = null;
    });
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
      debugPrint(
          '[OrderDetail] Loaded order ${widget.orderId} | status=${order?['status']}');

      // Connect realtime only while the order is still in flight
      final status = (order?['status'] as String? ?? '').toUpperCase();
      final isActive = {
        'PENDING',
        'ACCEPTED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'IN_TRANSIT'
      }.contains(status);
      if (isActive && _wsChannel == null) _connectRealtime();
    } on DioException catch (e) {
      final msg = (e.response?.data as Map<String, dynamic>?)?['error'];
      setState(() {
        _error = msg is String ? msg : 'Failed to load order.';
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load order.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: GodropColors.background,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: GodropColors.blue.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                        color: GodropColors.blue, strokeWidth: 2.5),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Loading order details…',
                  style: TextStyle(fontSize: 13, color: GodropColors.mute)),
            ],
          ),
        ),
      );
    }
    if (_error != null || _order == null) {
      return Scaffold(
        backgroundColor: GodropColors.background,
        appBar: AppBar(title: const Text('Order Details')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                      color: GodropColors.error.withValues(alpha: 0.08),
                      shape: BoxShape.circle),
                  child: const Icon(Icons.error_outline_rounded,
                      color: GodropColors.error, size: 30),
                ),
                const SizedBox(height: 16),
                Text(_error ?? 'Order not found',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        color: GodropColors.slate, fontSize: 14)),
                const SizedBox(height: 20),
                GodropButton(
                    label: 'Retry', onTap: _load, fullWidth: false, height: 46),
              ],
            ),
          ),
        ),
      );
    }

    final order = _order!;
    final status = (order['status'] as String? ?? '').toUpperCase();

    final pickupAddress = order['pickupAddress'] as String? ?? '';
    final dropoffAddress = order['dropoffAddress'] as String? ?? '';
    final pickupLat = (order['pickupLat'] as num?)?.toDouble() ?? 6.4524;
    final pickupLng = (order['pickupLng'] as num?)?.toDouble() ?? 3.4754;
    final dropoffLat = (order['dropoffLat'] as num?)?.toDouble() ?? 6.4281;
    final dropoffLng = (order['dropoffLng'] as num?)?.toDouble() ?? 3.4219;
    final confirmationCode = order['confirmationCode'] as String?;
    final dropoffs = (order['dropoffs'] as List? ?? [])
        .map((e) => e as Map<String, dynamic>)
        .toList();
    final isMultiParcel = dropoffs.length > 1;
    final trackingCode = order['trackingCode'] as String? ?? '';
    final totalKobo = (order['totalKobo'] as num?)?.toInt() ?? 0;
    final paymentMethod = order['paymentMethod'] as String? ?? '';

    final riderFirstName = _rider?['firstName'] as String? ?? '';
    final riderLastName = _rider?['lastName'] as String? ?? '';
    final riderPhone = _rider?['phone'] as String? ?? '';
    final riderAvatarUrl = _rider?['avatarUrl'] as String?;
    final riderName = '$riderFirstName $riderLastName'.trim();
    final riderInitials = _initials(riderName);

    final items = (order['items'] as List? ?? [])
        .map((e) => e as Map<String, dynamic>)
        .toList();

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
                  icon: BitmapDescriptor.defaultMarkerWithHue(
                      BitmapDescriptor.hueOrange),
                  infoWindow: InfoWindow(title: pickupAddress.split(',').first),
                ),
                if (isMultiParcel)
                  for (var i = 0; i < dropoffs.length; i++)
                    Marker(
                      markerId: MarkerId('dropoff_$i'),
                      position: LatLng(
                        (dropoffs[i]['lat'] as num).toDouble(),
                        (dropoffs[i]['lng'] as num).toDouble(),
                      ),
                      icon: BitmapDescriptor.defaultMarkerWithHue(
                          BitmapDescriptor.hueAzure),
                      infoWindow: InfoWindow(
                        title: 'Parcel ${dropoffs[i]['sequence']}',
                        snippet:
                            (dropoffs[i]['address'] as String? ?? '').split(',').first,
                      ),
                    )
                else
                  Marker(
                    markerId: const MarkerId('dropoff'),
                    position: LatLng(dropoffLat, dropoffLng),
                    icon: BitmapDescriptor.defaultMarkerWithHue(
                        BitmapDescriptor.hueAzure),
                    infoWindow:
                        InfoWindow(title: dropoffAddress.split(',').first),
                  ),
              },
              polylines: {
                if (isMultiParcel)
                  for (var i = 0; i < dropoffs.length; i++)
                    Polyline(
                      polylineId: PolylineId('route_$i'),
                      points: [
                        LatLng(pickupLat, pickupLng),
                        LatLng(
                          (dropoffs[i]['lat'] as num).toDouble(),
                          (dropoffs[i]['lng'] as num).toDouble(),
                        ),
                      ],
                      color: GodropColors.blue,
                      width: 3,
                      patterns: [PatternItem.dash(20), PatternItem.gap(10)],
                    )
                else
                  Polyline(
                    polylineId: const PolylineId('route'),
                    points: [
                      LatLng(pickupLat, pickupLng),
                      LatLng(dropoffLat, dropoffLng)
                    ],
                    color: GodropColors.blue,
                    width: 4,
                    patterns: [PatternItem.dash(20), PatternItem.gap(10)],
                  ),
              },
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
            ),
          ),

          // Bottom sheet — draggable so the map and header remain
          // reachable even when the timeline content is tall.
          DraggableScrollableSheet(
            initialChildSize: 0.5,
            minChildSize: 0.18,
            maxChildSize: 0.92,
            snap: true,
            snapSizes: const [0.18, 0.5, 0.92],
            builder: (context, scrollController) {
              return ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(24)),
                child: Container(
                  color: GodropColors.background,
                  child: RefreshIndicator(
                    onRefresh: _load,
                    color: GodropColors.blue,
                    child: SingleChildScrollView(
                      controller: scrollController,
                      physics: const ClampingScrollPhysics(),
                      padding: EdgeInsets.fromLTRB(16, 12, 16, bottomPad + 20),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: Container(
                              width: 40,
                              height: 4,
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                  color: GodropColors.border,
                                  borderRadius: BorderRadius.circular(2)),
                            ),
                          ),

                          // Rider info (only when assigned)
                          if (_rider != null) ...[
                            AnimatedEntrance(
                              child: _RiderCard(
                                  name: riderName,
                                  phone: riderPhone,
                                  initials: riderInitials,
                                  avatarUrl: riderAvatarUrl),
                            ),
                            const SizedBox(height: 14),
                          ],

                          // Confirmation code (single-parcel only; multi-parcel
                          // codes are shown per parcel in the Parcels section)
                          if (!isMultiParcel &&
                              confirmationCode != null &&
                              confirmationCode.isNotEmpty) ...[
                            AnimatedEntrance(
                              delay: const Duration(milliseconds: 60),
                              child:
                                  _ConfirmationCodeCard(code: confirmationCode),
                            ),
                            const SizedBox(height: 14),
                          ],

                          // Route
                          AnimatedEntrance(
                            delay: const Duration(milliseconds: 120),
                            child: _SectionCard(
                              title: 'Route',
                              icon: Icons.alt_route_rounded,
                              children: [
                                _routeRow(Icons.radio_button_checked_rounded,
                                    GodropColors.blue, 'Pickup', pickupAddress),
                                const Padding(
                                  padding: EdgeInsets.only(left: 15),
                                  child: SizedBox(
                                      width: 1.5,
                                      height: 18,
                                      child: ColoredBox(
                                          color: GodropColors.border)),
                                ),
                                _routeRow(
                                    Icons.location_on_rounded,
                                    GodropColors.error,
                                    isMultiParcel ? 'Drop-offs' : 'Dropoff',
                                    isMultiParcel
                                        ? '${dropoffs.length} destinations'
                                        : dropoffAddress),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Parcels (multi-drop-off)
                          if (isMultiParcel) ...[
                            AnimatedEntrance(
                              delay: const Duration(milliseconds: 140),
                              child: _SectionCard(
                                title: 'Parcels (${dropoffs.length})',
                                icon: Icons.inventory_2_rounded,
                                children: [
                                  for (var i = 0; i < dropoffs.length; i++)
                                    _ParcelDetailTile(
                                      data: dropoffs[i],
                                      isLast: i == dropoffs.length - 1,
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),
                          ],

                          // Order summary
                          AnimatedEntrance(
                            delay: const Duration(milliseconds: 160),
                            child: _SectionCard(
                              title: 'Order Summary',
                              icon: Icons.receipt_long_rounded,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Text('Total Paid',
                                            style: TextStyle(
                                                fontSize: 12,
                                                color: GodropColors.mute)),
                                        const SizedBox(height: 2),
                                        Text(
                                          _fmtKobo(totalKobo),
                                          style: const TextStyle(
                                              fontSize: 24,
                                              fontWeight: FontWeight.w800,
                                              color: GodropColors.orange),
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10, vertical: 7),
                                      decoration: BoxDecoration(
                                        color: GodropColors.blue
                                            .withValues(alpha: 0.08),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(_paymentIcon(paymentMethod),
                                              size: 14,
                                              color: GodropColors.blue),
                                          const SizedBox(width: 6),
                                          Text(
                                            _paymentLabel(paymentMethod),
                                            style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                                color: GodropColors.blue),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                          // Order items
                          if (items.isNotEmpty) ...[
                            const SizedBox(height: 14),
                            AnimatedEntrance(
                              delay: const Duration(milliseconds: 200),
                              child: _SectionCard(
                                title: 'Items',
                                icon: Icons.shopping_bag_rounded,
                                children: [_OrderItemsList(items: items)],
                              ),
                            ),
                          ],

                          // Status timeline
                          if (_timeline.isNotEmpty) ...[
                            const SizedBox(height: 14),
                            AnimatedEntrance(
                              delay: const Duration(milliseconds: 240),
                              child: _SectionCard(
                                title: 'Timeline',
                                icon: Icons.history_rounded,
                                children:
                                    _timeline.asMap().entries.map((entry) {
                                  final event = entry.value;
                                  final isLast =
                                      entry.key == _timeline.length - 1;
                                  final evStatus =
                                      event['status'] as String? ?? '';
                                  final description =
                                      event['description'] as String?;
                                  final createdAt =
                                      event['createdAt'] as String? ?? '';
                                  final color =
                                      _statusColor(evStatus.toUpperCase());
                                  return Padding(
                                    padding: EdgeInsets.only(
                                        bottom: isLast ? 0 : 16),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Column(
                                          children: [
                                            Container(
                                              width: 26,
                                              height: 26,
                                              decoration: BoxDecoration(
                                                  color: color.withValues(
                                                      alpha: 0.1),
                                                  shape: BoxShape.circle),
                                              child: Icon(
                                                  _statusIcon(
                                                      evStatus.toUpperCase()),
                                                  size: 13,
                                                  color: color),
                                            ),
                                            if (!isLast)
                                              Container(
                                                width: 1.5,
                                                height: 28,
                                                margin:
                                                    const EdgeInsets.symmetric(
                                                        vertical: 4),
                                                color: GodropColors.border,
                                              ),
                                          ],
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Padding(
                                            padding:
                                                const EdgeInsets.only(top: 3),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(evStatus,
                                                    style: const TextStyle(
                                                        fontSize: 13,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        color:
                                                            GodropColors.ink)),
                                                if (description != null &&
                                                    description.isNotEmpty)
                                                  Padding(
                                                    padding:
                                                        const EdgeInsets.only(
                                                            top: 2),
                                                    child: Text(description,
                                                        style: const TextStyle(
                                                            fontSize: 12,
                                                            color: GodropColors
                                                                .mute)),
                                                  ),
                                                Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                          top: 2),
                                                  child: Text(
                                                      _fmtDate(createdAt),
                                                      style: const TextStyle(
                                                          fontSize: 11,
                                                          color: GodropColors
                                                              .mute)),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                          ],

                          // Report an issue
                          const SizedBox(height: 20),
                          Center(
                            child: TextButton.icon(
                              onPressed: () => context.push(
                                '/orders/${widget.orderId}/report-issue',
                                extra: trackingCode,
                              ),
                              icon: const Icon(Icons.flag_outlined,
                                  size: 16, color: GodropColors.slate),
                              label: const Text('Report an issue',
                                  style: TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w600,
                                      color: GodropColors.slate)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),

          // Back button — painted above the sheet so it stays
          // reachable no matter how far the sheet is dragged up.
          Positioned(
            top: topPad + 12,
            left: 16,
            child: GestureDetector(
              onTap: () => context.canPop() ? context.pop() : context.go('/orders'),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 2))
                  ],
                ),
                child: const Icon(Icons.arrow_back_rounded,
                    size: 20, color: GodropColors.ink),
              ),
            ),
          ),

          // Status chip — same reasoning as the back button.
          Positioned(
            top: topPad + 12,
            left: 72,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 8,
                      offset: const Offset(0, 2))
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                        color: _statusColor(status).withValues(alpha: 0.1),
                        shape: BoxShape.circle),
                    child: Icon(_statusIcon(status),
                        size: 13, color: _statusColor(status)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _statusLabel(status),
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: GodropColors.ink),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (trackingCode.isNotEmpty) ...[
                    const SizedBox(width: 8),
                    Text(
                      '#$trackingCode',
                      style: const TextStyle(
                          fontSize: 12, color: GodropColors.mute),
                    ),
                  ],
                ],
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
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: color, size: 15),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 11,
                        color: GodropColors.mute,
                        fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(address,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _statusLabel(String status) {
    return switch (status) {
      'PENDING' => 'Waiting for confirmation',
      'ACCEPTED' => 'Rider assigned',
      'PREPARING' => 'Order being prepared',
      'READY_FOR_PICKUP' => 'Ready for pickup',
      'PICKED_UP' => 'Order picked up',
      'IN_TRANSIT' => 'Rider on the way',
      'DELIVERED' => 'Delivered',
      'CANCELLED' => 'Cancelled',
      'FAILED' => 'Delivery failed',
      _ => status,
    };
  }

  IconData _statusIcon(String status) {
    return switch (status) {
      'PENDING' => Icons.schedule_rounded,
      'ACCEPTED' => Icons.task_alt_rounded,
      'PREPARING' => Icons.soup_kitchen_rounded,
      'READY_FOR_PICKUP' => Icons.inventory_2_rounded,
      'PICKED_UP' => Icons.local_shipping_rounded,
      'IN_TRANSIT' => Icons.directions_bike_rounded,
      'DELIVERED' => Icons.check_circle_rounded,
      'CANCELLED' => Icons.cancel_rounded,
      'FAILED' => Icons.error_rounded,
      _ => Icons.info_rounded,
    };
  }

  Color _statusColor(String status) {
    return switch (status) {
      'DELIVERED' => GodropColors.success,
      'CANCELLED' || 'FAILED' => GodropColors.error,
      'PENDING' => GodropColors.orange,
      _ => GodropColors.blue,
    };
  }

  IconData _paymentIcon(String method) {
    return switch (method.toLowerCase()) {
      'card' => Icons.credit_card_rounded,
      'cash' => Icons.payments_rounded,
      'wallet' || 'wallet_card' => Icons.account_balance_wallet_rounded,
      _ => Icons.payments_rounded,
    };
  }

  String _paymentLabel(String method) {
    if (method.isEmpty) return 'N/A';
    return method
        .split('_')
        .map((w) => w.isEmpty
            ? w
            : '${w[0].toUpperCase()}${w.substring(1).toLowerCase()}')
        .join(' ');
  }

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
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
    if (parts.length >= 2 && parts[1].isNotEmpty) {
      return '${parts[0][0]}${parts[1][0]}';
    }
    if (parts[0].isNotEmpty) return parts[0][0];
    return '?';
  }
}

// ── Parcel detail tile ────────────────────────────────────────────────────────

class _ParcelDetailTile extends StatelessWidget {
  final Map<String, dynamic> data;
  final bool isLast;
  const _ParcelDetailTile({required this.data, required this.isLast});

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  (String, Color) _statusDisplay(String status) {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return ('Delivered', GodropColors.success);
      case 'FAILED':
      case 'CANCELLED':
        return ('Failed', GodropColors.error);
      case 'IN_TRANSIT':
        return ('In transit', GodropColors.blue);
      case 'PICKED_UP':
        return ('Picked up', GodropColors.blue);
      default:
        return ('Pending', GodropColors.slate);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sequence = data['sequence']?.toString() ?? '';
    final address = data['address'] as String? ?? '';
    final recipientName = data['recipientName'] as String? ?? '';
    final recipientPhone = data['recipientPhone'] as String? ?? '';
    final description = data['packageDescription'] as String?;
    final weightKg = data['weightKg'];
    final code = data['confirmationCode'] as String?;
    final feeKobo = (data['deliveryFeeKobo'] as num?)?.toInt() ?? 0;
    final (statusLabel, statusColor) =
        _statusDisplay(data['status'] as String? ?? 'PENDING');

    final meta = <String>[
      if (weightKg != null) '$weightKg kg',
      if (description != null && description.isNotEmpty) description,
    ].join(' · ');

    return Container(
      margin: EdgeInsets.only(bottom: isLast ? 0 : 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: GodropColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: GodropColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                alignment: Alignment.center,
                decoration: const BoxDecoration(
                  color: Color(0xFFE7EEFF),
                  shape: BoxShape.circle,
                ),
                child: Text(sequence,
                    style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.blue)),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(recipientName,
                    style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink)),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(statusLabel,
                    style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        color: statusColor)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_rounded,
                  size: 14, color: GodropColors.error),
              const SizedBox(width: 4),
              Expanded(
                child: Text(address,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.slate)),
              ),
            ],
          ),
          if (recipientPhone.isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(recipientPhone,
                style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
          ],
          if (meta.isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(meta,
                style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
          ],
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (code != null && code.isNotEmpty)
                Row(children: [
                  const Icon(Icons.lock_rounded,
                      size: 12, color: GodropColors.blue),
                  const SizedBox(width: 4),
                  Text('Code: $code',
                      style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.blue)),
                ])
              else
                const SizedBox.shrink(),
              Text(_fmtKobo(feeKobo),
                  style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink)),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Section card ──────────────────────────────────────────────────────────────

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 16,
                decoration: BoxDecoration(
                  gradient: GodropColors.blueGradient,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 8),
              Icon(icon, size: 15, color: GodropColors.blue),
              const SizedBox(width: 6),
              Text(
                title.toUpperCase(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.slate,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }
}

// ── Rider card ────────────────────────────────────────────────────────────────

class _RiderCard extends StatelessWidget {
  final String name;
  final String phone;
  final String initials;
  final String? avatarUrl;

  const _RiderCard(
      {required this.name,
      required this.phone,
      required this.initials,
      this.avatarUrl});

  Future<void> _call() async {
    if (phone.isEmpty) return;
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(
                gradient: GodropColors.blueGradient, shape: BoxShape.circle),
            child: (avatarUrl != null && avatarUrl!.isNotEmpty)
                ? ClipOval(
                    child: Image.network(
                      avatarUrl!,
                      width: 48,
                      height: 48,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Center(
                        child: Text(
                          initials,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  )
                : Center(
                    child: Text(
                      initials,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700),
                    ),
                  ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name.isEmpty ? 'Your Rider' : name,
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink)),
                const SizedBox(height: 2),
                Text(
                  riderPhone(phone),
                  style:
                      const TextStyle(fontSize: 12, color: GodropColors.mute),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: phone.isEmpty ? null : _call,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: GodropColors.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.call_rounded,
                  color: GodropColors.success, size: 19),
            ),
          ),
        ],
      ),
    );
  }

  String riderPhone(String phone) =>
      phone.isEmpty ? 'Your delivery partner' : phone;
}

// ── Confirmation code card ───────────────────────────────────────────────────

class _ConfirmationCodeCard extends StatelessWidget {
  final String code;
  const _ConfirmationCodeCard({required this.code});

  void _copy(BuildContext context) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Code copied to clipboard'),
        backgroundColor: GodropColors.ink,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: GodropColors.orangeGradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: GodropColors.orange.withValues(alpha: 0.25),
              blurRadius: 16,
              offset: const Offset(0, 6)),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CONFIRMATION CODE',
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1),
                ),
                const SizedBox(height: 6),
                Text(
                  code,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 6),
                ),
                const SizedBox(height: 4),
                Text(
                  'Share this with your rider on delivery',
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 11),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _copy(context),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(10)),
              child:
                  const Icon(Icons.copy_rounded, color: Colors.white, size: 18),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Order items ───────────────────────────────────────────────────────────────

class _OrderItemsList extends StatelessWidget {
  final List<Map<String, dynamic>> items;
  const _OrderItemsList({required this.items});

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
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
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                        color: GodropColors.blue.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8)),
                    child: Center(
                        child: Text('$qty',
                            style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: GodropColors.blue))),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name,
                            style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink)),
                        if (notes != null && notes.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(notes,
                                style: const TextStyle(
                                    fontSize: 11, color: GodropColors.mute)),
                          ),
                      ],
                    ),
                  ),
                  Text(_fmtKobo(total),
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink)),
                ],
              ),
            ),
            if (!isLast)
              const Divider(height: 1, color: GodropColors.border, indent: 36),
          ],
        );
      }).toList(),
    );
  }
}
