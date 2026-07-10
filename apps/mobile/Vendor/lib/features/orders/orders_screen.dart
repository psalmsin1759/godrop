import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/order_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/status_chip.dart';
import '../profile/bloc/session_cubit.dart';
import 'bloc/orders_cubit.dart';
import 'bloc/orders_state.dart';

const _kFilters = <(String?, String)>[
  (null, 'All'),
  ('PENDING', 'Pending'),
  ('ACCEPTED', 'Accepted'),
  ('PREPARING', 'Preparing'),
  ('READY_FOR_PICKUP', 'Ready'),
  ('IN_TRANSIT', 'In transit'),
  ('DELIVERED', 'Delivered'),
  ('CANCELLED', 'Cancelled'),
];

/// STAFF only work the live queue — no order history.
const _kStaffFilters = <(String?, String)>[
  ('PENDING', 'Pending'),
  ('ACCEPTED', 'Accepted'),
  ('PREPARING', 'Preparing'),
  ('READY_FOR_PICKUP', 'Ready'),
];

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    final cubit = context.read<OrdersCubit>();
    final staff = !context.read<SessionCubit>().isManagerOrAbove;
    if (cubit.state is OrdersInitial) {
      // STAFF land on the live queue instead of the full history.
      cubit.load(status: staff ? 'PENDING' : null);
    }
    _scrollCtrl.addListener(() {
      if (_scrollCtrl.position.pixels >
          _scrollCtrl.position.maxScrollExtent - 300) {
        cubit.loadMore();
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
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: const Text('Orders'),
        automaticallyImplyLeading: false,
        backgroundColor: GodropColors.background,
      ),
      body: Column(
        children: [
          SizedBox(
            height: 44,
            child: BlocBuilder<OrdersCubit, OrdersState>(
              builder: (ctx, state) {
                final selected = ctx.read<OrdersCubit>().statusFilter;
                final filters = ctx.watch<SessionCubit>().isManagerOrAbove
                    ? _kFilters
                    : _kStaffFilters;
                return ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: filters.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) {
                    final (value, label) = filters[i];
                    final isSelected = value == selected;
                    return GestureDetector(
                      onTap: () => ctx.read<OrdersCubit>().load(status: value),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? GodropColors.blue
                              : GodropColors.card,
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(
                              color: isSelected
                                  ? GodropColors.blue
                                  : GodropColors.border),
                        ),
                        child: Text(
                          label,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? GodropColors.white
                                : GodropColors.slate,
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: BlocBuilder<OrdersCubit, OrdersState>(
              builder: (ctx, state) {
                if (state is OrdersLoading || state is OrdersInitial) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (state is OrdersError) {
                  return EmptyState(
                    icon: Icons.cloud_off_rounded,
                    title: 'Could not load orders',
                    subtitle: state.message,
                    actionLabel: 'Retry',
                    onAction: () => ctx
                        .read<OrdersCubit>()
                        .load(status: ctx.read<OrdersCubit>().statusFilter),
                  );
                }
                final loaded = state as OrdersLoaded;
                if (loaded.orders.isEmpty) {
                  return EmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: 'No orders here yet',
                    subtitle: loaded.statusFilter == null
                        ? 'New orders will appear as customers place them.'
                        : 'No orders with this status right now.',
                  );
                }
                return RefreshIndicator(
                  onRefresh: () => ctx.read<OrdersCubit>().refresh(),
                  child: ListView.separated(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 96),
                    itemCount:
                        loaded.orders.length + (loaded.loadingMore ? 1 : 0),
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, i) {
                      if (i >= loaded.orders.length) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2)),
                          ),
                        );
                      }
                      return _OrderCard(order: loaded.orders[i]);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final VendorOrder order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/orders/${order.id}'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.circular(18),
          boxShadow: GodropColors.softShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text('#${order.trackingCode}',
                      style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink)),
                ),
                StatusChip(status: order.status),
              ],
            ),
            const SizedBox(height: 8),
            if (order.customer != null)
              Text(order.customer!.fullName,
                  style: const TextStyle(
                      fontSize: 13, color: GodropColors.slate)),
            const SizedBox(height: 4),
            Row(
              children: [
                Expanded(
                  child: Text(
                    '${order.itemCount} item${order.itemCount == 1 ? '' : 's'} · ${formatDateTime(order.createdAt)}',
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.mute),
                  ),
                ),
                Text(formatKobo(order.totalKobo),
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.orange)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
