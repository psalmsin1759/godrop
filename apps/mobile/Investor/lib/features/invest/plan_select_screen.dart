import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/invest_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/invest_flow_cubit.dart';

/// Screen 12 — choose a plan (Starter / Rider / Fleet).
class PlanSelectScreen extends StatefulWidget {
  const PlanSelectScreen({super.key, required this.asset});

  final InvestmentAsset asset;

  @override
  State<PlanSelectScreen> createState() => _PlanSelectScreenState();
}

class _PlanSelectScreenState extends State<PlanSelectScreen> {
  @override
  void initState() {
    super.initState();
    context.read<InvestFlowCubit>().start(widget.asset);
  }

  static const _tones = {
    'Starter': (color: Color(0xFF6FA0FF), soft: InvestColors.blueSoft, gradient: InvestColors.cta),
    'Rider': (color: InvestColors.orange, soft: InvestColors.orangeSoft, gradient: InvestColors.ctaOrange),
    'Fleet': (color: InvestColors.gold, soft: InvestColors.goldSoft, gradient: InvestColors.gold2),
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<InvestFlowCubit, InvestFlowState>(
          builder: (context, state) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                InvestTopBar(title: 'Choose a plan', subtitle: widget.asset.name),
                Expanded(
                  child: state.loading
                      ? const LoadingView()
                      : ListView(
                          padding: const EdgeInsets.fromLTRB(18, 4, 18, 20),
                          children: [
                            const Text(
                              'The plan sets your lock period and payout rate. Longer tenures pay more each month.',
                              style: TextStyle(
                                fontSize: 13.5,
                                height: 1.5,
                                color: InvestColors.sub,
                              ),
                            ),
                            const SizedBox(height: 18),
                            for (final plan in state.plans) ...[
                              _planCard(context, plan, state.plan?.id == plan.id),
                              const SizedBox(height: 14),
                            ],
                          ],
                        ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
                  child: InvestButton(
                    label: state.plan == null
                        ? 'Select a plan'
                        : 'Continue with ${state.plan!.name} plan',
                    trailingIcon: Icons.arrow_forward,
                    onPressed: state.plan == null
                        ? null
                        : () => context.push('/invest/amount'),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _planCard(BuildContext context, InvestmentPlan plan, bool selected) {
    final tone = _tones[plan.name] ?? _tones['Starter']!;
    return GestureDetector(
      onTap: () => context.read<InvestFlowCubit>().selectPlan(plan),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: selected ? tone.soft : InvestColors.raise,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: selected ? tone.color : InvestColors.line,
                width: 1.5,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        gradient: tone.gradient,
                        borderRadius: BorderRadius.circular(13),
                      ),
                      child: const Icon(Icons.trending_up,
                          size: 24, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            plan.name,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: InvestColors.text,
                            ),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            '${plan.tenureMonths} months lock',
                            style: const TextStyle(
                                fontSize: 12, color: InvestColors.sub),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: selected ? tone.color : Colors.transparent,
                        border: Border.all(
                          color: selected ? tone.color : InvestColors.line2,
                          width: 2,
                        ),
                      ),
                      child: selected
                          ? const Icon(Icons.check, size: 14, color: Colors.white)
                          : null,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _planStat('MONTHLY RATE', formatBps(plan.monthlyRateBps),
                        color: tone.color),
                    _planStat('TOTAL ROI', formatBps(plan.totalRoiBps)),
                    _planStat('MIN', formatKoboCompact(plan.minAmountKobo)),
                  ],
                ),
                if (plan.note != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.schedule, size: 14, color: InvestColors.mute),
                      const SizedBox(width: 6),
                      Text(
                        plan.note!,
                        style:
                            const TextStyle(fontSize: 12, color: InvestColors.sub),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          if (plan.isPopular)
            Positioned(
              top: -10,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: InvestColors.orange,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text(
                  'MOST POPULAR',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.4,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _planStat(String label, String value, {Color color = InvestColors.text}) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w600,
              color: InvestColors.mute,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
