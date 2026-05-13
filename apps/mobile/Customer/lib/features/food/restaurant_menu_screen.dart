import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import '../../app/theme.dart';
import '../../shared/api/places_service.dart';
import 'bloc/cart_cubit.dart';
import 'bloc/cart_state.dart';
import 'models/restaurant_data.dart';

class RestaurantMenuScreen extends StatefulWidget {
  final RestaurantData restaurant;
  final String? deliveryAddress;
  const RestaurantMenuScreen({
    super.key,
    required this.restaurant,
    this.deliveryAddress,
  });

  @override
  State<RestaurantMenuScreen> createState() =>
      _RestaurantMenuScreenState();
}

class _RestaurantMenuScreenState extends State<RestaurantMenuScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  late String _deliveryAddress;

  RestaurantData get _r => widget.restaurant;

  @override
  void initState() {
    super.initState();
    _deliveryAddress = widget.deliveryAddress ?? 'Detecting location...';
    _tabs = TabController(length: _r.menuCategories.length, vsync: this);
    _tabs.addListener(() => setState(() {}));
    if (widget.deliveryAddress == null) _resolveCurrentLocation();
  }

  Future<void> _resolveCurrentLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (mounted) setState(() => _deliveryAddress = 'Set delivery address');
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 8),
      );
      final address = await PlacesService.reverseGeocode(pos.latitude, pos.longitude);
      if (mounted) {
        setState(() => _deliveryAddress = address ?? 'Set delivery address');
      }
    } catch (_) {
      if (mounted) setState(() => _deliveryAddress = 'Set delivery address');
    }
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  void _showDeliverySheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _DeliveryAddressSheet(
        currentAddress: _deliveryAddress,
        onAddressSelected: (addr) => setState(() => _deliveryAddress = addr),
      ),
    );
  }

  String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (context, cart) {
        final vendorCart = cart.cartFor(_r.id);
        final totalItems = vendorCart?.totalItems ?? 0;
        final totalKobo = vendorCart?.subtotalKobo ?? 0;

        return Scaffold(
          backgroundColor: GodropColors.background,
          body: Stack(
            children: [
              NestedScrollView(
                headerSliverBuilder: (_, __) => [
                  SliverToBoxAdapter(
                    child: Container(
                      color: GodropColors.white,
                      child: Column(
                        children: [
                          // Hero image
                          Stack(
                            children: [
                              Container(
                                height: 180,
                                color: GodropColors.orange.withOpacity(0.08),
                                child: Center(
                                    child: Icon(Icons.restaurant_rounded,
                                        size: 72,
                                        color: GodropColors.orange
                                            .withOpacity(0.3))),
                              ),
                              Positioned(
                                top: MediaQuery.of(context).padding.top + 8,
                                left: 12,
                                child: GestureDetector(
                                  onTap: () => context.go('/food/restaurants'),
                                  child: Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius:
                                            BorderRadius.circular(10)),
                                    child: const Icon(
                                        Icons.chevron_left_rounded,
                                        size: 22),
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
                                Text(_r.name,
                                    style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                        color: GodropColors.ink)),
                                const SizedBox(height: 4),
                                Text('${_r.type} · ${_r.area}',
                                    style: const TextStyle(
                                        fontSize: 13,
                                        color: GodropColors.slate)),
                                const SizedBox(height: 10),
                                Row(
                                  children: [
                                    _InfoChip(
                                        icon: Icons.star_rounded,
                                        label:
                                            '${_r.rating} (1.1K)',
                                        iconColor: GodropColors.orange),
                                    const SizedBox(width: 12),
                                    _InfoChip(
                                        icon: Icons.access_time_rounded,
                                        label: _r.deliveryTime,
                                        iconColor: GodropColors.slate),
                                    const SizedBox(width: 12),
                                    _InfoChip(
                                        icon: Icons.local_shipping_rounded,
                                        label: _r.deliveryFeeKobo == 0
                                            ? 'Free delivery'
                                            : '+ ${_fmt(_r.deliveryFeeKobo)}',
                                        iconColor: _r.deliveryFeeKobo == 0
                                            ? GodropColors.success
                                            : GodropColors.slate),
                                  ],
                                ),
                                const SizedBox(height: 14),
                                // Delivering to — tappable
                                GestureDetector(
                                  onTap: _showDeliverySheet,
                                  behavior: HitTestBehavior.opaque,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: GodropColors.background,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                          color: GodropColors.border,
                                          width: 1),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(
                                            Icons.location_on_rounded,
                                            size: 14,
                                            color: GodropColors.orange),
                                        const SizedBox(width: 6),
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Delivering to',
                                              style: TextStyle(
                                                  fontSize: 10,
                                                  color: GodropColors.mute),
                                            ),
                                            Text(
                                              _deliveryAddress,
                                              style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w600,
                                                  color: GodropColors.ink),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                        const Spacer(),
                                        const Icon(
                                            Icons.keyboard_arrow_down_rounded,
                                            size: 16,
                                            color: GodropColors.slate),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TabBar(
                            controller: _tabs,
                            isScrollable: true,
                            tabAlignment: TabAlignment.start,
                            labelColor: GodropColors.blue,
                            unselectedLabelColor: GodropColors.slate,
                            indicatorColor: GodropColors.blue,
                            indicatorSize: TabBarIndicatorSize.label,
                            labelStyle: const TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 14),
                            tabs: _r.menuCategories
                                .map((c) => Tab(text: c.name))
                                .toList(),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                body: TabBarView(
                  controller: _tabs,
                  children: _r.menuCategories.map((category) {
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
                            cartQuantity: cartItem?.quantity ?? 0,
                            onAdd: () =>
                                context.read<CartCubit>().addItem(
                                      partnerId: _r.id,
                                      partnerName: _r.name,
                                      partnerType: _r.partnerType,
                                      item: CartItemData(
                                        id: item.id,
                                        name: item.name,
                                        desc: item.desc,
                                        priceKobo: item.priceKobo,
                                        emoji: item.emoji,
                                      ),
                                    ),
                            onIncrement: () => context
                                .read<CartCubit>()
                                .increment(_r.id, item.id),
                            onDecrement: () => context
                                .read<CartCubit>()
                                .decrement(_r.id, item.id),
                          ),
                        );
                      },
                    );
                  }).toList(),
                ),
              ),

              // View cart button
              if (totalItems > 0)
                Positioned(
                  bottom: 24,
                  left: 16,
                  right: 16,
                  child: GestureDetector(
                    onTap: () => context.go('/food/cart', extra: {'partnerId': _r.id}),
                    child: Container(
                      height: 54,
                      decoration: BoxDecoration(
                          color: GodropColors.blue,
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
          ),
        );
      },
    );
  }
}

class _MenuItemCard extends StatelessWidget {
  final MenuItemData item;
  final int cartQuantity;
  final VoidCallback onAdd;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;

  const _MenuItemCard({
    required this.item,
    required this.cartQuantity,
    required this.onAdd,
    required this.onIncrement,
    required this.onDecrement,
  });

  String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink,
                        fontSize: 15)),
                const SizedBox(height: 4),
                Text(item.desc,
                    style: const TextStyle(
                        fontSize: 12,
                        color: GodropColors.slate,
                        height: 1.4)),
                const SizedBox(height: 8),
                Text(_fmt(item.priceKobo),
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.orange)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                    color: GodropColors.orange.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12)),
                child: Center(
                    child: Text(item.emoji,
                        style: const TextStyle(fontSize: 32))),
              ),
              if (cartQuantity == 0)
                GestureDetector(
                  onTap: onAdd,
                  child: Container(
                    width: 26,
                    height: 26,
                    decoration: const BoxDecoration(
                        color: GodropColors.blue, shape: BoxShape.circle),
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
                        decoration: const BoxDecoration(
                            color: GodropColors.blue, shape: BoxShape.circle),
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
                        decoration: const BoxDecoration(
                            color: GodropColors.blue, shape: BoxShape.circle),
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
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color iconColor;
  const _InfoChip(
      {required this.icon, required this.label, required this.iconColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: iconColor),
        const SizedBox(width: 3),
        Text(label,
            style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
      ],
    );
  }
}

// ── Delivery address bottom sheet ────────────────────────────────────────────

class _DeliveryAddressSheet extends StatefulWidget {
  final String currentAddress;
  final ValueChanged<String> onAddressSelected;
  const _DeliveryAddressSheet(
      {required this.currentAddress, required this.onAddressSelected});

  @override
  State<_DeliveryAddressSheet> createState() => _DeliveryAddressSheetState();
}

class _DeliveryAddressSheetState extends State<_DeliveryAddressSheet> {
  late final TextEditingController _ctrl;
  final FocusNode _focus = FocusNode();
  List<PlacesPrediction> _suggestions = [];
  bool _searchLoading = false;
  bool _locationLoading = false;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController();
    _ctrl.addListener(_onChanged);
    Future.delayed(
        const Duration(milliseconds: 300),
        () { if (mounted) _focus.requestFocus(); });
  }

  void _onChanged() async {
    final q = _ctrl.text.trim();
    if (q.length < 2) {
      setState(() { _suggestions = []; _searchLoading = false; });
      return;
    }
    setState(() => _searchLoading = true);
    final results = await PlacesService.autocomplete(q);
    if (mounted) setState(() { _suggestions = results; _searchLoading = false; });
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
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 10),
      );
      final address = await PlacesService.reverseGeocode(pos.latitude, pos.longitude);
      if (mounted && address != null) {
        widget.onAddressSelected(address);
        Navigator.pop(context);
      }
    } catch (_) {
      if (mounted) setState(() => _locationLoading = false);
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final showSuggestions = _ctrl.text.trim().length >= 2;

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
                  borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 20),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text('Deliver to',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink)),
          ),
          const SizedBox(height: 4),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text('Enter your delivery address',
                style: TextStyle(fontSize: 13, color: GodropColors.slate)),
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              controller: _ctrl,
              focusNode: _focus,
              textInputAction: TextInputAction.search,
              style: const TextStyle(fontSize: 15, color: GodropColors.ink),
              decoration: InputDecoration(
                hintText: 'Search address...',
                hintStyle:
                    const TextStyle(color: GodropColors.mute, fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded,
                    color: GodropColors.blue, size: 20),
                suffixIcon: _searchLoading
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: GodropColors.blue)))
                    : (_ctrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close_rounded,
                                color: GodropColors.mute, size: 18),
                            onPressed: _ctrl.clear,
                          )
                        : null),
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
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: InkWell(
              onTap: _locationLoading ? null : _useCurrentLocation,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: GodropColors.blue.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: GodropColors.blue.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: _locationLoading
                          ? const Padding(
                              padding: EdgeInsets.all(8),
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: GodropColors.blue))
                          : const Icon(Icons.my_location_rounded,
                              color: GodropColors.blue, size: 16),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Use my current location',
                              style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: GodropColors.blue)),
                          Text('Detect your location automatically',
                              style: TextStyle(
                                  fontSize: 11, color: GodropColors.slate)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded,
                        size: 18, color: GodropColors.blue),
                  ],
                ),
              ),
            ),
          ),
          if (showSuggestions) ...[
            const SizedBox(height: 12),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Icon(Icons.place_rounded,
                      size: 13, color: GodropColors.mute),
                  SizedBox(width: 4),
                  Text('Suggestions',
                      style: TextStyle(
                          fontSize: 12,
                          color: GodropColors.mute,
                          fontWeight: FontWeight.w500)),
                ],
              ),
            ),
            const SizedBox(height: 4),
            Expanded(
              child: _suggestions.isEmpty && !_searchLoading
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
                        final pred = _suggestions[i];
                        final label = pred.secondaryText.isNotEmpty
                            ? '${pred.mainText}, ${pred.secondaryText}'
                            : pred.mainText;
                        return ListTile(
                          leading: Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                                color: GodropColors.blue.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(8)),
                            child: const Icon(Icons.place_rounded,
                                color: GodropColors.blue, size: 16),
                          ),
                          title: Text(pred.mainText,
                              style: const TextStyle(
                                  fontSize: 14,
                                  color: GodropColors.ink,
                                  fontWeight: FontWeight.w500)),
                          subtitle: pred.secondaryText.isNotEmpty
                              ? Text(pred.secondaryText,
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: GodropColors.mute))
                              : null,
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 4, vertical: 2),
                          dense: true,
                          onTap: () {
                            widget.onAddressSelected(label);
                            Navigator.pop(context);
                          },
                        );
                      },
                    ),
            ),
          ] else
            const Spacer(),
          SizedBox(height: bottomInset + 16),
        ],
      ),
    );
  }
}
