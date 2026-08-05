import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/services/user_prefs.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../orders/bloc/remote_orders_cubit.dart';
import '../orders/bloc/remote_orders_state.dart';
import '../profile/bloc/notifications_cubit.dart';
import '../profile/bloc/notifications_state.dart';
import '../food/bloc/cart_cubit.dart';
import '../food/bloc/cart_state.dart';
import '../food/models/restaurant_data.dart';
import '../../shared/bloc/delivery_address_cubit.dart';
import '../../shared/api/places_service.dart';
import '../../shared/api/api.dart';
import '../../shared/models/promotion_models.dart' as promo;

String _homeOrderLabel(String orderType) {
  switch (orderType) {
    case 'grocery':
      return 'Grocery Order';
    case 'retail':
      return 'Retail Order';
    case 'pharmacy':
      return 'Pharmacy Order';
    case 'truck':
      return 'Truck';
    case 'parcel':
      return 'Parcel';
    default:
      return 'Food Order';
  }
}

IconData _homeOrderIcon(String orderType) {
  switch (orderType) {
    case 'grocery':
      return Icons.shopping_basket_rounded;
    case 'retail':
      return Icons.storefront_rounded;
    case 'pharmacy':
      return Icons.medication_rounded;
    case 'truck':
      return Icons.local_shipping_rounded;
    case 'parcel':
      return Icons.inventory_2_rounded;
    default:
      return Icons.restaurant_rounded;
  }
}

Color _homeOrderColor(String orderType) {
  switch (orderType) {
    case 'grocery':
      return const Color(0xFF0EA5E9);
    case 'retail':
      return const Color(0xFF8B5CF6);
    case 'pharmacy':
      return const Color(0xFF10B981);
    case 'truck':
      return GodropColors.orange;
    case 'parcel':
      return GodropColors.blue;
    default:
      return GodropColors.orange;
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isGridView = true;
  promo.Banner? _banner;

  @override
  void initState() {
    super.initState();
    context.read<RemoteOrdersCubit>().load();
    context.read<NotificationsCubit>().load();
    _loadBanner();
  }

  Future<void> _loadBanner() async {
    try {
      final res = await PromotionsService(DioClient.instance).getBanners();
      if (!mounted) return;
      final candidates = res.banners.where((b) {
        return (b.imageUrl ?? '').isNotEmpty ||
            (b.badge ?? '').isNotEmpty ||
            (b.title ?? '').isNotEmpty ||
            (b.ctaLabel ?? '').isNotEmpty;
      });
      if (candidates.isNotEmpty) setState(() => _banner = candidates.first);
    } catch (_) {
      // Banner section simply stays hidden on failure.
    }
  }

  static const _categories = [
    _Category(
        icon: Icons.inventory_2_rounded,
        label: 'Parcel',
        sub: 'Same-day rider',
        route: '/parcel/addresses',
        tag: '30 MIN',
        tagColor: Color(0xFF22C55E)),
    _Category(
        icon: Icons.local_shipping_rounded,
        label: 'Truck',
        sub: 'Move & relocate',
        route: '/truck',
        tag: null,
        tagColor: null,
        iconColor: GodropColors.orange),
    _Category(
        icon: Icons.restaurant_rounded,
        label: 'Food',
        sub: 'Cooked fresh, delivered',
        route: '/food/restaurants',
        tag: 'HOT',
        tagColor: GodropColors.orange,
        iconColor: GodropColors.orange),
    _Category(
        icon: Icons.shopping_basket_rounded,
        label: 'Grocery',
        sub: 'Groceries & essentials',
        route: '/grocery/stores',
        tag: 'NEW',
        tagColor: Color(0xFF0EA5E9),
        iconColor: Color(0xFF0EA5E9)),
    _Category(
        icon: Icons.storefront_rounded,
        label: 'Retail',
        sub: 'Fashion, home',
        route: '/retail/stores',
        tag: null,
        tagColor: null,
        iconColor: Color(0xFF8B5CF6)),
    _Category(
        icon: Icons.medication_rounded,
        label: 'Pharmacy',
        sub: 'Health essentials',
        route: '/pharmacy/stores',
        tag: null,
        tagColor: null,
        iconColor: Color(0xFF10B981)),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: _HomeHeader(
              isGridView: _isGridView,
              onToggleLayout: () => setState(() => _isGridView = !_isGridView),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  const _SectionHeader(title: 'What do you need?'),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    switchInCurve: Curves.easeOut,
                    switchOutCurve: Curves.easeIn,
                    transitionBuilder: (child, animation) => FadeTransition(
                      opacity: animation,
                      child: SizeTransition(
                        sizeFactor: animation,
                        child: child,
                      ),
                    ),
                    child: _isGridView
                        ? GridView.builder(
                            key: const ValueKey('grid'),
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 3,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 0.95,
                            ),
                            itemCount: _categories.length,
                            itemBuilder: (_, i) => AnimatedEntrance(
                              delay: Duration(milliseconds: 80 + i * 55),
                              child: _CategoryCard(cat: _categories[i]),
                            ),
                          )
                        : ListView.separated(
                            key: const ValueKey('list'),
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _categories.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 10),
                            itemBuilder: (_, i) => AnimatedEntrance(
                              delay: Duration(milliseconds: 80 + i * 55),
                              child: _CategoryCard(
                                  cat: _categories[i], isGrid: false),
                            ),
                          ),
                  ),
                  if (_banner != null) ...[
                    const SizedBox(height: 20),
                    AnimatedEntrance(
                      delay: const Duration(milliseconds: 440),
                      child: _PromoBannerCard(banner: _banner!),
                    ),
                  ],
                  BlocBuilder<RemoteOrdersCubit, RemoteOrdersState>(
                    builder: (context, remoteState) {
                      final apiOrders = remoteState is RemoteOrdersLoaded
                          ? remoteState.active.items
                          : <dynamic>[];
                      if (apiOrders.isEmpty) return const SizedBox.shrink();
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Container(
                                width: 4,
                                height: 18,
                                decoration: BoxDecoration(
                                  gradient: GodropColors.blueGradient,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text('Active orders',
                                  style: TextStyle(
                                      fontSize: 17,
                                      fontWeight: FontWeight.w700,
                                      color: GodropColors.ink,
                                      letterSpacing: -0.3)),
                              if (apiOrders.length > 1) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                      color: GodropColors.blue,
                                      borderRadius: BorderRadius.circular(20)),
                                  child: Text('${apiOrders.length}',
                                      style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700)),
                                ),
                              ],
                              const Spacer(),
                              GestureDetector(
                                onTap: () => context.go('/active-orders'),
                                child: const Text('See all',
                                    style: TextStyle(
                                        color: GodropColors.blue,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ...apiOrders.take(3).map((order) {
                            final id = order.id as String;
                            final trackingCode = order.trackingCode ?? '';
                            final type = order.type as String;
                            final status = order.status as String;
                            final totalKobo = order.totalKobo as int;
                            final confirmationCode = order.confirmationCode;
                            final dropoff = order.dropoffAddress ?? '';
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: _RemoteOrderCard(
                                id: id,
                                trackingCode: trackingCode,
                                type: type,
                                status: status,
                                totalKobo: totalKobo,
                                dropoffAddress: dropoff,
                                confirmationCode: confirmationCode,
                                isMultiParcel: order.isMultiParcel,
                              ),
                            );
                          }),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _HomeHeader extends StatefulWidget {
  final bool isGridView;
  final VoidCallback onToggleLayout;
  const _HomeHeader({required this.isGridView, required this.onToggleLayout});

  @override
  State<_HomeHeader> createState() => _HomeHeaderState();
}

class _HomeHeaderState extends State<_HomeHeader> {
  static const _questions = [
    'What are we moving today?',
    'Hungry? Order food now',
    'Need groceries delivered?',
    'Send a parcel across Lagos',
    'Moving homes? Book a truck',
    'Shop retail, we deliver',
    'Need medicine? We deliver',
  ];

  int _questionIndex = 0;
  Timer? _timer;
  String _userName = '';

  @override
  void initState() {
    super.initState();
    _userName = UserPrefs.name;
    _timer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (mounted) {
        setState(() {
          _questionIndex = (_questionIndex + 1) % _questions.length;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _showAddressSheet(BuildContext context) {
    final current = context.read<DeliveryAddressCubit>().state;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AddressBottomSheet(
        currentAddress: current,
        onAddressSelected: (address) =>
            context.read<DeliveryAddressCubit>().setAddress(address),
      ),
    );
  }

  void _showCartSummary(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BlocProvider.value(
        value: context.read<CartCubit>(),
        child: const _CartSummarySheet(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return BlocBuilder<DeliveryAddressCubit, String>(
      builder: (context, deliveryAddress) {
        final addrDisplay =
            deliveryAddress.isEmpty ? 'Set delivery address' : deliveryAddress;

        return BlocBuilder<CartCubit, CartState>(
          builder: (context, cartState) {
            final cartVendors = cartState.totalVendors;

            return Stack(
              children: [
                // Blue gradient — full background
                Container(
                  decoration:
                      const BoxDecoration(gradient: GodropColors.blueGradient),
                  padding: EdgeInsets.fromLTRB(16, topPadding + 14, 16, 80),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Logo + app name + icon pill
                      Row(
                        children: [
                          Image.asset('assets/images/logo.png',
                              width: 26, height: 26),
                          const SizedBox(width: 6),
                          const Text('GoDrop',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700)),
                          const Spacer(),
                          // Notification icon
                          BlocBuilder<NotificationsCubit, NotificationsState>(
                            builder: (context, notifState) {
                              final unread = notifState is NotificationsLoaded
                                  ? notifState.unreadCount
                                  : 0;
                              return GestureDetector(
                                onTap: () => context.go('/notifications'),
                                child: Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        color:
                                            Colors.white.withValues(alpha: 0.18),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                          Icons.notifications_outlined,
                                          color: Colors.white,
                                          size: 20),
                                    ),
                                    if (unread > 0)
                                      Positioned(
                                        top: -2,
                                        right: -2,
                                        child: Container(
                                          padding: const EdgeInsets.all(3),
                                          constraints: const BoxConstraints(
                                              minWidth: 18, minHeight: 18),
                                          decoration: BoxDecoration(
                                            color: GodropColors.orange,
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                                color: GodropColors.blueDark,
                                                width: 1.5),
                                          ),
                                          child: Center(
                                            child: Text(
                                              unread > 9 ? '9+' : '$unread',
                                              style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              );
                            },
                          ),
                          const SizedBox(width: 8),
                          // ── Feature 6: Cart icon with badge ──────────────
                          GestureDetector(
                            onTap: () => _showCartSummary(context),
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.18),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.shopping_bag_outlined,
                                      color: Colors.white, size: 20),
                                ),
                                if (cartVendors > 0)
                                  Positioned(
                                    top: -2,
                                    right: -2,
                                    child: Container(
                                      width: 16,
                                      height: 16,
                                      decoration: const BoxDecoration(
                                        color: Colors.red,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Center(
                                        child: Text(
                                          '$cartVendors',
                                          style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 9,
                                              fontWeight: FontWeight.w700),
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      // Deliver to — tappable dropdown
                      const Text("DELIVER TO",
                          style: TextStyle(
                              color: Colors.white54,
                              fontSize: 13,
                              fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      GestureDetector(
                        onTap: () => _showAddressSheet(context),
                        behavior: HitTestBehavior.opaque,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.location_on_rounded,
                                color: Theme.of(context).colorScheme.secondary,
                                size: 14),
                            const SizedBox(width: 4),
                            Text(
                              addrDisplay,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500),
                            ),
                            const SizedBox(width: 3),
                            const Icon(Icons.keyboard_arrow_down_rounded,
                                color: Colors.white, size: 16),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Greeting
                      Text(
                        _userName.isNotEmpty
                            ? 'Hi ${_userName.split(' ').first},'
                            : 'Hi there,',
                        style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            height: 1.2),
                      ),
                      const SizedBox(height: 4),
                      // Rotating category question
                      SizedBox(
                        height: 24,
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 380),
                          transitionBuilder: (child, animation) =>
                              FadeTransition(
                            opacity: animation,
                            child: SlideTransition(
                              position: Tween<Offset>(
                                begin: const Offset(0, 0.4),
                                end: Offset.zero,
                              ).animate(CurvedAnimation(
                                  parent: animation, curve: Curves.easeOut)),
                              child: child,
                            ),
                          ),
                          child: Align(
                            key: ValueKey(_questionIndex),
                            alignment: Alignment.centerLeft,
                            child: Text(
                              _questions[_questionIndex],
                              style: const TextStyle(
                                fontSize: 15,
                                color: GodropColors.orange,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
                // White rounded card — overlays bottom of blue gradient
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      color: GodropColors.card,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(30),
                        topRight: Radius.circular(30),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: GodropColors.ink.withValues(alpha: 0.10),
                          blurRadius: 20,
                          offset: const Offset(0, -4),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            readOnly: true,
                            onTap: () => context.push('/search'),
                            decoration: InputDecoration(
                              hintText: 'Search restaurants, shops, parcels...',
                              hintStyle: const TextStyle(
                                  color: GodropColors.mute, fontSize: 14),
                              prefixIcon: const Padding(
                                padding: EdgeInsets.only(left: 14, right: 8),
                                child: Icon(Icons.search_rounded,
                                    color: GodropColors.mute, size: 20),
                              ),
                              prefixIconConstraints: const BoxConstraints(
                                  minWidth: 0, minHeight: 0),
                              filled: true,
                              fillColor: GodropColors.background,
                              contentPadding:
                                  const EdgeInsets.symmetric(vertical: 14),
                              border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: BorderSide.none),
                              enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: BorderSide.none),
                              focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(14),
                                  borderSide: BorderSide.none),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: widget.onToggleLayout,
                          child: Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              gradient: GodropColors.blueGradient,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color:
                                      GodropColors.blue.withValues(alpha: 0.35),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: AnimatedSwitcher(
                              duration: const Duration(milliseconds: 250),
                              transitionBuilder: (child, animation) =>
                                  RotationTransition(
                                turns: animation,
                                child: FadeTransition(
                                    opacity: animation, child: child),
                              ),
                              child: Icon(
                                widget.isGridView
                                    ? Icons.view_list_rounded
                                    : Icons.grid_view_rounded,
                                key: ValueKey(widget.isGridView),
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}

// ── Feature 6: Cart summary sheet ─────────────────────────────────────────────

class _CartSummarySheet extends StatelessWidget {
  const _CartSummarySheet();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (context, cartState) {
        final activeCarts = cartState.activeCarts;
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24), topRight: Radius.circular(24)),
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                      color: GodropColors.border,
                      borderRadius: BorderRadius.circular(2)),
                ),
                const SizedBox(height: 20),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text('Your carts',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: GodropColors.ink)),
                  ),
                ),
                const SizedBox(height: 12),
                if (activeCarts.isEmpty)
                  const Padding(
                    padding: EdgeInsets.fromLTRB(20, 20, 20, 20),
                    child: Center(
                      child: Text('No active carts',
                          style: TextStyle(
                              fontSize: 15, color: GodropColors.mute)),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    itemCount: activeCarts.length,
                    separatorBuilder: (_, __) =>
                        const Divider(height: 1, indent: 52),
                    itemBuilder: (_, i) {
                      final vc = activeCarts[i];
                      return ListTile(
                        leading: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                              color:
                                  vc.partnerType.color.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10)),
                          child: Icon(vc.partnerType.icon,
                              color: vc.partnerType.color, size: 20),
                        ),
                        title: Text(vc.partnerName,
                            style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink)),
                        subtitle: Text(
                            '${vc.totalItems} item${vc.totalItems == 1 ? '' : 's'}',
                            style: const TextStyle(
                                fontSize: 12, color: GodropColors.mute)),
                        trailing: GestureDetector(
                          onTap: () {
                            Navigator.pop(context);
                            context.go('/food/cart',
                                extra: {'partnerId': vc.partnerId});
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                                color: GodropColors.blue,
                                borderRadius: BorderRadius.circular(8)),
                            child: const Text('Checkout →',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600)),
                          ),
                        ),
                      );
                    },
                  ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }
}

//

// ── Address bottom sheet (Feature 4: uses DeliveryAddressCubit) ───────────────

class _AddressBottomSheet extends StatefulWidget {
  final String currentAddress;
  final ValueChanged<String> onAddressSelected;

  const _AddressBottomSheet({
    required this.currentAddress,
    required this.onAddressSelected,
  });

  @override
  State<_AddressBottomSheet> createState() => _AddressBottomSheetState();
}

class _AddressBottomSheetState extends State<_AddressBottomSheet> {
  late final TextEditingController _controller;
  final FocusNode _focus = FocusNode();
  List<PlacesPrediction> _suggestions = [];
  bool _loading = false;
  List<String> _popularAreas = [];
  bool _loadingPopular = true;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.currentAddress);
    _controller.addListener(_onTextChanged);
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _focus.requestFocus();
    });
    _loadPopularAreas();
  }

  void _loadPopularAreas() async {
    final areas = await PlacesService.fetchPopularAreas();
    if (mounted)
      setState(() {
        _popularAreas = areas;
        _loadingPopular = false;
      });
  }

  void _onTextChanged() async {
    final q = _controller.text.trim();
    if (q.length < 2) {
      setState(() {
        _suggestions = [];
        _loading = false;
      });
      return;
    }
    setState(() => _loading = true);
    final results = await PlacesService.autocomplete(q);
    if (mounted)
      setState(() {
        _suggestions = results;
        _loading = false;
      });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _select(String address) {
    widget.onAddressSelected(address);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final showPopular = _controller.text.trim().length < 2;

    return Container(
      height: MediaQuery.of(context).size.height * 0.78 + bottomInset,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 12),
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: GodropColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'Deliver to',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink),
            ),
          ),
          const SizedBox(height: 4),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'Enter your delivery address',
              style: TextStyle(fontSize: 13, color: GodropColors.slate),
            ),
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _controller,
              focusNode: _focus,
              textInputAction: TextInputAction.search,
              style: const TextStyle(fontSize: 15, color: GodropColors.ink),
              decoration: InputDecoration(
                hintText: 'e.g. 14 Admiralty Way, Lekki',
                hintStyle:
                    const TextStyle(color: GodropColors.mute, fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded,
                    color: GodropColors.blue, size: 20),
                suffixIcon: _loading
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: GodropColors.blue)))
                    : ValueListenableBuilder<TextEditingValue>(
                        valueListenable: _controller,
                        builder: (_, value, __) => value.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.close_rounded,
                                    color: GodropColors.mute, size: 18),
                                onPressed: _controller.clear,
                              )
                            : const SizedBox.shrink(),
                      ),
                filled: true,
                fillColor: GodropColors.background,
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:
                      const BorderSide(color: GodropColors.blue, width: 1.5),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                const Icon(Icons.access_time_rounded,
                    size: 13, color: GodropColors.mute),
                const SizedBox(width: 4),
                ValueListenableBuilder<TextEditingValue>(
                  valueListenable: _controller,
                  builder: (_, value, __) => Text(
                    value.text.isEmpty
                        ? 'Popular areas in Lagos'
                        : 'Suggestions',
                    style: const TextStyle(
                        fontSize: 12,
                        color: GodropColors.mute,
                        fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: showPopular
                ? _buildPopularList()
                : (_suggestions.isEmpty && !_loading
                    ? const Center(
                        child: Text('No results found',
                            style: TextStyle(
                                fontSize: 14, color: GodropColors.mute)))
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 4),
                        itemCount: _suggestions.length,
                        separatorBuilder: (_, __) =>
                            const Divider(height: 1, indent: 44),
                        itemBuilder: (_, i) {
                          final p = _suggestions[i];
                          final label = p.secondaryText.isNotEmpty
                              ? '${p.mainText}, ${p.secondaryText}'
                              : p.mainText;
                          return ListTile(
                            leading: Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color:
                                    GodropColors.blue.withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.place_rounded,
                                  color: GodropColors.blue, size: 16),
                            ),
                            title: Text(p.mainText,
                                style: const TextStyle(
                                    fontSize: 14,
                                    color: GodropColors.ink,
                                    fontWeight: FontWeight.w500)),
                            subtitle: p.secondaryText.isNotEmpty
                                ? Text(p.secondaryText,
                                    style: const TextStyle(
                                        fontSize: 12, color: GodropColors.mute))
                                : null,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 4, vertical: 2),
                            dense: true,
                            onTap: () => _select(label),
                          );
                        },
                      )),
          ),
          SizedBox(height: bottomInset + 16),
        ],
      ),
    );
  }

  Widget _buildPopularList() {
    if (_loadingPopular) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 32),
          child: CircularProgressIndicator(
              color: GodropColors.blue, strokeWidth: 2),
        ),
      );
    }
    if (_popularAreas.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 32),
          child: Text('No areas found',
              style: TextStyle(fontSize: 14, color: GodropColors.mute)),
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      itemCount: _popularAreas.length,
      separatorBuilder: (_, __) => const Divider(height: 1, indent: 44),
      itemBuilder: (_, i) {
        final area = _popularAreas[i];
        return ListTile(
          leading: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: GodropColors.blue.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.location_on_rounded,
                color: GodropColors.blue, size: 16),
          ),
          title: Text(area,
              style: const TextStyle(
                  fontSize: 14,
                  color: GodropColors.ink,
                  fontWeight: FontWeight.w500)),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
          dense: true,
          onTap: () => _select(area),
        );
      },
    );
  }
}

// ── Section header ────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 18,
          decoration: BoxDecoration(
            gradient: GodropColors.blueGradient,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(title,
            style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: GodropColors.ink,
                letterSpacing: -0.3,
                height: 1.0)),
      ],
    );
  }
}

// ── Promo banner ───────────────────────────────────────────────────────────────

class _PromoBannerCard extends StatelessWidget {
  final promo.Banner banner;
  const _PromoBannerCard({required this.banner});

  @override
  Widget build(BuildContext context) {
    final hasImage = (banner.imageUrl ?? '').isNotEmpty;
    final badge = banner.badge ?? '';
    final title = banner.title ?? '';
    final cta = banner.ctaLabel ?? '';

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: hasImage ? null : GodropColors.orangeGradient,
        color: hasImage ? GodropColors.orange : null,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: GodropColors.orange.withValues(alpha: 0.32),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          if (hasImage)
            Positioned.fill(
              child: Image.network(
                banner.imageUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    const DecoratedBox(decoration: BoxDecoration(gradient: GodropColors.orangeGradient)),
              ),
            ),
          if (hasImage)
            Positioned.fill(
              child: Container(color: Colors.black.withValues(alpha: 0.28)),
            ),
          if (!hasImage) ...[
            Positioned(
              top: -30,
              right: -20,
              child: Container(
                width: 130,
                height: 130,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.10),
                ),
              ),
            ),
            Positioned(
              bottom: -40,
              right: 50,
              child: Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
            ),
          ],
          Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (badge.isNotEmpty) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.22),
                              borderRadius: BorderRadius.circular(20)),
                          child: Text(badge,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8)),
                        ),
                        const SizedBox(height: 10),
                      ],
                      if (title.isNotEmpty) ...[
                        Text(title,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 17,
                                fontWeight: FontWeight.w800,
                                height: 1.25,
                                letterSpacing: -0.3)),
                        const SizedBox(height: 10),
                      ],
                      if (cta.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                              color: Colors.white, borderRadius: BorderRadius.circular(20)),
                          child: Text(cta,
                              style: const TextStyle(
                                  color: GodropColors.orange,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800)),
                        ),
                    ],
                  ),
                ),
                if (!hasImage)
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(18)),
                    child: const Icon(Icons.inventory_2_rounded, color: Colors.white, size: 44),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Category card ─────────────────────────────────────────────────────────────

class _Category {
  final IconData icon;
  final String label;
  final String sub;
  final String route;
  final String? tag;
  final Color? tagColor;
  final Color? iconColor;
  const _Category(
      {required this.icon,
      required this.label,
      required this.sub,
      required this.route,
      this.tag,
      this.tagColor,
      this.iconColor});
}

class _CategoryCard extends StatefulWidget {
  final _Category cat;
  final bool isGrid;
  const _CategoryCard({required this.cat, this.isGrid = true});

  @override
  State<_CategoryCard> createState() => _CategoryCardState();
}

class _CategoryCardState extends State<_CategoryCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 100),
    reverseDuration: const Duration(milliseconds: 200),
  );
  late final Animation<double> _scale = Tween(begin: 1.0, end: 0.93).animate(
    CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
  );

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cat = widget.cat;
    final accent = cat.iconColor ?? GodropColors.blue;
    return GestureDetector(
      onTapDown: (_) => _ctrl.forward(),
      onTapUp: (_) => _ctrl.reverse(),
      onTapCancel: _ctrl.reverse,
      onTap: () => context.go(cat.route),
      child: ScaleTransition(
        scale: _scale,
        child: Container(
          decoration: BoxDecoration(
            color: GodropColors.card,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: GodropColors.border, width: 1),
            boxShadow: GodropColors.softShadow,
          ),
          padding: const EdgeInsets.all(12),
          child: widget.isGrid ? _gridContent(accent) : _listContent(accent),
        ),
      ), // ScaleTransition
    );
  }

  Widget _tag(_Category cat) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
          color: cat.tagColor,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: (cat.tagColor ?? GodropColors.blue).withValues(alpha: 0.35),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ]),
      child: Text(cat.tag!,
          style: const TextStyle(
              color: Colors.white,
              fontSize: 8,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.3)),
    );
  }

  Widget _iconBadge(Color accent) {
    final cat = widget.cat;
    return Container(
      width: 42,
      height: 42,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            accent.withValues(alpha: 0.18),
            accent.withValues(alpha: 0.08),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Icon(cat.icon, color: accent, size: 22),
    );
  }

  Widget _gridContent(Color accent) {
    final cat = widget.cat;
    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _iconBadge(accent),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(cat.label,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink,
                        fontSize: 13,
                        letterSpacing: -0.2)),
                const SizedBox(height: 1),
                Text(cat.sub,
                    style: const TextStyle(
                        fontSize: 10, color: GodropColors.mute),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ],
        ),
        if (cat.tag != null) Positioned(top: 0, right: 0, child: _tag(cat)),
      ],
    );
  }

  Widget _listContent(Color accent) {
    final cat = widget.cat;
    return Row(
      children: [
        _iconBadge(accent),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(cat.label,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink,
                          fontSize: 14,
                          letterSpacing: -0.2)),
                  if (cat.tag != null) ...[
                    const SizedBox(width: 8),
                    _tag(cat),
                  ],
                ],
              ),
              const SizedBox(height: 2),
              Text(cat.sub,
                  style: const TextStyle(fontSize: 12, color: GodropColors.mute),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
        const Icon(Icons.chevron_right_rounded,
            color: GodropColors.mute, size: 20),
      ],
    );
  }
}

// ── Remote active order card (from API) ───────────────────────────────────────

class _RemoteOrderCard extends StatelessWidget {
  final String id;
  final String trackingCode;
  final String type;
  final String status;
  final int totalKobo;
  final String dropoffAddress;
  final String? confirmationCode;
  final bool isMultiParcel;
  const _RemoteOrderCard({
    required this.id,
    required this.trackingCode,
    required this.type,
    required this.status,
    required this.totalKobo,
    required this.dropoffAddress,
    this.confirmationCode,
    this.isMultiParcel = false,
  });

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  Color _statusColor(String s) {
    switch (s.toUpperCase()) {
      case 'PENDING':
        return Colors.orange;
      case 'ACCEPTED':
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return GodropColors.blue;
      case 'IN_TRANSIT':
      case 'PICKED_UP':
        return GodropColors.success;
      default:
        return GodropColors.mute;
    }
  }

  String _statusLabel(String s) {
    switch (s.toUpperCase()) {
      case 'PENDING':
        return 'Waiting';
      case 'ACCEPTED':
        return 'Confirmed';
      case 'PREPARING':
        return 'Preparing';
      case 'READY_FOR_PICKUP':
        return 'Ready';
      case 'PICKED_UP':
        return 'Picked up';
      case 'IN_TRANSIT':
        return 'On the way';
      default:
        return s;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _homeOrderColor(type.toLowerCase());
    final icon = _homeOrderIcon(type.toLowerCase());
    return GestureDetector(
      onTap: () => context.go('/orders/$id'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GodropColors.border, width: 1),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color, Color.lerp(color, Colors.black, 0.18)!],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                    color: color.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 3)),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(_homeOrderLabel(type.toLowerCase()),
                    style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink,
                        fontSize: 14)),
                const SizedBox(height: 2),
                Text('#$trackingCode · ${_fmtKobo(totalKobo)}',
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.slate)),
                if (dropoffAddress.isNotEmpty)
                  Text(dropoffAddress,
                      style: const TextStyle(
                          fontSize: 12, color: GodropColors.mute),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                if (isMultiParcel) ...[
                  const SizedBox(height: 2),
                  const Text('Tap for delivery codes',
                      style: TextStyle(
                          fontSize: 11,
                          color: GodropColors.orange,
                          fontWeight: FontWeight.w600)),
                ] else if (confirmationCode != null &&
                    confirmationCode!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text('Code: $confirmationCode',
                      style: const TextStyle(
                          fontSize: 11,
                          color: GodropColors.orange,
                          fontWeight: FontWeight.w600)),
                ],
              ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
                color: _statusColor(status).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20)),
            child: Text(_statusLabel(status),
                style: TextStyle(
                    color: _statusColor(status),
                    fontSize: 12,
                    fontWeight: FontWeight.w600)),
          ),
        ]),
      ),
    );
  }
}
