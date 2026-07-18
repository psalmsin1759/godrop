import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';

/// Shimmer skeletons shown while first-load data is in flight.
/// Real cards stay white; only the grey placeholder shapes shimmer.
class GodropShimmer extends StatelessWidget {
  final Widget child;
  const GodropShimmer({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFE9E7E3),
      highlightColor: const Color(0xFFF8F7F5),
      child: child,
    );
  }
}

class SkeletonBox extends StatelessWidget {
  final double? width;
  final double height;
  final double radius;
  const SkeletonBox({super.key, this.width, required this.height, this.radius = 8});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

/// Mimics the standard Godrop list card: leading tile, two text lines,
/// trailing value.
class SkeletonCard extends StatelessWidget {
  const SkeletonCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(18),
        boxShadow: GodropColors.softShadow,
      ),
      child: const GodropShimmer(
        child: Row(
          children: [
            SkeletonBox(width: 44, height: 44, radius: 14),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SkeletonBox(width: 140, height: 14),
                  SizedBox(height: 8),
                  SkeletonBox(width: 90, height: 11),
                ],
              ),
            ),
            SkeletonBox(width: 56, height: 14),
          ],
        ),
      ),
    );
  }
}

/// A scrollable column of [SkeletonCard]s — drop-in for list screens.
class ListSkeleton extends StatelessWidget {
  final int count;
  final EdgeInsets padding;
  const ListSkeleton({
    super.key,
    this.count = 7,
    this.padding = const EdgeInsets.fromLTRB(20, 12, 20, 120),
  });

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      physics: const NeverScrollableScrollPhysics(),
      padding: padding,
      itemCount: count,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, __) => const SkeletonCard(),
    );
  }
}

class _SkeletonPanel extends StatelessWidget {
  final double height;
  final Widget child;
  const _SkeletonPanel({required this.height, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: GodropShimmer(child: child),
    );
  }
}

/// Home screen: greeting, store toggle card, 2×2 stats, pending orders.
class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    Widget statCard() => const Expanded(
          child: _SkeletonPanel(
            height: 110,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonBox(width: 34, height: 34, radius: 11),
                SizedBox(height: 12),
                SkeletonBox(width: 80, height: 16),
              ],
            ),
          ),
        );

    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 96),
      children: [
        const GodropShimmer(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonBox(width: 170, height: 22),
              SizedBox(height: 8),
              SkeletonBox(width: 110, height: 13),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const _SkeletonPanel(
          height: 74,
          child: Row(
            children: [
              SkeletonBox(width: 42, height: 42, radius: 14),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SkeletonBox(width: 120, height: 14),
                    SizedBox(height: 6),
                    SkeletonBox(width: 160, height: 11),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(children: [statCard(), const SizedBox(width: 12), statCard()]),
        const SizedBox(height: 12),
        Row(children: [statCard(), const SizedBox(width: 12), statCard()]),
        const SizedBox(height: 24),
        const GodropShimmer(
            child: SkeletonBox(width: 130, height: 15)),
        const SizedBox(height: 14),
        const SkeletonCard(),
        const SizedBox(height: 10),
        const SkeletonCard(),
        const SizedBox(height: 10),
        const SkeletonCard(),
      ],
    );
  }
}

/// Wallet: balance hero card, bank account row, transactions.
class WalletSkeleton extends StatelessWidget {
  const WalletSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 96),
      children: const [
        _SkeletonPanel(
          height: 150,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonBox(width: 100, height: 12),
              SizedBox(height: 12),
              SkeletonBox(width: 180, height: 28),
              SizedBox(height: 18),
              SkeletonBox(width: 140, height: 40, radius: 12),
            ],
          ),
        ),
        SizedBox(height: 16),
        SkeletonCard(),
        SizedBox(height: 24),
        GodropShimmer(child: SkeletonBox(width: 110, height: 15)),
        SizedBox(height: 14),
        SkeletonCard(),
        SizedBox(height: 10),
        SkeletonCard(),
        SizedBox(height: 10),
        SkeletonCard(),
      ],
    );
  }
}

/// Detail/form screens: a header block and stacked full-width fields.
class DetailSkeleton extends StatelessWidget {
  const DetailSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      children: [
        const _SkeletonPanel(
          height: 110,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonBox(width: 150, height: 16),
              SizedBox(height: 10),
              SkeletonBox(width: 220, height: 12),
              SizedBox(height: 8),
              SkeletonBox(width: 180, height: 12),
            ],
          ),
        ),
        const SizedBox(height: 16),
        for (var i = 0; i < 4; i++) ...[
          _SkeletonPanel(
            height: 58,
            child: Align(
              alignment: Alignment.centerLeft,
              child: SkeletonBox(width: 120 + 40.0 * (i % 3), height: 14),
            ),
          ),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}
