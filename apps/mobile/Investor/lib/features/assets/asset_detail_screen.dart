import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/invest_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/progress_bar.dart';
import '../../shared/widgets/top_bar.dart';
import '../../shared/widgets/vehicle_tile.dart';

/// Screen 11 — asset detail: hero tile, stat grid, funding progress,
/// "how this works" steps, risk note, sticky CTA into the invest flow.
class AssetDetailScreen extends StatelessWidget {
  const AssetDetailScreen({super.key, required this.asset});

  final InvestmentAsset asset;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.only(bottom: 110),
            children: [
              Stack(
                children: [
                  VehicleTile(
                    vehicleClass: asset.vehicleClass,
                    height: 230,
                    radius: 0,
                    label: asset.shortCode,
                  ),
                  Positioned(
                    top: MediaQuery.of(context).padding.top + 14,
                    left: 18,
                    child: const InvestBackButton(onDark: true),
                  ),
                  Positioned(
                    top: MediaQuery.of(context).padding.top + 14,
                    right: 18,
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.favorite_border,
                          size: 20, color: Colors.white),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                asset.name,
                                style: const TextStyle(
                                  fontSize: 23,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.5,
                                  color: InvestColors.text,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                asset.description ?? asset.shortCode,
                                style: const TextStyle(
                                    fontSize: 13, color: InvestColors.sub),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: InvestColors.orangeSoft,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: const BoxDecoration(
                                  color: InvestColors.orange,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 5),
                              Text(
                                asset.status,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: InvestColors.orange,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 2.1,
                      children: [
                        _statCard('Projected ROI', formatBps(asset.projectedRoiBps),
                            color: InvestColors.green),
                        _statCard(
                            'Monthly payout', formatKobo(asset.monthlyPayoutKobo)),
                        _statCard(
                            'Investment tenure', '${asset.tenureMonths} months'),
                        _statCard('Minimum entry', formatKobo(asset.minInvestKobo)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: InvestColors.raise,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: InvestColors.line),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${formatKobo(asset.raisedKobo)} raised',
                                style: const TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: InvestColors.text,
                                ),
                              ),
                              Text(
                                'of ${formatKobo(asset.targetKobo)} goal',
                                style: const TextStyle(
                                    fontSize: 12.5, color: InvestColors.sub),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          InvestProgressBar(value: asset.fundedPct / 100, height: 8),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '👥 ${asset.investorCount} investors',
                                style: const TextStyle(
                                    fontSize: 12, color: InvestColors.sub),
                              ),
                              Text(
                                'Only ${asset.slotsLeft} slots left',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: InvestColors.orange,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'How this works',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: InvestColors.text,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _step(1, 'You fund a share of the vehicle',
                        'Invest from ${formatKobo(asset.minInvestKobo)} up to the full unit price.',
                        last: false),
                    _step(2, 'A vetted rider operates it daily',
                        'GoDrop handles vetting, tracking and maintenance.',
                        last: false),
                    _step(3, 'You earn every month',
                        '${formatKobo(asset.monthlyPayoutKobo)}/mo per full unit lands in your wallet.',
                        last: true),
                    const SizedBox(height: 18),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: InvestColors.orangeSoft,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.shield_outlined,
                              size: 18, color: InvestColors.orange),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Returns are projected, not guaranteed. Assets are insured. Capital is at risk. Read the full disclosure before investing.',
                              style: TextStyle(
                                fontSize: 11.5,
                                height: 1.45,
                                color: InvestColors.sub,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    InvestColors.bg.withValues(alpha: 0),
                    InvestColors.bg,
                  ],
                  stops: const [0, 0.3],
                ),
              ),
              child: SafeArea(
                top: false,
                child: InvestButton(
                  label: 'Choose a plan · Invest',
                  trailingIcon: Icons.arrow_forward,
                  onPressed: () => context.push('/invest/plans', extra: asset),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, {Color color = InvestColors.text}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: InvestColors.raise,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: InvestColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: InvestColors.mute,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.3,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _step(int n, String title, String body, {required bool last}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Column(
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: const BoxDecoration(
                  color: InvestColors.blueSoft,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  '$n',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: InvestColors.blueBright,
                  ),
                ),
              ),
              if (!last)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    color: InvestColors.line,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: last ? 0 : 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: InvestColors.text,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    body,
                    style: const TextStyle(
                      fontSize: 12.5,
                      height: 1.45,
                      color: InvestColors.sub,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
