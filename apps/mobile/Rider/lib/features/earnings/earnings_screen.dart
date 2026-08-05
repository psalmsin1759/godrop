import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../profile/bloc/profile_cubit.dart';
import '../profile/bloc/profile_state.dart';
import 'bloc/earnings_cubit.dart';
import 'bloc/earnings_state.dart';

(String, String) _splitNaira(double naira) {
  final str = naira.toStringAsFixed(2);
  final parts = str.split('.');
  final intPart = parts[0]
      .replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',');
  return (intPart, parts[1]);
}

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen>
    with AutomaticKeepAliveClientMixin, SingleTickerProviderStateMixin {
  @override
  bool get wantKeepAlive => true;

  bool _hideBalance = false;
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<EarningsCubit>().load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: BlocConsumer<EarningsCubit, EarningsState>(
        listener: (ctx, state) {
          if (state is WithdrawalSuccess) {
            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
              content: Text('Withdrawal initiated!'),
              backgroundColor: GodropColors.success,
              behavior: SnackBarBehavior.floating,
            ));
          } else if (state is EarningsError) {
            ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
              content: Text(state.message),
              backgroundColor: GodropColors.error,
              behavior: SnackBarBehavior.floating,
            ));
          }
        },
        builder: (ctx, state) {
          final loaded = switch (state) {
            EarningsLoaded s => s,
            WithdrawalSubmitting s => s.loaded,
            WithdrawalSuccess s => s.loaded,
            EarningsError s => s.loaded,
            _ => null,
          };
          final loading = state is EarningsLoading;
          final submitting = state is WithdrawalSubmitting;
          final errorMessage = state is EarningsError ? state.message : null;

          return Column(
            children: [
              _buildHeader(ctx, loaded, loading, submitting),
              _buildTabBar(),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildBreakdownTab(ctx, loaded, loading, errorMessage),
                    _buildWithdrawalsTab(ctx, loaded, loading, errorMessage),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          gradient: GodropColors.blueGradient,
          borderRadius: BorderRadius.circular(10),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: GodropColors.white,
        unselectedLabelColor: GodropColors.slate,
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        tabs: const [
          Tab(text: 'Earnings breakdown'),
          Tab(text: 'Withdrawal history'),
        ],
      ),
    );
  }

  Widget _refreshableTab(BuildContext ctx, Widget child) {
    return RefreshIndicator(
      onRefresh: () => ctx.read<EarningsCubit>().load(),
      color: GodropColors.blue,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        children: [child],
      ),
    );
  }

  Widget _buildBreakdownTab(BuildContext ctx, EarningsLoaded? loaded,
      bool loading, String? errorMessage) {
    if (loaded == null) {
      return _refreshableTab(
          ctx,
          loading
              ? _bodyShimmer()
              : _error(ctx, errorMessage ?? 'Something went wrong'));
    }
    return _refreshableTab(
      ctx,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AnimatedEntrance(child: _statsRow(loaded.summary)),
          const SizedBox(height: 20),
          if (loaded.earnings.isEmpty)
            const _EmptyEarnings()
          else
            ...loaded.earnings.asMap().entries.map((e) => AnimatedEntrance(
                  delay: Duration(milliseconds: e.key * 30),
                  child: _EarningCard(earning: e.value),
                )),
        ],
      ),
    );
  }

  Widget _buildWithdrawalsTab(BuildContext ctx, EarningsLoaded? loaded,
      bool loading, String? errorMessage) {
    if (loaded == null) {
      return _refreshableTab(
          ctx,
          loading
              ? _bodyShimmer()
              : _error(ctx, errorMessage ?? 'Something went wrong'));
    }
    return _refreshableTab(
      ctx,
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: loaded.withdrawals.isEmpty
            ? const [_EmptyWithdrawals()]
            : loaded.withdrawals
                .asMap()
                .entries
                .map((e) => AnimatedEntrance(
                      delay: Duration(milliseconds: e.key * 40),
                      child: _WithdrawalCard(w: e.value),
                    ))
                .toList(),
      ),
    );
  }

  Widget _buildHeader(BuildContext ctx, EarningsLoaded? loaded, bool loading,
      bool submitting) {
    final pendingBalance = loaded?.summary.pendingBalance ?? 0;
    final (intPart, decPart) = _splitNaira(pendingBalance);
    final canWithdraw = !loading && !submitting && pendingBalance >= 100;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
          20, MediaQuery.of(ctx).padding.top + 16, 20, 32),
      decoration: const BoxDecoration(
        gradient: GodropColors.blueGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.account_balance_wallet_rounded,
                    color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text('Earnings',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w700)),
              ),
              GestureDetector(
                onTap: () => ctx.read<EarningsCubit>().load(),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.14),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.refresh_rounded,
                      color: Colors.white, size: 18),
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),
          AnimatedEntrance(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'PENDING BALANCE',
                        style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.65),
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1),
                      ),
                      const Spacer(),
                      if (!loading)
                        GestureDetector(
                          onTap: () =>
                              setState(() => _hideBalance = !_hideBalance),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.1),
                                shape: BoxShape.circle),
                            child: Icon(
                              _hideBalance
                                  ? Icons.visibility_off_rounded
                                  : Icons.visibility_rounded,
                              color: Colors.white.withValues(alpha: 0.8),
                              size: 16,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  loading
                      ? Shimmer.fromColors(
                          baseColor: Colors.white.withValues(alpha: 0.15),
                          highlightColor: Colors.white.withValues(alpha: 0.35),
                          child: Container(
                            width: 150,
                            height: 38,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        )
                      : _hideBalance
                          ? const Text(
                              '₦ • • • • • •',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 32,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 2),
                            )
                          : Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                const Padding(
                                  padding: EdgeInsets.only(bottom: 5),
                                  child: Text('₦',
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 24,
                                          fontWeight: FontWeight.w500)),
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  intPart,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 40,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: -1),
                                ),
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 5),
                                  child: Text(
                                    '.$decPart',
                                    style: TextStyle(
                                        color: Colors.white.withValues(alpha: 0.6),
                                        fontSize: 20,
                                        fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                  const SizedBox(height: 4),
                  Text(
                    loaded == null
                        ? ' '
                        : 'Lifetime: ${formatNaira(loaded.summary.total, decimals: 0)} · ${loaded.summary.deliveryCount} deliveries',
                    style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7), fontSize: 12),
                  ),
                  const SizedBox(height: 20),
                  GodropButton(
                    label: submitting ? 'Processing…' : 'Withdraw Earnings',
                    onTap: canWithdraw
                        ? () => _onWithdrawTap(ctx, pendingBalance)
                        : null,
                    gradientColors: const [Colors.white, Colors.white],
                    textColor: GodropColors.blue,
                    icon: Icons.north_east_rounded,
                    isLoading: submitting,
                  ),
                  if (!loading && pendingBalance < 100) ...[
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        'Minimum withdrawal is ₦100',
                        style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.6),
                            fontSize: 12),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statsRow(RiderEarningsSummary s) {
    return Row(
      children: [
        Expanded(child: _statBox('Today', formatNaira(s.today, decimals: 0))),
        const SizedBox(width: 10),
        Expanded(child: _statBox('This Week', formatNaira(s.thisWeek, decimals: 0))),
        const SizedBox(width: 10),
        Expanded(child: _statBox('This Month', formatNaira(s.thisMonth, decimals: 0))),
      ],
    );
  }

  Widget _statBox(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          Text(value,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: GodropColors.orange,
              )),
          const SizedBox(height: 2),
          Text(label,
              style: const TextStyle(fontSize: 11, color: GodropColors.mute)),
        ],
      ),
    );
  }

  void _onWithdrawTap(BuildContext ctx, double max) {
    final profileState = ctx.read<ProfileCubit>().state;
    final profile = profileState is ProfileLoaded ? profileState.profile : null;
    final hasBankAccount = profile?.bankCode != null &&
        profile?.accountNumber != null &&
        profile?.accountName != null;

    if (!hasBankAccount) {
      _showNoBankAccountSheet(ctx);
      return;
    }
    _showWithdrawDialog(ctx, max);
  }

  void _showNoBankAccountSheet(BuildContext ctx) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: GodropColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bctx) => Padding(
        padding: EdgeInsets.fromLTRB(
            24, 24, 24, MediaQuery.of(bctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: GodropColors.blue.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.account_balance_rounded,
                  color: GodropColors.blue, size: 22),
            ),
            const SizedBox(height: 14),
            const Text('Add a bank account',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink)),
            const SizedBox(height: 6),
            const Text(
              'You need to add a bank account before you can withdraw your earnings.',
              style: TextStyle(fontSize: 13, color: GodropColors.slate),
            ),
            const SizedBox(height: 20),
            GodropButton(
              label: 'Add Bank Account',
              onTap: () {
                Navigator.pop(bctx);
                ctx.push('/profile/bank');
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showWithdrawDialog(BuildContext ctx, double max) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: GodropColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bctx) => Padding(
        padding: EdgeInsets.fromLTRB(
            24, 24, 24, MediaQuery.of(bctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Request Withdrawal',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink)),
            const SizedBox(height: 4),
            Text('Available: ${formatNaira(max, decimals: 0)}',
                style: const TextStyle(
                    fontSize: 13, color: GodropColors.slate)),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: 'Amount in Naira (min ₦100)',
                prefixText: '₦ ',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: GodropColors.border),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
            const SizedBox(height: 20),
            GodropButton(
              label: 'Confirm Withdrawal',
              onTap: () {
                final amount =
                    double.tryParse(controller.text.replaceAll(',', ''));
                if (amount == null || amount < 100) return;
                Navigator.pop(bctx);
                ctx.read<EarningsCubit>().requestWithdrawal(amount);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _error(BuildContext ctx, String message) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: GodropColors.mute, size: 40),
            const SizedBox(height: 12),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: GodropColors.slate, fontSize: 14)),
            const SizedBox(height: 16),
            TextButton(
                onPressed: () => ctx.read<EarningsCubit>().load(),
                child: const Text('Retry')),
          ],
        ),
      ),
    );
  }

  Widget _bodyShimmer() {
    return Shimmer.fromColors(
      baseColor: GodropColors.border,
      highlightColor: GodropColors.white,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 22, 16, 16),
        child: Column(
          children: [
            Row(
              children: List.generate(
                3,
                (_) => Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    height: 72,
                    decoration: BoxDecoration(
                        color: GodropColors.white,
                        borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            ...List.generate(
              4,
              (_) => Container(
                margin: const EdgeInsets.only(bottom: 10),
                height: 68,
                decoration: BoxDecoration(
                    color: GodropColors.white,
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyEarnings extends StatelessWidget {
  const _EmptyEarnings();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 44),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
                color: GodropColors.orange.withValues(alpha: 0.08),
                shape: BoxShape.circle),
            child: const Icon(Icons.local_shipping_outlined,
                color: GodropColors.orange, size: 28),
          ),
          const SizedBox(height: 14),
          const Text('No earnings yet',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink)),
          const SizedBox(height: 4),
          const Text('Complete deliveries to start earning',
              style: TextStyle(fontSize: 12, color: GodropColors.mute)),
        ],
      ),
    );
  }
}

class _EmptyWithdrawals extends StatelessWidget {
  const _EmptyWithdrawals();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 44),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
                color: GodropColors.blue.withValues(alpha: 0.08),
                shape: BoxShape.circle),
            child: const Icon(Icons.north_rounded,
                color: GodropColors.blue, size: 28),
          ),
          const SizedBox(height: 14),
          const Text('No withdrawals yet',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink)),
          const SizedBox(height: 4),
          const Text('Your withdrawal requests will appear here',
              style: TextStyle(fontSize: 12, color: GodropColors.mute)),
        ],
      ),
    );
  }
}

class _WithdrawalCard extends StatelessWidget {
  final RiderWithdrawal w;
  const _WithdrawalCard({required this.w});

  @override
  Widget build(BuildContext context) {
    final (color, bg) = switch (w.status) {
      'COMPLETED' => (GodropColors.success, GodropColors.success.withValues(alpha: 0.1)),
      'PENDING' || 'PROCESSING' => (GodropColors.orange, GodropColors.orange.withValues(alpha: 0.1)),
      _ => (GodropColors.error, GodropColors.error.withValues(alpha: 0.1)),
    };
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
            child: Icon(Icons.north_rounded, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${w.bankName} · ${w.accountNumber}',
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: GodropColors.ink)),
                Text(w.accountName,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.mute)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(formatNaira(w.amount, decimals: 0),
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink)),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                    color: bg, borderRadius: BorderRadius.circular(4)),
                child: Text(w.status,
                    style: TextStyle(
                        fontSize: 10, color: color, fontWeight: FontWeight.w500)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EarningCard extends StatelessWidget {
  final RiderEarning earning;
  const _EarningCard({required this.earning});

  @override
  Widget build(BuildContext context) {
    final deliveryFee = earning.deliveryFee;
    final platformCut = earning.platformCut;
    final riderShare = earning.riderSharePercent;
    final hasBreakdown = deliveryFee != null && deliveryFee > 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: GodropColors.orange.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.local_shipping_rounded,
                    color: GodropColors.orange, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      earning.order?.trackingCode ?? 'Delivery',
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: GodropColors.ink),
                    ),
                    if (earning.order != null)
                      Text(
                        earning.order!.dropoffAddress,
                        style: const TextStyle(
                            fontSize: 12, color: GodropColors.mute),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    formatNaira(earning.amount, decimals: 0),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.orange,
                    ),
                  ),
                  Text(
                    earning.status,
                    style:
                        const TextStyle(fontSize: 11, color: GodropColors.mute),
                  ),
                ],
              ),
            ],
          ),
          if (hasBreakdown) ...[
            const SizedBox(height: 12),
            const Divider(height: 1, color: GodropColors.border),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _breakdownStat(
                    'Delivery fee',
                    formatNaira(deliveryFee, decimals: 0),
                  ),
                ),
                Expanded(
                  child: _breakdownStat(
                    'Godrop${riderShare != null ? ' (${100 - riderShare}%)' : ''}',
                    formatNaira(platformCut ?? 0, decimals: 0),
                  ),
                ),
                Expanded(
                  child: _breakdownStat(
                    'Your wallet${riderShare != null ? ' ($riderShare%)' : ''}',
                    formatNaira(earning.amount, decimals: 0),
                    highlight: true,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _breakdownStat(String label, String value, {bool highlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: GodropColors.mute),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: highlight ? GodropColors.success : GodropColors.ink,
          ),
        ),
      ],
    );
  }
}
