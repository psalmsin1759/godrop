import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/api/places_service.dart';
import '../../shared/bloc/delivery_address_cubit.dart';
import '../../shared/bloc/favorites_cubit.dart';
import '../../shared/bloc/saved_addresses_cubit.dart';
import '../food/models/restaurant_data.dart';
import '../parcel/models/parcel_location.dart';
import '../parcel/widgets/location_picker_sheet.dart';
import 'bloc/partners_cubit.dart';
import 'bloc/partners_state.dart';
import 'models/partner_item.dart';

class PartnersScreen extends StatefulWidget {
  final PartnerType partnerType;
  const PartnersScreen({super.key, required this.partnerType});

  @override
  State<PartnersScreen> createState() => _PartnersScreenState();
}

class _PartnersScreenState extends State<PartnersScreen> {
  late final PartnersCubit _cubit;
  late final SavedAddressesCubit _savedAddressesCubit;
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';
  bool _showFavoritesOnly = false;

  PartnerType get _type => widget.partnerType;

  @override
  void initState() {
    super.initState();
    _cubit = PartnersCubit(_type)..load();
    _savedAddressesCubit = SavedAddressesCubit();
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
        locationSettings:
            const LocationSettings(accuracy: LocationAccuracy.medium),
      );
      final address =
          await PlacesService.reverseGeocode(pos.latitude, pos.longitude);
      if (mounted && address != null) {
        context.read<DeliveryAddressCubit>().setAddress(address);
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _cubit.close();
    _savedAddressesCubit.close();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearchChanged(String v) {
    setState(() => _searchQuery = v);
    _cubit.load(search: v.isEmpty ? null : v);
  }

  void _showDeliverySheet() async {
    final saved = _savedAddressesCubit.state.addresses;
    final result = await showModalBottomSheet<ParcelLocation>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LocationPickerSheet(
        title: 'Set delivery address',
        showCurrentLocation: true,
        savedAddresses: saved,
      ),
    );
    if (result != null && mounted) {
      context.read<DeliveryAddressCubit>().setAddress(result.name);
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _type.color;

    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: _cubit),
        BlocProvider.value(value: _savedAddressesCubit),
      ],
      child: BlocBuilder<DeliveryAddressCubit, String>(
        builder: (context, deliveryAddress) {
          final addressDisplay = deliveryAddress.isEmpty
              ? 'Set delivery address'
              : deliveryAddress;

          return Scaffold(
            backgroundColor: GodropColors.background,
            body: RefreshIndicator(
              color: color,
              onRefresh: () => _cubit.load(
                search: _searchQuery.isEmpty ? null : _searchQuery,
              ),
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
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
                            height: 48,
                            decoration: BoxDecoration(
                                color: GodropColors.background,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: GodropColors.border)),
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
                          Row(
                            children: [
                              _FilterPill(
                                label: 'All',
                                selected: !_showFavoritesOnly,
                                color: color,
                                onTap: () =>
                                    setState(() => _showFavoritesOnly = false),
                              ),
                              const SizedBox(width: 10),
                              _FilterPill(
                                label: 'Favorites',
                                icon: Icons.favorite_rounded,
                                selected: _showFavoritesOnly,
                                color: color,
                                onTap: () =>
                                    setState(() => _showFavoritesOnly = true),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: BlocBuilder<FavoritesCubit, FavoritesState>(
                      builder: (context, favState) {
                        return BlocBuilder<PartnersCubit, PartnersState>(
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
                                        padding:
                                            const EdgeInsets.only(bottom: 14),
                                        child: Container(
                                          decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius:
                                                  BorderRadius.circular(16)),
                                          child: Column(
                                            children: [
                                              // Banner placeholder (152px)
                                              ClipRRect(
                                                borderRadius: const BorderRadius
                                                    .vertical(
                                                    top: Radius.circular(16)),
                                                child: Container(
                                                  height: 152,
                                                  width: double.infinity,
                                                  color: Colors.white,
                                                ),
                                              ),
                                              Padding(
                                                padding:
                                                    const EdgeInsets.all(12),
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

                            final results = _showFavoritesOnly
                                ? state.items
                                    .where((p) =>
                                        favState.vendorIds.contains(p.id))
                                    .toList()
                                : state.items;

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
                                            : 'Featured near you',
                                        style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w600,
                                            color: GodropColors.ink),
                                      ),
                                      if (state.status ==
                                          PartnersStatus.loading)
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
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 60),
                                      child: Center(
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              _showFavoritesOnly
                                                  ? Icons
                                                      .favorite_border_rounded
                                                  : (_type ==
                                                          PartnerType.restaurant
                                                      ? Icons.no_food_rounded
                                                      : Icons
                                                          .storefront_rounded),
                                              size: 48,
                                              color: GodropColors.mute,
                                            ),
                                            const SizedBox(height: 12),
                                            Text(
                                              _showFavoritesOnly
                                                  ? 'No favorites yet — tap the heart icon on any ${_type.label.toLowerCase()} to save it here.'
                                                  : _type.emptyText,
                                              textAlign: TextAlign.center,
                                              style: const TextStyle(
                                                  fontSize: 15,
                                                  color: GodropColors.mute),
                                            ),
                                          ],
                                        ),
                                      ),
                                    )
                                  else
                                    ...results.map((p) {
                                      final item = p.copyWith(
                                          isFavorite: favState.vendorIds
                                              .contains(p.id));
                                      return Padding(
                                        padding:
                                            const EdgeInsets.only(bottom: 14),
                                        child: _PartnerCard(
                                          partner: item,
                                          onTap: () => context.go(
                                            '/partner/menu',
                                            extra: {
                                              'partner': item,
                                              'deliveryAddress':
                                                  deliveryAddress,
                                            },
                                          ),
                                          onFavoriteToggle: () => context
                                              .read<FavoritesCubit>()
                                              .toggle(p.id),
                                        ),
                                      );
                                    }),
                                ],
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ── Filter pill (All / Favorites) ──────────────────────────────────────────────

class _FilterPill extends StatelessWidget {
  final String label;
  final bool selected;
  final Color color;
  final VoidCallback onTap;
  final IconData? icon;
  const _FilterPill({
    required this.label,
    required this.selected,
    required this.color,
    required this.onTap,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
        decoration: BoxDecoration(
          color: selected
              ? color.withValues(alpha: 0.10)
              : GodropColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color:
                selected ? color.withValues(alpha: 0.3) : GodropColors.border,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: selected ? color : GodropColors.mute),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: selected ? color : GodropColors.slate,
              ),
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
  final VoidCallback? onFavoriteToggle;
  const _PartnerCard(
      {required this.partner, required this.onTap, this.onFavoriteToggle});

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
          borderRadius: BorderRadius.circular(18),
          boxShadow: GodropColors.softShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(18)),
                  child: partner.logoUrl != null
                      ? Image.network(
                          partner.logoUrl!,
                          height: 152,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _PlaceholderBanner(color: color, icon: icon),
                        )
                      : _PlaceholderBanner(color: color, icon: icon),
                ),
                // Subtle bottom gradient for legibility/depth on every card
                Positioned.fill(
                  child: ClipRRect(
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(18)),
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.28),
                          ],
                          stops: const [0.55, 1.0],
                        ),
                      ),
                    ),
                  ),
                ),
                if (!partner.isOpenNow)
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(18)),
                      child: Container(
                        color: Colors.black.withValues(alpha: 0.45),
                        alignment: Alignment.center,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 7),
                          decoration: BoxDecoration(
                              color: GodropColors.ink.withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(20)),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.access_time_filled_rounded,
                                  size: 14, color: Colors.white),
                              SizedBox(width: 6),
                              Text('Closed',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: GestureDetector(
                    onTap: onFavoriteToggle,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: GodropColors.softShadow),
                      child: Icon(
                        partner.isFavorite
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        size: 19,
                        color: partner.isFavorite
                            ? GodropColors.orange
                            : GodropColors.slate,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(partner.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                color: GodropColors.ink,
                                fontSize: 16)),
                        const SizedBox(height: 3),
                        Text(subtitle,
                            style: const TextStyle(
                                fontSize: 12, color: GodropColors.slate)),
                        const SizedBox(height: 6),
                        if (partner.deliveryFeeKobo == 0)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color:
                                  GodropColors.success.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Free delivery',
                              style: TextStyle(
                                fontSize: 11,
                                color: GodropColors.success,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          )
                        else
                          Row(
                            children: [
                              const Icon(Icons.local_shipping_outlined,
                                  size: 12, color: GodropColors.mute),
                              const SizedBox(width: 3),
                              Text(
                                partner.deliveryFeeKobo != null
                                    ? 'Delivery: ${_fmtFee(partner.deliveryFeeKobo!)}'
                                    : 'Delivery fee varies',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: GodropColors.mute,
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
      height: 152,
      width: double.infinity,
      color: color.withValues(alpha: 0.08),
      child: Center(
          child: Icon(icon, size: 48, color: color.withValues(alpha: 0.3))),
    );
  }
}
