import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/invest_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/progress_bar.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import '../../shared/widgets/vehicle_tile.dart';
import 'bloc/portfolio_cubit.dart';

/// Screen 18 — investment tracking: earned summary, stat pills,
/// month-by-month payout schedule timeline.
class InvestmentDetailScreen extends StatefulWidget {
  const InvestmentDetailScreen({super.key, required this.investmentId});

  final String investmentId;

  @override
  State<InvestmentDetailScreen> createState() => _InvestmentDetailScreenState();
}

class _InvestmentDetailScreenState extends State<InvestmentDetailScreen> {
  @override
  void initState() {
    super.initState();
    context.read<InvestmentDetailCubit>().load(widget.investmentId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<InvestmentDetailCubit, InvestmentDetailState>(
          builder: (context, state) {
            return switch (state) {
              InvestmentDetailLoading() => const LoadingView(),
              InvestmentDetailError(message: final m) => ErrorView(
                  message: m,
                  onRetry: () => context
                      .read<InvestmentDetailCubit>()
                      .load(widget.investmentId),
                ),
              InvestmentDetailLoaded(investment: final inv) =>
                _buildLoaded(context, inv),
            };
          },
        ),
      ),
    );
  }

  Widget _buildLoaded(BuildContext context, Investment inv) {
    final progressPct = (inv.progress * 100).round();
    return Column(
      children: [
        InvestTopBar(title: inv.asset.name, subtitle: inv.reference),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(18, 4, 18, 20),
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: InvestColors.raise,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: InvestColors.line),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        SizedBox(
                          width: 70,
                          child: VehicleTile(
                            vehicleClass: inv.asset.vehicleClass,
                            height: 56,
                            radius: 12,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Earned so far',
                                style: TextStyle(
                                    fontSize: 12, color: InvestColors.sub),
                              ),
                              Text(
                                formatKobo(inv.earnedKobo),
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.4,
                                  color: InvestColors.green,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'of ${formatKobo(inv.projectedKobo)} projected',
                                style: const TextStyle(
                                    fontSize: 12, color: InvestColors.mute),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Month ${inv.monthsPaid} of ${inv.totalMonths} · $progressPct%',
                          style: const TextStyle(
                              fontSize: 11.5, color: InvestColors.sub),
                        ),
                        Text(
                          'Matures ${formatMonthYear(inv.maturesAt)}',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            color: InvestColors.text,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    InvestProgressBar(value: inv.progress, height: 7),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _pill('Capital', formatKobo(inv.amountKobo)),
                  const SizedBox(width: 10),
                  _pill('Monthly', formatKobo(inv.monthlyPayoutKobo),
                      color: InvestColors.green),
                  const SizedBox(width: 10),
                  _pill('Rate', formatBps(inv.plan.monthlyRateBps)),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'Payout schedule',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: InvestColors.text,
                ),
              ),
              const SizedBox(height: 14),
              _schedule(inv),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
          child: Row(
            children: [
              Expanded(
                child: InvestButton(
                  label: 'Top up',
                  kind: InvestButtonKind.dark,
                  onPressed: () {},
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: InvestButton(
                  label: 'Download statement',
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Statement will be emailed to you.')),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _pill(String label, String value, {Color color = InvestColors.text}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: InvestColors.raise,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: InvestColors.line),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: const TextStyle(fontSize: 10.5, color: InvestColors.mute),
            ),
          ],
        ),
      ),
    );
  }

  Widget _schedule(Investment inv) {
    final nextSequence = inv.payouts
        .where((p) => !p.isPaid)
        .fold<int?>(null, (min, p) => min == null || p.sequence < min ? p.sequence : min);
    return Column(
      children: inv.payouts.asMap().entries.map((entry) {
        final p = entry.value;
        final last = entry.key == inv.payouts.length - 1;
        final paid = p.isPaid;
        final next = p.sequence == nextSequence;
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Column(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: paid
                          ? InvestColors.green
                          : (next ? InvestColors.blueSoft : Colors.transparent),
                      border: Border.all(
                        color: paid
                            ? InvestColors.green
                            : (next ? InvestColors.blue : InvestColors.line2),
                        width: 2,
                      ),
                    ),
                    child: paid
                        ? const Icon(Icons.check, size: 14, color: Colors.white)
                        : (next
                            ? Center(
                                child: Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: InvestColors.blue,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              )
                            : null),
                  ),
                  if (!last)
                    Expanded(
                      child: Container(
                        width: 2,
                        margin: const EdgeInsets.symmetric(vertical: 2),
                        color: paid ? InvestColors.green : InvestColors.line,
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(bottom: last ? 0 : 18),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Month ${p.sequence}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: paid || next
                                  ? InvestColors.text
                                  : InvestColors.sub,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            formatDate(p.dueDate),
                            style: const TextStyle(
                                fontSize: 12, color: InvestColors.mute),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${paid ? '+' : ''}${formatKobo(p.amountKobo)}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: paid
                                  ? InvestColors.green
                                  : (next ? InvestColors.text : InvestColors.sub),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            paid
                                ? 'PAID'
                                : (next
                                    ? 'NEXT · ${daysUntil(p.dueDate)} DAYS'
                                    : 'SCHEDULED'),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: paid
                                  ? InvestColors.green
                                  : (next
                                      ? InvestColors.blueBright
                                      : InvestColors.mute),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
