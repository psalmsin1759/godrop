import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/places_service.dart';
import 'models/restaurant_data.dart';

class RestaurantsScreen extends StatefulWidget {
  const RestaurantsScreen({super.key});

  @override
  State<RestaurantsScreen> createState() => _RestaurantsScreenState();
}

class _RestaurantsScreenState extends State<RestaurantsScreen> {
  String _filter = 'All';
  String _deliveryAddress = 'Lekki Phase 1, Lagos';
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  static const _filters = ['All', 'Nigerian', 'Fast Food', 'Grills', 'Shawarma', 'Continental'];

  List<RestaurantData> get _filtered {
    final query = _searchQuery.toLowerCase();
    return kNigerianRestaurants.where((r) {
      final matchesCuisine = _filter == 'All' || r.cuisines.contains(_filter);
      if (!matchesCuisine) return false;
      if (query.isEmpty) return true;
      if (r.name.toLowerCase().contains(query)) return true;
      if (r.type.toLowerCase().contains(query)) return true;
      if (r.area.toLowerCase().contains(query)) return true;
      // search menu items too
      return r.menuCategories.any((cat) =>
          cat.items.any((item) => item.name.toLowerCase().contains(query)));
    }).toList();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
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

  @override
  Widget build(BuildContext context) {
    final results = _filtered;
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
                  // Header row
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
                          child: const Icon(Icons.chevron_left_rounded, size: 22),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Deliver to — tappable
                      Expanded(
                        child: GestureDetector(
                          onTap: _showDeliverySheet,
                          behavior: HitTestBehavior.opaque,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Delivering to',
                                  style: TextStyle(fontSize: 11, color: GodropColors.mute)),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_rounded,
                                      size: 13, color: GodropColors.orange),
                                  const SizedBox(width: 3),
                                  Flexible(
                                    child: Text(
                                      _deliveryAddress,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: GodropColors.ink),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const Icon(Icons.keyboard_arrow_down_rounded,
                                      size: 16, color: GodropColors.ink),
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
                    text: const TextSpan(
                      style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink,
                          height: 1.2),
                      children: [
                        TextSpan(text: 'What are '),
                        TextSpan(
                            text: 'you craving?',
                            style: TextStyle(color: GodropColors.orange)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Search
                  Container(
                    height: 46,
                    decoration: BoxDecoration(
                        color: GodropColors.background,
                        borderRadius: BorderRadius.circular(12)),
                    child: TextField(
                      controller: _searchCtrl,
                      onChanged: (v) => setState(() => _searchQuery = v),
                      style: const TextStyle(fontSize: 14, color: GodropColors.ink),
                      decoration: InputDecoration(
                        hintText: 'Search restaurants or food...',
                        hintStyle:
                            const TextStyle(color: GodropColors.mute, fontSize: 14),
                        prefixIcon: const Icon(Icons.search_rounded,
                            color: GodropColors.mute, size: 20),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.close_rounded,
                                    size: 18, color: GodropColors.mute),
                                onPressed: () {
                                  _searchCtrl.clear();
                                  setState(() => _searchQuery = '');
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
                  // Category filters
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _filters
                          .map((f) => Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: GestureDetector(
                                  onTap: () => setState(() => _filter = f),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 180),
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 8),
                                    decoration: BoxDecoration(
                                      color: _filter == f
                                          ? GodropColors.ink
                                          : GodropColors.background,
                                      borderRadius: BorderRadius.circular(20),
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
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _searchQuery.isNotEmpty
                            ? '${results.length} result${results.length == 1 ? '' : 's'}'
                            : (_filter == 'All'
                                ? 'Featured near you'
                                : '$_filter restaurants'),
                        style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: GodropColors.ink),
                      ),
                      if (_searchQuery.isEmpty)
                        const Text('See all',
                            style:
                                TextStyle(fontSize: 14, color: GodropColors.blue)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (results.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text('No restaurants found',
                            style: TextStyle(
                                fontSize: 15, color: GodropColors.mute)),
                      ),
                    )
                  else
                    ...results.map((r) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _RestaurantCard(
                            restaurant: r,
                            onTap: () => context.go(
                              '/food/restaurant',
                              extra: {'restaurant': r, 'deliveryAddress': _deliveryAddress},
                            ),
                          ),
                        )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Delivery address bottom sheet with Google Places autocomplete ────────────

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
  bool _loading = false;

  static const _popular = [
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
    'Festac Town, Lagos',
    'Ojodu Berger, Lagos',
    'Oshodi, Lagos',
  ];

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.currentAddress);
    _ctrl.addListener(_onChanged);
    Future.delayed(const Duration(milliseconds: 300),
        () { if (mounted) _focus.requestFocus(); });
  }

  void _onChanged() async {
    final q = _ctrl.text.trim();
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
    _ctrl.dispose();
    _focus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final showPopular = _ctrl.text.trim().length < 2;

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
            child: Text('Search your delivery address',
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
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Icon(
                  showPopular ? Icons.access_time_rounded : Icons.place_rounded,
                  size: 13,
                  color: GodropColors.mute,
                ),
                const SizedBox(width: 4),
                Text(
                  showPopular ? 'Popular areas in Lagos' : 'Suggestions',
                  style: const TextStyle(
                      fontSize: 12,
                      color: GodropColors.mute,
                      fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: showPopular
                ? _buildPopularList()
                : _buildSuggestionsList(),
          ),
          SizedBox(height: bottomInset + 16),
        ],
      ),
    );
  }

  Widget _buildPopularList() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      itemCount: _popular.length,
      separatorBuilder: (_, __) => const Divider(height: 1, indent: 44),
      itemBuilder: (_, i) => _AddressTile(
        icon: Icons.location_on_rounded,
        title: _popular[i],
        onTap: () {
          widget.onAddressSelected(_popular[i]);
          Navigator.pop(context);
        },
      ),
    );
  }

  Widget _buildSuggestionsList() {
    if (_suggestions.isEmpty && !_loading) {
      return const Center(
        child: Text('No results found',
            style: TextStyle(fontSize: 14, color: GodropColors.mute)),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      itemCount: _suggestions.length,
      separatorBuilder: (_, __) => const Divider(height: 1, indent: 44),
      itemBuilder: (_, i) {
        final pred = _suggestions[i];
        final label = pred.secondaryText.isNotEmpty
            ? '${pred.mainText}, ${pred.secondaryText}'
            : pred.mainText;
        return _AddressTile(
          icon: Icons.place_rounded,
          title: pred.mainText,
          subtitle: pred.secondaryText,
          onTap: () {
            widget.onAddressSelected(label);
            Navigator.pop(context);
          },
        );
      },
    );
  }
}

class _AddressTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  const _AddressTile(
      {required this.icon,
      required this.title,
      this.subtitle,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
            color: GodropColors.blue.withOpacity(0.08),
            borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: GodropColors.blue, size: 16),
      ),
      title: Text(title,
          style: const TextStyle(
              fontSize: 14,
              color: GodropColors.ink,
              fontWeight: FontWeight.w500)),
      subtitle: subtitle != null && subtitle!.isNotEmpty
          ? Text(subtitle!,
              style: const TextStyle(fontSize: 12, color: GodropColors.mute))
          : null,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      dense: true,
      onTap: onTap,
    );
  }
}

// ── Restaurant card ──────────────────────────────────────────────────────────

class _RestaurantCard extends StatelessWidget {
  final RestaurantData restaurant;
  final VoidCallback onTap;
  const _RestaurantCard({required this.restaurant, required this.onTap});

  String _fmt(int kobo) =>
      kobo == 0 ? 'Free' : '₦${(kobo / 100).toStringAsFixed(0)}';

  @override
  Widget build(BuildContext context) {
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
                Container(
                  height: 120,
                  decoration: BoxDecoration(
                    color: GodropColors.orange.withOpacity(0.08),
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(16)),
                  ),
                  child: Center(
                      child: Icon(Icons.restaurant_rounded,
                          size: 48,
                          color: GodropColors.orange.withOpacity(0.3))),
                ),
                if (restaurant.tag != null)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                          color: restaurant.tagColor,
                          borderRadius: BorderRadius.circular(6)),
                      child: Text(restaurant.tag!,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600)),
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
                        Text(restaurant.name,
                            style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink,
                                fontSize: 15)),
                        const SizedBox(height: 2),
                        Text('${restaurant.type} · ${restaurant.area}',
                            style: const TextStyle(
                                fontSize: 12, color: GodropColors.slate)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.local_shipping_outlined,
                                size: 12, color: GodropColors.mute),
                            const SizedBox(width: 3),
                            Text(
                              restaurant.deliveryFeeKobo == 0
                                  ? 'Free delivery'
                                  : 'Delivery: ${_fmt(restaurant.deliveryFeeKobo)}',
                              style: TextStyle(
                                fontSize: 11,
                                color: restaurant.deliveryFeeKobo == 0
                                    ? GodropColors.success
                                    : GodropColors.mute,
                                fontWeight: restaurant.deliveryFeeKobo == 0
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
                      Row(children: [
                        const Icon(Icons.star_rounded,
                            size: 14, color: GodropColors.orange),
                        const SizedBox(width: 2),
                        Text(restaurant.rating.toString(),
                            style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink)),
                      ]),
                      Text(restaurant.deliveryTime,
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
