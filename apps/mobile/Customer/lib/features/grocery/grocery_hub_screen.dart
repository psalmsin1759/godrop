import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../food/models/restaurant_data.dart';
import '../partners/bloc/partners_cubit.dart';
import '../partners/bloc/partners_state.dart';
import '../partners/models/partner_item.dart';

class GroceryHubScreen extends StatefulWidget {
  const GroceryHubScreen({super.key});

  @override
  State<GroceryHubScreen> createState() => _GroceryHubScreenState();
}

class _GroceryHubScreenState extends State<GroceryHubScreen> {
  late final PartnersCubit _cubit;

  static const _categories = [
    _GroceryCategory(emoji: '🍎', label: 'Fruits', color: Color(0xFFFFEEE8)),
    _GroceryCategory(emoji: '🥛', label: 'Dairy', color: Color(0xFFEEF4FF)),
    _GroceryCategory(emoji: '🥩', label: 'Meat', color: Color(0xFFFFEEEE)),
    _GroceryCategory(emoji: '🥤', label: 'Drinks', color: Color(0xFFEEF8EE)),
    _GroceryCategory(emoji: '🍿', label: 'Snacks', color: Color(0xFFFFF8EE)),
    _GroceryCategory(emoji: '🍞', label: 'Bakery', color: Color(0xFFFFF0E8)),
  ];

  @override
  void initState() {
    super.initState();
    _cubit = PartnersCubit(PartnerType.grocery)..load();
  }

  @override
  void dispose() {
    _cubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _cubit,
      child: Scaffold(
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
                            child:
                                const Icon(Icons.chevron_left_rounded, size: 22),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            color: GodropColors.ink,
                            height: 1.25),
                        children: [
                          TextSpan(text: 'Fresh to your door,\n'),
                          TextSpan(
                              text: 'in under 2 hours.',
                              style: TextStyle(color: GodropColors.blue)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    GestureDetector(
                      onTap: () => context.go('/grocery/stores'),
                      child: Container(
                        height: 46,
                        decoration: BoxDecoration(
                            color: GodropColors.background,
                            borderRadius: BorderRadius.circular(12)),
                        child: const Row(
                          children: [
                            SizedBox(width: 12),
                            Icon(Icons.search_rounded,
                                color: GodropColors.mute, size: 20),
                            SizedBox(width: 8),
                            Text('Search groceries...',
                                style: TextStyle(
                                    color: GodropColors.mute, fontSize: 14)),
                          ],
                        ),
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
                        const Text('Shop by category',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink)),
                        GestureDetector(
                          onTap: () => context.go('/grocery/stores'),
                          child: Text('See all',
                              style: TextStyle(
                                  fontSize: 14, color: GodropColors.blue)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        childAspectRatio: 1.3,
                      ),
                      itemCount: _categories.length,
                      itemBuilder: (_, i) =>
                          _GroceryCategoryCard(cat: _categories[i]),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Partner stores',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink)),
                        GestureDetector(
                          onTap: () => context.go('/grocery/stores'),
                          child: Text('See all',
                              style: TextStyle(
                                  fontSize: 14, color: GodropColors.blue)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    BlocBuilder<PartnersCubit, PartnersState>(
                      builder: (context, state) {
                        if (state.status == PartnersStatus.loading &&
                            state.items.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 24),
                            child: Center(
                              child: CircularProgressIndicator(
                                  color: GodropColors.blue, strokeWidth: 2),
                            ),
                          );
                        }
                        if (state.status == PartnersStatus.failure &&
                            state.items.isEmpty) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            child: Center(
                              child: Column(
                                children: [
                                  const Text('Could not load stores',
                                      style: TextStyle(
                                          fontSize: 14,
                                          color: GodropColors.slate)),
                                  TextButton(
                                    onPressed: () => _cubit.load(),
                                    child: const Text('Retry',
                                        style: TextStyle(
                                            color: GodropColors.blue)),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }
                        return Column(
                          children: state.items
                              .map((s) => Padding(
                                    padding: const EdgeInsets.only(bottom: 10),
                                    child: _StoreCard(
                                      store: s,
                                      onTap: () => context.go(
                                          '/partner/menu',
                                          extra: s),
                                    ),
                                  ))
                              .toList(),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GroceryCategory {
  final String emoji;
  final String label;
  final Color color;
  const _GroceryCategory(
      {required this.emoji, required this.label, required this.color});
}

class _GroceryCategoryCard extends StatelessWidget {
  final _GroceryCategory cat;
  const _GroceryCategoryCard({required this.cat});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          color: cat.color, borderRadius: BorderRadius.circular(14)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(cat.emoji, style: const TextStyle(fontSize: 28)),
          const SizedBox(height: 4),
          Text(cat.label,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink)),
        ],
      ),
    );
  }
}

class _StoreCard extends StatelessWidget {
  final PartnerItem store;
  final VoidCallback onTap;
  const _StoreCard({required this.store, required this.onTap});

  String _fmtFee(int kobo) =>
      kobo == 0 ? 'Free delivery' : '₦${(kobo / 100).toStringAsFixed(0)} fee';

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
            color: GodropColors.white,
            borderRadius: BorderRadius.circular(14)),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                  color: GodropColors.blue.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.store_rounded,
                  color: GodropColors.blue, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(store.name,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: GodropColors.ink,
                          fontSize: 14)),
                  Text(
                    store.deliveryTimeLabel,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.slate),
                  ),
                ],
              ),
            ),
            Text(
              store.deliveryFeeKobo != null
                  ? _fmtFee(store.deliveryFeeKobo!)
                  : '',
              style: const TextStyle(fontSize: 12, color: GodropColors.mute),
            ),
          ],
        ),
      ),
    );
  }
}
