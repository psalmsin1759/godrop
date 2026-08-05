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

class _Stop {
  final String? id;
  final LatLng position;
  final String address;
  final String? recipientName;
  final String status;

  const _Stop({
    this.id,
    required this.position,
    required this.address,
    this.recipientName,
    this.status = '',
  });
}

class ActiveMapScreen extends StatefulWidget {
  /// When set, focuses the map on this specific drop-off (a multi-parcel
  /// order's `RiderParcelDropoff.id`). Null shows the whole route/overview.
  final String? focusDropoffId;
  const ActiveMapScreen({super.key, this.focusDropoffId});

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

  List<_Stop> _stopsFor(RiderOrderDetail order) {
    if (order.isMultiParcel) {
      return order.dropoffs!
          .map((d) => _Stop(
                id: d.id,
                position: LatLng(d.lat, d.lng),
                address: d.address,
                recipientName: d.recipientName,
                status: d.status,
              ))
          .toList();
    }
    return [
      _Stop(
        position: LatLng(order.dropoffLat, order.dropoffLng),
        address: order.dropoffAddress,
      ),
    ];
  }

  _Stop? _findFocused(List<_Stop> stops) {
    final focusId = widget.focusDropoffId;
    if (focusId == null) return null;
    for (final s in stops) {
      if (s.id == focusId) return s;
    }
    return null;
  }

  void _fitBounds(List<_Stop> targets) {
    final controller = _mapController;
    final rider = _riderPosition;
    if (controller == null || rider == null || targets.isEmpty || _fitted) {
      return;
    }
    _fitted = true;
    final lats = [rider.latitude, ...targets.map((t) => t.position.latitude)];
    final lngs = [rider.longitude, ...targets.map((t) => t.position.longitude)];
    controller.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(lats.reduce(min) - 0.01, lngs.reduce(min) - 0.01),
          northeast: LatLng(lats.reduce(max) + 0.01, lngs.reduce(max) + 0.01),
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

  double _hueFor(_Stop s, bool focused) {
    if (focused) return BitmapDescriptor.hueOrange;
    switch (s.status) {
      case 'DELIVERED':
        return BitmapDescriptor.hueGreen;
      case 'FAILED':
        return BitmapDescriptor.hueRose;
      default:
        return BitmapDescriptor.hueAzure;
    }
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

          final stops = _stopsFor(order);
          final focused = _findFocused(stops);
          final unresolvedStops = stops
              .where((s) => s.status != 'DELIVERED' && s.status != 'FAILED')
              .toList();
          _fitBounds(focused != null ? [focused] : stops);

          final markers = <Marker>{
            for (final s in stops)
              Marker(
                markerId: MarkerId(s.id ?? 'dropoff'),
                position: s.position,
                icon: BitmapDescriptor.defaultMarkerWithHue(
                    _hueFor(s, s.id != null && s.id == focused?.id)),
                infoWindow: InfoWindow(
                  title: s.recipientName ?? 'Drop-off',
                  snippet: s.address,
                ),
              ),
          };

          final routeTargets =
              focused != null ? [focused] : unresolvedStops;
          final polylines = <Polyline>{
            if (_riderPosition != null)
              for (final s in routeTargets)
                Polyline(
                  polylineId: PolylineId('route_${s.id ?? 'dropoff'}'),
                  points: [_riderPosition!, s.position],
                  color: GodropColors.blue,
                  width: 4,
                  patterns: [PatternItem.dash(20), PatternItem.gap(10)],
                ),
          };

          final headerLabel = focused != null
              ? '${focused.recipientName != null ? '${focused.recipientName} · ' : ''}${focused.address}'
              : order.isMultiParcel
                  ? '${unresolvedStops.length} of ${stops.length} drop-offs left'
                  : order.dropoffAddress;

          return Stack(
            children: [
              Positioned.fill(
                child: GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: _riderPosition ?? stops.first.position,
                    zoom: 14,
                  ),
                  onMapCreated: (controller) {
                    _mapController = controller;
                    _fitBounds(focused != null ? [focused] : stops);
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
                          headerLabel,
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
