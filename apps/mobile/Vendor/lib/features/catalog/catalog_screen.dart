import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/catalog_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/skeleton.dart';
import 'bloc/categories_cubit.dart';
import 'bloc/categories_state.dart';
import 'bloc/products_cubit.dart';
import 'bloc/products_state.dart';

/// The Menu tab — products and categories in two sub-tabs.
class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 2, vsync: this);

  @override
  void initState() {
    super.initState();
    final products = context.read<ProductsCubit>();
    if (products.state is ProductsInitial) products.load();
    final categories = context.read<CategoriesCubit>();
    if (categories.state is CategoriesInitial) categories.load();
    _tabs.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  void _onAddPressed() {
    if (_tabs.index == 1) {
      context.push('/catalog/category/new');
      return;
    }
    // Products need a category — steer the vendor there before the form.
    final catState = context.read<CategoriesCubit>().state;
    if (catState is CategoriesLoaded && catState.categories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text(
            'Add a category first — every product belongs to one.'),
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'Add category',
          onPressed: () {
            _tabs.animateTo(1);
            context.push('/catalog/category/new');
          },
        ),
      ));
      return;
    }
    context.push('/catalog/product/new');
  }

  void _showProductsInCategory(ProductCategory category) {
    context.read<ProductsCubit>().load(categoryId: category.id);
    _tabs.animateTo(0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: const Text('Menu'),
        automaticallyImplyLeading: false,
        backgroundColor: GodropColors.background,
        bottom: TabBar(
          controller: _tabs,
          labelColor: GodropColors.blue,
          unselectedLabelColor: GodropColors.mute,
          indicatorColor: GodropColors.blue,
          labelStyle:
              const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          tabs: const [Tab(text: 'Products'), Tab(text: 'Categories')],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'catalog_fab',
        backgroundColor: GodropColors.blue,
        foregroundColor: GodropColors.white,
        icon: const Icon(Icons.add_rounded),
        label: Text(_tabs.index == 0 ? 'Product' : 'Category'),
        onPressed: _onAddPressed,
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          const _ProductsTab(),
          _CategoriesTab(onViewProducts: _showProductsInCategory),
        ],
      ),
    );
  }
}

// ── Products tab ─────────────────────────────────────────────────────────────

class _ProductsTab extends StatefulWidget {
  const _ProductsTab();

  @override
  State<_ProductsTab> createState() => _ProductsTabState();
}

class _ProductsTabState extends State<_ProductsTab>
    with AutomaticKeepAliveClientMixin {
  final _scrollCtrl = ScrollController();

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(() {
      if (_scrollCtrl.position.pixels >
          _scrollCtrl.position.maxScrollExtent - 300) {
        context.read<ProductsCubit>().loadMore();
      }
    });
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Column(
      children: [
        const SizedBox(height: 10),
        SizedBox(
          height: 40,
          child: BlocBuilder<CategoriesCubit, CategoriesState>(
            builder: (ctx, catState) {
              final cats = catState is CategoriesLoaded
                  ? catState.categories
                  : <ProductCategory>[];
              // Also rebuild on product loads so the selected chip follows
              // the active filter (it can change from the Categories tab too).
              return BlocBuilder<ProductsCubit, ProductsState>(
                builder: (ctx, _) {
                  final selected = ctx.read<ProductsCubit>().categoryFilter;
                  return ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      _FilterChip(
                        label: 'All',
                        selected: selected == null,
                        onTap: () => ctx.read<ProductsCubit>().load(),
                      ),
                      for (final c in cats) ...[
                        const SizedBox(width: 8),
                        _FilterChip(
                          label: c.name,
                          selected: selected == c.id,
                          onTap: () =>
                              ctx.read<ProductsCubit>().load(categoryId: c.id),
                        ),
                      ],
                    ],
                  );
                },
              );
            },
          ),
        ),
        const SizedBox(height: 4),
        Expanded(
          child: BlocBuilder<ProductsCubit, ProductsState>(
            builder: (ctx, state) {
              if (state is ProductsLoading || state is ProductsInitial) {
                return const ListSkeleton(
                    padding: EdgeInsets.fromLTRB(20, 8, 20, 120));
              }
              if (state is ProductsError) {
                return EmptyState(
                  icon: Icons.cloud_off_rounded,
                  title: 'Could not load products',
                  subtitle: state.message,
                  actionLabel: 'Retry',
                  onAction: () => ctx.read<ProductsCubit>().load(),
                );
              }
              final loaded = state as ProductsLoaded;
              if (loaded.products.isEmpty) {
                if (loaded.categoryFilter != null) {
                  return EmptyState(
                    icon: Icons.restaurant_menu_rounded,
                    title: 'No products in this category',
                    subtitle:
                        'Add one, or pick another category above.',
                    actionLabel: 'Show all products',
                    onAction: () => ctx.read<ProductsCubit>().load(),
                  );
                }
                return const EmptyState(
                  icon: Icons.restaurant_menu_rounded,
                  title: 'No products yet',
                  subtitle:
                      'Add your first product so customers can start ordering.',
                );
              }
              return RefreshIndicator(
                onRefresh: () => ctx
                    .read<ProductsCubit>()
                    .load(categoryId: loaded.categoryFilter, silent: true),
                child: ListView.separated(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
                  itemCount:
                      loaded.products.length + (loaded.loadingMore ? 1 : 0),
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) {
                    if (i >= loaded.products.length) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.all(12),
                          child: SizedBox(
                              width: 22,
                              height: 22,
                              child:
                                  CircularProgressIndicator(strokeWidth: 2)),
                        ),
                      );
                    }
                    return _ProductCard(product: loaded.products[i]);
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _FilterChip(
      {required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
        decoration: BoxDecoration(
          color: selected ? GodropColors.blue : GodropColors.card,
          borderRadius: BorderRadius.circular(100),
          border: Border.all(
              color: selected ? GodropColors.blue : GodropColors.border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: selected ? GodropColors.white : GodropColors.slate,
          ),
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final off = !product.isAvailable;
    return GestureDetector(
      onTap: () =>
          context.push('/catalog/product/${product.id}', extra: product),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: off ? GodropColors.divider : GodropColors.card,
          borderRadius: BorderRadius.circular(18),
          boxShadow: off ? null : GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Opacity(
              opacity: off ? 0.5 : 1,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: product.imageUrl != null
                    ? Image.network(
                        product.imageUrl!,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const _ImageFallback(),
                      )
                    : const _ImageFallback(),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: off ? GodropColors.mute : GodropColors.ink)),
                  const SizedBox(height: 2),
                  Text(
                    off ? 'Unavailable' : product.category?.name ?? '',
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.mute),
                  ),
                  const SizedBox(height: 2),
                  Text(formatKobo(product.priceKobo),
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: off
                              ? GodropColors.mute
                              : GodropColors.orange)),
                ],
              ),
            ),
            Switch.adaptive(
              value: product.isAvailable,
              activeTrackColor: GodropColors.success,
              onChanged: (v) async {
                final err = await context
                    .read<ProductsCubit>()
                    .toggleAvailability(product.id, v);
                if (err != null && context.mounted) {
                  ScaffoldMessenger.of(context)
                      .showSnackBar(SnackBar(content: Text(err)));
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _ImageFallback extends StatelessWidget {
  const _ImageFallback();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 56,
      color: GodropColors.blue.withValues(alpha: 0.06),
      child: const Icon(Icons.fastfood_outlined,
          color: GodropColors.mute, size: 22),
    );
  }
}

// ── Categories tab ───────────────────────────────────────────────────────────

class _CategoriesTab extends StatelessWidget {
  final ValueChanged<ProductCategory> onViewProducts;
  const _CategoriesTab({required this.onViewProducts});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CategoriesCubit, CategoriesState>(
      builder: (ctx, state) {
        if (state is CategoriesLoading || state is CategoriesInitial) {
          return const ListSkeleton();
        }
        if (state is CategoriesError) {
          return EmptyState(
            icon: Icons.cloud_off_rounded,
            title: 'Could not load categories',
            subtitle: state.message,
            actionLabel: 'Retry',
            onAction: () => ctx.read<CategoriesCubit>().load(),
          );
        }
        final categories = (state as CategoriesLoaded).categories;
        if (categories.isEmpty) {
          return const EmptyState(
            icon: Icons.category_outlined,
            title: 'No categories yet',
            subtitle:
                'Group your menu into categories like Mains, Drinks, or Sides.',
          );
        }
        return RefreshIndicator(
          onRefresh: () => ctx.read<CategoriesCubit>().load(silent: true),
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) => _CategoryCard(
                category: categories[i], onViewProducts: onViewProducts),
          ),
        );
      },
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final ProductCategory category;
  final ValueChanged<ProductCategory> onViewProducts;
  const _CategoryCard(
      {required this.category, required this.onViewProducts});

  @override
  Widget build(BuildContext context) {
    final off = !category.isActive;
    return GestureDetector(
      onTap: () => context.push('/catalog/category/${category.id}',
          extra: category),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: off ? GodropColors.divider : GodropColors.card,
          borderRadius: BorderRadius.circular(18),
          boxShadow: off ? null : GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(category.name,
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: off ? GodropColors.mute : GodropColors.ink)),
                  const SizedBox(height: 2),
                  GestureDetector(
                    onTap: () => onViewProducts(category),
                    behavior: HitTestBehavior.opaque,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${category.productCount} product${category.productCount == 1 ? '' : 's'}${off ? ' • Hidden' : ''}',
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: off
                                  ? GodropColors.mute
                                  : GodropColors.blue),
                        ),
                        Icon(Icons.chevron_right_rounded,
                            size: 16,
                            color:
                                off ? GodropColors.mute : GodropColors.blue),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Switch.adaptive(
              value: category.isActive,
              activeTrackColor: GodropColors.success,
              onChanged: (v) async {
                final err = await context
                    .read<CategoriesCubit>()
                    .toggleActive(category.id, v);
                if (err != null && context.mounted) {
                  ScaffoldMessenger.of(context)
                      .showSnackBar(SnackBar(content: Text(err)));
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
