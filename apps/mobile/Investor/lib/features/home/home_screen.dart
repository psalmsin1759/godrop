import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/home_models.dart';
import '../../shared/models/wallet_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/chips.dart';
import '../../shared/widgets/invest_avatar.dart';
import '../../shared/widgets/section_header.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/tx_tile.dart';
import '../../shared/widgets/vehicle_tile.dart';
import 'bloc/home_cubit.dart';
import 'widgets/asset_grid_card.dart';

/// Screens 08–09 — Home with portfolio strip, multi-wallet cards,
/// quick actions, promo banner, browse-by-class, asset grid, activity.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _promoIndex = 0;
  final _promoController = PageController();

  @override
  void initState() {
    super.initState();
    context.read<HomeCubit>().load();
  }

  @override
  void dispose() {
    _promoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<HomeCubit, HomeState>(
          builder: (context, state) {
            return switch (state) {
              HomeInitial() || HomeLoading() => const LoadingView(),
              HomeError(message: final m) => ErrorView(
                  message: m,
                  onRetry: () => context.read<HomeCubit>().load(),
                ),
              HomeLoaded(data: final data, balanceHidden: final hidden) =>
                _buildLoaded(context, data, hidden),
            };
          },
        ),
      ),
    );
  }

  Widget _buildLoaded(BuildContext context, HomeResponse data, bool hidden) {
    return RefreshIndicator(
      color: InvestColors.blue,
      onRefresh: () => context.read<HomeCubit>().load(silent: true),
      child: ListView(
        padding: const EdgeInsets.only(bottom: 20),
        children: [
          _header(context, data),
          _portfolioStrip(data, hidden),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Your wallets',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: InvestColors.text,
                  ),
                ),
                GestureDetector(
                  onTap: () => context.go('/transactions'),
                  child: const Text(
                    'Manage',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: InvestColors.blueBright,
                    ),
                  ),
                ),
              ],
            ),
          ),
          _walletStrip(data.wallets, hidden),
          _quickActions(context),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 20, 18, 0),
            child: Column(
              children: [
                SizedBox(
                  height: 108,
                  child: PageView(
                    controller: _promoController,
                    onPageChanged: (i) => setState(() => _promoIndex = i),
                    children: const [
                      _PromoBanner.refer(),
                      _PromoBanner.reinvest(),
                      _PromoBanner.shuttle(),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Dots(active: _promoIndex),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 20, 18, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionHeader(
                  title: 'Explore assets',
                  action: 'See all',
                  onAction: () => context.push('/assets'),
                ),
                const SizedBox(height: 3),
                const Text(
                  'Browse by class',
                  style: TextStyle(fontSize: 12.5, color: InvestColors.sub),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          _classChips(context, data),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                mainAxisExtent: 222,
              ),
              itemCount: data.assets.length,
              itemBuilder: (_, i) => AssetGridCard(asset: data.assets[i]),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 22, 18, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionHeader(
                  title: 'Recent activity',
                  action: 'View all',
                  onAction: () => context.go('/transactions'),
                ),
                const SizedBox(height: 12),
                for (final tx in data.recentActivity) ...[
                  TxTile(tx: tx),
                  const SizedBox(height: 10),
                ],
                if (data.recentActivity.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Text(
                      'No activity yet — make your first investment.',
                      style: TextStyle(fontSize: 13, color: InvestColors.mute),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _header(BuildContext context, HomeResponse data) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 6, 18, 14),
      child: Row(
        children: [
          InvestAvatar(
            size: 46,
            initials: data.investor.firstName.isNotEmpty
                ? data.investor.firstName[0] +
                    (data.investor.lastName.isNotEmpty ? data.investor.lastName[0] : '')
                : '',
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Welcome back 👋',
                  style: TextStyle(fontSize: 13, color: InvestColors.sub),
                ),
                const SizedBox(height: 1),
                Text(
                  'Hello ${data.investor.firstName}',
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.4,
                    color: InvestColors.text,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => context.push('/notifications'),
            child: Stack(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: InvestColors.raise2,
                    shape: BoxShape.circle,
                    border: Border.all(color: InvestColors.line),
                  ),
                  child: const Icon(Icons.notifications_none,
                      size: 22, color: InvestColors.text),
                ),
                if (data.unreadNotifications > 0)
                  Positioned(
                    top: 10,
                    right: 11,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: InvestColors.orange,
                        shape: BoxShape.circle,
                        border: Border.all(color: InvestColors.bg, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _portfolioStrip(HomeResponse data, bool hidden) {
    final p = data.portfolio;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 18),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: InvestColors.raise,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: InvestColors.line),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Total portfolio',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: InvestColors.sub,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    hidden ? '₦ ••••••' : formatKobo(p.portfolioValueKobo),
                    style: const TextStyle(
                      fontSize: 23,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                      color: InvestColors.text,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      SoftBadge(
                        label: hidden ? '+₦ ••••' : formatKobo(p.earnedKobo, sign: true),
                        color: InvestColors.green,
                        icon: Icons.arrow_upward,
                      ),
                      const SizedBox(width: 5),
                      const Text(
                        'all-time earned',
                        style: TextStyle(fontSize: 11, color: InvestColors.mute),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const VerticalDivider(width: 28),
            SizedBox(
              width: 96,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'This month',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: InvestColors.sub,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    hidden ? '+₦ ••••' : formatKobo(p.thisMonthKobo, sign: true),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: InvestColors.green,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 26,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [40, 55, 45, 68, 60, 82].asMap().entries.map((e) {
                        final last = e.key == 5;
                        return Expanded(
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 1.5),
                            height: 26 * e.value / 100,
                            decoration: BoxDecoration(
                              color: last ? InvestColors.green : InvestColors.raise3,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _walletStrip(InvestorWallets wallets, bool hidden) {
    return SizedBox(
      height: 168,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 18),
        children: [
          _WalletCard(
            name: 'Main Wallet',
            balanceKobo: wallets.mainBalanceKobo,
            subtitle: 'Available to invest',
            gradient: InvestColors.card,
            icon: Icons.account_balance_wallet_outlined,
            hidden: hidden,
            onEyeTap: () => context.read<HomeCubit>().toggleBalanceHidden(),
          ),
          const SizedBox(width: 12),
          _WalletCard(
            name: 'Payout Wallet',
            balanceKobo: wallets.payoutBalanceKobo,
            subtitle: 'From monthly returns',
            gradient: InvestColors.cardGreen,
            icon: Icons.trending_up,
            hidden: hidden,
          ),
          const SizedBox(width: 12),
          _WalletCard(
            name: 'Flow Safe',
            balanceKobo: wallets.safeBalanceKobo,
            subtitle: 'Locked · earning up to 16% p.a.',
            themed: true,
            icon: Icons.savings_outlined,
            hidden: hidden,
            onTap: () => context.go('/safe'),
          ),
        ],
      ),
    );
  }

  Widget _quickActions(BuildContext context) {
    final actions = [
      (label: 'Invest', icon: Icons.trending_up, color: InvestColors.blueBright, bg: InvestColors.blueSoft, route: '/assets'),
      (label: 'Add money', icon: Icons.add, color: InvestColors.green, bg: InvestColors.greenSoft, route: '/wallet/fund'),
      (label: 'Withdraw', icon: Icons.arrow_downward, color: InvestColors.orange, bg: InvestColors.orangeSoft, route: '/wallet/withdraw'),
      (label: 'Flow Safe', icon: Icons.savings_outlined, color: InvestColors.gold, bg: InvestColors.goldSoft, route: '/safe'),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
      child: Row(
        children: actions.map((a) {
          return Expanded(
            child: GestureDetector(
              onTap: () =>
                  a.route == '/safe' ? context.go(a.route) : context.push(a.route),
              child: Column(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: a.bg,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(a.icon, size: 22, color: a.color),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    a.label,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: InvestColors.text,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _classChips(BuildContext context, HomeResponse data) {
    return SizedBox(
      height: 48,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 18),
        itemCount: data.assetClasses.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) {
          final c = data.assetClasses[i];
          final first = i == 0;
          return GestureDetector(
            onTap: () => context.push('/assets', extra: c.vehicleClass),
            child: Container(
              padding: const EdgeInsets.fromLTRB(8, 8, 14, 8),
              decoration: BoxDecoration(
                color: first ? InvestColors.blue : InvestColors.raise,
                borderRadius: BorderRadius.circular(30),
                border: Border.all(
                  color: first ? InvestColors.blue : InvestColors.line,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: first
                          ? Colors.white.withValues(alpha: 0.2)
                          : InvestColors.raise3,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      VehicleTile.iconFor(c.vehicleClass),
                      size: 18,
                      color: first
                          ? Colors.white
                          : VehicleTile.glyphColorFor(c.vehicleClass),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    c.label,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: first ? Colors.white : InvestColors.text,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${c.count}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: first
                          ? Colors.white.withValues(alpha: 0.7)
                          : InvestColors.mute,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _WalletCard extends StatelessWidget {
  const _WalletCard({
    required this.name,
    required this.balanceKobo,
    required this.subtitle,
    required this.icon,
    this.gradient,
    this.themed = false,
    required this.hidden,
    this.onEyeTap,
    this.onTap,
  });

  final String name;
  final int balanceKobo;
  final String subtitle;
  final IconData icon;
  final Gradient? gradient;

  /// Themed = Flow Safe card, rendered on surface colors instead of brand gradient.
  final bool themed;
  final bool hidden;
  final VoidCallback? onEyeTap;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final fg = themed ? InvestColors.text : Colors.white;
    final fgSub = themed ? InvestColors.sub : Colors.white.withValues(alpha: 0.85);
    final fgMute = themed ? InvestColors.mute : Colors.white.withValues(alpha: 0.7);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 296,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: themed ? InvestColors.cardDark : gradient,
          borderRadius: BorderRadius.circular(20),
          border: themed ? Border.all(color: InvestColors.line2) : null,
          boxShadow: themed ? null : InvestColors.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: themed
                        ? InvestColors.orangeSoft
                        : Colors.white.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon,
                      size: 22, color: themed ? InvestColors.orange : Colors.white),
                ),
                if (themed)
                  const Icon(Icons.chevron_right, size: 18, color: InvestColors.sub)
                else if (onEyeTap != null)
                  GestureDetector(
                    onTap: onEyeTap,
                    child: Icon(
                      hidden ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 20,
                      color: Colors.white,
                    ),
                  ),
              ],
            ),
            const Spacer(),
            Text(name, style: TextStyle(fontSize: 12.5, color: fgSub)),
            const SizedBox(height: 3),
            Text(
              hidden ? '₦ ••••••' : formatKobo(balanceKobo),
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.6,
                color: fg,
              ),
            ),
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(fontSize: 11.5, color: fgMute)),
          ],
        ),
      ),
    );
  }
}

class _PromoBanner extends StatelessWidget {
  const _PromoBanner.refer()
      : kicker = 'REFER & EARN',
        title = 'Get ₦5,000 per friend',
        body = 'Invite friends who invest — you both get paid.',
        icon = Icons.card_giftcard,
        gradient = InvestColors.ctaOrange;

  const _PromoBanner.reinvest()
      : kicker = 'AUTOPILOT',
        title = 'Auto-reinvest payouts',
        body = 'Compound your returns without lifting a finger.',
        icon = Icons.autorenew,
        gradient = InvestColors.cardGreen;

  const _PromoBanner.shuttle()
      : kicker = 'NEW ASSET · 38% ROI',
        title = 'City Shuttle now open',
        body = '14-seat commuter bus. Only 14 slots left.',
        icon = Icons.directions_bus_filled,
        gradient = InvestColors.card;

  final String kicker;
  final String title;
  final String body;
  final IconData icon;
  final Gradient gradient;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  kicker,
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1,
                    color: Colors.white.withValues(alpha: 0.9),
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  body,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: Colors.white.withValues(alpha: 0.85),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(icon, size: 30, color: Colors.white),
          ),
        ],
      ),
    );
  }
}
