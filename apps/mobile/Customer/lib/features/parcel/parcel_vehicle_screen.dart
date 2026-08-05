import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/common_models.dart';
import '../../shared/models/delivery_models.dart';
import '../../shared/widgets/coupon_input.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/payment_method_selector.dart';
import '../../shared/widgets/section_header.dart';
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
  if (n.contains('bicycle') || n.contains('cycle'))
    return Icons.directions_bike_rounded;
  if (n.contains('motorcycle') || n.contains('motor') || n.contains('bike')) {
    return Icons.two_wheeler_rounded;
  }
  if (n.contains('van')) return Icons.airport_shuttle_rounded;
  if (n.contains('truck') || n.contains('pickup'))
    return Icons.local_shipping_rounded;
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
  // 'card' | 'wallet' | 'wallet_card'
  String _paymentMethod = 'card';
  double _walletBalance = 0;
  AppliedCoupon? _coupon;

  @override
  void initState() {
    super.initState();
    _loadWalletBalance();
  }

  Future<void> _loadWalletBalance() async {
    try {
      final balance = await WalletService(DioClient.instance).getBalance();
      if (mounted) setState(() => _walletBalance = balance.balance);
    } catch (_) {}
  }

  ParcelLocation get _pickup =>
      widget.routeData?.pickup ??
      const ParcelLocation(lat: 6.4524, lng: 3.4754, name: 'Lekki Phase 1');

  List<ParcelItem> get _parcels =>
      widget.routeData?.parcels ??
      const [
        ParcelItem(
            dropoff:
                ParcelLocation(lat: 6.4281, lng: 3.4219, name: 'Victoria Island'))
      ];

  List<LocationPoint> get _dropoffPoints => _parcels
      .map((p) => LocationPoint(
          lat: p.dropoff.lat, lng: p.dropoff.lng, address: p.dropoff.name))
      .toList();

  LocationPoint get _pickupPoint =>
      LocationPoint(lat: _pickup.lat, lng: _pickup.lng, address: _pickup.name);

  Set<Marker> get _markers => {
        Marker(
          markerId: const MarkerId('pickup'),
          position: LatLng(_pickup.lat, _pickup.lng),
          icon:
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        ),
        for (var i = 0; i < _parcels.length; i++)
          Marker(
            markerId: MarkerId('dropoff_$i'),
            position: LatLng(_parcels[i].dropoff.lat, _parcels[i].dropoff.lng),
            icon:
                BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
          ),
      };

  Set<Polyline> get _polylines => {
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

  void _onMapCreated(GoogleMapController ctrl) {
    final lats = [_pickup.lat, ..._parcels.map((p) => p.dropoff.lat)];
    final lngs = [_pickup.lng, ..._parcels.map((p) => p.dropoff.lng)];
    ctrl.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(lats.reduce(min) - 0.005, lngs.reduce(min) - 0.005),
          northeast: LatLng(lats.reduce(max) + 0.005, lngs.reduce(max) + 0.005),
        ),
        48,
      ),
    );
  }

  void _proceed(ParcelLoaded parcelState) {
    final selected = parcelState.selectedType;
    final total = (parcelState.quote?.totalKobo ?? 0) - (_coupon?.discountKobo ?? 0);
    final walletBalanceKobo = (_walletBalance * 100).round();
    if (_paymentMethod == 'wallet' && walletBalanceKobo < total) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Insufficient wallet balance for this option.')),
      );
      return;
    }
    context.go(
      '/parcel/finding',
      extra: ParcelRouteData(
        pickup: _pickup,
        parcels: _parcels,
        vehicleTypeId: selected?.id ?? '',
        vehicleLabel: selected?.name ?? '',
        quotedTotalKobo: total,
        estimatedMinutes: parcelState.estimatedMinutes,
        paymentMethod: _paymentMethod,
        couponCode: _coupon?.code,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return BlocProvider(
      create: (_) => ParcelCubit()
        ..loadVehicleTypes(pickup: _pickupPoint, dropoffs: _dropoffPoints),
      child: Scaffold(
        backgroundColor: GodropColors.white,
        body: Column(
          children: [
            // ── Map ──
            SizedBox(
              height: 240,
              child: Stack(
                children: [
                  GoogleMap(
                    initialCameraPosition: CameraPosition(
                      target: LatLng(_pickup.lat, _pickup.lng),
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
                  ),
                  Positioned(
                    top: topPad + 8,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: GodropColors.card,
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
                              child: const Icon(Icons.inventory_2_rounded,
                                  color: Colors.white, size: 12),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _parcels.length > 1
                                  ? '${_parcels.length} parcels · ${_parcels.length} drop-offs'
                                  : 'Single parcel',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink,
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
                      child:
                          CircularProgressIndicator(color: GodropColors.blue),
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
                              onTap: () =>
                                  ctx.read<ParcelCubit>().loadVehicleTypes(
                                        pickup: _pickupPoint,
                                        dropoffs: _dropoffPoints,
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
                      pickup: _pickupPoint,
                      dropoffs: _dropoffPoints,
                      parcels: _parcels,
                      bottomPad: bottomPad,
                      onProceed: _proceed,
                      paymentMethod: _paymentMethod,
                      walletBalance: _walletBalance,
                      onPaymentMethodChanged: (m) =>
                          setState(() => _paymentMethod = m),
                      coupon: _coupon,
                      onCouponChanged: (c) => setState(() => _coupon = c),
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
  final LocationPoint pickup;
  final List<LocationPoint> dropoffs;
  final List<ParcelItem> parcels;
  final double bottomPad;
  final void Function(ParcelLoaded) onProceed;
  final String paymentMethod;
  final double walletBalance;
  final ValueChanged<String> onPaymentMethodChanged;
  final AppliedCoupon? coupon;
  final ValueChanged<AppliedCoupon?> onCouponChanged;

  const _VehicleContent({
    required this.state,
    required this.pickup,
    required this.dropoffs,
    required this.parcels,
    required this.bottomPad,
    required this.onProceed,
    required this.paymentMethod,
    required this.walletBalance,
    required this.onPaymentMethodChanged,
    required this.coupon,
    required this.onCouponChanged,
  });

  int get _discountedTotal =>
      (state.quote?.totalKobo ?? 0) - (coupon?.discountKobo ?? 0);

  bool get _walletInsufficient {
    final quote = state.quote;
    if (quote == null || paymentMethod != 'wallet') return false;
    return (walletBalance * 100).round() < _discountedTotal;
  }

  String _buttonLabel() {
    if (state.quoteLoading) return 'Getting price...';
    final selected = state.selectedType;
    final quote = state.quote;
    if (selected == null || quote == null) return 'Select a vehicle';
    if (_walletInsufficient) return 'Insufficient wallet balance';
    if (paymentMethod == 'wallet') {
      return 'Book ${selected.name} · Pay from wallet';
    }
    if (paymentMethod == 'wallet_card') {
      final split = PaymentSplit.compute(
        method: paymentMethod,
        totalKobo: _discountedTotal,
        walletBalanceNaira: walletBalance,
      );
      if (split.cardCoversKobo > 0) {
        return 'Book ${selected.name} · Pay ${_formatKobo(split.cardCoversKobo)} via card';
      }
      return 'Book ${selected.name} · Pay from wallet';
    }
    return 'Book ${selected.name} · ${_formatKobo(_discountedTotal)}';
  }

  void _onVehicleSelected(BuildContext context, ParcelVehicleType type) {
    if (state.selectedTypeId == type.id && state.quote != null) return;
    context.read<ParcelCubit>().selectVehicleType(
          typeId: type.id,
          pickup: pickup,
          dropoffs: dropoffs,
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
                  GodropSectionHeader(
                      title: parcels.length > 1
                          ? 'Your ${parcels.length} parcels'
                          : 'Your parcel'),
                  const SizedBox(height: 12),
                  ...parcels.asMap().entries.map((e) {
                    final i = e.key;
                    final p = e.value;
                    final legFee = i < state.parcelLegs.length
                        ? state.parcelLegs[i].deliveryFeeKobo
                        : null;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _ParcelSummaryCard(
                        index: i + 1,
                        parcel: p,
                        feeKobo: legFee,
                        showIndex: parcels.length > 1,
                      ),
                    );
                  }),
                  const SizedBox(height: 16),
                  const GodropSectionHeader(title: 'Choose a vehicle'),
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
                  if (state.selectedType != null && state.quote != null) ...[
                    const SizedBox(height: 16),
                    const GodropSectionHeader(title: 'Coupon code'),
                    const SizedBox(height: 12),
                    CouponInputCard(
                      orderType: 'PARCEL',
                      deliveryFeeKobo: state.quote!.deliveryFeeKobo,
                      orderValueKobo: state.quote!.totalKobo,
                      applied: coupon,
                      onChanged: onCouponChanged,
                    ),
                    const SizedBox(height: 16),
                    const GodropSectionHeader(title: 'Payment method'),
                    const SizedBox(height: 12),
                    PaymentMethodSelector(
                      selected: paymentMethod,
                      onChanged: onPaymentMethodChanged,
                      totalKobo: _discountedTotal,
                      walletBalance: walletBalance,
                    ),
                  ],
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ),
        ),
        Container(
          padding: EdgeInsets.fromLTRB(16, 12, 16, bottomPad + 16),
          decoration: BoxDecoration(
            color: GodropColors.white,
            boxShadow: [
              BoxShadow(
                color: GodropColors.ink.withValues(alpha: 0.06),
                blurRadius: 16,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: GodropButton(
            label: _buttonLabel(),
            onTap: _walletInsufficient ? null : () => onProceed(state),
            color: GodropColors.orange,
          ),
        ),
      ],
    );
  }
}

// ── Parcel summary card ───────────────────────────────────────────────────────

class _ParcelSummaryCard extends StatelessWidget {
  final int index;
  final ParcelItem parcel;
  final int? feeKobo;
  final bool showIndex;

  const _ParcelSummaryCard({
    required this.index,
    required this.parcel,
    required this.feeKobo,
    required this.showIndex,
  });

  @override
  Widget build(BuildContext context) {
    final meta = <String>[
      if (parcel.recipientName.isNotEmpty) parcel.recipientName,
      if (parcel.weightKg != null) '${parcel.weightKg} kg',
      if (parcel.description?.isNotEmpty == true) parcel.description!,
    ].join(' · ');
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
      ),
      child: Row(
        children: [
          if (showIndex) ...[
            Container(
              width: 26,
              height: 26,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                color: Color(0xFFE7EEFF),
                shape: BoxShape.circle,
              ),
              child: Text(
                '$index',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.blue,
                ),
              ),
            ),
            const SizedBox(width: 10),
          ] else
            const Padding(
              padding: EdgeInsets.only(right: 10),
              child: Icon(Icons.flag_rounded,
                  size: 18, color: GodropColors.blue),
            ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  parcel.dropoff.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: GodropColors.ink,
                  ),
                ),
                if (meta.isNotEmpty)
                  Text(
                    meta,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 11.5, color: GodropColors.mute),
                  ),
              ],
            ),
          ),
          if (feeKobo != null) ...[
            const SizedBox(width: 8),
            Text(
              _formatKobo(feeKobo!),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: GodropColors.orange,
              ),
            ),
          ],
        ],
      ),
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
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? GodropColors.blue : GodropColors.border,
            width: selected ? 2 : 1,
          ),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: selected
                    ? GodropColors.blueGradient
                    : LinearGradient(
                        colors: [
                          GodropColors.slate.withValues(alpha: 0.12),
                          GodropColors.slate.withValues(alpha: 0.05),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                borderRadius: BorderRadius.circular(13),
              ),
              child: Icon(
                _iconForVehicleType(type.name),
                color: selected ? Colors.white : GodropColors.slate,
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
          Icon(Icons.error_outline_rounded, size: 16, color: Colors.red.shade600),
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
