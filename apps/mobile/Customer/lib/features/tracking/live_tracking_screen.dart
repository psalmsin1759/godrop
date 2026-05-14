import 'dart:math' show min, max;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../app/theme.dart';
import '../orders/models/active_order.dart';
import '../parcel/models/parcel_location.dart';

class LiveTrackingScreen extends StatefulWidget {
  final ActiveOrderData? order;
  const LiveTrackingScreen({super.key, this.order});

  @override
  State<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends State<LiveTrackingScreen> {
  ActiveOrderData get _order =>
      widget.order ??
      const ActiveOrderData(
        riderName: 'Chukwuemeka O.',
        riderRating: 4.9,
        riderTrips: 1240,
        riderVehicleNo: 'KJA-342HB',
        riderDistance: '0.8 km',
        pickup: ParcelLocation(lat: 6.4524, lng: 3.4754, name: 'Lekki Phase 1'),
        dropoff: ParcelLocation(lat: 6.4281, lng: 3.4219, name: 'Victoria Island'),
        vehicleIndex: 0,
      );

  Set<Marker> get _markers => {
        Marker(
          markerId: const MarkerId('pickup'),
          position: LatLng(_order.pickup.lat, _order.pickup.lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          infoWindow: InfoWindow(title: 'Pickup: ${_order.pickup.name.split(',').first}'),
        ),
        Marker(
          markerId: const MarkerId('dropoff'),
          position: LatLng(_order.dropoff.lat, _order.dropoff.lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
          infoWindow: InfoWindow(title: 'Dropoff: ${_order.dropoff.name.split(',').first}'),
        ),
      };

  Set<Polyline> get _polylines => {
        Polyline(
          polylineId: const PolylineId('route'),
          points: [
            LatLng(_order.pickup.lat, _order.pickup.lng),
            LatLng(_order.dropoff.lat, _order.dropoff.lng),
          ],
          color: GodropColors.blue,
          width: 4,
          patterns: [PatternItem.dash(20), PatternItem.gap(10)],
        ),
      };

  void _onMapCreated(GoogleMapController ctrl) {
    final minLat = min(_order.pickup.lat, _order.dropoff.lat);
    final maxLat = max(_order.pickup.lat, _order.dropoff.lat);
    final minLng = min(_order.pickup.lng, _order.dropoff.lng);
    final maxLng = max(_order.pickup.lng, _order.dropoff.lng);
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
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;
    final order = _order;

    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Stack(
        children: [
          // Full-screen Google Map
          Positioned.fill(
            child: GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(
                  (order.pickup.lat + order.dropoff.lat) / 2,
                  (order.pickup.lng + order.dropoff.lng) / 2,
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
          // Back button
          Positioned(
            top: topPad + 12,
            left: 16,
            child: GestureDetector(
              onTap: () => context.go('/orders'),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    )
                  ],
                ),
                child: const Icon(Icons.arrow_back_rounded, size: 20, color: GodropColors.ink),
              ),
            ),
          ),
          // Status chip
          Positioned(
            top: topPad + 12,
            left: 72,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.directions_bike_rounded, size: 16, color: GodropColors.blue),
                  const SizedBox(width: 6),
                  const Expanded(
                    child: Text(
                      'Rider on the way',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: GodropColors.ink),
                    ),
                  ),
                  Text(
                    '~${order.etaMinutes} min',
                    style: const TextStyle(fontSize: 12, color: GodropColors.orange, fontWeight: FontWeight.w600),
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
            child: Container(
              padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPad + 20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Rider info
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          color: GodropColors.ink,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            order.riderInitials,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              order.riderName,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink,
                              ),
                            ),
                            Row(
                              children: [
                                const Icon(Icons.star_rounded, size: 13, color: GodropColors.orange),
                                const SizedBox(width: 3),
                                Text(
                                  '${order.riderRating} · ${order.riderVehicleNo}',
                                  style: const TextStyle(fontSize: 12, color: GodropColors.slate),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      _ActionBtn(
                        icon: Icons.message_rounded,
                        color: GodropColors.blue.withOpacity(0.08),
                        iconColor: GodropColors.blue,
                      ),
                      const SizedBox(width: 10),
                      _ActionBtn(
                        icon: Icons.phone_rounded,
                        color: GodropColors.blue.withOpacity(0.08),
                        iconColor: GodropColors.blue,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  // Route summary
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: GodropColors.background,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.route_rounded, size: 16, color: GodropColors.blue),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${order.pickup.name.split(',').first} → ${order.dropoff.name.split(',').first}',
                            style: const TextStyle(fontSize: 13, color: GodropColors.slate),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '${order.distanceKm.toStringAsFixed(1)} km',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: GodropColors.ink),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Confirmation code
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
                        const Text(
                          'Give this code to your rider',
                          style: TextStyle(fontSize: 12, color: GodropColors.slate),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          order.confirmationCode ?? '—',
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
                  // Timeline
                  const _TimelineItem(label: 'Order placed', time: 'Just now', done: true),
                  const _TimelineItem(label: 'Rider assigned', time: 'Just now', done: true),
                  const _TimelineItem(label: 'Picked up', time: '', done: false, isActive: false),
                  const _TimelineItem(label: 'On the way', time: '', done: false, isActive: true),
                  const _TimelineItem(label: 'Delivered', time: '', done: false, isLast: true),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {},
                          child: Container(
                            height: 46,
                            decoration: BoxDecoration(
                              color: GodropColors.background,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(
                              child: Text(
                                'Share trip',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: GodropColors.ink,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {},
                          child: Container(
                            height: 46,
                            decoration: BoxDecoration(
                              color: GodropColors.error.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(
                              child: Text(
                                'SOS · Help',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: GodropColors.error,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final Color color;
  final Color iconColor;
  const _ActionBtn({required this.icon, required this.color, required this.iconColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, size: 18, color: iconColor),
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final String label;
  final String time;
  final bool done;
  final bool isActive;
  final bool isLast;
  const _TimelineItem({
    required this.label,
    required this.time,
    required this.done,
    this.isActive = false,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Column(
          children: [
            Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done
                    ? GodropColors.blue
                    : (isActive ? GodropColors.orange : GodropColors.border),
              ),
              child: done
                  ? const Icon(Icons.check_rounded, size: 10, color: Colors.white)
                  : null,
            ),
            if (!isLast)
              Container(
                width: 1.5,
                height: 22,
                color: done ? GodropColors.blue.withOpacity(0.3) : GodropColors.border,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: isActive
                  ? GodropColors.orange
                  : (done ? GodropColors.ink : GodropColors.mute),
              fontWeight:
                  isActive || done ? FontWeight.w500 : FontWeight.w400,
            ),
          ),
        ),
        Text(time, style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
        SizedBox(height: isLast ? 0 : 4),
      ],
    );
  }
}
