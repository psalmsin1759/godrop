import 'dart:async';
import 'dart:math' show min, max;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import 'bloc/active_cubit.dart';
import 'bloc/active_state.dart';

class ActiveMapScreen extends StatefulWidget {
  const ActiveMapScreen({super.key});

  @override
  State<ActiveMapScreen> createState() => _ActiveMapScreenState();
}

class _ActiveMapScreenState extends State<ActiveMapScreen> {
  GoogleMapController? _mapController;
  StreamSubscription<Position>? _positionSub;
  LatLng? _riderPosition;
  bool _fitted = false;

  @override
  void initState() {
    super.initState();
    _startLocationStream();
  }

  Future<void> _startLocationStream() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      return;
    }
    try {
      final last = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      if (mounted) {
        setState(() => _riderPosition = LatLng(last.latitude, last.longitude));
        _fitBounds();
      }
    } catch (_) {}

    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    ).listen((pos) {
      if (!mounted) return;
      setState(() => _riderPosition = LatLng(pos.latitude, pos.longitude));
    });
  }

  @override
  void dispose() {
    _positionSub?.cancel();
    super.dispose();
  }

  void _fitBounds([RiderOrderDetail? order]) {
    final controller = _mapController;
    final rider = _riderPosition;
    if (controller == null || rider == null || order == null || _fitted) return;
    _fitted = true;
    final dropoff = LatLng(order.dropoffLat, order.dropoffLng);
    final minLat = min(rider.latitude, dropoff.latitude);
    final maxLat = max(rider.latitude, dropoff.latitude);
    final minLng = min(rider.longitude, dropoff.longitude);
    final maxLng = max(rider.longitude, dropoff.longitude);
    controller.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat - 0.01, minLng - 0.01),
          northeast: LatLng(maxLat + 0.01, maxLng + 0.01),
        ),
        80,
      ),
    );
  }

  void _recenter() {
    final controller = _mapController;
    final rider = _riderPosition;
    if (controller == null || rider == null) return;
    controller.animateCamera(CameraUpdate.newLatLngZoom(rider, 15));
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: GodropColors.background,
      body: BlocBuilder<ActiveCubit, ActiveState>(
        builder: (ctx, state) {
          final order = switch (state) {
            ActiveLoaded s => s.order,
            ActiveActionLoading s => s.order,
            _ => null,
          };

          if (order == null) {
            return const Center(
              child: Text('No active delivery',
                  style: TextStyle(color: GodropColors.mute)),
            );
          }

          final dropoff = LatLng(order.dropoffLat, order.dropoffLng);
          _fitBounds(order);

          final markers = <Marker>{
            Marker(
              markerId: const MarkerId('dropoff'),
              position: dropoff,
              icon: BitmapDescriptor.defaultMarkerWithHue(
                  BitmapDescriptor.hueRed),
              infoWindow: InfoWindow(
                title: 'Dropoff',
                snippet: order.dropoffAddress,
              ),
            ),
          };

          final polylines = <Polyline>{
            if (_riderPosition != null)
              Polyline(
                polylineId: const PolylineId('route'),
                points: [_riderPosition!, dropoff],
                color: GodropColors.blue,
                width: 4,
                patterns: [PatternItem.dash(20), PatternItem.gap(10)],
              ),
          };

          return Stack(
            children: [
              Positioned.fill(
                child: GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: _riderPosition ?? dropoff,
                    zoom: 14,
                  ),
                  onMapCreated: (controller) {
                    _mapController = controller;
                    _fitBounds(order);
                  },
                  markers: markers,
                  polylines: polylines,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                ),
              ),
              Positioned(
                top: topPad + 12,
                left: 16,
                child: GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: GodropColors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: GodropColors.softShadow,
                    ),
                    child: const Icon(Icons.arrow_back_rounded,
                        size: 20, color: GodropColors.ink),
                  ),
                ),
              ),
              Positioned(
                top: topPad + 12,
                left: 64,
                right: 16,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: GodropColors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: GodropColors.softShadow,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.location_on_rounded,
                          size: 16, color: GodropColors.error),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          order.dropoffAddress,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: GodropColors.ink),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Positioned(
                right: 16,
                bottom: bottomPad + 16,
                child: GestureDetector(
                  onTap: _recenter,
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: GodropColors.white,
                      shape: BoxShape.circle,
                      boxShadow: GodropColors.softShadow,
                    ),
                    child: const Icon(Icons.my_location_rounded,
                        color: GodropColors.blue, size: 20),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
