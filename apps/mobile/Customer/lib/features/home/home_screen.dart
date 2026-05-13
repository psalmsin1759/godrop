import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/services/user_prefs.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../orders/bloc/order_cubit.dart';
import '../orders/bloc/order_state.dart';
import '../orders/bloc/remote_orders_cubit.dart';
import '../orders/bloc/remote_orders_state.dart';
import '../food/bloc/cart_cubit.dart';
import '../food/bloc/cart_state.dart';
import '../food/models/restaurant_data.dart';
import '../../shared/bloc/delivery_address_cubit.dart';
import '../../shared/api/places_service.dart';

String _homeOrderLabel(String orderType) {
  switch (orderType) {
    case 'grocery': return 'Grocery Order';
    case 'retail': return 'Retail Order';
    case 'pharmacy': return 'Pharmacy Order';
    case 'truck': return 'Truck';
    case 'parcel': return 'Parcel';
    default: return 'Food Order';
  }
}

IconData _homeOrderIcon(String orderType) {
  switch (orderType) {
    case 'grocery': return Icons.shopping_basket_rounded;
    case 'retail': return Icons.storefront_rounded;
    case 'pharmacy': return Icons.medication_rounded;
    case 'truck': return Icons.local_shipping_rounded;
    case 'parcel': return Icons.inventory_2_rounded;
    default: return Icons.restaurant_rounded;
  }
}

Color _homeOrderColor(String orderType) {
  switch (orderType) {
    case 'grocery': return const Color(0xFF0EA5E9);
    case 'retail': return const Color(0xFF8B5CF6);
    case 'pharmacy': return const Color(0xFF10B981);
    case 'truck': return GodropColors.orange;
    case 'parcel': return GodropColors.blue;
    default: return GodropColors.orange;
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    context.read<RemoteOrdersCubit>().load();
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
        sub: '480+ restaurants',
        route: '/food/restaurants',
        tag: 'HOT',
        tagColor: GodropColors.orange,
        iconColor: GodropColors.orange),
    _Category(
        icon: Icons.shopping_basket_rounded,
        label: 'Grocery',
        sub: 'Shoprite, Ebeano',
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
          SliverToBoxAdapter(child: _HomeHeader()),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Search bar
                  GestureDetector(
                    onTap: () => context.go('/search'),
                    child: Container(
                      height: 44,
                      decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: GodropColors.border)),
                      child: const Row(children: [
                        SizedBox(width: 12),
                        Icon(Icons.search_rounded, color: GodropColors.mute, size: 20),
                        SizedBox(width: 8),
                        Text('Search restaurants, groceries...', style: TextStyle(color: GodropColors.mute, fontSize: 14)),
                      ]),
                    ),
                  ),
                  const SizedBox(height: 14),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 1.05,
                    ),
                    itemCount: _categories.length,
                    itemBuilder: (_, i) => AnimatedEntrance(
                      delay: Duration(milliseconds: 80 + i * 55),
                      child: _CategoryCard(cat: _categories[i]),
                    ),
                  ),
                  const SizedBox(height: 16),
                  AnimatedEntrance(
                    delay: const Duration(milliseconds: 440),
                    child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: GodropColors.orange,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('LIMITED · ENDS SOON',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.8)),
                              const SizedBox(height: 6),
                              const Text('NO delivery on\nparcels under 5kg',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      height: 1.25)),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.18),
                                    borderRadius: BorderRadius.circular(12)),
                                child: Text('Use code GODROP5',
                                    style: TextStyle(
                                        color: Colors.white.withOpacity(0.8),
                                        fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.18),
                              borderRadius: BorderRadius.circular(14)),
                          child: const Icon(Icons.inventory_2_rounded,
                              color: Colors.white, size: 48),
                        ),
                      ],
                    ),
                  ),
                  ), // AnimatedEntrance closes
                  BlocBuilder<RemoteOrdersCubit, RemoteOrdersState>(
                    builder: (context, remoteState) {
                      final apiOrders = remoteState is RemoteOrdersLoaded ? remoteState.active : <dynamic>[];
                      if (apiOrders.isEmpty) return const SizedBox.shrink();
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(children: [
                                const Text('Active orders', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                                if (apiOrders.length > 1) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(color: GodropColors.blue, borderRadius: BorderRadius.circular(20)),
                                    child: Text('${apiOrders.length}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                                  ),
                                ],
                              ]),
                              TextButton(
                                onPressed: () => context.go('/active-orders'),
                                child: const Text('See all', style: TextStyle(color: GodropColors.blue, fontSize: 14)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
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
        final addrDisplay = deliveryAddress.isEmpty
            ? 'Set delivery address'
            : deliveryAddress;

        return BlocBuilder<CartCubit, CartState>(
          builder: (context, cartState) {
            final cartVendors = cartState.totalVendors;

            return Stack(
              children: [
                // Blue gradient — full background
                Container(
                  decoration: const BoxDecoration(
                      gradient: GodropColors.blueGradient),
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
                          GestureDetector(
                            onTap: () => context.go('/notifications'),
                            child: Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.18),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.notifications_outlined,
                                    color: Colors.white, size: 20)),
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
                                    color: Colors.white.withOpacity(0.18),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                      Icons.shopping_bag_outlined,
                                      color: Colors.white,
                                      size: 20),
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
                                color:
                                    Theme.of(context).colorScheme.secondary,
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
                                  parent: animation,
                                  curve: Curves.easeOut)),
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
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(30),
                        topRight: Radius.circular(30),
                      ),
                    ),
                    padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            readOnly: true,
                            onTap: () {},
                            decoration: InputDecoration(
                              hintText:
                                  'Search restaurants, shops, parcels...',
                              hintStyle: const TextStyle(
                                  color: GodropColors.mute, fontSize: 14),
                              prefixIcon: const Padding(
                                padding:
                                    EdgeInsets.only(left: 14, right: 8),
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
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide.none),
                              enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide.none),
                              focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: BorderSide.none),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () {},
                          child: Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: GodropColors.blue,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.tune_rounded,
                                color: Colors.white, size: 20),
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
            borderRadius:
                BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
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
                              color: vc.partnerType.color.withOpacity(0.1),
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

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.currentAddress);
    _controller.addListener(_onTextChanged);
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _focus.requestFocus();
    });
  }

  void _onTextChanged() async {
    final q = _controller.text.trim();
    if (q.length < 2) {
      setState(() { _suggestions = []; _loading = false; });
      return;
    }
    setState(() => _loading = true);
    final results = await PlacesService.autocomplete(q);
    if (mounted) setState(() { _suggestions = results; _loading = false; });
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
                    value.text.isEmpty ? 'Popular areas in Lagos' : 'Suggestions',
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
                                color: GodropColors.blue.withOpacity(0.08),
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
                                        fontSize: 12,
                                        color: GodropColors.mute))
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

  static const _popularAreas = [
    'Lekki Phase 1, Lagos',
    'Victoria Island (VI), Lagos',
    'Ikeja, Lagos',
    'Yaba, Lagos',
    'Surulere, Lagos',
    'Ikoyi, Lagos',
    'Ajah, Lagos',
    'Maryland, Lagos',
    'Gbagada, Lagos',
    'Magodo, Lagos',
    'Ojodu Berger, Lagos',
    'Festac Town, Lagos',
    'Isale Eko, Lagos Island',
    'Oshodi, Lagos',
    'Agege, Lagos',
  ];

  Widget _buildPopularList() => ListView.separated(
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
                color: GodropColors.blue.withOpacity(0.08),
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
  const _CategoryCard({required this.cat});

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
  late final Animation<double> _scale =
      Tween(begin: 1.0, end: 0.93).animate(
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
    return GestureDetector(
      onTapDown: (_) => _ctrl.forward(),
      onTapUp: (_) => _ctrl.reverse(),
      onTapCancel: _ctrl.reverse,
      onTap: () => context.go(cat.route),
      child: ScaleTransition(
        scale: _scale,
        child: Container(
        decoration: BoxDecoration(
            color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
        padding: const EdgeInsets.all(12),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                      color: (cat.iconColor ?? GodropColors.blue)
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10)),
                  child: Icon(cat.icon,
                      color: cat.iconColor ?? GodropColors.blue, size: 20),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(cat.label,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: GodropColors.ink,
                            fontSize: 13)),
                    Text(cat.sub,
                        style: const TextStyle(
                            fontSize: 10, color: GodropColors.mute),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                  ],
                ),
              ],
            ),
            if (cat.tag != null)
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                  decoration: BoxDecoration(
                      color: cat.tagColor,
                      borderRadius: BorderRadius.circular(5)),
                  child: Text(cat.tag!,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.w700)),
                ),
              ),
          ],
        ),
      ),
      ),  // ScaleTransition
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
  const _RemoteOrderCard({
    required this.id, required this.trackingCode, required this.type,
    required this.status, required this.totalKobo, required this.dropoffAddress,
    this.confirmationCode,
  });

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  Color _statusColor(String s) {
    switch (s.toUpperCase()) {
      case 'PENDING': return Colors.orange;
      case 'ACCEPTED': case 'PREPARING': case 'READY_FOR_PICKUP': return GodropColors.blue;
      case 'IN_TRANSIT': case 'PICKED_UP': return GodropColors.success;
      default: return GodropColors.mute;
    }
  }

  String _statusLabel(String s) {
    switch (s.toUpperCase()) {
      case 'PENDING': return 'Waiting';
      case 'ACCEPTED': return 'Confirmed';
      case 'PREPARING': return 'Preparing';
      case 'READY_FOR_PICKUP': return 'Ready';
      case 'PICKED_UP': return 'Picked up';
      case 'IN_TRANSIT': return 'On the way';
      default: return s;
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
        decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
        child: Row(children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(_homeOrderLabel(type.toLowerCase()), style: const TextStyle(fontWeight: FontWeight.w600, color: GodropColors.ink, fontSize: 14)),
            const SizedBox(height: 2),
            Text('#$trackingCode · ${_fmtKobo(totalKobo)}', style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
            if (dropoffAddress.isNotEmpty)
              Text(dropoffAddress, style: const TextStyle(fontSize: 12, color: GodropColors.mute), maxLines: 1, overflow: TextOverflow.ellipsis),
            if (confirmationCode != null && confirmationCode!.isNotEmpty) ...[
              const SizedBox(height: 2),
              Text('Code: $confirmationCode', style: const TextStyle(fontSize: 11, color: GodropColors.orange, fontWeight: FontWeight.w600)),
            ],
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: _statusColor(status).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
            child: Text(_statusLabel(status), style: TextStyle(color: _statusColor(status), fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ]),
      ),
    );
  }
}

// ── Active order card ─────────────────────────────────────────────────────────

class _ActiveOrderCard extends StatelessWidget {
  final String type;
  final IconData icon;
  final Color iconBg;
  final String subtitle;
  final String status;
  final Color statusColor;
  final String? confirmationCode;
  final VoidCallback onTap;
  const _ActiveOrderCard(
      {required this.type,
      required this.icon,
      required this.iconBg,
      required this.subtitle,
      required this.status,
      required this.statusColor,
      this.confirmationCode,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
            color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
        child: Row(
          children: [
            Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                    color: iconBg, borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, color: Colors.white, size: 20)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(type,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: GodropColors.ink,
                          fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(subtitle,
                      style: const TextStyle(
                          fontSize: 12, color: GodropColors.slate)),
                  if (confirmationCode != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.lock_rounded,
                            size: 11, color: GodropColors.mute),
                        const SizedBox(width: 3),
                        Text('Code: $confirmationCode',
                            style: const TextStyle(
                                fontSize: 11,
                                color: GodropColors.mute,
                                fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20)),
              child: Text(status,
                  style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }
}
