import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/invest_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/chips.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/progress_bar.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import '../../shared/widgets/vehicle_tile.dart';
import 'bloc/assets_cubit.dart';

/// Screen 10 — asset catalog with class filter chips and full asset cards.
class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key, this.initialClass});

  final String? initialClass;

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  static const _filters = [
    (label: 'All', value: null),
    (label: 'Keke', value: 'KEKE'),
    (label: 'Shuttle', value: 'SHUTTLE'),
    (label: 'Ride car', value: 'RIDE_CAR'),
    (label: 'Bike', value: 'BIKE'),
  ];

  String? _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.initialClass;
    context.read<AssetsCubit>().load(vehicleClass: _selected);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const InvestTopBar(
              title: 'Invest in assets',
              subtitle: 'Vetted vehicles · monthly returns',
            ),
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.fromLTRB(18, 4, 18, 0),
                itemCount: _filters.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final f = _filters[i];
                  return SelectChip(
                    label: f.label,
                    pill: true,
                    selected: _selected == f.value,
                    onTap: () {
                      setState(() => _selected = f.value);
                      context.read<AssetsCubit>().load(vehicleClass: f.value);
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 14),
            Expanded(
              child: BlocBuilder<AssetsCubit, AssetsState>(
                builder: (context, state) {
                  return switch (state) {
                    AssetsInitial() || AssetsLoading() => const LoadingView(),
                    AssetsError(message: final m) => ErrorView(
                        message: m,
                        onRetry: () =>
                            context.read<AssetsCubit>().load(vehicleClass: _selected),
                      ),
                    AssetsLoaded(assets: final assets) => assets.isEmpty
                        ? const EmptyView(
                            title: 'No assets in this class yet',
                            subtitle: 'Check back soon — new vehicles open regularly.',
                            icon: Icons.directions_car_outlined,
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(18, 0, 18, 20),
                            itemCount: assets.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 14),
                            itemBuilder: (_, i) => _AssetCard(asset: assets[i]),
                          ),
                  };
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AssetCard extends StatelessWidget {
  const _AssetCard({required this.asset});

  final InvestmentAsset asset;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: InvestColors.raise,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: InvestColors.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              VehicleTile(
                vehicleClass: asset.vehicleClass,
                height: 124,
                radius: 0,
                label: asset.shortCode,
              ),
              if (asset.isHot)
                const Positioned(
                  top: 10,
                  right: 10,
                  child: SoftBadge(
                    label: 'FILLING FAST',
                    color: InvestColors.orange,
                    solid: true,
                  ),
                ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      asset.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: InvestColors.text,
                      ),
                    ),
                    SoftBadge(
                      label: '${formatBps(asset.projectedRoiBps)} ROI',
                      color: InvestColors.green,
                      icon: Icons.trending_up,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _stat('UNIT PRICE', formatKobo(asset.unitPriceKobo)),
                    const SizedBox(width: 20),
                    _stat('TENURE', '${asset.tenureMonths} mo'),
                    const SizedBox(width: 20),
                    _stat('FROM', formatKobo(asset.minInvestKobo)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${asset.fundedPct}% funded',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: InvestColors.sub,
                      ),
                    ),
                    Text(
                      '${asset.slotsLeft} slots left',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: InvestColors.orange,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                InvestProgressBar(value: asset.fundedPct / 100),
                const SizedBox(height: 14),
                InvestButton(
                  label: 'Invest now',
                  small: true,
                  trailingIcon: Icons.arrow_forward,
                  onPressed: () => context.push('/assets/${asset.id}', extra: asset),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(String label, String value) {
    return Column(
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
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: InvestColors.text,
          ),
        ),
      ],
    );
  }
}
