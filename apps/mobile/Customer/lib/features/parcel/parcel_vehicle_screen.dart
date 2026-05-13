import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import '../../app/theme.dart';
import '../../shared/models/common_models.dart';
import '../../shared/models/delivery_models.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/parcel_cubit.dart';
import 'bloc/parcel_state.dart';
import 'models/parcel_location.dart';

String _formatKobo(int kobo) {
  final naira = kobo / 100;
  final formatted = naira.toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]},',
      );
  return '₦$formatted';
}

IconData _iconForVehicleType(String name) {
  final n = name.toLowerCase();
  if (n.contains('bicycle') || n.contains('cycle')) return Icons.directions_bike_rounded;
  if (n.contains('motorcycle') || n.contains('motor') || n.contains('bike')) {
    return Icons.two_wheeler_rounded;
  }
  if (n.contains('van')) return Icons.airport_shuttle_rounded;
  if (n.contains('truck') || n.contains('pickup')) return Icons.local_shipping_rounded;
  if (n.contains('car')) return Icons.directions_car_rounded;
  return Icons.delivery_dining_rounded;
}

class ParcelVehicleScreen extends StatefulWidget {
  final ParcelRouteData? routeData;
  const ParcelVehicleScreen({super.key, this.routeData});

  @override
  State<ParcelVehicleScreen> createState() => _ParcelVehicleScreenState();
}

class _ParcelVehicleScreenState extends State<ParcelVehicleScreen> {
  int? _selectedPayment;
  final _recipientNameCtrl = TextEditingController();
  final _recipientPhoneCtrl = TextEditingController();
  final _descriptionCtrl = TextEditingController();
  PhoneNumber _phoneNumber = PhoneNumber(isoCode: 'NG');
  bool _phoneValid = false;

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
          southwest: LatLng(minLat - 0.005, minLng - 0.005),
          northeast: LatLng(maxLat + 0.005, maxLng + 0.005),
        ),
        48,
      ),
    );
  }

  void _proceed(ParcelLoaded parcelState) {
    final selected = parcelState.selectedType;
    final fullPhone = _phoneNumber.phoneNumber;
    context.go(
      '/parcel/finding',
      extra: ParcelRouteData(
        pickup: _pickup,
        dropoff: _dropoff,
        vehicleTypeId: selected?.id ?? '',
        vehicleLabel: selected?.name ?? '',
        quotedTotalKobo: parcelState.quote?.totalKobo,
        estimatedMinutes: parcelState.estimatedMinutes,
        paymentMethod: _selectedPayment == 0 ? 'cash' : 'card',
        recipientName: _recipientNameCtrl.text.trim(),
        recipientPhone: fullPhone?.trim() ?? '',
        packageDescription: _descriptionCtrl.text.trim().isEmpty
            ? 'Parcel delivery'
            : _descriptionCtrl.text.trim(),
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  void dispose() {
    _recipientNameCtrl.dispose();
    _recipientPhoneCtrl.dispose();
    _descriptionCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return BlocProvider(
      create: (_) => ParcelCubit()
        ..loadVehicleTypes(
          pickup: LocationPoint(lat: _pickup.lat, lng: _pickup.lng, address: _pickup.name),
          dropoff: LocationPoint(lat: _dropoff.lat, lng: _dropoff.lng, address: _dropoff.name),
        ),
      child: Scaffold(
        backgroundColor: GodropColors.white,
        body: Column(
          children: [
            // ── Map ──
            SizedBox(
              height: 260,
              child: Stack(
                children: [
                  GoogleMap(
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
                  Positioned(
                    top: topPad + 8,
                    left: 12,
                    child: GestureDetector(
                      onTap: () => context.go('/parcel/addresses'),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 6,
                            )
                          ],
                        ),
                        child: const Icon(Icons.chevron_left_rounded, size: 22),
                      ),
                    ),
                  ),
                  Positioned(
                    top: topPad + 8,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 8,
                            )
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.location_on_rounded,
                                color: GodropColors.orange, size: 14),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Padding(
                                padding: const EdgeInsets.all(4),
                                child: Text(
                                  '${_pickup.name.split(',').first} → ${_dropoff.name.split(',').first}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: GodropColors.ink,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: GodropColors.ink,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.straighten_rounded,
                                color: Colors.white, size: 14),
                            const SizedBox(width: 6),
                            Text(
                              '${_distanceKm.toStringAsFixed(1)} km',
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
            // ── Content ──
            Expanded(
              child: BlocBuilder<ParcelCubit, ParcelState>(
                builder: (ctx, state) {
                  if (state is ParcelVehicleTypesLoading) {
                    return const Center(
                      child: CircularProgressIndicator(color: GodropColors.blue),
                    );
                  }
                  if (state is ParcelVehicleTypesError) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.wifi_off_rounded,
                                size: 40, color: GodropColors.mute),
                            const SizedBox(height: 12),
                            Text(
                              state.message,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                  color: GodropColors.slate, fontSize: 14),
                            ),
                            const SizedBox(height: 16),
                            GodropButton(
                              label: 'Retry',
                              onTap: () => ctx.read<ParcelCubit>().loadVehicleTypes(
                                pickup: LocationPoint(
                                    lat: _pickup.lat, lng: _pickup.lng, address: _pickup.name),
                                dropoff: LocationPoint(
                                    lat: _dropoff.lat, lng: _dropoff.lng, address: _dropoff.name),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }
                  if (state is ParcelLoaded) {
                    return _VehicleContent(
                      state: state,
                      pickup: _pickup,
                      dropoff: _dropoff,
                      selectedPayment: _selectedPayment,
                      recipientNameCtrl: _recipientNameCtrl,
                      recipientPhoneCtrl: _recipientPhoneCtrl,
                      descriptionCtrl: _descriptionCtrl,
                      phoneNumber: _phoneNumber,
                      onPhoneChanged: (n) => _phoneNumber = n,
                      onPhoneValidated: (v) => _phoneValid = v,
                      bottomPad: bottomPad,
                      onPaymentChanged: (v) => setState(() => _selectedPayment = v),
                      onProceed: _proceed,
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Vehicle content ───────────────────────────────────────────────────────────

class _VehicleContent extends StatelessWidget {
  final ParcelLoaded state;
  final ParcelLocation pickup;
  final ParcelLocation dropoff;
  final int? selectedPayment;
  final TextEditingController recipientNameCtrl;
  final TextEditingController recipientPhoneCtrl;
  final TextEditingController descriptionCtrl;
  final PhoneNumber phoneNumber;
  final ValueChanged<PhoneNumber> onPhoneChanged;
  final ValueChanged<bool> onPhoneValidated;
  final double bottomPad;
  final ValueChanged<int> onPaymentChanged;
  final void Function(ParcelLoaded) onProceed;

  const _VehicleContent({
    required this.state,
    required this.pickup,
    required this.dropoff,
    required this.selectedPayment,
    required this.recipientNameCtrl,
    required this.recipientPhoneCtrl,
    required this.descriptionCtrl,
    required this.phoneNumber,
    required this.onPhoneChanged,
    required this.onPhoneValidated,
    required this.bottomPad,
    required this.onPaymentChanged,
    required this.onProceed,
  });

  String _buttonLabel() {
    if (state.quoteLoading) return 'Getting price...';
    final selected = state.selectedType;
    final quote = state.quote;
    if (selected == null || quote == null) return 'Select a vehicle';
    return 'Book ${selected.name} · ${_formatKobo(quote.totalKobo)}';
  }

  void _onVehicleSelected(BuildContext context, ParcelVehicleType type) {
    if (state.selectedTypeId == type.id && state.quote != null) return;
    context.read<ParcelCubit>().selectVehicleType(
          typeId: type.id,
          pickup: LocationPoint(lat: pickup.lat, lng: pickup.lng, address: pickup.name),
          dropoff: LocationPoint(lat: dropoff.lat, lng: dropoff.lng, address: dropoff.name),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Container(
            color: GodropColors.background,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Choose a vehicle',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (state.vehicleTypes.isEmpty)
                    const _EmptyVehiclesCard()
                  else
                    ...state.vehicleTypes.map(
                      (type) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _VehicleCard(
                          type: type,
                          selected: state.selectedTypeId == type.id,
                          quoteLoading: state.quoteLoading &&
                              state.selectedTypeId == type.id,
                          quotedTotal: state.selectedTypeId == type.id
                              ? state.quote?.totalKobo
                              : null,
                          estimatedMinutes: state.selectedTypeId == type.id
                              ? state.estimatedMinutes
                              : null,
                          onTap: () => _onVehicleSelected(context, type),
                        ),
                      ),
                    ),
                  if (state.quoteError != null) ...[
                    const SizedBox(height: 4),
                    _QuoteError(message: state.quoteError!),
                  ],
                  const SizedBox(height: 16),
                  const Text(
                    'Payment method',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _PaymentOption(
                          icon: Icons.payments_outlined,
                          label: 'Cash',
                          selected: selectedPayment == 0,
                          onTap: () => onPaymentChanged(0),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _PaymentOption(
                          icon: Icons.credit_card_rounded,
                          label: 'Card',
                          selected: selectedPayment == 1,
                          onTap: () => onPaymentChanged(1),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Recipient details',
                    style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink),
                  ),
                  const SizedBox(height: 12),
                  _InputField(
                    controller: recipientNameCtrl,
                    hint: "Recipient's full name",
                    icon: Icons.person_outline_rounded,
                  ),
                  const SizedBox(height: 10),
                  // Phone input with Nigerian flag and validation
                  Container(
                    decoration: BoxDecoration(
                      color: GodropColors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: GodropColors.border),
                    ),
                    child: InternationalPhoneNumberInput(
                      onInputChanged: onPhoneChanged,
                      onInputValidated: onPhoneValidated,
                      selectorConfig: SelectorConfig(
                        selectorType: PhoneInputSelectorType.BOTTOM_SHEET,
                        setSelectorButtonAsPrefixIcon: true,
                        leadingPadding: 12,
                        showFlags: true,
                      ),
                      ignoreBlank: false,
                      autoValidateMode: AutovalidateMode.disabled,
                      selectorTextStyle: const TextStyle(
                        color: GodropColors.ink,
                        fontSize: 14,
                      ),
                      initialValue: phoneNumber,
                      textFieldController: recipientPhoneCtrl,
                      formatInput: false,
                      keyboardType: const TextInputType.numberWithOptions(
                          signed: true, decimal: true),
                      inputDecoration: const InputDecoration(
                        hintText: 'Phone number',
                        hintStyle:
                            TextStyle(color: GodropColors.mute, fontSize: 14),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 14, vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  _InputField(
                    controller: descriptionCtrl,
                    hint: 'What are you sending? (optional)',
                    icon: Icons.inventory_2_outlined,
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
        ),
        Container(
          padding: EdgeInsets.fromLTRB(16, 12, 16, bottomPad + 16),
          color: GodropColors.white,
          child: GodropButton(
            label: _buttonLabel(),
            onTap: () => onProceed(state),
            color: GodropColors.orange,
          ),
        ),
      ],
    );
  }
}

// ── Vehicle card ──────────────────────────────────────────────────────────────

class _VehicleCard extends StatelessWidget {
  final ParcelVehicleType type;
  final bool selected;
  final bool quoteLoading;
  final int? quotedTotal;
  final int? estimatedMinutes;
  final VoidCallback onTap;

  const _VehicleCard({
    required this.type,
    required this.selected,
    required this.quoteLoading,
    required this.quotedTotal,
    required this.estimatedMinutes,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? GodropColors.blue : GodropColors.border,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: selected
                    ? GodropColors.blue.withOpacity(0.08)
                    : GodropColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _iconForVehicleType(type.name),
                color: selected ? GodropColors.blue : GodropColors.slate,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    type.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: GodropColors.ink,
                      fontSize: 15,
                    ),
                  ),
                  if (type.description != null)
                    Text(
                      type.description!,
                      style: const TextStyle(
                          fontSize: 12, color: GodropColors.slate),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            if (quoteLoading)
              const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: GodropColors.blue),
              )
            else
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    quotedTotal != null
                        ? _formatKobo(quotedTotal!)
                        : _formatKobo(type.baseFeeKobo),
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: selected && quotedTotal != null
                          ? GodropColors.orange
                          : GodropColors.ink,
                      fontSize: 15,
                    ),
                  ),
                  if (estimatedMinutes != null)
                    Text(
                      '$estimatedMinutes min',
                      style: const TextStyle(
                          fontSize: 11, color: GodropColors.mute),
                    )
                  else
                    Text(
                      '${_formatKobo(type.perKmKobo)}/km',
                      style: const TextStyle(
                          fontSize: 11, color: GodropColors.mute),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

// ── Supporting widgets ────────────────────────────────────────────────────────

class _EmptyVehiclesCard extends StatelessWidget {
  const _EmptyVehiclesCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
      ),
      child: const Center(
        child: Text(
          'No vehicle types available at the moment.',
          style: TextStyle(color: GodropColors.slate, fontSize: 14),
        ),
      ),
    );
  }
}

class _QuoteError extends StatelessWidget {
  final String message;
  const _QuoteError({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline_rounded,
              size: 16, color: Colors.red.shade600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(fontSize: 12, color: Colors.red.shade700),
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _PaymentOption({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? GodropColors.blue : GodropColors.border,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon,
                size: 18,
                color: selected ? GodropColors.blue : GodropColors.slate),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: selected ? GodropColors.blue : GodropColors.slate,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final TextInputType keyboard;

  const _InputField({
    required this.controller,
    required this.hint,
    required this.icon,
    this.keyboard = TextInputType.text,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      style: const TextStyle(fontSize: 14, color: GodropColors.ink),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 14),
        prefixIcon: Icon(icon, size: 18, color: GodropColors.slate),
        filled: true,
        fillColor: GodropColors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: GodropColors.border)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: GodropColors.border)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide:
                const BorderSide(color: GodropColors.blue, width: 1.5)),
      ),
    );
  }
}
