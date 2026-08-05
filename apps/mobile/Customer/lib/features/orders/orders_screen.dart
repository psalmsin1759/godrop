import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/order_models.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/remote_orders_cubit.dart';
import 'bloc/remote_orders_state.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  final _activeScroll = ScrollController();
  final _historyScroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    context.read<RemoteOrdersCubit>().load();
    _activeScroll.addListener(() {
      if (_activeScroll.position.pixels >
          _activeScroll.position.maxScrollExtent - 300) {
        context.read<RemoteOrdersCubit>().loadMoreActive();
      }
    });
    _historyScroll.addListener(() {
      if (_historyScroll.position.pixels >
          _historyScroll.position.maxScrollExtent - 300) {
        context.read<RemoteOrdersCubit>().loadMoreHistory();
      }
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    _activeScroll.dispose();
    _historyScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Column(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: GodropColors.blueGradient,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
            ),
            padding: EdgeInsets.fromLTRB(20, topPad + 16, 20, 16),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.14),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.receipt_long_rounded,
                          color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text('My Orders',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: TabBar(
                    controller: _tabs,
                    indicator: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(11),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    splashBorderRadius: BorderRadius.circular(11),
                    labelColor: GodropColors.blue,
                    unselectedLabelColor: Colors.white,
                    labelStyle: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600),
                    unselectedLabelStyle: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600),
                    tabs: const [
                      Tab(text: 'Active'),
                      Tab(text: 'Completed'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: BlocBuilder<RemoteOrdersCubit, RemoteOrdersState>(
              builder: (ctx, remoteState) {
                Future<void> onRefresh() =>
                    ctx.read<RemoteOrdersCubit>().load();
                return TabBarView(
                  controller: _tabs,
                  children: [
                    _RemoteOrdersList(
                      orders: remoteState is RemoteOrdersLoaded
                          ? remoteState.active.items
                          : [],
                      loading: remoteState is RemoteOrdersLoading,
                      error: remoteState is RemoteOrdersError
                          ? remoteState.message
                          : null,
                      loadingMore: remoteState is RemoteOrdersLoaded
                          ? remoteState.active.loadingMore
                          : false,
                      scrollController: _activeScroll,
                      emptyIcon: Icons.local_shipping_outlined,
                      emptyText: 'No active orders',
                      emptySubtitle:
                          'Orders you place will show up here so you can track them live.',
                      onRetry: onRefresh,
                      onRefresh: onRefresh,
                      isActive: true,
                    ),
                    _RemoteOrdersList(
                      orders: remoteState is RemoteOrdersLoaded
                          ? remoteState.history.items
                          : [],
                      loading: remoteState is RemoteOrdersLoading,
                      error: remoteState is RemoteOrdersError
                          ? remoteState.message
                          : null,
                      loadingMore: remoteState is RemoteOrdersLoaded
                          ? remoteState.history.loadingMore
                          : false,
                      scrollController: _historyScroll,
                      emptyIcon: Icons.receipt_long_rounded,
                      emptyText: 'No completed orders yet',
                      emptySubtitle:
                          'Your delivered and cancelled orders will appear here.',
                      onRetry: onRefresh,
                      onRefresh: onRefresh,
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _RemoteOrdersList extends StatelessWidget {
  final List<Order> orders;
  final bool loading;
  final String? error;
  final IconData emptyIcon;
  final String emptyText;
  final String emptySubtitle;
  final VoidCallback onRetry;
  final Future<void> Function()? onRefresh;
  final bool isActive;
  final bool loadingMore;
  final ScrollController? scrollController;

  const _RemoteOrdersList({
    required this.orders,
    required this.loading,
    required this.error,
    this.emptyIcon = Icons.inbox_rounded,
    required this.emptyText,
    this.emptySubtitle = '',
    required this.onRetry,
    this.onRefresh,
    this.isActive = false,
    this.loadingMore = false,
    this.scrollController,
  });

  IconData _iconFor(String type) {
    switch (type.toLowerCase()) {
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

  Color _colorFor(String type) {
    switch (type.toLowerCase()) {
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

  String _labelFor(String type) {
    switch (type.toLowerCase()) {
      case 'grocery':
        return 'Grocery';
      case 'retail':
        return 'Retail';
      case 'pharmacy':
        return 'Pharmacy';
      case 'truck':
        return 'Truck';
      case 'parcel':
        return 'Parcel';
      default:
        return 'Food';
    }
  }

  String _subtitleFor(Order order) {
    final type = order.type.toLowerCase();
    if (type == 'parcel' && order.isMultiParcel) {
      final pickup = order.pickupAddress?.split(',').first.trim();
      return '${pickup ?? 'Pickup'} → ${order.dropoffs!.length} drop-offs';
    }
    if (type == 'parcel' || type == 'truck') {
      final pickup = order.pickupAddress?.split(',').first.trim();
      final dropoff = order.dropoffAddress?.split(',').first.trim();
      if (pickup != null &&
          pickup.isNotEmpty &&
          dropoff != null &&
          dropoff.isNotEmpty) {
        return '$pickup → $dropoff';
      }
    }
    return _labelFor(order.type);
  }

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
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
                width: 44,
                height: 44,
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
                  Container(
                      height: 10,
                      width: 48,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10))),
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
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: GodropColors.error.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.error_outline_rounded,
                    color: GodropColors.error, size: 32),
              ),
              const SizedBox(height: 16),
              Text(error!,
                  textAlign: TextAlign.center,
                  style:
                      const TextStyle(fontSize: 14, color: GodropColors.slate)),
              const SizedBox(height: 20),
              GodropButton(label: 'Retry', onTap: onRetry, fullWidth: false),
            ],
          ),
        ),
      );
    }
    if (orders.isEmpty) {
      final empty = Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: GodropColors.blue.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: Icon(emptyIcon, color: GodropColors.blue, size: 38),
              ),
              const SizedBox(height: 18),
              Text(emptyText,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink)),
              if (emptySubtitle.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(emptySubtitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        fontSize: 13, color: GodropColors.mute)),
              ],
            ],
          ),
        ),
      );
      return onRefresh != null
          ? RefreshIndicator(
              onRefresh: onRefresh!,
              color: GodropColors.blue,
              child: ListView(
                children: [
                  SizedBox(height: 320, child: empty),
                ],
              ),
            )
          : empty;
    }

    final list = ListView.separated(
      controller: scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: orders.length + (loadingMore ? 1 : 0),
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        if (i >= orders.length) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Center(
              child: SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: GodropColors.blue),
              ),
            ),
          );
        }
        final order = orders[i];
        final (statusLabel, statusColor) =
            _statusDisplay(order.status, isActive);
        return AnimatedEntrance(
          delay: Duration(milliseconds: i * 70),
          child: _OrderCard(
            id: '#${order.trackingCode ?? order.id.substring(0, 6).toUpperCase()}',
            type: _labelFor(order.type),
            icon: _iconFor(order.type),
            iconBg: _colorFor(order.type),
            route: _subtitleFor(order),
            date: _fmtDate(order.createdAt),
            amount: _fmtKobo(order.totalKobo),
            status: statusLabel,
            statusColor: statusColor,
            badge: order.isMultiParcel ? '×${order.dropoffs!.length} parcels' : null,
            confirmationCode: !order.isMultiParcel &&
                    order.confirmationCode != null &&
                    order.confirmationCode!.isNotEmpty
                ? order.confirmationCode
                : null,
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
      final delivered = status == 'DELIVERED' ||
          status == 'completed' ||
          status == 'delivered';
      return delivered
          ? ('Delivered', GodropColors.success)
          : ('Cancelled', GodropColors.error);
    }
    return switch (status.toUpperCase()) {
      'PENDING' => ('Pending', GodropColors.slate),
      'ACCEPTED' => ('Rider found', GodropColors.blue),
      'PREPARING' => ('Preparing', GodropColors.orange),
      'READY_FOR_PICKUP' => ('Ready', GodropColors.orange),
      'PICKED_UP' => ('Picked up', GodropColors.blue),
      'IN_TRANSIT' => ('In transit', GodropColors.blue),
      _ => (status, GodropColors.slate),
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
  final String? badge;
  final VoidCallback onTap;

  const _OrderCard(
      {required this.id,
      required this.type,
      required this.icon,
      required this.iconBg,
      required this.route,
      required this.date,
      required this.amount,
      required this.status,
      required this.statusColor,
      this.actionLabel,
      this.confirmationCode,
      this.foodSummary,
      this.badge,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                    color: iconBg, borderRadius: BorderRadius.circular(12)),
                child: Icon(icon, color: Colors.white, size: 20)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Flexible(
                      child: Text(type,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              color: GodropColors.ink,
                              fontSize: 14)),
                    ),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(id,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontSize: 12, color: GodropColors.mute)),
                    ),
                    if (badge != null) ...[
                      const SizedBox(width: 6),
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE7EEFF),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(badge!,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: GodropColors.blue)),
                        ),
                      ),
                    ],
                  ]),
                  Text(foodSummary ?? route,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 12, color: GodropColors.slate)),
                  Text(date,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 11, color: GodropColors.mute)),
                  if (confirmationCode != null) ...[
                    const SizedBox(height: 3),
                    Row(children: [
                      const Icon(Icons.lock_rounded,
                          size: 11, color: GodropColors.blue),
                      const SizedBox(width: 3),
                      Flexible(
                        child: Text('Code: $confirmationCode',
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                fontSize: 11,
                                color: GodropColors.blue,
                                fontWeight: FontWeight.w700)),
                      ),
                    ]),
                  ],
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(amount,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink,
                        fontSize: 14)),
                const SizedBox(height: 4),
                if (actionLabel != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                        color: GodropColors.blue,
                        borderRadius: BorderRadius.circular(20)),
                    child: Text(actionLabel!,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600)),
                  )
                else
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20)),
                    child: Text(status,
                        style: TextStyle(
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w600)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
