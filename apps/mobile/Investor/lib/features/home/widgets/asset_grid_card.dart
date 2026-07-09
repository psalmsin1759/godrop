import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../app/theme.dart';
import '../../../shared/models/invest_models.dart';
import '../../../shared/utils/currency.dart';
import '../../../shared/widgets/chips.dart';
import '../../../shared/widgets/progress_bar.dart';
import '../../../shared/widgets/vehicle_tile.dart';

/// Design-kit `AssetGridCard` — compact 2-column asset card on Home.
class AssetGridCard extends StatelessWidget {
  const AssetGridCard({super.key, required this.asset});

  final InvestmentAsset asset;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/assets/${asset.id}', extra: asset),
      child: Container(
        decoration: BoxDecoration(
          color: InvestColors.raise,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: InvestColors.line),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                VehicleTile(vehicleClass: asset.vehicleClass, height: 84, radius: 0),
                Positioned(
                  top: 7,
                  right: 7,
                  child: SoftBadge(
                    label: formatBps(asset.projectedRoiBps),
                    color: InvestColors.green,
                    icon: Icons.trending_up,
                  ),
                ),
                if (asset.isHot)
                  const Positioned(
                    top: 7,
                    left: 7,
                    child: SoftBadge(
                      label: 'FILLING FAST',
                      color: InvestColors.orange,
                      solid: true,
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    asset.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w800,
                      color: InvestColors.text,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'From ${formatKoboCompact(asset.minInvestKobo)} · ${asset.tenureMonths} mo',
                    style: const TextStyle(fontSize: 10.5, color: InvestColors.mute),
                  ),
                  const SizedBox(height: 8),
                  Text.rich(
                    TextSpan(
                      text: formatKobo(asset.monthlyPayoutKobo),
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                        color: InvestColors.green,
                      ),
                      children: const [
                        TextSpan(
                          text: '/mo',
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w600,
                            color: InvestColors.mute,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 9),
                  InvestProgressBar(value: asset.fundedPct / 100, height: 5),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${asset.fundedPct}% funded',
                        style:
                            const TextStyle(fontSize: 9.5, color: InvestColors.mute),
                      ),
                      Text(
                        '${asset.slotsLeft} left',
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                          color: InvestColors.orange,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
