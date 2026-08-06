import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../app/theme.dart';
import '../../shared/api/places_service.dart';
import '../../shared/bloc/saved_addresses_cubit.dart';
import '../../shared/widgets/godrop_button.dart';
import 'models/parcel_location.dart';
import 'widgets/location_picker_sheet.dart';
import 'widgets/parcel_details_sheet.dart';

// Lagos fallback used only when location permission is denied or geocoding fails
const _kFallback = ParcelLocation(
  lat: 6.5244,
  lng: 3.3792,
  name: 'Lagos, Nigeria',
);

class ParcelAddressesScreen extends StatefulWidget {
  const ParcelAddressesScreen({super.key});

  @override
  State<ParcelAddressesScreen> createState() => _ParcelAddressesScreenState();
}

class _ParcelAddressesScreenState extends State<ParcelAddressesScreen> {
  GoogleMapController? _mapCtrl;
  ParcelLocation _pickup = _kFallback;
  // Each parcel has its own drop-off + recipient + optional description/weight.
  final List<ParcelItem> _parcels = [];
  bool _locating = true;

  // Pickup resolved and at least one parcel added before continuing.
  bool get _canContinue => !_locating && _parcels.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _resolveCurrentLocation();
  }

  @override
  void dispose() {
    _mapCtrl = null;
    super.dispose();
  }

  Future<void> _resolveCurrentLocation() async {
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (mounted) setState(() => _locating = false);
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings:
            const LocationSettings(accuracy: LocationAccuracy.high),
      );
      final address = await PlacesService.reverseGeocode(
          position.latitude, position.longitude);

      if (mounted) {
        setState(() {
          _pickup = ParcelLocation(
            lat: position.latitude,
            lng: position.longitude,
            name: address ?? _kFallback.name,
          );
          _locating = false;
        });
        _updateCamera();
      }
    } catch (_) {
      if (mounted) setState(() => _locating = false);
    }
  }

  Set<Marker> get _markers => {
        Marker(
          markerId: const MarkerId('pickup'),
          position: LatLng(_pickup.lat, _pickup.lng),
          icon:
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          infoWindow: InfoWindow(title: _pickup.name),
        ),
        for (var i = 0; i < _parcels.length; i++)
          Marker(
            markerId: MarkerId('dropoff_$i'),
            position: LatLng(_parcels[i].dropoff.lat, _parcels[i].dropoff.lng),
            icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueAzure),
            infoWindow: InfoWindow(
                title: 'Parcel ${i + 1}', snippet: _parcels[i].dropoff.name),
          ),
      };

  Set<Polyline> get _polylines {
    if (_parcels.isEmpty) return {};
    return {
      for (var i = 0; i < _parcels.length; i++)
        Polyline(
          polylineId: PolylineId('route_$i'),
          points: [
            LatLng(_pickup.lat, _pickup.lng),
            LatLng(_parcels[i].dropoff.lat, _parcels[i].dropoff.lng),
          ],
          color: GodropColors.blue,
          width: 3,
          patterns: [PatternItem.dash(20), PatternItem.gap(10)],
        ),
    };
  }

  void _updateCamera() {
    final ctrl = _mapCtrl;
    if (ctrl == null) return;
    if (_parcels.isNotEmpty) {
      final lats = [_pickup.lat, ..._parcels.map((p) => p.dropoff.lat)];
      final lngs = [_pickup.lng, ..._parcels.map((p) => p.dropoff.lng)];
      ctrl.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest:
                LatLng(lats.reduce(min) - 0.005, lngs.reduce(min) - 0.005),
            northeast:
                LatLng(lats.reduce(max) + 0.005, lngs.reduce(max) + 0.005),
          ),
          100,
        ),
      );
    } else {
      ctrl.animateCamera(
        CameraUpdate.newLatLngZoom(LatLng(_pickup.lat, _pickup.lng), 14),
      );
    }
  }

  Future<void> _changePickup(SavedAddressesState savedState) async {
    final result = await showModalBottomSheet<ParcelLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LocationPickerSheet(
        title: 'Change pickup',
        showCurrentLocation: true,
        savedAddresses: savedState.addresses,
      ),
    );
    if (result != null && mounted) {
      setState(() => _pickup = result);
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted) _updateCamera();
    }
  }

  /// Pick a drop-off location, then capture recipient + optional description /
  /// weight for that parcel and add it to the list.
  Future<void> _addParcel(SavedAddressesState savedState) async {
    final location = await showModalBottomSheet<ParcelLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LocationPickerSheet(
        title: 'Where to?',
        savedAddresses: savedState.addresses,
      ),
    );
    if (location == null || !mounted) return;

    final item = await showModalBottomSheet<ParcelItem>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ParcelDetailsSheet(
        dropoff: location,
        parcelIndex: _parcels.length + 1,
      ),
    );
    if (item == null || !mounted) return;

    setState(() => _parcels.add(item));
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) _updateCamera();
  }

  Future<void> _editParcel(int index) async {
    final updated = await showModalBottomSheet<ParcelItem>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ParcelDetailsSheet(
        dropoff: _parcels[index].dropoff,
        parcelIndex: index + 1,
        existing: _parcels[index],
      ),
    );
    if (updated == null || !mounted) return;
    setState(() => _parcels[index] = updated);
  }

  void _removeParcel(int index) {
    setState(() => _parcels.removeAt(index));
    _updateCamera();
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return BlocProvider(
      create: (_) => SavedAddressesCubit(),
      child: BlocBuilder<SavedAddressesCubit, SavedAddressesState>(
        builder: (context, savedState) {
          return Scaffold(
            backgroundColor: GodropColors.background,
            resizeToAvoidBottomInset: false,
            body: Column(
              children: [
                // ── Map with floating header ──
                Expanded(
                  child: Stack(
                    children: [
                      GoogleMap(
                        initialCameraPosition: CameraPosition(
                          target: LatLng(_pickup.lat, _pickup.lng),
                          zoom: 14,
                        ),
                        onMapCreated: (ctrl) {
                          _mapCtrl = ctrl;
                          if (!_locating) _updateCamera();
                        },
                        markers: _markers,
                        polylines: _polylines,
                        myLocationButtonEnabled: false,
                        zoomControlsEnabled: false,
                      ),
                      Positioned(
                        top: topPad + 12,
                        left: 16,
                        right: 16,
                        child: Row(
                          children: [
                            GestureDetector(
                              onTap: () => context.go('/home'),
                              child: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: GodropColors.card,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: GodropColors.softShadow,
                                ),
                                child: const Icon(Icons.chevron_left_rounded,
                                    color: GodropColors.ink, size: 24),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Container(
                                height: 40,
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 12),
                                alignment: Alignment.centerLeft,
                                decoration: BoxDecoration(
                                  color: GodropColors.card,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: GodropColors.softShadow,
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 26,
                                      height: 26,
                                      decoration: BoxDecoration(
                                        gradient: GodropColors.orangeGradient,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(
                                          Icons.inventory_2_rounded,
                                          color: Colors.white,
                                          size: 14),
                                    ),
                                    const SizedBox(width: 10),
                                    Text(
                                      _parcels.length > 1
                                          ? 'Send ${_parcels.length} parcels'
                                          : 'Send a parcel',
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                        color: GodropColors.ink,
                                        letterSpacing: -0.2,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // ── Address panel ──
                Container(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(context).size.height * 0.56,
                  ),
                  decoration: BoxDecoration(
                    color: GodropColors.card,
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(28)),
                    boxShadow: [
                      BoxShadow(
                        color: GodropColors.ink.withValues(alpha: 0.08),
                        blurRadius: 24,
                        offset: const Offset(0, -8),
                      ),
                    ],
                  ),
                  padding: EdgeInsets.fromLTRB(20, 22, 20, bottomPad + 20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 4,
                            height: 18,
                            decoration: BoxDecoration(
                              gradient: GodropColors.orangeGradient,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            "Pickup & drop-offs",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.ink,
                              letterSpacing: -0.3,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Flexible(
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Pickup
                              Container(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 12),
                                decoration: BoxDecoration(
                                  color: GodropColors.background,
                                  borderRadius: BorderRadius.circular(16),
                                  border:
                                      Border.all(color: GodropColors.border),
                                ),
                                child: _AddressTimelineRow(
                                  color: GodropColors.orange,
                                  icon: Icons.my_location_rounded,
                                  label: 'PICK UP',
                                  value: _locating
                                      ? 'Getting your location...'
                                      : _pickup.name,
                                  loading: _locating,
                                  onTap: _locating
                                      ? null
                                      : () => _changePickup(savedState),
                                ),
                              ),
                              const SizedBox(height: 12),
                              // Parcels list
                              ..._parcels.asMap().entries.map((e) {
                                final i = e.key;
                                final p = e.value;
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: _ParcelRow(
                                    index: i + 1,
                                    parcel: p,
                                    onEdit: () => _editParcel(i),
                                    onRemove: () => _removeParcel(i),
                                  ),
                                );
                              }),
                              // Add drop-off
                              _AddDropoffButton(
                                isFirst: _parcels.isEmpty,
                                onTap: _locating
                                    ? null
                                    : () => _addParcel(savedState),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Opacity(
                        opacity: _canContinue ? 1.0 : 0.5,
                        child: GodropButton(
                          label: _parcels.length > 1
                              ? 'Continue · ${_parcels.length} parcels →'
                              : 'Continue →',
                          onTap: !_canContinue
                              ? null
                              : () => context.go(
                                    '/parcel/vehicle',
                                    extra: ParcelRouteData(
                                      pickup: _pickup,
                                      parcels: List.of(_parcels),
                                    ),
                                  ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ── Supporting widgets ────────────────────────────────────────────────────────

class _ParcelRow extends StatelessWidget {
  final int index;
  final ParcelItem parcel;
  final VoidCallback onEdit;
  final VoidCallback onRemove;

  const _ParcelRow({
    required this.index,
    required this.parcel,
    required this.onEdit,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final meta = <String>[
      if (parcel.recipientName.isNotEmpty) parcel.recipientName,
      if (parcel.weightKg != null) '${parcel.weightKg} kg',
      if (parcel.description?.isNotEmpty == true) parcel.description!,
    ].join(' · ');
    return InkWell(
      onTap: onEdit,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: GodropColors.background,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GodropColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 30,
              height: 30,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                color: Color(0xFFE7EEFF),
                shape: BoxShape.circle,
              ),
              child: Text(
                '$index',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.blue,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    parcel.dropoff.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: GodropColors.ink,
                    ),
                  ),
                  if (meta.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        meta,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            fontSize: 12, color: GodropColors.mute),
                      ),
                    ),
                ],
              ),
            ),
            IconButton(
              onPressed: onRemove,
              visualDensity: VisualDensity.compact,
              icon: const Icon(Icons.close_rounded,
                  size: 18, color: GodropColors.mute),
            ),
          ],
        ),
      ),
    );
  }
}

class _AddDropoffButton extends StatelessWidget {
  final bool isFirst;
  final VoidCallback? onTap;
  const _AddDropoffButton({required this.isFirst, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: GodropColors.blue.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: GodropColors.blue.withValues(alpha: 0.4),
            width: 1.2,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.add_location_alt_rounded,
                size: 18, color: GodropColors.blue),
            const SizedBox(width: 8),
            Text(
              isFirst ? 'Add a drop-off' : 'Add another drop-off',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: GodropColors.blue,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AddressTimelineRow extends StatelessWidget {
  final Color color;
  final IconData icon;
  final String label;
  final String value;
  final bool loading;
  final bool placeholder;
  final VoidCallback? onTap;

  const _AddressTimelineRow({
    required this.color,
    required this.icon,
    required this.label,
    required this.value,
    this.loading = false,
    this.placeholder = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 16, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.mute,
                      letterSpacing: 0.6,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w600,
                      color: placeholder ? GodropColors.mute : GodropColors.ink,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            if (loading)
              const SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                    strokeWidth: 1.5, color: GodropColors.mute),
              )
            else
              const Icon(Icons.chevron_right_rounded,
                  color: GodropColors.mute, size: 20),
          ],
        ),
      ),
    );
  }
}

