import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/order_models.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../food/bloc/cart_cubit.dart';
import '../food/bloc/cart_state.dart';
import '../food/models/restaurant_data.dart';
import 'bloc/remote_orders_cubit.dart';
import 'bloc/remote_orders_state.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    context.read<RemoteOrdersCubit>().load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        backgroundColor: GodropColors.white,
        title: const Text('Orders'),
        bottom: TabBar(
          controller: _tabs,
          labelColor: GodropColors.blue,
          unselectedLabelColor: GodropColors.slate,
          indicatorColor: GodropColors.blue,
          tabs: [
            const Tab(text: 'Active'),
            const Tab(text: 'Completed'),
            Tab(
              child: BlocBuilder<CartCubit, CartState>(
                builder: (ctx, cs) {
                  final total = cs.activeCarts.fold(0, (s, c) => s + c.totalItems);
                  if (total == 0) return const Text('My Cart');
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('My Cart'),
                      const SizedBox(width: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: GodropColors.blue,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text('$total',
                            style: const TextStyle(
                                color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
      body: BlocBuilder<RemoteOrdersCubit, RemoteOrdersState>(
        builder: (ctx, remoteState) {
          Future<void> onRefresh() => ctx.read<RemoteOrdersCubit>().load();
          return TabBarView(
            controller: _tabs,
            children: [
              _RemoteOrdersList(
                orders: remoteState is RemoteOrdersLoaded ? remoteState.active : [],
                loading: remoteState is RemoteOrdersLoading,
                error: remoteState is RemoteOrdersError ? remoteState.message : null,
                emptyText: 'No active orders',
                onRetry: onRefresh,
                onRefresh: onRefresh,
                isActive: true,
              ),
              _RemoteOrdersList(
                orders: remoteState is RemoteOrdersLoaded ? remoteState.completed : [],
                loading: remoteState is RemoteOrdersLoading,
                error: remoteState is RemoteOrdersError ? remoteState.message : null,
                emptyText: 'No completed orders',
                onRetry: onRefresh,
                onRefresh: onRefresh,
              ),
              const _MyCartTab(),
            ],
          );
        },
      ),
    );
  }
}


class _RemoteOrdersList extends StatelessWidget {
  final List<Order> orders;
  final bool loading;
  final String? error;
  final String emptyText;
  final VoidCallback onRetry;
  final Future<void> Function()? onRefresh;
  final bool isActive;

  const _RemoteOrdersList({
    required this.orders,
    required this.loading,
    required this.error,
    required this.emptyText,
    required this.onRetry,
    this.onRefresh,
    this.isActive = false,
  });

  IconData _iconFor(String type) {
    switch (type) {
      case 'grocery': return Icons.shopping_basket_rounded;
      case 'retail': return Icons.storefront_rounded;
      case 'pharmacy': return Icons.medication_rounded;
      case 'truck': return Icons.local_shipping_rounded;
      case 'parcel': return Icons.inventory_2_rounded;
      default: return Icons.restaurant_rounded;
    }
  }

  Color _colorFor(String type) {
    switch (type) {
      case 'grocery': return const Color(0xFF0EA5E9);
      case 'retail': return const Color(0xFF8B5CF6);
      case 'pharmacy': return const Color(0xFF10B981);
      case 'truck': return GodropColors.orange;
      case 'parcel': return GodropColors.blue;
      default: return GodropColors.orange;
    }
  }

  String _labelFor(String type) {
    switch (type) {
      case 'grocery': return 'Grocery';
      case 'retail': return 'Retail';
      case 'pharmacy': return 'Pharmacy';
      case 'truck': return 'Truck';
      case 'parcel': return 'Parcel';
      default: return 'Food';
    }
  }

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final m = dt.minute.toString().padLeft(2, '0');
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      return '${months[dt.month - 1]} ${dt.day} · $h:$m $period';
    } catch (_) {
      return iso;
    }
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFE8E6E1),
      highlightColor: const Color(0xFFF5F4F2),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, __) => Container(
          height: 82,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
          ),
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(height: 12, width: 140, color: Colors.white),
                    const SizedBox(height: 8),
                    Container(height: 10, width: 90, color: Colors.white),
                  ],
                ),
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(height: 12, width: 60, color: Colors.white),
                  const SizedBox(height: 8),
                  Container(height: 10, width: 48, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10))),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return _buildShimmer();
    }
    if (error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, color: GodropColors.mute, size: 40),
            const SizedBox(height: 12),
            Text(error!, style: const TextStyle(fontSize: 14, color: GodropColors.mute)),
            const SizedBox(height: 16),
            TextButton(onPressed: onRetry, child: const Text('Retry', style: TextStyle(color: GodropColors.blue))),
          ],
        ),
      );
    }
    if (orders.isEmpty) {
      return onRefresh != null
          ? RefreshIndicator(
              onRefresh: onRefresh!,
              color: GodropColors.blue,
              child: ListView(
                children: [
                  SizedBox(
                    height: 300,
                    child: Center(
                      child: Text(emptyText, style: const TextStyle(color: GodropColors.mute)),
                    ),
                  ),
                ],
              ),
            )
          : Center(child: Text(emptyText, style: const TextStyle(color: GodropColors.mute)));
    }

    final list = ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: orders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final order = orders[i];
        final (statusLabel, statusColor) = _statusDisplay(order.status, isActive);
        return AnimatedEntrance(
          delay: Duration(milliseconds: i * 70),
          child: _OrderCard(
            id: '#${order.id.substring(0, 6).toUpperCase()}',
            type: _labelFor(order.type),
            icon: _iconFor(order.type),
            iconBg: _colorFor(order.type),
            route: order.type,
            date: _fmtDate(order.createdAt),
            amount: _fmtKobo(order.totalKobo),
            status: statusLabel,
            statusColor: statusColor,
            onTap: () => context.push('/orders/${order.id}'),
          ),
        );
      },
    );

    if (onRefresh != null) {
      return RefreshIndicator(
        onRefresh: onRefresh!,
        color: GodropColors.blue,
        child: list,
      );
    }
    return list;
  }

  (String, Color) _statusDisplay(String status, bool active) {
    if (!active) {
      final delivered = status == 'DELIVERED' || status == 'completed' || status == 'delivered';
      return delivered
          ? ('Delivered', GodropColors.success)
          : ('Cancelled', GodropColors.error);
    }
    return switch (status.toUpperCase()) {
      'PENDING'           => ('Pending',     GodropColors.slate),
      'ACCEPTED'          => ('Rider found', GodropColors.blue),
      'PREPARING'         => ('Preparing',   GodropColors.orange),
      'READY_FOR_PICKUP'  => ('Ready',       GodropColors.orange),
      'PICKED_UP'         => ('Picked up',   GodropColors.blue),
      'IN_TRANSIT'        => ('In transit',  GodropColors.blue),
      _                   => (status,        GodropColors.slate),
    };
  }
}

class _OrderCard extends StatelessWidget {
  final String id;
  final String type;
  final IconData icon;
  final Color iconBg;
  final String route;
  final String date;
  final String amount;
  final String status;
  final Color statusColor;
  final String? actionLabel;
  final String? confirmationCode;
  final String? foodSummary;
  final VoidCallback onTap;

  const _OrderCard({required this.id, required this.type, required this.icon, required this.iconBg, required this.route, required this.date, required this.amount, required this.status, required this.statusColor, this.actionLabel, this.confirmationCode, this.foodSummary, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
        child: Row(
          children: [
            Container(width: 40, height: 40, decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)), child: Icon(icon, color: Colors.white, size: 20)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Text(type, style: const TextStyle(fontWeight: FontWeight.w600, color: GodropColors.ink, fontSize: 14)),
                    const SizedBox(width: 6),
                    Text(id, style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                  ]),
                  Text(foodSummary ?? route, style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
                  Text(date, style: const TextStyle(fontSize: 11, color: GodropColors.mute)),
                  if (confirmationCode != null) ...[
                    const SizedBox(height: 3),
                    Row(children: [
                      const Icon(Icons.lock_rounded, size: 11, color: GodropColors.blue),
                      const SizedBox(width: 3),
                      Text('Code: $confirmationCode', style: const TextStyle(fontSize: 11, color: GodropColors.blue, fontWeight: FontWeight.w700)),
                    ]),
                  ],
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(amount, style: const TextStyle(fontWeight: FontWeight.w700, color: GodropColors.ink, fontSize: 14)),
                const SizedBox(height: 4),
                if (actionLabel != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: GodropColors.blue, borderRadius: BorderRadius.circular(20)),
                    child: Text(actionLabel!, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                    child: Text(status, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── My Cart Tab ───────────────────────────────────────────────────────────────

class _MyCartTab extends StatelessWidget {
  const _MyCartTab();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (ctx, state) {
        final carts = state.activeCarts;

        if (carts.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: GodropColors.background,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.shopping_bag_outlined, size: 34, color: GodropColors.mute),
                ),
                const SizedBox(height: 16),
                const Text('Your cart is empty',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                const SizedBox(height: 6),
                const Text('Add items from restaurants, grocery\nstores, pharmacies or retail shops.',
                    style: TextStyle(fontSize: 13, color: GodropColors.slate, height: 1.5),
                    textAlign: TextAlign.center),
              ],
            ),
          );
        }

        const typeOrder = [PartnerType.restaurant, PartnerType.grocery, PartnerType.retail, PartnerType.pharmacy];
        final grouped = <PartnerType, List<VendorCart>>{};
        for (final cart in carts) {
          (grouped[cart.partnerType] ??= []).add(cart);
        }

        final sections = typeOrder.where((t) => grouped.containsKey(t)).toList();
        final grandSubtotal = carts.fold(0, (s, c) => s + c.subtotalKobo);
        final grandItems = carts.fold(0, (s, c) => s + c.totalItems);

        int cardIndex = 0;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: [
            for (int si = 0; si < sections.length; si++) ...[
              if (si > 0) const SizedBox(height: 6),
              _TypeSectionHeader(type: sections[si]),
              const SizedBox(height: 8),
              for (final cart in grouped[sections[si]]!) ...[
                AnimatedEntrance(
                  delay: Duration(milliseconds: cardIndex++ * 60),
                  child: _VendorCartCard(cart: cart),
                ),
                const SizedBox(height: 10),
              ],
            ],
            if (carts.length > 1) ...[
              const SizedBox(height: 4),
              _GrandTotalCard(subtotalKobo: grandSubtotal, itemCount: grandItems),
            ],
          ],
        );
      },
    );
  }
}

// ── Type section header ───────────────────────────────────────────────────────

class _TypeSectionHeader extends StatelessWidget {
  final PartnerType type;
  const _TypeSectionHeader({required this.type});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: type.color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(type.icon, color: type.color, size: 15),
        ),
        const SizedBox(width: 8),
        Text(type.label,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: type.color, letterSpacing: 0.2)),
      ],
    );
  }
}

// ── Vendor cart card ──────────────────────────────────────────────────────────

class _VendorCartCard extends StatelessWidget {
  final VendorCart cart;
  const _VendorCartCard({required this.cart});

  static String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  void _confirmClear(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _ClearCartSheet(
        partnerName: cart.partnerName,
        onConfirm: () => context.read<CartCubit>().clearVendor(cart.partnerId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vendor header
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: cart.partnerType.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(cart.partnerType.icon, color: cart.partnerType.color, size: 19),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(cart.partnerName,
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink),
                          overflow: TextOverflow.ellipsis),
                      Text('${cart.totalItems} item${cart.totalItems == 1 ? '' : 's'}',
                          style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => _confirmClear(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: GodropColors.error.withOpacity(0.07),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Clear',
                        style: TextStyle(fontSize: 12, color: GodropColors.error, fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, indent: 14, endIndent: 14),

          // Items
          ...cart.items.asMap().entries.map((e) {
            final idx = e.key;
            final item = e.value;
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 28,
                        child: item.emoji.isNotEmpty
                            ? Text(item.emoji, style: const TextStyle(fontSize: 20))
                            : const Icon(Icons.fastfood_rounded, size: 20, color: GodropColors.mute),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.name,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: GodropColors.ink),
                                overflow: TextOverflow.ellipsis),
                            Text(_fmt(item.priceKobo),
                                style: const TextStyle(fontSize: 12, color: GodropColors.orange, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Qty controls
                      Row(
                        children: [
                          _MiniQtyBtn(
                            icon: item.quantity <= 1 ? Icons.delete_outline_rounded : Icons.remove_rounded,
                            isDelete: item.quantity <= 1,
                            onTap: () => context.read<CartCubit>().decrement(cart.partnerId, item.id),
                          ),
                          SizedBox(
                            width: 30,
                            child: Center(
                              child: Text('${item.quantity}',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                            ),
                          ),
                          _MiniQtyBtn(
                            icon: Icons.add_rounded,
                            onTap: () => context.read<CartCubit>().increment(cart.partnerId, item.id),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (idx < cart.items.length - 1)
                  const Divider(height: 1, indent: 50, endIndent: 14),
              ],
            );
          }),

          const Divider(height: 1, indent: 14, endIndent: 14),

          // Subtotal row + checkout button
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Subtotal', style: TextStyle(fontSize: 11, color: GodropColors.mute)),
                    Text(_fmt(cart.subtotalKobo),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: GodropColors.ink)),
                  ],
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => context.push('/food/cart', extra: {'partnerId': cart.partnerId}),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: GodropColors.blue,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Checkout', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 15),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Grand total bar (shown when 2+ vendors) ───────────────────────────────────

class _GrandTotalCard extends StatelessWidget {
  final int subtotalKobo;
  final int itemCount;
  const _GrandTotalCard({required this.subtotalKobo, required this.itemCount});

  static String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: GodropColors.blue.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: GodropColors.blue.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          const Icon(Icons.shopping_cart_rounded, size: 18, color: GodropColors.blue),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '$itemCount items across multiple stores',
              style: const TextStyle(fontSize: 13, color: GodropColors.slate),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text('Total', style: TextStyle(fontSize: 11, color: GodropColors.mute)),
              Text(_fmt(subtotalKobo),
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: GodropColors.ink)),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Mini qty button ───────────────────────────────────────────────────────────

class _MiniQtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool isDelete;
  const _MiniQtyBtn({required this.icon, required this.onTap, this.isDelete = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 26,
        height: 26,
        decoration: BoxDecoration(
          color: isDelete ? GodropColors.error.withOpacity(0.08) : GodropColors.background,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Icon(icon, size: 14, color: isDelete ? GodropColors.error : GodropColors.ink),
      ),
    );
  }
}

// ── Clear cart confirmation sheet ─────────────────────────────────────────────

class _ClearCartSheet extends StatelessWidget {
  final String partnerName;
  final VoidCallback onConfirm;
  const _ClearCartSheet({required this.partnerName, required this.onConfirm});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40, height: 4,
              decoration: BoxDecoration(color: GodropColors.border, borderRadius: BorderRadius.circular(2)),
            ),
            const SizedBox(height: 20),
            Container(
              width: 56, height: 56,
              decoration: BoxDecoration(
                color: GodropColors.error.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.delete_outline_rounded, size: 28, color: GodropColors.error),
            ),
            const SizedBox(height: 14),
            Text('Clear $partnerName?',
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: GodropColors.ink),
                textAlign: TextAlign.center),
            const SizedBox(height: 6),
            const Text('All items in this cart will be removed.',
                style: TextStyle(fontSize: 13, color: GodropColors.slate),
                textAlign: TextAlign.center),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      height: 46,
                      decoration: BoxDecoration(
                        color: GodropColors.background,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: const Text('Keep items',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                      onConfirm();
                    },
                    child: Container(
                      height: 46,
                      decoration: BoxDecoration(
                        color: GodropColors.error,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: const Text('Clear cart',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
