import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/invest_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/chips.dart';
import '../../shared/widgets/progress_bar.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/vehicle_tile.dart';
import 'bloc/portfolio_cubit.dart';

/// Screen 17 — My Assets: portfolio value card, next-payout strip,
/// Active/Matured/All tabs, holding cards.
class PortfolioScreen extends StatefulWidget {
  const PortfolioScreen({super.key});

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    context.read<PortfolioCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<PortfolioCubit, PortfolioState>(
          builder: (context, state) {
            return switch (state) {
              PortfolioInitial() || PortfolioLoading() => const LoadingView(),
              PortfolioError(message: final m) => ErrorView(
                  message: m,
                  onRetry: () => context.read<PortfolioCubit>().load(),
                ),
              PortfolioLoaded() => _buildLoaded(context, state),
            };
          },
        ),
      ),
    );
  }

  Widget _buildLoaded(BuildContext context, PortfolioLoaded state) {
    final p = state.portfolio;
    final holdings = switch (_tab) {
      0 => state.active,
      1 => state.matured,
      _ => state.investments,
    };
    return RefreshIndicator(
      color: InvestColors.blue,
      onRefresh: () => context.read<PortfolioCubit>().load(),
      child: ListView(
        padding: const EdgeInsets.only(bottom: 20),
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(18, 10, 18, 4),
            child: Text(
              'My Assets',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.5,
                color: InvestColors.text,
              ),
            ),
          ),
          if (p != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 12, 18, 0),
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: InvestColors.card,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TOTAL PORTFOLIO VALUE',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      formatKobo(p.portfolioValueKobo, decimals: true),
                      style: const TextStyle(
                        fontSize: 34,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.6,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: InvestColors.green.withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.arrow_upward,
                                  size: 13, color: Color(0xFF5EEBAE)),
                              const SizedBox(width: 3),
                              Text(
                                formatKobo(p.earnedKobo, sign: true),
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF5EEBAE),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'earned to date',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withValues(alpha: 0.7),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    IntrinsicHeight(
                      child: Row(
                        children: [
                          _cardStat(formatKobo(p.investedKobo), 'Invested'),
                          _cardDivider(),
                          _cardStat('${p.activeCount} assets', 'Active'),
                          _cardDivider(),
                          _cardStat(
                            p.nextPayout == null
                                ? '—'
                                : formatMonthDay(p.nextPayout!.dueDate),
                            'Next payout',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          if (p?.nextPayout != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: InvestColors.greenSoft,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                      color: InvestColors.green.withValues(alpha: 0.25)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: InvestColors.green,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.monetization_on,
                          size: 24, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Next payout in ${daysUntil(p!.nextPayout!.dueDate)} days',
                            style: const TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w700,
                              color: InvestColors.text,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${formatKobo(p.nextPayout!.amountKobo)} from ${p.nextPayout!.assetName ?? 'your assets'} · ${formatMonthDay(p.nextPayout!.dueDate)}',
                            style: const TextStyle(
                                fontSize: 12, color: InvestColors.sub),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right,
                        size: 16, color: InvestColors.green),
                  ],
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 12),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: InvestColors.raise2,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  _tabButton('Active (${state.active.length})', 0),
                  _tabButton('Matured (${state.matured.length})', 1),
                  _tabButton('All', 2),
                ],
              ),
            ),
          ),
          if (holdings.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 30),
              child: EmptyView(
                title: 'Nothing here yet',
                subtitle: 'Invest in an asset to start earning monthly.',
                icon: Icons.local_mall_outlined,
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18),
              child: Column(
                children: [
                  for (final h in holdings) ...[
                    _HoldingCard(investment: h),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _cardStat(String value, String label) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 10.5,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _cardDivider() {
    return Container(
      width: 1,
      margin: const EdgeInsets.symmetric(horizontal: 10),
      color: Colors.white.withValues(alpha: 0.18),
    );
  }

  Widget _tabButton(String label, int index) {
    final on = _tab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: on ? InvestColors.blue : Colors.transparent,
            borderRadius: BorderRadius.circular(9),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: on ? Colors.white : InvestColors.sub,
            ),
          ),
        ),
      ),
    );
  }
}

class _HoldingCard extends StatelessWidget {
  const _HoldingCard({required this.investment});

  final Investment investment;

  @override
  Widget build(BuildContext context) {
    final matured = investment.isMatured;
    return GestureDetector(
      onTap: () => context.push('/portfolio/${investment.id}'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: InvestColors.raise,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: InvestColors.line),
        ),
        child: Column(
          children: [
            Row(
              children: [
                SizedBox(
                  width: 56,
                  child: VehicleTile(
                    vehicleClass: investment.asset.vehicleClass,
                    height: 48,
                    radius: 11,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              investment.asset.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: InvestColors.text,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          SoftBadge(
                            label: investment.status,
                            color: matured ? InvestColors.sub : InvestColors.green,
                            background:
                                matured ? InvestColors.raise3 : InvestColors.greenSoft,
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Invested ${formatKobo(investment.amountKobo)}',
                        style:
                            const TextStyle(fontSize: 12, color: InvestColors.sub),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      formatKobo(investment.monthlyPayoutKobo, sign: true),
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: matured ? InvestColors.sub : InvestColors.green,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      '/month',
                      style: TextStyle(fontSize: 10.5, color: InvestColors.mute),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  matured
                      ? 'Completed'
                      : 'Month ${investment.monthsPaid} of ${investment.totalMonths}',
                  style: const TextStyle(fontSize: 11, color: InvestColors.sub),
                ),
                Text(
                  matured
                      ? '✓ Capital returned'
                      : 'Next: ${formatMonthDay(investment.nextPayout?.dueDate)}',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: matured ? InvestColors.sub : InvestColors.text,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 5),
            InvestProgressBar(
              value: investment.progress,
              color: matured ? InvestColors.green : null,
            ),
          ],
        ),
      ),
    );
  }
}
