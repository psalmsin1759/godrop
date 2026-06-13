import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/api/places_service.dart';
import '../../shared/bloc/saved_addresses_cubit.dart';
import '../../shared/models/common_models.dart';
import '../../shared/models/delivery_models.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/widgets/godrop_back_button.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/section_header.dart';
import '../parcel/models/parcel_location.dart';
import '../parcel/widgets/location_picker_sheet.dart';
import 'bloc/truck_cubit.dart';
import 'bloc/truck_state.dart';
import 'models/truck_booking_data.dart';

const _kFallback = ParcelLocation(
  lat: 6.5244,
  lng: 3.3792,
  name: 'Lagos, Nigeria',
);

class TruckBookingScreen extends StatelessWidget {
  const TruckBookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => TruckCubit()..load()),
        BlocProvider(create: (_) => SavedAddressesCubit()),
      ],
      child: const _TruckBookingBody(),
    );
  }
}

class _TruckBookingBody extends StatefulWidget {
  const _TruckBookingBody();

  @override
  State<_TruckBookingBody> createState() => _TruckBookingBodyState();
}

class _TruckBookingBodyState extends State<_TruckBookingBody> {
  GoogleMapController? _mapCtrl;
  ParcelLocation _pickup = _kFallback;
  ParcelLocation? _dropoff;
  bool _locating = true;

  String? _selectedApartmentId;
  String? _selectedApartmentName;
  int _selectedTruckIndex = -1;
  int _loaderCount = 1;
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _selectedTime = TimeOfDay.now();

  @override
  void initState() {
    super.initState();
    _resolveCurrentLocation();
  }

  @override
  void dispose() {
    _mapCtrl?.dispose();
    super.dispose();
  }

  // ── Location ──────────────────────────────────────────────────────────────

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
      final address = await PlacesService.reverseGeocode(position.latitude, position.longitude);
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

  // ── Quote ─────────────────────────────────────────────────────────────────

  void _tryFetchQuote() {
    if (_dropoff == null || _selectedApartmentId == null) return;
    final state = context.read<TruckCubit>().state;
    final truckTypeId = state is TruckLoaded && _selectedTruckIndex >= 0
        ? state.truckTypes[_selectedTruckIndex].id
        : null;
    context.read<TruckCubit>().fetchQuote(
      apartmentTypeId: _selectedApartmentId!,
      truckTypeId: truckTypeId,
      numLoaders: _loaderCount,
      pickup: LocationPoint(lat: _pickup.lat, lng: _pickup.lng, address: _pickup.name),
      dropoff: LocationPoint(lat: _dropoff!.lat, lng: _dropoff!.lng, address: _dropoff!.name),
    );
  }

  // ── Map helpers ───────────────────────────────────────────────────────────

  double? get _distanceKm {
    if (_dropoff == null) return null;
    return _haversineKm(_pickup.lat, _pickup.lng, _dropoff!.lat, _dropoff!.lng);
  }

  double _haversineKm(double lat1, double lng1, double lat2, double lng2) {
    const R = 6371.0;
    final dLat = _rad(lat2 - lat1);
    final dLng = _rad(lng2 - lng1);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_rad(lat1)) * cos(_rad(lat2)) * sin(dLng / 2) * sin(dLng / 2);
    return R * 2 * atan2(sqrt(a), sqrt(1 - a));
  }

  double _rad(double deg) => deg * pi / 180;

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
          80,
        ),
      );
    } else {
      ctrl.animateCamera(
        CameraUpdate.newLatLngZoom(LatLng(_pickup.lat, _pickup.lng), 14),
      );
    }
  }

  Future<void> _openAddressPicker({required bool isPickup}) async {
    final saved = context.read<SavedAddressesCubit>().state.addresses;
    final result = await showModalBottomSheet<ParcelLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LocationPickerSheet(
        title: isPickup ? 'Change pickup address' : 'Set drop-off address',
        showCurrentLocation: isPickup,
        savedAddresses: saved,
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
      _updateCamera();
      _tryFetchQuote();
    }
  }

  // ── Date / time ───────────────────────────────────────────────────────────

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate.isBefore(now) ? now : _selectedDate,
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
            primary: GodropColors.blue,
            onPrimary: Colors.white,
            surface: Colors.white,
            onSurface: GodropColors.ink,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
            primary: GodropColors.blue,
            onPrimary: Colors.white,
            surface: Colors.white,
            onSurface: GodropColors.ink,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedTime = picked);
  }

  String get _dateLabel {
    final now = DateTime.now();
    final isToday = _selectedDate.year == now.year &&
        _selectedDate.month == now.month &&
        _selectedDate.day == now.day;
    if (isToday) return 'Today';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${_selectedDate.day} ${months[_selectedDate.month - 1]}';
  }

  String get _timeLabel {
    final h = _selectedTime.hourOfPeriod == 0 ? 12 : _selectedTime.hourOfPeriod;
    final m = _selectedTime.minute.toString().padLeft(2, '0');
    final period = _selectedTime.period == DayPeriod.am ? 'AM' : 'PM';
    return '$h:$m $period';
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;
    final dist = _distanceKm;

    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: GodropColors.background,
      body: Column(
        children: [
          // ── Map ──
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.30,
            child: Stack(
              children: [
                GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(_pickup.lat, _pickup.lng),
                    zoom: 14,
                  ),
                  onMapCreated: (ctrl) {
                    setState(() => _mapCtrl = ctrl);
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
                  child: GodropBackButton(onTap: () => context.go('/home')),
                ),
                Positioned(
                  top: topPad + 12,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: GodropColors.softShadow,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 22,
                            height: 22,
                            decoration: const BoxDecoration(
                              gradient: GodropColors.orangeGradient,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.local_shipping_rounded,
                                color: Colors.white, size: 12),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Book a Truck',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.ink,
                              letterSpacing: -0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                if (dist != null)
                  Positioned(
                    bottom: 12,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          gradient: GodropColors.blueGradient,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: GodropColors.blue.withValues(alpha: 0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.straighten_rounded,
                                size: 14, color: Colors.white),
                            const SizedBox(width: 6),
                            Text(
                              '${dist.toStringAsFixed(1)} km',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // ── Booking panel ──
          Expanded(
            child: BlocBuilder<TruckCubit, TruckState>(
              builder: (context, state) {
                return SingleChildScrollView(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, bottomPad + 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Set your route, pick a truck and add helpers',
                        style: TextStyle(fontSize: 14, color: GodropColors.slate),
                      ),
                      const SizedBox(height: 16),

                      // ── Route ──
                      AnimatedEntrance(
                        child: _RouteSection(
                          pickup: _pickup,
                          dropoff: _dropoff,
                          locating: _locating,
                          distKm: dist,
                          onPickupTap: () => _openAddressPicker(isPickup: true),
                          onDropoffTap: () => _openAddressPicker(isPickup: false),
                        ),
                      ),

                      const SizedBox(height: 22),

                      // ── Apartment type ──
                      const AnimatedEntrance(
                        delay: Duration(milliseconds: 60),
                        child: GodropSectionHeader(
                          title: 'What kind of apartment are you moving from?',
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Padding(
                        padding: EdgeInsets.only(left: 12),
                        child: Text(
                          'Helps us calculate the right price',
                          style: TextStyle(fontSize: 13, color: GodropColors.slate),
                        ),
                      ),
                      const SizedBox(height: 12),

                      AnimatedEntrance(
                        delay: const Duration(milliseconds: 60),
                        child: state is TruckLoading || state is TruckInitial
                            ? _ApartmentShimmer()
                            : state is TruckError
                                ? _ErrorRetry(
                                    message: state.message,
                                    onRetry: () =>
                                        context.read<TruckCubit>().load(),
                                  )
                                : state is TruckLoaded
                                    ? _ApartmentGrid(
                                        types: state.apartmentTypes,
                                        selectedId: _selectedApartmentId,
                                        onSelect: (type) {
                                          setState(() {
                                            _selectedApartmentId = type.id;
                                            _selectedApartmentName = type.name;
                                          });
                                          _tryFetchQuote();
                                        },
                                      )
                                    : const SizedBox.shrink(),
                      ),

                      const SizedBox(height: 22),

                      // ── Truck type ──
                      const AnimatedEntrance(
                        delay: Duration(milliseconds: 120),
                        child: GodropSectionHeader(title: 'Choose your truck'),
                      ),
                      const SizedBox(height: 12),

                      AnimatedEntrance(
                        delay: const Duration(milliseconds: 120),
                        child: state is TruckLoading || state is TruckInitial
                            ? _TruckListShimmer()
                            : state is TruckLoaded
                                ? Column(
                                    children: state.truckTypes.isEmpty
                                        ? const [_EmptyTruckTypes()]
                                        : state.truckTypes
                                            .asMap()
                                            .entries
                                            .map(
                                              (e) => Padding(
                                                padding: const EdgeInsets.only(
                                                    bottom: 10),
                                                child: _TruckCard(
                                                  truckType: e.value,
                                                  selected:
                                                      _selectedTruckIndex == e.key,
                                                  onTap: () {
                                                    setState(() =>
                                                        _selectedTruckIndex = e.key);
                                                    _tryFetchQuote();
                                                  },
                                                ),
                                              ),
                                            )
                                            .toList(),
                                  )
                                : const SizedBox.shrink(),
                      ),

                      const SizedBox(height: 22),

                      // ── Date & time ──
                      const AnimatedEntrance(
                        delay: Duration(milliseconds: 180),
                        child: GodropSectionHeader(title: 'When are you moving?'),
                      ),
                      const SizedBox(height: 4),
                      const Padding(
                        padding: EdgeInsets.only(left: 12),
                        child: Text(
                          'Pick a date and time for your move',
                          style: TextStyle(fontSize: 13, color: GodropColors.slate),
                        ),
                      ),
                      const SizedBox(height: 12),
                      AnimatedEntrance(
                        delay: const Duration(milliseconds: 180),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: _pickDate,
                                child: _DateTimePicker(
                                  icon: Icons.calendar_today_rounded,
                                  iconColor: GodropColors.blue,
                                  label: 'DATE',
                                  value: _dateLabel,
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: GestureDetector(
                                onTap: _pickTime,
                                child: _DateTimePicker(
                                  icon: Icons.access_time_rounded,
                                  iconColor: GodropColors.orange,
                                  label: 'TIME',
                                  value: _timeLabel,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 22),

                      // ── Loaders ──
                      const AnimatedEntrance(
                        delay: Duration(milliseconds: 240),
                        child: GodropSectionHeader(
                            title: 'How many loaders do you need?'),
                      ),
                      const SizedBox(height: 4),
                      const Padding(
                        padding: EdgeInsets.only(left: 12),
                        child: Text(
                          'Loaders help carry and load your items',
                          style: TextStyle(fontSize: 13, color: GodropColors.slate),
                        ),
                      ),
                      const SizedBox(height: 12),
                      AnimatedEntrance(
                        delay: const Duration(milliseconds: 240),
                        child: _LoadersCard(
                          count: _loaderCount,
                          perLoaderKobo: state is TruckLoaded
                              ? state.perLoaderKobo
                              : 500000,
                          onChanged: (v) {
                            setState(() => _loaderCount = v);
                            _tryFetchQuote();
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // ── CTA ──
          BlocBuilder<TruckCubit, TruckState>(
            builder: (context, state) {
              return _CtaBar(
                state: state,
                dropoff: _dropoff,
                distKm: dist,
                selectedApartmentId: _selectedApartmentId,
                selectedApartmentName: _selectedApartmentName,
                truckTypeName: state is TruckLoaded && _selectedTruckIndex >= 0
                    ? state.truckTypes[_selectedTruckIndex].name
                    : '',
                truckTypeId: state is TruckLoaded && _selectedTruckIndex >= 0
                    ? state.truckTypes[_selectedTruckIndex].id
                    : null,
                loaderCount: _loaderCount,
                perLoaderKobo: state is TruckLoaded ? state.perLoaderKobo : 500000,
                pickup: _pickup,
                scheduledDate: _selectedDate,
                scheduledTime: _selectedTime,
                bottomPad: MediaQuery.of(context).padding.bottom,
              );
            },
          ),
        ],
      ),
    );
  }
}

// ── Route section ─────────────────────────────────────────────────────────────

class _RouteSection extends StatelessWidget {
  final ParcelLocation pickup;
  final ParcelLocation? dropoff;
  final bool locating;
  final double? distKm;
  final VoidCallback onPickupTap;
  final VoidCallback onDropoffTap;

  const _RouteSection({
    required this.pickup,
    required this.dropoff,
    required this.locating,
    required this.distKm,
    required this.onPickupTap,
    required this.onDropoffTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
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
              const Text(
                'YOUR ROUTE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.slate,
                  letterSpacing: 0.5,
                ),
              ),
              const Spacer(),
              if (distKm != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: GodropColors.blue.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${distKm!.toStringAsFixed(1)} km away',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: GodropColors.blue,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: GodropColors.background,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: GodropColors.border),
            ),
            child: Column(
              children: [
                _AddressRow(
                  icon: Icons.my_location_rounded,
                  color: GodropColors.orange,
                  label: 'MOVING FROM',
                  address: locating ? 'Getting your location...' : pickup.name,
                  hasAddress: !locating,
                  loading: locating,
                  onTap: locating ? null : onPickupTap,
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 17),
                  child: Container(width: 2, height: 16, color: GodropColors.border),
                ),
                _AddressRow(
                  icon: Icons.flag_rounded,
                  color: GodropColors.blue,
                  label: 'MOVING TO',
                  address: dropoff?.name ?? 'Tap to add destination',
                  hasAddress: dropoff != null,
                  onTap: onDropoffTap,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Address row ───────────────────────────────────────────────────────────────

class _AddressRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final String address;
  final bool hasAddress;
  final bool loading;
  final VoidCallback? onTap;

  const _AddressRow({
    required this.icon,
    required this.color,
    required this.label,
    required this.address,
    required this.hasAddress,
    this.loading = false,
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
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.mute,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    address,
                    style: TextStyle(
                      fontSize: 14,
                      color: hasAddress ? GodropColors.ink : GodropColors.mute,
                      fontWeight: hasAddress ? FontWeight.w600 : FontWeight.w400,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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

// ── Apartment grid ────────────────────────────────────────────────────────────

class _ApartmentGrid extends StatelessWidget {
  final List<ApartmentType> types;
  final String? selectedId;
  final ValueChanged<ApartmentType> onSelect;

  static const _icons = [
    Icons.chair_rounded,
    Icons.bed_rounded,
    Icons.bedroom_child_rounded,
    Icons.bedroom_parent_rounded,
    Icons.home_rounded,
  ];

  const _ApartmentGrid({
    required this.types,
    required this.selectedId,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.45,
      ),
      itemCount: types.length,
      itemBuilder: (_, i) {
        final t = types[i];
        final isSelected = selectedId == t.id;
        final icon = i < _icons.length ? _icons[i] : Icons.home_rounded;
        return GestureDetector(
          onTap: () => onSelect(t),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            decoration: BoxDecoration(
              color: isSelected
                  ? GodropColors.blue.withValues(alpha: 0.07)
                  : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? GodropColors.blue : GodropColors.border,
                width: isSelected ? 1.5 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: GodropColors.blue.withValues(alpha: 0.12),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : GodropColors.softShadow,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: isSelected ? GodropColors.blueGradient : null,
                    color: isSelected
                        ? null
                        : GodropColors.slate.withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon,
                      size: 18,
                      color: isSelected ? Colors.white : GodropColors.slate),
                ),
                const SizedBox(height: 6),
                Text(
                  t.name,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? GodropColors.blue : GodropColors.ink,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _ApartmentShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.45,
      ),
      itemCount: 5,
      itemBuilder: (_, __) => Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade50,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

// ── Truck type list ───────────────────────────────────────────────────────────

class _TruckCard extends StatelessWidget {
  final TruckType truckType;
  final bool selected;
  final VoidCallback onTap;

  const _TruckCard({
    required this.truckType,
    required this.selected,
    required this.onTap,
  });

  String _formatKobo(int kobo) {
    final n = (kobo ~/ 100).toString();
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? GodropColors.orange : GodropColors.border,
            width: selected ? 2 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: GodropColors.orange.withValues(alpha: 0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: selected ? GodropColors.orangeGradient : null,
                color: selected ? null : GodropColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.local_shipping_rounded,
                  color: selected ? Colors.white : GodropColors.blue, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    truckType.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: GodropColors.ink,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    truckType.capacity ?? truckType.description ?? '',
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.slate),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  _formatKobo(truckType.baseFeeKobo),
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink,
                    fontSize: 15,
                  ),
                ),
                const Text(
                  'base fee',
                  style: TextStyle(fontSize: 11, color: GodropColors.mute),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TruckListShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        3,
        (i) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Shimmer.fromColors(
            baseColor: Colors.grey.shade200,
            highlightColor: Colors.grey.shade50,
            child: Container(
              height: 72,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyTruckTypes extends StatelessWidget {
  const _EmptyTruckTypes();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: const Center(
        child: Text(
          'No truck types available at the moment',
          style: TextStyle(fontSize: 13, color: GodropColors.mute),
        ),
      ),
    );
  }
}

// ── Date / time picker ────────────────────────────────────────────────────────

class _DateTimePicker extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;

  const _DateTimePicker({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.mute,
                  letterSpacing: 0.4,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Loaders card ──────────────────────────────────────────────────────────────

class _LoadersCard extends StatelessWidget {
  final int count;
  final int perLoaderKobo;
  final ValueChanged<int> onChanged;

  const _LoadersCard({
    required this.count,
    required this.perLoaderKobo,
    required this.onChanged,
  });

  String _fmt(int kobo) {
    final n = (kobo ~/ 100).toString();
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  @override
  Widget build(BuildContext context) {
    final totalKobo = count * perLoaderKobo;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: GodropColors.blue.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.people_rounded,
                color: GodropColors.blue, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$count loader${count > 1 ? 's' : ''}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: GodropColors.ink,
                  ),
                ),
                Text(
                  '${_fmt(totalKobo)} total',
                  style: const TextStyle(fontSize: 12, color: GodropColors.slate),
                ),
              ],
            ),
          ),
          _LoaderCounter(
            value: count,
            min: 0,
            max: 20,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

class _LoaderCounter extends StatelessWidget {
  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;

  const _LoaderCounter({
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _CountBtn(
          icon: Icons.remove_rounded,
          enabled: value > min,
          onTap: () => onChanged(value - 1),
        ),
        SizedBox(
          width: 38,
          child: Text(
            '$value',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: GodropColors.ink,
            ),
          ),
        ),
        _CountBtn(
          icon: Icons.add_rounded,
          enabled: value < max,
          onTap: () => onChanged(value + 1),
        ),
      ],
    );
  }
}

class _CountBtn extends StatelessWidget {
  final IconData icon;
  final bool enabled;
  final VoidCallback onTap;

  const _CountBtn({required this.icon, required this.enabled, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: enabled
              ? GodropColors.blue.withValues(alpha: 0.1)
              : GodropColors.background,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          size: 18,
          color: enabled ? GodropColors.blue : GodropColors.mute,
        ),
      ),
    );
  }
}

// ── CTA bar ───────────────────────────────────────────────────────────────────

class _CtaBar extends StatelessWidget {
  final TruckState state;
  final ParcelLocation? dropoff;
  final double? distKm;
  final String? selectedApartmentId;
  final String? selectedApartmentName;
  final String truckTypeName;
  final String? truckTypeId;
  final int loaderCount;
  final int perLoaderKobo;
  final ParcelLocation pickup;
  final DateTime scheduledDate;
  final TimeOfDay scheduledTime;
  final double bottomPad;

  const _CtaBar({
    required this.state,
    required this.dropoff,
    required this.distKm,
    required this.selectedApartmentId,
    required this.selectedApartmentName,
    required this.truckTypeName,
    this.truckTypeId,
    required this.loaderCount,
    required this.perLoaderKobo,
    required this.pickup,
    required this.scheduledDate,
    required this.scheduledTime,
    required this.bottomPad,
  });

  String _fmt(int kobo) {
    final n = (kobo ~/ 100).toString();
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  @override
  Widget build(BuildContext context) {
    final loaded = state is TruckLoaded ? state as TruckLoaded : null;
    final quote = loaded?.quote;
    final quoteLoading = loaded?.quoteLoading ?? false;
    final quoteError = loaded?.quoteError;

    final canContinue = dropoff != null &&
        selectedApartmentId != null &&
        quote != null &&
        !quoteLoading;

    String ctaLabel;
    if (dropoff == null) {
      ctaLabel = 'Add a drop-off address';
    } else if (selectedApartmentId == null) {
      ctaLabel = 'Select apartment type';
    } else if (quoteLoading) {
      ctaLabel = 'Calculating price...';
    } else if (quoteError != null) {
      ctaLabel = 'Retry price calculation';
    } else if (quote != null) {
      ctaLabel = 'Continue · ${_fmt(quote.totalKobo)}';
    } else {
      ctaLabel = 'Continue';
    }

    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, bottomPad + 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (distKm != null && selectedApartmentName != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$selectedApartmentName · ${distKm!.toStringAsFixed(1)} km',
                  style: const TextStyle(fontSize: 13, color: GodropColors.slate),
                ),
                Text(
                  '$loaderCount loader${loaderCount > 1 ? 's' : ''}',
                  style: const TextStyle(fontSize: 13, color: GodropColors.slate),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
          if (quoteLoading)
            Shimmer.fromColors(
              baseColor: Colors.grey.shade200,
              highlightColor: Colors.grey.shade50,
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            )
          else
            Opacity(
              opacity: canContinue ? 1.0 : 0.6,
              child: GodropButton(
                label: ctaLabel,
                onTap: canContinue
                    ? () => context.push(
                          '/truck/confirmation',
                          extra: TruckBookingData(
                            pickup: pickup,
                            dropoff: dropoff!,
                            distanceKm: distKm ?? 0,
                            truckTypeName: truckTypeName,
                            truckTypeId: truckTypeId,
                            apartmentTypeId: selectedApartmentId,
                            apartmentTypeName: selectedApartmentName,
                            loaderCount: loaderCount,
                            perLoaderKobo: perLoaderKobo,
                            scheduledDate: scheduledDate,
                            scheduledTime: scheduledTime,
                            priceBreakdown: quote,
                            estimatedMinutes: loaded?.estimatedMinutes,
                          ),
                        )
                    : quoteError != null
                        ? () => context.read<TruckCubit>().fetchQuote(
                              apartmentTypeId: selectedApartmentId!,
                              truckTypeId: truckTypeId,
                              numLoaders: loaderCount,
                              pickup: LocationPoint(
                                lat: pickup.lat,
                                lng: pickup.lng,
                                address: pickup.name,
                              ),
                              dropoff: LocationPoint(
                                lat: dropoff!.lat,
                                lng: dropoff!.lng,
                                address: dropoff!.name,
                              ),
                            )
                        : null,
                color: GodropColors.orange,
              ),
            ),
        ],
      ),
    );
  }
}

// ── Error / retry ─────────────────────────────────────────────────────────────

class _ErrorRetry extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorRetry({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          Text(message,
              style: const TextStyle(fontSize: 13, color: GodropColors.slate),
              textAlign: TextAlign.center),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: onRetry,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              decoration: BoxDecoration(
                color: GodropColors.blue.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Retry',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: GodropColors.blue),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
