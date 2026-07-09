import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/invest_button.dart';
import 'bloc/invest_flow_cubit.dart';

/// Screen 16 — investment active: green check rings, summary, mini receipt.
class InvestSuccessScreen extends StatelessWidget {
  const InvestSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<InvestFlowCubit, InvestFlowState>(
          builder: (context, state) {
            final investment = state.result?.investment;
            final asset = state.asset;
            final plan = state.plan;
            return Padding(
              padding: const EdgeInsets.fromLTRB(22, 0, 22, 24),
              child: Column(
                children: [
                  Expanded(
                    child: Center(
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            SizedBox(
                              width: 120,
                              height: 120,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  Container(
                                    width: 120,
                                    height: 120,
                                    decoration: const BoxDecoration(
                                      color: InvestColors.greenSoft,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  Container(
                                    width: 92,
                                    height: 92,
                                    decoration: BoxDecoration(
                                      color: InvestColors.green
                                          .withValues(alpha: 0.22),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  Container(
                                    width: 68,
                                    height: 68,
                                    decoration: BoxDecoration(
                                      color: InvestColors.green,
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                          color: InvestColors.green
                                              .withValues(alpha: 0.45),
                                          blurRadius: 30,
                                          offset: const Offset(0, 12),
                                        ),
                                      ],
                                    ),
                                    child: const Icon(Icons.check,
                                        size: 34, color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 26),
                            const Text(
                              'Investment active!',
                              style: TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.5,
                                color: InvestColors.text,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text.rich(
                              TextSpan(
                                text: 'You invested ',
                                style: const TextStyle(
                                  fontSize: 14.5,
                                  height: 1.55,
                                  color: InvestColors.sub,
                                ),
                                children: [
                                  TextSpan(
                                    text: formatKobo(state.amountKobo),
                                    style: const TextStyle(
                                      color: InvestColors.text,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  TextSpan(
                                      text:
                                          ' in a ${asset?.name ?? 'vehicle'}. Your first payout arrives '),
                                  TextSpan(
                                    text: formatDate(
                                        investment?.payouts.isNotEmpty == true
                                            ? investment!.payouts.first.dueDate
                                            : null),
                                    style: const TextStyle(
                                      color: InvestColors.text,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const TextSpan(text: '.'),
                                ],
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 26),
                            Container(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: InvestColors.raise,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: InvestColors.line),
                              ),
                              child: Column(
                                children: [
                                  _row('Reference',
                                      investment?.reference ?? state.result?.reference ?? '—'),
                                  _row(
                                    'Plan',
                                    plan == null
                                        ? '—'
                                        : '${plan.name} · ${plan.tenureMonths} months',
                                  ),
                                  _row(
                                    'Monthly payout',
                                    formatKobo(
                                        investment?.monthlyPayoutKobo ??
                                            state.estMonthlyKobo,
                                        sign: true),
                                    valueColor: InvestColors.green,
                                    last: true,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  InvestButton(
                    label: 'View my assets',
                    trailingIcon: Icons.arrow_forward,
                    onPressed: () {
                      context.read<InvestFlowCubit>().resetFlow();
                      context.go('/portfolio');
                    },
                  ),
                  const SizedBox(height: 10),
                  InvestButton(
                    label: 'Back to home',
                    kind: InvestButtonKind.dark,
                    onPressed: () {
                      context.read<InvestFlowCubit>().resetFlow();
                      context.go('/home');
                    },
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _row(String label, String value,
      {Color valueColor = InvestColors.text, bool last = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: InvestColors.line)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 13, color: InvestColors.sub)),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }
}
