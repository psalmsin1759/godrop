import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_places_flutter/google_places_flutter.dart';
import 'package:google_places_flutter/model/prediction.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/api/places_service.dart';
import '../../shared/bloc/delivery_address_cubit.dart';
import '../food/models/restaurant_data.dart';
import 'bloc/partners_cubit.dart';
import 'bloc/partners_state.dart';
import 'models/partner_item.dart';

const _kPlacesApiKey = 'AIzaSyDQrymY31J4gl5ws6SStg42Vpk_AfWFt_U';

class PartnersScreen extends StatefulWidget {
  final PartnerType partnerType;
  const PartnersScreen({super.key, required this.partnerType});

  @override
  State<PartnersScreen> createState() => _PartnersScreenState();
}

class _PartnersScreenState extends State<PartnersScreen> {
  late final PartnersCubit _cubit;
  String _filter = 'All';
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  PartnerType get _type => widget.partnerType;

  @override
  void initState() {
    super.initState();
    _cubit = PartnersCubit(_type)..load();
    _resolveCurrentLocationIfEmpty();
  }

  Future<void> _resolveCurrentLocationIfEmpty() async {
    // Only resolve GPS if global address is empty
    final current = context.read<DeliveryAddressCubit>().state;
    if (current.isNotEmpty) return;
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) return;
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
      );
      final address = await PlacesService.reverseGeocode(pos.latitude, pos.longitude);
      if (mounted && address != null) {
        context.read<DeliveryAddressCubit>().setAddress(address);
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _cubit.close();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearchChanged(String v) {
    setState(() => _searchQuery = v);
    _cubit.load(search: v.isEmpty ? null : v);
  }

  void _showDeliverySheet() {
    final current = context.read<DeliveryAddressCubit>().state;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _DeliverySheet(
        currentAddress: current,
        onAddressSelected: (addr) =>
            context.read<DeliveryAddressCubit>().setAddress(addr),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filters = _type.filters;
    final color = _type.color;

    return BlocProvider.value(
      value: _cubit,
      child: BlocBuilder<DeliveryAddressCubit, String>(
        builder: (context, deliveryAddress) {
          final addressDisplay = deliveryAddress.isEmpty
              ? 'Set delivery address'
              : deliveryAddress;

          return Scaffold(
            backgroundColor: GodropColors.background,
            body: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Container(
                    color: GodropColors.white,
                    padding: EdgeInsets.fromLTRB(
                        16, MediaQuery.of(context).padding.top + 12, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () => context.go('/home'),
                              child: Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                    color: GodropColors.background,
                                    borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.chevron_left_rounded,
                                    size: 22),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: GestureDetector(
                                onTap: _showDeliverySheet,
                                behavior: HitTestBehavior.opaque,
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    const Text('Delivering to',
                                        style: TextStyle(
                                            fontSize: 11,
                                            color: GodropColors.mute)),
                                    Row(
                                      children: [
                                        Icon(Icons.location_on_rounded,
                                            size: 13, color: color),
                                        const SizedBox(width: 3),
                                        Flexible(
                                          child: Text(
                                            addressDisplay,
                                            style: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                                color: GodropColors.ink),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const Icon(
                                            Icons.keyboard_arrow_down_rounded,
                                            size: 16,
                                            color: GodropColors.ink),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        RichText(
                          text: TextSpan(
                            style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w700,
                                color: GodropColors.ink,
                                height: 1.2),
                            children: [
                              TextSpan(text: _type.listTitle),
                              TextSpan(
                                  text: _type.listTitleAccent,
                                  style: TextStyle(color: color)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          height: 46,
                          decoration: BoxDecoration(
                              color: GodropColors.background,
                              borderRadius: BorderRadius.circular(12)),
                          child: TextField(
                            controller: _searchCtrl,
                            onChanged: _onSearchChanged,
                            style: const TextStyle(
                                fontSize: 14, color: GodropColors.ink),
                            decoration: InputDecoration(
                              hintText: _type.searchHint,
                              hintStyle: const TextStyle(
                                  color: GodropColors.mute, fontSize: 14),
                              prefixIcon: const Icon(Icons.search_rounded,
                                  color: GodropColors.mute, size: 20),
                              suffixIcon: _searchQuery.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.close_rounded,
                                          size: 18, color: GodropColors.mute),
                                      onPressed: () {
                                        _searchCtrl.clear();
                                        _onSearchChanged('');
                                      },
                                    )
                                  : null,
                              border: InputBorder.none,
                              contentPadding:
                                  const EdgeInsets.symmetric(vertical: 13),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: filters
                                .map((f) => Padding(
                                      padding:
                                          const EdgeInsets.only(right: 8),
                                      child: GestureDetector(
                                        onTap: () =>
                                            setState(() => _filter = f),
                                        child: AnimatedContainer(
                                          duration: const Duration(
                                              milliseconds: 180),
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 16, vertical: 8),
                                          decoration: BoxDecoration(
                                            color: _filter == f
                                                ? GodropColors.ink
                                                : GodropColors.background,
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          child: Text(f,
                                              style: TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w500,
                                                  color: _filter == f
                                                      ? Colors.white
                                                      : GodropColors.slate)),
                                        ),
                                      ),
                                    ))
                                .toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: BlocBuilder<PartnersCubit, PartnersState>(
                    builder: (context, state) {
                      // ── Feature 2: Shimmer loading ─────────────────────────
                      if (state.status == PartnersStatus.loading &&
                          state.items.isEmpty) {
                        return SliverToBoxAdapter(
                          child: Shimmer.fromColors(
                            baseColor: const Color(0xFFE0E0E0),
                            highlightColor: const Color(0xFFF5F5F5),
                            child: Column(
                              children: List.generate(
                                5,
                                (i) => Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: Container(
                                    decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius:
                                            BorderRadius.circular(16)),
                                    child: Column(
                                      children: [
                                        // Banner placeholder (120px)
                                        ClipRRect(
                                          borderRadius:
                                              const BorderRadius.vertical(
                                                  top: Radius.circular(16)),
                                          child: Container(
                                            height: 120,
                                            width: double.infinity,
                                            color: Colors.white,
                                          ),
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.all(12),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                  height: 14,
                                                  width: 160,
                                                  color: Colors.white),
                                              const SizedBox(height: 6),
                                              Container(
                                                  height: 10,
                                                  width: 100,
                                                  color: Colors.white),
                                              const SizedBox(height: 6),
                                              Container(
                                                  height: 10,
                                                  width: 80,
                                                  color: Colors.white),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }

                      if (state.status == PartnersStatus.failure &&
                          state.items.isEmpty) {
                        return SliverToBoxAdapter(
                          child: Padding(
                            padding:
                                const EdgeInsets.symmetric(vertical: 60),
                            child: Center(
                              child: Column(
                                children: [
                                  const Icon(Icons.wifi_off_rounded,
                                      size: 40, color: GodropColors.mute),
                                  const SizedBox(height: 12),
                                  Text(
                                    state.error?.contains(
                                                'SocketException') ==
                                            true
                                        ? 'No internet connection'
                                        : 'Something went wrong',
                                    style: const TextStyle(
                                        fontSize: 15,
                                        color: GodropColors.slate),
                                  ),
                                  const SizedBox(height: 12),
                                  TextButton(
                                    onPressed: () => _cubit.load(),
                                    child: const Text('Retry',
                                        style: TextStyle(
                                            color: GodropColors.blue,
                                            fontWeight: FontWeight.w600)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }

                      final results = _filter == 'All'
                          ? state.items
                          : state.items
                              .where((p) => p.cuisines.contains(_filter))
                              .toList();

                      return SliverToBoxAdapter(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  _searchQuery.isNotEmpty
                                      ? '${results.length} result${results.length == 1 ? '' : 's'}'
                                      : (_filter == 'All'
                                          ? 'Featured near you'
                                          : '$_filter ${_type.label.toLowerCase()}s'),
                                  style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: GodropColors.ink),
                                ),
                                if (state.status == PartnersStatus.loading)
                                  const SizedBox(
                                    width: 14,
                                    height: 14,
                                    child: CircularProgressIndicator(
                                        color: GodropColors.blue,
                                        strokeWidth: 1.5),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // ── Feature 2: Empty state ──────────────────────
                            if (results.isEmpty &&
                                state.status == PartnersStatus.success)
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 60),
                                child: Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        _type == PartnerType.restaurant
                                            ? Icons.no_food_rounded
                                            : Icons.storefront_rounded,
                                        size: 48,
                                        color: GodropColors.mute,
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        _type.emptyText,
                                        style: const TextStyle(
                                            fontSize: 15,
                                            color: GodropColors.mute),
                                      ),
                                    ],
                                  ),
                                ),
                              )
                            else
                              ...results.map((p) => Padding(
                                    padding:
                                        const EdgeInsets.only(bottom: 10),
                                    child: _PartnerCard(
                                      partner: p,
                                      onTap: () => context.go(
                                        '/partner/menu',
                                        extra: {
                                          'partner': p,
                                          'deliveryAddress': deliveryAddress,
                                        },
                                      ),
                                    ),
                                  )),
                          ],
                        ),
                      );
                    },
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

// ── Delivery address bottom sheet ─────────────────────────────────────────────

class _DeliverySheet extends StatefulWidget {
  final String currentAddress;
  final ValueChanged<String> onAddressSelected;
  const _DeliverySheet(
      {required this.currentAddress, required this.onAddressSelected});

  @override
  State<_DeliverySheet> createState() => _DeliverySheetState();
}

class _DeliverySheetState extends State<_DeliverySheet> {
  late final TextEditingController _ctrl;
  bool _locationLoading = false;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.currentAddress);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _locationLoading = true);
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (mounted) setState(() => _locationLoading = false);
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings:
            const LocationSettings(accuracy: LocationAccuracy.medium),
      );
      final address =
          await PlacesService.reverseGeocode(pos.latitude, pos.longitude);
      if (mounted) {
        widget.onAddressSelected(address ?? 'Current location');
        Navigator.of(context).pop();
      }
    } catch (_) {
      if (mounted) setState(() => _locationLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewInset = MediaQuery.of(context).viewInsets.bottom;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: viewInset),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.55,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.fromLTRB(16, 16, 16, bottomPad + 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
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
            Row(
              children: [
                const Text(
                  'Deliver to',
                  style: TextStyle(
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
                    child: const Icon(Icons.close_rounded,
                        size: 18, color: GodropColors.slate),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: _locationLoading ? null : _useCurrentLocation,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 11),
                decoration: BoxDecoration(
                  color: GodropColors.blue.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(12),
                  border:
                      Border.all(color: GodropColors.blue.withOpacity(0.15)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: GodropColors.blue.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: _locationLoading
                          ? const Padding(
                              padding: EdgeInsets.all(7),
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: GodropColors.blue))
                          : const Icon(Icons.my_location_rounded,
                              color: GodropColors.blue, size: 15),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text('Use my current location',
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: GodropColors.blue)),
                    ),
                    const Icon(Icons.chevron_right_rounded,
                        size: 18, color: GodropColors.blue),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            GooglePlaceAutoCompleteTextField(
              textEditingController: _ctrl,
              googleAPIKey: _kPlacesApiKey,
              inputDecoration: InputDecoration(
                hintText: 'Search for an address...',
                hintStyle:
                    const TextStyle(color: GodropColors.mute, fontSize: 15),
                prefixIcon: const Icon(Icons.search_rounded,
                    color: GodropColors.slate, size: 20),
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
                  borderSide: const BorderSide(
                      color: GodropColors.blue, width: 1.5),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
              ),
              textStyle:
                  const TextStyle(fontSize: 15, color: GodropColors.ink),
              debounceTime: 400,
              countries: const ['ng'],
              isLatLngRequired: false,
              getPlaceDetailWithLatLng: (_) {},
              itemClick: (Prediction prediction) {
                final name = prediction.description ?? '';
                if (name.isEmpty) return;
                _ctrl
                  ..text = name
                  ..selection = TextSelection.fromPosition(
                    TextPosition(offset: name.length),
                  );
                widget.onAddressSelected(name);
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ── Partner card ──────────────────────────────────────────────────────────────

class _PartnerCard extends StatelessWidget {
  final PartnerItem partner;
  final VoidCallback onTap;
  const _PartnerCard({required this.partner, required this.onTap});

  String _fmtFee(int kobo) =>
      kobo == 0 ? 'Free' : '₦${(kobo / 100).toStringAsFixed(0)}';

  @override
  Widget build(BuildContext context) {
    final color = partner.partnerType.color;
    final icon = partner.partnerType.icon;
    final subtitle = partner.cuisines.isNotEmpty
        ? partner.cuisines.take(2).join(' · ')
        : partner.partnerType.label;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
            color: GodropColors.white,
            borderRadius: BorderRadius.circular(16)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(16)),
                  child: partner.logoUrl != null
                      ? Image.network(
                          partner.logoUrl!,
                          height: 120,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _PlaceholderBanner(color: color, icon: icon),
                        )
                      : _PlaceholderBanner(color: color, icon: icon),
                ),
                if (!partner.isOpen)
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(16)),
                      child: Container(
                        color: Colors.black.withOpacity(0.45),
                        alignment: Alignment.center,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                              color: Colors.black54,
                              borderRadius: BorderRadius.circular(6)),
                          child: const Text('Closed',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ),
                  ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.favorite_border_rounded,
                        size: 18, color: GodropColors.slate),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(partner.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink,
                                fontSize: 15)),
                        const SizedBox(height: 2),
                        Text(subtitle,
                            style: const TextStyle(
                                fontSize: 12, color: GodropColors.slate)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.local_shipping_outlined,
                                size: 12, color: GodropColors.mute),
                            const SizedBox(width: 3),
                            Text(
                              partner.deliveryFeeKobo != null
                                  ? (partner.deliveryFeeKobo == 0
                                      ? 'Free delivery'
                                      : 'Delivery: ${_fmtFee(partner.deliveryFeeKobo!)}')
                                  : 'Delivery fee varies',
                              style: TextStyle(
                                fontSize: 11,
                                color: partner.deliveryFeeKobo == 0
                                    ? GodropColors.success
                                    : GodropColors.mute,
                                fontWeight: partner.deliveryFeeKobo == 0
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (partner.rating != null)
                        Row(children: [
                          const Icon(Icons.star_rounded,
                              size: 14, color: GodropColors.orange),
                          const SizedBox(width: 2),
                          Text(partner.rating!.toStringAsFixed(1),
                              style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: GodropColors.ink)),
                        ]),
                      const SizedBox(height: 2),
                      Text(partner.deliveryTimeLabel,
                          style: const TextStyle(
                              fontSize: 11, color: GodropColors.mute)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderBanner extends StatelessWidget {
  final Color color;
  final IconData icon;
  const _PlaceholderBanner({required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      width: double.infinity,
      color: color.withOpacity(0.08),
      child: Center(
          child: Icon(icon, size: 48, color: color.withOpacity(0.3))),
    );
  }
}
