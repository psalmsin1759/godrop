import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_places_flutter/google_places_flutter.dart';
import 'package:google_places_flutter/model/prediction.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import '../../app/theme.dart';
import '../../shared/widgets/godrop_button.dart';
import 'models/parcel_location.dart';

const _kApiKey = 'AIzaSyDQrymY31J4gl5ws6SStg42Vpk_AfWFt_U';

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
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      final address = await _reverseGeocode(position.latitude, position.longitude);

      if (mounted) {
        setState(() {
          _pickup = ParcelLocation(
            lat: position.latitude,
            lng: position.longitude,
            name: address ?? _kFallback.name,
          );
          _locating = false;
        });
        // Animate map to real location once it's ready
        _updateCamera();
      }
    } catch (_) {
      if (mounted) setState(() => _locating = false);
    }
  }

  Future<String?> _reverseGeocode(double lat, double lng) async {
    try {
      final uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', {
        'latlng': '$lat,$lng',
        'key': _kApiKey,
        'language': 'en',
        'result_type': 'street_address|route|sublocality',
      });
      final res = await http.get(uri);
      final data = json.decode(res.body) as Map<String, dynamic>;
      if (data['status'] == 'OK') {
        final results = data['results'] as List;
        if (results.isNotEmpty) {
          return results[0]['formatted_address'] as String;
        }
      }
    } catch (_) {}
    return null;
  }

  Set<Marker> get _markers => {
        Marker(
          markerId: const MarkerId('pickup'),
          position: LatLng(_pickup.lat, _pickup.lng),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
          infoWindow: InfoWindow(title: _pickup.name),
        ),
        if (_dropoff != null)
          Marker(
            markerId: const MarkerId('dropoff'),
            position: LatLng(_dropoff!.lat, _dropoff!.lng),
            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
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

  Future<void> _openAddressPicker({required bool isPickup}) async {
    final result = await showModalBottomSheet<ParcelLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AddressPickerSheet(
        title: isPickup ? 'Change pickup' : 'Set drop-off address',
      ),
    );
    if (result != null) {
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

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Column(
        children: [
          // ── Map with back button ──
          Expanded(
            child: Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(_pickup.lat, _pickup.lng),
                    zoom: 14,
                  ),
                  onMapCreated: (ctrl) {
                    setState(() => _mapCtrl = ctrl);
                    // If location resolved before map was ready, animate now
                    if (!_locating) _updateCamera();
                  },
                  markers: _markers,
                  polylines: _polylines,
                  myLocationButtonEnabled: false,
                  zoomControlsEnabled: false,
                ),
                Positioned(
                  top: topPad + 12,
                  left: 12,
                  right: 12,
                  child: Container(
                    width: double.infinity,
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => context.go('/home'),
                          child: Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.12),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.chevron_left_rounded, size: 24),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                             height: 38,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.12),
                                    blurRadius: 8,
                                  ),
                                ],
                              ),
                              child:  Padding(padding:  const EdgeInsets.symmetric(horizontal: 12, vertical: 8), child: Text('Send a parcel', style: Theme.of(context).textTheme.titleMedium,))
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Address panel ──
          Container(
            color: Colors.white,
            padding: EdgeInsets.fromLTRB(20, 20, 20, bottomPad + 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  "Where's it going?",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink,
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: GodropColors.background,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: _locating ? null : () => _openAddressPicker(isPickup: true),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Pick up", style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black45),),
                            _AddressRow(
                              dotColor: GodropColors.orange,
                              label: _locating ? 'Getting your location...' : _pickup.name,
                              hasAddress: !_locating,
                              actionLabel: _locating ? null : 'Edit',
                              loading: _locating,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 2),
                      Padding(
                        padding: const EdgeInsets.only(left: 20),
                        child: Container(width: 1.5, height: 16, color: GodropColors.border),
                      ),
                      const SizedBox(height: 2),
                      GestureDetector(
                        onTap: () => _openAddressPicker(isPickup: false),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Drop off", style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black45),),
                            _AddressRow(
                              dotColor: GodropColors.blue,
                              label: _dropoff?.name ?? 'Add drop-off address...',
                              hasAddress: _dropoff != null,
                              actionLabel: _dropoff != null ? 'Edit' : null,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _AddressChip(
                        label: 'Home',
                        icon: Icons.home_rounded,
                        onTap: () => _openAddressPicker(isPickup: false),
                      ),
                      const SizedBox(width: 8),
                      _AddressChip(
                        label: 'Work',
                        icon: Icons.work_rounded,
                        onTap: () => _openAddressPicker(isPickup: false),
                      ),
                      const SizedBox(width: 8),
                      _AddressChip(
                        label: '+ Add',
                        icon: Icons.add_rounded,
                        isAdd: true,
                        onTap: () => _openAddressPicker(isPickup: false),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Opacity(
                  opacity: _dropoff == null ? 0.5 : 1.0,
                  child: GodropButton(
                    label: 'Continue →',
                    onTap: _dropoff == null
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
  }
}

// ── Address picker sheet (uses google_places_flutter) ─────────────────────────

class _AddressPickerSheet extends StatefulWidget {
  final String title;
  const _AddressPickerSheet({required this.title});

  @override
  State<_AddressPickerSheet> createState() => _AddressPickerSheetState();
}

class _AddressPickerSheetState extends State<_AddressPickerSheet> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onPlaceSelected(Prediction prediction) {
    final lat = double.tryParse(prediction.lat ?? '');
    final lng = double.tryParse(prediction.lng ?? '');
    if (lat != null && lng != null && mounted) {
      Navigator.of(context).pop(ParcelLocation(
        lat: lat,
        lng: lng,
        name: prediction.description ?? _controller.text,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewInset = MediaQuery.of(context).viewInsets.bottom;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    final screenHeight = MediaQuery.of(context).size.height;

    return Padding(
      padding: EdgeInsets.only(bottom: viewInset),
      child: Container(
        height: screenHeight * 0.5,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.fromLTRB(16, 16, 16, bottomPad + 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle
            Center(
              child: Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: GodropColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            // Header
            Row(
              children: [
                Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink,
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: GodropColors.background,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.close_rounded, size: 18, color: GodropColors.slate),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Google Places autocomplete field
            GooglePlaceAutoCompleteTextField(
              textEditingController: _controller,
              googleAPIKey: _kApiKey,
              inputDecoration: InputDecoration(
                hintText: 'Search for an address...',
                hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 15),
                prefixIcon: const Icon(Icons.search_rounded, color: GodropColors.slate, size: 20),
                filled: true,
                fillColor: GodropColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: GodropColors.blue, width: 1.5),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
              textStyle: const TextStyle(fontSize: 15, color: GodropColors.ink),
              debounceTime: 500,
              countries: const ['ng'],
              isLatLngRequired: true,
              getPlaceDetailWithLatLng: _onPlaceSelected,
              itemClick: (Prediction prediction) {
                _controller
                  ..text = prediction.description ?? ''
                  ..selection = TextSelection.fromPosition(
                    TextPosition(offset: _controller.text.length),
                  );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ── Supporting widgets ────────────────────────────────────────────────────────

class _AddressRow extends StatelessWidget {
  final Color dotColor;
  final String label;
  final bool hasAddress;
  final String? actionLabel;
  final bool loading;

  const _AddressRow({
    required this.dotColor,
    required this.label,
    required this.hasAddress,
    this.actionLabel,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 15,
                    color: hasAddress ? GodropColors.ink : GodropColors.mute,
                    fontWeight: hasAddress ? FontWeight.w500 : FontWeight.w400,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (loading) ...[
                const SizedBox(width: 8),
                const SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(
                    strokeWidth: 1.5,
                    color: GodropColors.mute,
                  ),
                ),
              ] else if (actionLabel != null) ...[
                const SizedBox(width: 8),
                Text(
                  actionLabel!,
                  style: const TextStyle(
                    fontSize: 13,
                    color: GodropColors.blue,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _AddressChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isAdd;
  final VoidCallback onTap;

  const _AddressChip({
    required this.label,
    required this.icon,
    required this.onTap,
    this.isAdd = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isAdd ? GodropColors.blue.withValues(alpha: 0.06) : GodropColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isAdd ? GodropColors.blue.withValues(alpha: 0.2) : GodropColors.border,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 14, color: isAdd ? GodropColors.blue : GodropColors.slate),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: isAdd ? GodropColors.blue : GodropColors.ink,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
