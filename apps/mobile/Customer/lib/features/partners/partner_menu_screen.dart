import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/api/places_service.dart';
import '../../shared/bloc/delivery_address_cubit.dart';
import '../food/bloc/cart_cubit.dart';
import '../food/bloc/cart_state.dart';
import '../food/models/restaurant_data.dart';
import 'bloc/menu_cubit.dart';
import 'bloc/menu_state.dart';
import 'models/partner_item.dart';

class PartnerMenuScreen extends StatefulWidget {
  final PartnerItem partner;
  final String? deliveryAddress;
  const PartnerMenuScreen({
    super.key,
    required this.partner,
    this.deliveryAddress,
  });

  @override
  State<PartnerMenuScreen> createState() => _PartnerMenuScreenState();
}

class _PartnerMenuScreenState extends State<PartnerMenuScreen> {
  late final MenuCubit _menuCubit;

  PartnerItem get _p => widget.partner;

  @override
  void initState() {
    super.initState();
    _menuCubit = MenuCubit(_p)..load();
    // If a delivery address was passed in (from navigation), update the global cubit
    if (widget.deliveryAddress != null &&
        widget.deliveryAddress!.isNotEmpty &&
        widget.deliveryAddress != 'Detecting location...') {
      // Schedule after build to avoid calling context.read in initState
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          final current = context.read<DeliveryAddressCubit>().state;
          if (current.isEmpty) {
            context.read<DeliveryAddressCubit>().setAddress(widget.deliveryAddress!);
          }
        }
      });
    } else if (widget.deliveryAddress == null) {
      _resolveCurrentLocation();
    }
  }

  Future<void> _resolveCurrentLocation() async {
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
        final current = context.read<DeliveryAddressCubit>().state;
        if (current.isEmpty) {
          context.read<DeliveryAddressCubit>().setAddress(address);
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _menuCubit.close();
    super.dispose();
  }

  String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  @override
  Widget build(BuildContext context) {
    final color = _p.partnerType.color;
    final icon = _p.partnerType.icon;

    return BlocProvider.value(
      value: _menuCubit,
      child: BlocBuilder<CartCubit, CartState>(
        builder: (context, cartState) {
          final vendorCart = cartState.cartFor(_p.id);
          final totalItems = vendorCart?.totalItems ?? 0;
          final totalKobo = vendorCart?.subtotalKobo ?? 0;

          return Scaffold(
            backgroundColor: GodropColors.background,
            body: BlocBuilder<MenuCubit, MenuState>(
              builder: (context, menu) {
                return Stack(
                  children: [
                    if (menu.status == MenuStatus.loading)
                      _buildLoadingBody(color, icon, menu)
                    else if (menu.status == MenuStatus.failure)
                      _buildErrorBody(color, icon, menu)
                    else if (menu.status == MenuStatus.success &&
                        menu.categories.isEmpty)
                      _buildEmptyMenuBody(color, icon, menu)
                    else if (menu.status == MenuStatus.success)
                      _buildSuccessBody(context, color, icon, cartState, menu)
                    else
                      _buildLoadingBody(color, icon, menu),

                    // View cart button — only shows items from this vendor
                    if (totalItems > 0)
                      Positioned(
                        bottom: 24,
                        left: 16,
                        right: 16,
                        child: GestureDetector(
                          onTap: () => context.go('/food/cart',
                              extra: {'partnerId': _p.id}),
                          child: Container(
                            height: 54,
                            decoration: BoxDecoration(
                                color: color,
                                borderRadius: BorderRadius.circular(14)),
                            child: Row(
                              children: [
                                const SizedBox(width: 16),
                                Container(
                                  width: 26,
                                  height: 26,
                                  decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(8)),
                                  child: Center(
                                      child: Text('$totalItems',
                                          style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 13,
                                              fontWeight: FontWeight.w700))),
                                ),
                                const SizedBox(width: 12),
                                const Expanded(
                                    child: Text('View cart',
                                        style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 16,
                                            fontWeight: FontWeight.w600))),
                                Text(_fmt(totalKobo),
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700)),
                                const SizedBox(width: 16),
                              ],
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildHeader(Color color, IconData icon, MenuState menu) {
    final rating = menu.rating ?? _p.rating;
    final deliveryFee = menu.deliveryFeeKobo ?? _p.deliveryFeeKobo;
    final estMin = menu.estimatedMinutes ?? _p.estimatedMinutes;

    return Container(
      color: GodropColors.white,
      child: Column(
        children: [
          Stack(
            children: [
              ClipRect(
                child: SizedBox(
                  height: 200,
                  width: double.infinity,
                  child: _p.logoUrl != null
                      ? Image.network(
                          _p.logoUrl!,
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _HeaderPlaceholder(color: color, icon: icon),
                        )
                      : _HeaderPlaceholder(color: color, icon: icon),
                ),
              ),
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                height: 80,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0),
                        Colors.black.withValues(alpha: 0.35),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                top: MediaQuery.of(context).padding.top + 8,
                left: 12,
                child: GestureDetector(
                  onTap: () => context.go(_p.partnerType.listRoute),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: GodropColors.softShadow),
                    child: const Icon(Icons.chevron_left_rounded, size: 22),
                  ),
                ),
              ),
              if (!_p.isOpenNow)
                Positioned(
                  bottom: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: GodropColors.ink.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.access_time_filled_rounded,
                            size: 13, color: Colors.white),
                        SizedBox(width: 5),
                        Text('Closed',
                            style: TextStyle(
                                fontSize: 12,
                                color: Colors.white,
                                fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_p.name,
                    style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink)),
                const SizedBox(height: 4),
                Text(_p.partnerType.label,
                    style: const TextStyle(
                        fontSize: 13, color: GodropColors.slate)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    if (rating != null) ...[
                      _InfoChip(
                          icon: Icons.star_rounded,
                          label: rating.toStringAsFixed(1),
                          iconColor: GodropColors.orange),
                      const SizedBox(width: 12),
                    ],
                    if (estMin != null) ...[
                      _InfoChip(
                          icon: Icons.access_time_rounded,
                          label: '$estMin min',
                          iconColor: GodropColors.slate),
                      const SizedBox(width: 12),
                    ],
                    if (deliveryFee != null)
                      _InfoChip(
                          icon: Icons.local_shipping_rounded,
                          label: deliveryFee == 0
                              ? 'Free delivery'
                              : '+ ${_fmt(deliveryFee)}',
                          iconColor: deliveryFee == 0
                              ? GodropColors.success
                              : GodropColors.slate),
                  ],
                ),
                const SizedBox(height: 14),
                // Delivering to — reads from global DeliveryAddressCubit
                BlocBuilder<DeliveryAddressCubit, String>(
                  builder: (context, deliveryAddress) {
                    final display = deliveryAddress.isEmpty
                        ? 'Set delivery address'
                        : deliveryAddress;
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: GodropColors.background,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                            color: GodropColors.border, width: 1),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.location_on_rounded,
                              size: 14, color: color),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Delivering to',
                                  style: TextStyle(
                                      fontSize: 10,
                                      color: GodropColors.mute),
                                ),
                                Text(
                                  display,
                                  style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: GodropColors.ink),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Feature 2: Shimmer loading ─────────────────────────────────────────────

  Widget _buildLoadingBody(Color color, IconData icon, MenuState menu) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildHeader(color, icon, menu)),
        SliverToBoxAdapter(
          child: Shimmer.fromColors(
            baseColor: const Color(0xFFE0E0E0),
            highlightColor: const Color(0xFFF5F5F5),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Shimmer tab bar pills
                  Row(
                    children: List.generate(
                      2,
                      (i) => Padding(
                        padding: const EdgeInsets.only(right: 10),
                        child: Container(
                          width: 80,
                          height: 34,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Shimmer menu item cards
                  ...List.generate(
                    4,
                    (i) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Container(
                        height: 90,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorBody(Color color, IconData icon, MenuState menu) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildHeader(color, icon, menu)),
        SliverFillRemaining(
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.wifi_off_rounded,
                    size: 40, color: GodropColors.mute),
                const SizedBox(height: 12),
                const Text('Could not load menu',
                    style:
                        TextStyle(fontSize: 15, color: GodropColors.slate)),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => _menuCubit.load(),
                  child: const Text('Retry',
                      style: TextStyle(
                          color: GodropColors.blue,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── Feature 2: Empty menu state ────────────────────────────────────────────

  Widget _buildEmptyMenuBody(Color color, IconData icon, MenuState menu) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _buildHeader(color, icon, menu)),
        const SliverFillRemaining(
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.restaurant_menu_rounded,
                    size: 48, color: GodropColors.mute),
                SizedBox(height: 12),
                Text('No menu items available',
                    style: TextStyle(
                        fontSize: 15, color: GodropColors.slate)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessBody(
    BuildContext context,
    Color color,
    IconData icon,
    CartState cartState,
    MenuState menu,
  ) {
    final vendorCart = cartState.cartFor(_p.id);
    final isRestaurantClosed = !_p.isOpenNow;

    return DefaultTabController(
      length: menu.categories.length,
      child: NestedScrollView(
        headerSliverBuilder: (_, __) => [
          SliverToBoxAdapter(child: _buildHeader(color, icon, menu)),
          if (isRestaurantClosed)
            SliverToBoxAdapter(
              child: Container(
                width: double.infinity,
                color: GodropColors.error.withValues(alpha: 0.08),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: const Row(
                  children: [
                    Icon(Icons.access_time_filled_rounded,
                        size: 16, color: GodropColors.error),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'This partner is currently closed',
                        style: TextStyle(
                            fontSize: 13,
                            color: GodropColors.error,
                            fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          SliverPersistentHeader(
            pinned: true,
            delegate: _TabBarDelegate(
              TabBar(
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                labelColor: color,
                unselectedLabelColor: GodropColors.slate,
                indicatorColor: color,
                indicatorSize: TabBarIndicatorSize.label,
                labelStyle: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 14),
                tabs: menu.categories.map((c) => Tab(text: c.name)).toList(),
              ),
            ),
          ),
        ],
        body: TabBarView(
          children: menu.categories.map((category) {
            final isLoading = menu.loadingCategoryIds.contains(category.id);

            if (isLoading) {
              return _buildCategoryShimmer();
            }

            if (category.items.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.inventory_2_outlined,
                        size: 40, color: GodropColors.mute),
                    SizedBox(height: 12),
                    Text('No items in this category',
                        style:
                            TextStyle(fontSize: 14, color: GodropColors.slate)),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
              itemCount: category.items.length,
              itemBuilder: (_, i) {
                final item = category.items[i];
                final cartItem = vendorCart?.items
                    .where((ci) => ci.id == item.id)
                    .firstOrNull;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _MenuItemCard(
                    item: item,
                    accentColor: color,
                    cartQuantity: cartItem?.quantity ?? 0,
                    restaurantClosed: isRestaurantClosed,
                    onAdd: () => context.read<CartCubit>().addItem(
                          partnerId: _p.id,
                          partnerName: _p.name,
                          partnerType: _p.partnerType,
                          item: CartItemData(
                            id: item.id,
                            name: item.name,
                            desc: item.description ?? '',
                            priceKobo: item.priceKobo,
                          ),
                        ),
                    onIncrement: () =>
                        context.read<CartCubit>().increment(_p.id, item.id),
                    onDecrement: () =>
                        context.read<CartCubit>().decrement(_p.id, item.id),
                  ),
                );
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildCategoryShimmer() {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFE0E0E0),
      highlightColor: const Color(0xFFF5F5F5),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
        itemCount: 4,
        itemBuilder: (_, __) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Container(
            height: 90,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Tab bar pinned delegate ───────────────────────────────────────────────────

class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabBar tabBar;
  const _TabBarDelegate(this.tabBar);

  @override
  double get minExtent => tabBar.preferredSize.height;
  @override
  double get maxExtent => tabBar.preferredSize.height;

  @override
  Widget build(_, double shrinkOffset, bool overlapsContent) {
    return ColoredBox(color: GodropColors.white, child: tabBar);
  }

  @override
  bool shouldRebuild(_TabBarDelegate old) => old.tabBar != tabBar;
}

// ── Menu item card (Feature 1: unavailable badge) ─────────────────────────────

class _MenuItemCard extends StatelessWidget {
  final MenuDisplayItem item;
  final Color accentColor;
  final int cartQuantity;
  final bool restaurantClosed;
  final VoidCallback onAdd;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;

  const _MenuItemCard({
    required this.item,
    required this.accentColor,
    required this.cartQuantity,
    required this.restaurantClosed,
    required this.onAdd,
    required this.onIncrement,
    required this.onDecrement,
  });

  String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  @override
  Widget build(BuildContext context) {
    final isDisabled = restaurantClosed || !item.isAvailable;

    return Opacity(
      opacity: isDisabled ? 0.5 : 1.0,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(item.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink,
                                fontSize: 15)),
                      ),
                      // Feature 1: Unavailable badge
                      if (!item.isAvailable)
                        Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: GodropColors.error.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.block_rounded,
                                  size: 11, color: GodropColors.error),
                              SizedBox(width: 4),
                              Text(
                                'Unavailable',
                                style: TextStyle(
                                    fontSize: 10,
                                    color: GodropColors.error,
                                    fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  if (item.description != null &&
                      item.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(item.description!,
                        style: const TextStyle(
                            fontSize: 12,
                            color: GodropColors.slate,
                            height: 1.4)),
                  ],
                  const SizedBox(height: 8),
                  Text(_fmt(item.priceKobo),
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: accentColor)),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Stack(
              alignment: Alignment.bottomRight,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: item.imageUrl != null
                      ? Image.network(
                          item.imageUrl!,
                          width: 84,
                          height: 84,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _ItemImagePlaceholder(color: accentColor),
                        )
                      : _ItemImagePlaceholder(color: accentColor),
                ),
                // Feature 1: Disable add/increment/decrement when closed or unavailable
                if (!isDisabled)
                  if (cartQuantity == 0)
                    GestureDetector(
                      onTap: onAdd,
                      child: Container(
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                            color: accentColor, shape: BoxShape.circle),
                        child: const Icon(Icons.add_rounded,
                            color: Colors.white, size: 16),
                      ),
                    )
                  else
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        GestureDetector(
                          onTap: onDecrement,
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                                color: accentColor, shape: BoxShape.circle),
                            child: const Icon(Icons.remove_rounded,
                                color: Colors.white, size: 14),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: Text('$cartQuantity',
                              style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: GodropColors.ink)),
                        ),
                        GestureDetector(
                          onTap: onIncrement,
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                                color: accentColor, shape: BoxShape.circle),
                            child: const Icon(Icons.add_rounded,
                                color: Colors.white, size: 14),
                          ),
                        ),
                      ],
                    ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ItemImagePlaceholder extends StatelessWidget {
  final Color color;
  const _ItemImagePlaceholder({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 84,
      height: 84,
      color: color.withValues(alpha: 0.08),
      child: Icon(Icons.image_outlined,
          size: 30, color: color.withValues(alpha: 0.3)),
    );
  }
}

// ── Info chip ─────────────────────────────────────────────────────────────────

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color iconColor;
  const _InfoChip(
      {required this.icon, required this.label, required this.iconColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: GodropColors.background,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: iconColor),
          const SizedBox(width: 4),
          Text(label,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.slate)),
        ],
      ),
    );
  }
}

// ── Header placeholder ────────────────────────────────────────────────────────

class _HeaderPlaceholder extends StatelessWidget {
  final Color color;
  final IconData icon;
  const _HeaderPlaceholder({required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      width: double.infinity,
      color: color.withValues(alpha: 0.08),
      child: Center(
          child: Icon(icon, size: 72, color: color.withValues(alpha: 0.3))),
    );
  }
}

