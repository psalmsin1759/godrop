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
  ParcelLocation? _dropoff;
  bool _locating = true;

  // Both pickup (resolved, not still loading) and drop-off must be set
  // before the user can proceed to the next step.
  bool get _canContinue => !_locating && _dropoff != null;

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
        if (_dropoff != null)
          Marker(
            markerId: const MarkerId('dropoff'),
            position: LatLng(_dropoff!.lat, _dropoff!.lng),
            icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueAzure),
            infoWindow: InfoWindow(title: _dropoff!.name),
          ),
      };

  Set<Polyline> get _polylines {
    if (_dropoff == null) return {};
    return {
      Polyline(
        polylineId: const PolylineId('route'),
        points: [
          LatLng(_pickup.lat, _pickup.lng),
          LatLng(_dropoff!.lat, _dropoff!.lng),
        ],
        color: GodropColors.blue,
        width: 4,
        patterns: [PatternItem.dash(20), PatternItem.gap(10)],
      ),
    };
  }

  void _updateCamera() {
    final ctrl = _mapCtrl;
    if (ctrl == null) return;
    if (_dropoff != null) {
      final minLat = min(_pickup.lat, _dropoff!.lat);
      final maxLat = max(_pickup.lat, _dropoff!.lat);
      final minLng = min(_pickup.lng, _dropoff!.lng);
      final maxLng = max(_pickup.lng, _dropoff!.lng);
      ctrl.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBounds(
            southwest: LatLng(minLat - 0.005, minLng - 0.005),
            northeast: LatLng(maxLat + 0.005, maxLng + 0.005),
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

  Future<void> _openAddressPicker({
    required bool isPickup,
    required SavedAddressesState savedState,
  }) async {
    final result = await showModalBottomSheet<ParcelLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LocationPickerSheet(
        title: isPickup ? 'Change pickup' : 'Where to?',
        showCurrentLocation: isPickup,
        savedAddresses: savedState.addresses,
      ),
    );
    if (result != null && mounted) {
      setState(() {
        if (isPickup) {
          _pickup = result;
        } else {
          _dropoff = result;
        }
      });
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted) _updateCamera();
    }
  }

  Future<void> _useCurrentLocationForPickup() async {
    setState(() => _locating = true);
    await _resolveCurrentLocation();
  }

  Future<void> _onQuickAddress(
      SavedAddressesState savedState, String label) async {
    final saved = label == 'Home' ? savedState.home : savedState.work;

    if (saved != null) {
      setState(() {
        _dropoff =
            ParcelLocation(lat: saved.lat, lng: saved.lng, name: saved.address);
      });
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted) _updateCamera();
      return;
    }

    final result = await showModalBottomSheet<ParcelLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LocationPickerSheet(
        title: 'Set your $label address',
        savedAddresses: savedState.addresses,
      ),
    );
    if (result == null || !mounted) return;

    setState(() => _dropoff = result);
    await Future.delayed(const Duration(milliseconds: 300));
    if (mounted) _updateCamera();

    if (!mounted) return;
    final shouldSave = await _confirmSaveAddress(label, result.name);
    if (shouldSave == true && mounted) {
      await context.read<SavedAddressesCubit>().saveAddress(
            label: label,
            address: result.name,
            lat: result.lat,
            lng: result.lng,
          );
    }
  }

  Future<bool?> _confirmSaveAddress(String label, String address) {
    final gradient = label == 'Work'
        ? GodropColors.orangeGradient
        : GodropColors.blueGradient;
    final icon = label == 'Work' ? Icons.work_rounded : Icons.home_rounded;
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration:
                  BoxDecoration(gradient: gradient, shape: BoxShape.circle),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text('Save as $label?',
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink)),
            ),
          ],
        ),
        content: Text(
          'Save "$address" as your $label address for faster checkout next time.',
          style: const TextStyle(
              color: GodropColors.slate, fontSize: 14, height: 1.4),
        ),
        actionsAlignment: MainAxisAlignment.spaceBetween,
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Not now',
                style: TextStyle(
                    color: GodropColors.mute, fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Save',
                style: TextStyle(
                    color: GodropColors.blue, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
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
                                    const Text(
                                      'Send a parcel',
                                      style: TextStyle(
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
                            "Where's it going?",
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
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: GodropColors.background,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: GodropColors.border),
                        ),
                        child: Column(
                          children: [
                            _AddressTimelineRow(
                              color: GodropColors.orange,
                              icon: Icons.my_location_rounded,
                              label: 'PICK UP',
                              value: _locating
                                  ? 'Getting your location...'
                                  : _pickup.name,
                              loading: _locating,
                              onTap: _locating
                                  ? null
                                  : () => _openAddressPicker(
                                      isPickup: true, savedState: savedState),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(left: 17),
                              child: Container(
                                width: 2,
                                height: 16,
                                color: GodropColors.border,
                              ),
                            ),
                            _AddressTimelineRow(
                              color: GodropColors.blue,
                              icon: Icons.flag_rounded,
                              label: 'DROP OFF',
                              value: _dropoff?.name ??
                                  'Where are you sending this to?',
                              placeholder: _dropoff == null,
                              onTap: () => _openAddressPicker(
                                  isPickup: false, savedState: savedState),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          _QuickChip(
                            icon: Icons.my_location_rounded,
                            label: 'My location',
                            gradient: GodropColors.blueGradient,
                            onTap: _useCurrentLocationForPickup,
                          ),
                          const SizedBox(width: 10),
                          _QuickChip(
                            icon: Icons.home_rounded,
                            label: 'Home',
                            saved: savedState.home != null,
                            gradient: GodropColors.blueGradient,
                            onTap: () => _onQuickAddress(savedState, 'Home'),
                          ),
                          const SizedBox(width: 10),
                          _QuickChip(
                            icon: Icons.work_rounded,
                            label: 'Work',
                            saved: savedState.work != null,
                            gradient: GodropColors.orangeGradient,
                            onTap: () => _onQuickAddress(savedState, 'Work'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Opacity(
                        opacity: _canContinue ? 1.0 : 0.5,
                        child: GodropButton(
                          label: 'Continue →',
                          onTap: !_canContinue
                              ? null
                              : () => context.go(
                                    '/parcel/vehicle',
                                    extra: ParcelRouteData(
                                      pickup: _pickup,
                                      dropoff: _dropoff!,
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

class _QuickChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final LinearGradient gradient;
  final bool? saved;
  final VoidCallback onTap;

  const _QuickChip({
    required this.icon,
    required this.label,
    required this.gradient,
    required this.onTap,
    this.saved,
  });

  @override
  Widget build(BuildContext context) {
    final isAddState = saved == false;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: GodropColors.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: GodropColors.border),
            boxShadow: GodropColors.softShadow,
          ),
          child: Column(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  gradient: isAddState ? null : gradient,
                  color: isAddState ? GodropColors.background : null,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isAddState ? Icons.add_rounded : icon,
                  size: 18,
                  color: isAddState ? GodropColors.slate : Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                isAddState ? 'Add $label' : label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
