import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/rider_header.dart';
import 'bloc/analytics_cubit.dart';
import 'bloc/analytics_state.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  int _days = 30;

  @override
  void initState() {
    super.initState();
    context.read<AnalyticsCubit>().load(days: _days);
  }

  void _changeRange(int days) {
    if (days == _days) return;
    setState(() => _days = days);
    context.read<AnalyticsCubit>().load(days: days);
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            RiderHeader(
              icon: Icons.bar_chart_rounded,
              title: 'Analytics',
              subtitle: 'Your performance at a glance',
              trailing: RiderHeaderAction(
                icon: Icons.refresh_rounded,
                onTap: () => context.read<AnalyticsCubit>().load(days: _days),
              ),
            ),
            Expanded(
              child: BlocBuilder<AnalyticsCubit, AnalyticsState>(
                builder: (ctx, state) {
                  if (state is AnalyticsLoading || state is AnalyticsInitial) {
                    return _shimmer();
                  }
                  if (state is AnalyticsError) {
                    return _refreshable(_error(ctx, state.message));
                  }
                  if (state is AnalyticsLoaded) {
                    return _refreshable(_content(state));
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _refreshable(Widget child) {
    return RefreshIndicator(
      onRefresh: () => context.read<AnalyticsCubit>().load(days: _days),
      color: GodropColors.blue,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [child],
      ),
    );
  }

  Widget _content(AnalyticsLoaded state) {
    final a = state.analytics;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _rangeSelector(),
        const SizedBox(height: 16),
        _summaryRow(a),
        const SizedBox(height: 20),
        _sectionLabel('Earnings over time'),
        const SizedBox(height: 12),
        _earningsChartCard(a),
        const SizedBox(height: 20),
        _sectionLabel('Deliveries by type'),
        const SizedBox(height: 12),
        _typeBreakdownCard(a),
      ],
    );
  }

  Widget _rangeSelector() {
    const options = [7, 30, 90];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
      ),
      child: Row(
        children: options.map((d) {
          final selected = d == _days;
          return Expanded(
            child: GestureDetector(
              onTap: () => _changeRange(d),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  gradient: selected ? GodropColors.blueGradient : null,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    '$d days',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color:
                          selected ? GodropColors.white : GodropColors.slate,
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _summaryRow(RiderAnalytics a) {
    return Row(
      children: [
        Expanded(
          child: _statCard(
            icon: Icons.star_rounded,
            color: GodropColors.orange,
            value: a.ratingCount > 0 ? a.rating.toStringAsFixed(1) : '—',
            label:
                a.ratingCount > 0 ? '${a.ratingCount} ratings' : 'No ratings',
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _statCard(
            icon: Icons.local_shipping_rounded,
            color: GodropColors.blue,
            value: '${a.deliveredCount}',
            label: 'Deliveries',
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _statCard(
            icon: Icons.account_balance_wallet_rounded,
            color: GodropColors.success,
            value: formatNaira(a.periodEarnings, decimals: 0),
            label: 'Earned',
          ),
        ),
      ],
    );
  }

  Widget _statCard({
    required IconData icon,
    required Color color,
    required String value,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 8),
          Text(value,
              style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(label,
              style: const TextStyle(fontSize: 11, color: GodropColors.mute),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _sectionLabel(String label) {
    return Row(
      children: [
        Container(
          width: 3,
          height: 16,
          decoration: BoxDecoration(
            color: GodropColors.blue,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: GodropColors.slate,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }

  Widget _earningsChartCard(RiderAnalytics a) {
    final hasData = a.dailyEarnings.any((d) => d.earnings > 0);
    if (!hasData) {
      return _emptyCard(
        icon: Icons.show_chart_rounded,
        title: 'No earnings yet',
        subtitle: 'Complete deliveries to see your trend here',
      );
    }
    final maxY = a.dailyEarnings.fold<double>(
        0, (m, d) => d.earnings > m ? d.earnings : m);
    final gridInterval = maxY <= 0 ? 1.0 : maxY / 4;
    final labelEvery = (a.dailyEarnings.length / 5).ceil().clamp(1, 1000);

    return Container(
      padding: const EdgeInsets.fromLTRB(8, 20, 16, 12),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      height: 220,
      child: LineChart(
        LineChartData(
          minY: 0,
          maxY: maxY <= 0 ? 10 : maxY * 1.2,
          gridData: FlGridData(
            drawVerticalLine: false,
            horizontalInterval: gridInterval == 0 ? 1 : gridInterval,
            getDrawingHorizontalLine: (_) =>
                FlLine(color: GodropColors.border, strokeWidth: 1),
          ),
          borderData: FlBorderData(show: false),
          titlesData: FlTitlesData(
            topTitles:
                const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles:
                const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 40,
                interval: gridInterval == 0 ? 1 : gridInterval,
                getTitlesWidget: (value, meta) => Text(
                  value >= 1000
                      ? '${(value / 1000).toStringAsFixed(1)}k'
                      : value.toStringAsFixed(0),
                  style:
                      const TextStyle(fontSize: 10, color: GodropColors.mute),
                ),
              ),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 24,
                interval: labelEvery.toDouble(),
                getTitlesWidget: (value, meta) {
                  final i = value.toInt();
                  if (i < 0 || i >= a.dailyEarnings.length) {
                    return const SizedBox.shrink();
                  }
                  final date = a.dailyEarnings[i].date;
                  final parts = date.split('-');
                  final label =
                      parts.length == 3 ? '${parts[2]}/${parts[1]}' : date;
                  return Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(label,
                        style: const TextStyle(
                            fontSize: 9, color: GodropColors.mute)),
                  );
                },
              ),
            ),
          ),
          lineBarsData: [
            LineChartBarData(
              spots: a.dailyEarnings
                  .asMap()
                  .entries
                  .map((e) => FlSpot(e.key.toDouble(), e.value.earnings))
                  .toList(),
              isCurved: true,
              color: GodropColors.blue,
              barWidth: 2.5,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    GodropColors.blue.withValues(alpha: 0.18),
                    GodropColors.blue.withValues(alpha: 0.0),
                  ],
                ),
              ),
            ),
          ],
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipColor: (_) => GodropColors.ink,
              getTooltipItems: (spots) => spots.map((s) {
                final point = a.dailyEarnings[s.x.toInt()];
                return LineTooltipItem(
                  '${formatNaira(point.earnings, decimals: 0)}\n${point.deliveries} deliveries',
                  const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w600),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }

  static const _typeColors = <String, Color>{
    'FOOD': GodropColors.orange,
    'GROCERY': Color(0xFF10B981),
    'RETAIL': Color(0xFF8B5CF6),
    'PHARMACY': Color(0xFF0EA5E9),
    'PARCEL': GodropColors.blue,
  };

  Widget _typeBreakdownCard(RiderAnalytics a) {
    if (a.ordersByType.isEmpty) {
      return _emptyCard(
        icon: Icons.pie_chart_outline_rounded,
        title: 'No deliveries yet',
        subtitle: 'A breakdown by order type will show up here',
      );
    }
    final total = a.ordersByType.fold<int>(0, (s, t) => s + t.count);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            height: 100,
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 28,
                sections: a.ordersByType.map((t) {
                  final color = _typeColors[t.type] ?? GodropColors.mute;
                  return PieChartSectionData(
                    value: t.count.toDouble(),
                    color: color,
                    radius: 20,
                    showTitle: false,
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: a.ordersByType.map((t) {
                final color = _typeColors[t.type] ?? GodropColors.mute;
                final pct = total == 0 ? 0 : (t.count / total * 100).round();
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration:
                            BoxDecoration(color: color, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _typeLabel(t.type),
                          style: const TextStyle(
                              fontSize: 12, color: GodropColors.ink),
                        ),
                      ),
                      Text(
                        '${t.count} · $pct%',
                        style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: GodropColors.mute),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  String _typeLabel(String type) => switch (type) {
        'FOOD' => 'Food',
        'GROCERY' => 'Grocery',
        'PARCEL' => 'Parcel',
        'RETAIL' => 'Retail',
        'PHARMACY' => 'Pharmacy',
        _ => type,
      };

  Widget _emptyCard({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 36),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
      ),
      child: Column(
        children: [
          Icon(icon, color: GodropColors.mute, size: 32),
          const SizedBox(height: 10),
          Text(title,
              style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink)),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(subtitle,
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontSize: 12, color: GodropColors.mute)),
          ),
        ],
      ),
    );
  }

  Widget _error(BuildContext ctx, String message) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded,
                color: GodropColors.mute, size: 40),
            const SizedBox(height: 12),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: GodropColors.slate, fontSize: 14)),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => ctx.read<AnalyticsCubit>().load(days: _days),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _shimmer() {
    return Shimmer.fromColors(
      baseColor: GodropColors.border,
      highlightColor: GodropColors.white,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            height: 40,
            decoration: BoxDecoration(
                color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
          ),
          const SizedBox(height: 16),
          Row(
            children: List.generate(
              3,
              (_) => Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  height: 80,
                  decoration: BoxDecoration(
                      color: GodropColors.white,
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Container(
            height: 220,
            decoration: BoxDecoration(
                color: GodropColors.white, borderRadius: BorderRadius.circular(16)),
          ),
          const SizedBox(height: 20),
          Container(
            height: 130,
            decoration: BoxDecoration(
                color: GodropColors.white, borderRadius: BorderRadius.circular(16)),
          ),
        ],
      ),
    );
  }
}
