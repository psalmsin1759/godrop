import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/analytics_models.dart';
import '../../shared/models/order_models.dart';
import '../../shared/services/user_prefs.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/section_header.dart';
import '../../shared/widgets/status_chip.dart';
import '../profile/bloc/session_cubit.dart';
import 'bloc/dashboard_cubit.dart';
import 'bloc/dashboard_state.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    final state = context.read<DashboardCubit>().state;
    if (state is DashboardInitial) {
      context.read<DashboardCubit>().load();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: SafeArea(
        bottom: false,
        child: BlocBuilder<DashboardCubit, DashboardState>(
          builder: (ctx, state) {
            if (state is DashboardLoading || state is DashboardInitial) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is DashboardError) {
              return EmptyState(
                icon: Icons.cloud_off_rounded,
                title: 'Could not load your dashboard',
                subtitle: state.message,
                actionLabel: 'Retry',
                onAction: () => ctx.read<DashboardCubit>().load(),
              );
            }
            final loaded = state as DashboardLoaded;
            return RefreshIndicator(
              onRefresh: () =>
                  ctx.read<DashboardCubit>().load(silent: true),
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 96),
                children: [
                  _Header(unread: loaded.unreadNotifications),
                  const SizedBox(height: 16),
                  AnimatedEntrance(child: _StoreToggleCard(loaded: loaded)),
                  const SizedBox(height: 16),
                  if (loaded.analytics != null) ...[
                    AnimatedEntrance(
                      delay: const Duration(milliseconds: 60),
                      child: _StatsGrid(summary: loaded.analytics!.summary),
                    ),
                    const SizedBox(height: 20),
                    if (loaded.graph != null &&
                        loaded.graph!.points.isNotEmpty) ...[
                      AnimatedEntrance(
                        delay: const Duration(milliseconds: 120),
                        child: _RevenueChartCard(points: loaded.graph!.points),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ],
                  const GodropSectionHeader(title: 'Pending orders'),
                  const SizedBox(height: 12),
                  if (loaded.pendingOrders.isEmpty)
                    const _NoPendingCard()
                  else
                    ...loaded.pendingOrders.map(
                      (o) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _PendingOrderCard(order: o),
                      ),
                    ),
                  if (loaded.pendingTotal > loaded.pendingOrders.length)
                    Center(
                      child: TextButton(
                        onPressed: () => context.go('/orders'),
                        child: Text(
                          'View all ${loaded.pendingTotal} pending orders',
                          style: const TextStyle(
                              color: GodropColors.blue,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  if (loaded.analytics != null &&
                      loaded.analytics!.topProducts.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    const GodropSectionHeader(title: 'Top products (30 days)'),
                    const SizedBox(height: 12),
                    AnimatedEntrance(
                      child: _TopProductsCard(
                          products: loaded.analytics!.topProducts),
                    ),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final int unread;
  const _Header({required this.unread});

  @override
  Widget build(BuildContext context) {
    final vendorName = UserPrefs.vendorName;
    final adminName = UserPrefs.adminName.split(' ').first;
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                adminName.isEmpty ? 'Welcome back' : 'Hi, $adminName 👋',
                style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink,
                    letterSpacing: -0.4),
              ),
              if (vendorName.isNotEmpty)
                Text(vendorName,
                    style: const TextStyle(
                        fontSize: 14, color: GodropColors.slate)),
            ],
          ),
        ),
        GestureDetector(
          onTap: () => context.push('/notifications'),
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: GodropColors.card,
              borderRadius: BorderRadius.circular(14),
              boxShadow: GodropColors.softShadow,
            ),
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                const Icon(Icons.notifications_none_rounded,
                    color: GodropColors.ink, size: 22),
                if (unread > 0)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 4, vertical: 1),
                      constraints: const BoxConstraints(minWidth: 16),
                      decoration: BoxDecoration(
                        color: GodropColors.orange,
                        borderRadius: BorderRadius.circular(10),
                        border:
                            Border.all(color: GodropColors.white, width: 1.5),
                      ),
                      child: Text(
                        unread > 99 ? '99+' : '$unread',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StoreToggleCard extends StatelessWidget {
  final DashboardLoaded loaded;
  const _StoreToggleCard({required this.loaded});

  @override
  Widget build(BuildContext context) {
    final open = loaded.storeOpen;
    final isOwner = context.watch<SessionCubit>().isOwner;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: open ? GodropColors.blueGradient : null,
        color: open ? null : GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: open
                  ? Colors.white.withValues(alpha: 0.15)
                  : GodropColors.error.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              open ? Icons.storefront_rounded : Icons.nightlight_round,
              color: open ? GodropColors.white : GodropColors.error,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  open ? 'Store is open' : 'Store is closed',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: open ? GodropColors.white : GodropColors.ink,
                  ),
                ),
                Text(
                  open
                      ? 'Customers can place orders'
                      : isOwner
                          ? 'Flip the switch to start receiving orders'
                          : 'Only the owner can reopen the store',
                  style: TextStyle(
                    fontSize: 12,
                    color: open
                        ? Colors.white.withValues(alpha: 0.75)
                        : GodropColors.slate,
                  ),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: open,
            activeTrackColor:
                open ? Colors.white.withValues(alpha: 0.35) : null,
            thumbColor: open
                ? const WidgetStatePropertyAll(GodropColors.white)
                : null,
            onChanged: isOwner
                ? (v) async {
                    final err = await context
                        .read<DashboardCubit>()
                        .toggleStoreOpen(v);
                    if (err != null && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(err)),
                      );
                    }
                  }
                : null,
          ),
        ],
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  final AnalyticsSummary summary;
  const _StatsGrid({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(children: [
          Expanded(
            child: _StatCard(
              label: 'Revenue (30d)',
              value: formatKobo(summary.totalRevenueKobo, decimals: 0),
              icon: Icons.payments_outlined,
              color: GodropColors.orange,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              label: 'Orders (30d)',
              value: '${summary.totalOrders}',
              icon: Icons.receipt_long_outlined,
              color: GodropColors.blue,
            ),
          ),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: _StatCard(
              label: 'Completed',
              value: '${summary.completedOrders}',
              icon: Icons.check_circle_outline_rounded,
              color: GodropColors.success,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              label: 'Avg order',
              value: formatKobo(summary.avgOrderValueKobo, decimals: 0),
              icon: Icons.stacked_line_chart_rounded,
              color: const Color(0xFF8B5CF6),
            ),
          ),
        ]),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(18),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(11),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(height: 10),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value,
                style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink,
                    letterSpacing: -0.4)),
          ),
          const SizedBox(height: 2),
          Text(label,
              style:
                  const TextStyle(fontSize: 12, color: GodropColors.mute)),
        ],
      ),
    );
  }
}

/// Lightweight revenue bar chart — avoids a chart dependency for one view.
class _RevenueChartCard extends StatelessWidget {
  final List<RevenuePoint> points;
  const _RevenueChartCard({required this.points});

  @override
  Widget build(BuildContext context) {
    final shown = points.length > 14
        ? points.sublist(points.length - 14)
        : points;
    final maxRevenue = shown.fold<int>(
        0, (m, p) => p.revenueKobo > m ? p.revenueKobo : m);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Revenue trend',
              style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink)),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: shown.map((p) {
                final frac = maxRevenue == 0
                    ? 0.0
                    : p.revenueKobo / maxRevenue;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: Tooltip(
                      message:
                          '${p.date}\n${formatKobo(p.revenueKobo)} · ${p.orders} orders',
                      child: Container(
                        height: 8 + 104 * frac,
                        decoration: BoxDecoration(
                          gradient: frac > 0 ? GodropColors.blueGradient : null,
                          color: frac > 0 ? null : GodropColors.divider,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(_shortDate(shown.first.date),
                  style: const TextStyle(
                      fontSize: 11, color: GodropColors.mute)),
              Text(_shortDate(shown.last.date),
                  style: const TextStyle(
                      fontSize: 11, color: GodropColors.mute)),
            ],
          ),
        ],
      ),
    );
  }

  String _shortDate(String iso) {
    final dt = DateTime.tryParse(iso);
    if (dt == null) return iso;
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${dt.day} ${months[dt.month - 1]}';
  }
}

class _NoPendingCard extends StatelessWidget {
  const _NoPendingCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(18),
        boxShadow: GodropColors.softShadow,
      ),
      child: const Row(
        children: [
          Icon(Icons.check_circle_outline_rounded,
              color: GodropColors.success, size: 22),
          SizedBox(width: 12),
          Expanded(
            child: Text('All caught up — no orders waiting on you.',
                style: TextStyle(fontSize: 14, color: GodropColors.slate)),
          ),
        ],
      ),
    );
  }
}

class _PendingOrderCard extends StatelessWidget {
  final VendorOrder order;
  const _PendingOrderCard({required this.order});

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
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('#${order.trackingCode}',
                      style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink)),
                  const SizedBox(height: 3),
                  Text(
                    '${order.itemCount} item${order.itemCount == 1 ? '' : 's'} · ${timeAgo(order.createdAt)}',
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.mute),
                  ),
                ],
              ),
            ),
            Text(formatKobo(order.totalKobo),
                style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.orange)),
            const SizedBox(width: 10),
            const StatusChip(status: 'PENDING'),
          ],
        ),
      ),
    );
  }
}

class _TopProductsCard extends StatelessWidget {
  final List<TopProduct> products;
  const _TopProductsCard({required this.products});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          for (var i = 0; i < products.length && i < 5; i++) ...[
            if (i > 0) const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: GodropColors.blue.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: Center(
                      child: Text('${i + 1}',
                          style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.blue)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(products[i].name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink)),
                        Text('${products[i].orders} orders',
                            style: const TextStyle(
                                fontSize: 12, color: GodropColors.mute)),
                      ],
                    ),
                  ),
                  Text(formatKobo(products[i].revenueKobo, decimals: 0),
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.orange)),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
