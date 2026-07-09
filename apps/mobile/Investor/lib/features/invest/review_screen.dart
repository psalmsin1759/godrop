import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/top_bar.dart';
import '../../shared/widgets/vehicle_tile.dart';
import 'bloc/invest_flow_cubit.dart';

/// Screen 14 — review: asset header, amount highlight card, detail rows,
/// projected returns, disclosure, confirm CTA.
class ReviewScreen extends StatelessWidget {
  const ReviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<InvestFlowCubit, InvestFlowState>(
          builder: (context, state) {
            final preview = state.preview;
            final asset = state.asset;
            final plan = state.plan;
            if (preview == null || asset == null || plan == null) {
              return const Center(child: Text('Start from an asset to invest.'));
            }
            return Column(
              children: [
                const InvestTopBar(title: 'Review investment'),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(18, 4, 18, 20),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: InvestColors.raise,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: InvestColors.line),
                        ),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 68,
                              child: VehicleTile(
                                vehicleClass: asset.vehicleClass,
                                height: 56,
                                radius: 12,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    asset.name,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: InvestColors.text,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${plan.name} plan · ${plan.tenureMonths}-month lock',
                                    style: const TextStyle(
                                        fontSize: 12.5, color: InvestColors.sub),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          gradient: InvestColors.card,
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'INVESTMENT AMOUNT',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.white.withValues(alpha: 0.8),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              formatKobo(preview.amountKobo, decimals: true),
                              style: const TextStyle(
                                fontSize: 34,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.6,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: InvestColors.raise,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: InvestColors.line),
                        ),
                        child: Column(
                          children: [
                            _row('Asset', asset.name),
                            _row('Plan', '${plan.name} · ${plan.tenureMonths} months'),
                            _row('Monthly rate', formatBps(plan.monthlyRateBps),
                                valueColor: InvestColors.green),
                            _row('Lock period', '${plan.tenureMonths} months'),
                            _row('Maturity date', formatDate(preview.maturesAt),
                                last: true),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: InvestColors.greenSoft,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color: InvestColors.green.withValues(alpha: 0.25)),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Est. monthly payout',
                                  style: TextStyle(
                                      fontSize: 13, color: InvestColors.sub),
                                ),
                                Text(
                                  formatKobo(preview.monthlyPayoutKobo, sign: true),
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: InvestColors.green,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Total projected return',
                                  style: TextStyle(
                                      fontSize: 13, color: InvestColors.sub),
                                ),
                                Text(
                                  formatKobo(preview.totalReturnKobo),
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: InvestColors.text,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Text(
                          'By confirming you agree returns are projected and capital is at risk. Funds unlock at maturity.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 11.5,
                            height: 1.5,
                            color: InvestColors.mute,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
                  child: InvestButton(
                    label: 'Confirm & pay ${formatKobo(preview.amountKobo)}',
                    onPressed: () => context.push('/invest/payment'),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _row(String label, String value,
      {Color valueColor = InvestColors.text, bool last = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 13),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: InvestColors.line)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 13.5, color: InvestColors.sub)),
          Text(
            value,
            style: TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w700,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }
}
