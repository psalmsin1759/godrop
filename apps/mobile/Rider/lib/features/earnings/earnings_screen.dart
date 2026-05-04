import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/animated_entrance.dart';
import 'bloc/earnings_cubit.dart';
import 'bloc/earnings_state.dart';

String _fmt(int kobo) {
  final naira = kobo / 100;
  return '₦${naira.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')}';
}

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    context.read<EarningsCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: SafeArea(
        child: BlocConsumer<EarningsCubit, EarningsState>(
          listener: (ctx, state) {
            if (state is WithdrawalSuccess) {
              ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
                content: Text('Withdrawal request submitted!'),
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
            if (state is EarningsLoading) return _shimmer();
            if (state is EarningsError) return _error(ctx, state.message);

            final loaded = state is EarningsLoaded
                ? state
                : state is WithdrawalSubmitting
                    ? state.loaded
                    : state is WithdrawalSuccess
                        ? state.loaded
                        : null;

            if (loaded == null) return const SizedBox.shrink();

            final submitting = state is WithdrawalSubmitting;
            return _buildContent(ctx, loaded, submitting);
          },
        ),
      ),
    );
  }

  Widget _buildContent(
      BuildContext ctx, EarningsLoaded state, bool submitting) {
    return RefreshIndicator(
      onRefresh: () => ctx.read<EarningsCubit>().load(),
      color: GodropColors.blue,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AnimatedEntrance(
            child: _summaryCard(ctx, state, submitting),
          ),
          const SizedBox(height: 20),
          AnimatedEntrance(
            delay: const Duration(milliseconds: 80),
            child: _statsRow(state.summary),
          ),
          const SizedBox(height: 20),
          if (state.withdrawals.isNotEmpty) ...[
            AnimatedEntrance(
              delay: const Duration(milliseconds: 120),
              child: _section('Withdrawal History'),
            ),
            const SizedBox(height: 10),
            ...state.withdrawals.asMap().entries.map((e) => AnimatedEntrance(
                  delay: Duration(milliseconds: 140 + e.key * 40),
                  child: _WithdrawalCard(w: e.value),
                )),
            const SizedBox(height: 20),
          ],
          if (state.earnings.isNotEmpty) ...[
            AnimatedEntrance(
              delay: const Duration(milliseconds: 160),
              child: _section('Earnings Breakdown'),
            ),
            const SizedBox(height: 10),
            ...state.earnings.asMap().entries.map((e) => AnimatedEntrance(
                  delay: Duration(milliseconds: 180 + e.key * 30),
                  child: _EarningCard(earning: e.value),
                )),
          ],
        ],
      ),
    );
  }

  Widget _summaryCard(
      BuildContext ctx, EarningsLoaded state, bool submitting) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: GodropColors.blueGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'Pending Balance',
                style: TextStyle(color: GodropColors.white, fontSize: 13),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => ctx.read<EarningsCubit>().load(),
                child: const Icon(Icons.refresh_rounded,
                    color: GodropColors.white, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _fmt(state.summary.pendingBalanceKobo),
            style: const TextStyle(
              color: GodropColors.white,
              fontSize: 40,
              fontWeight: FontWeight.w700,
              letterSpacing: -1.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Lifetime: ${_fmt(state.summary.totalKobo)} · ${state.summary.deliveryCount} deliveries',
            style: TextStyle(
                color: GodropColors.white.withOpacity(0.7), fontSize: 12),
          ),
          const SizedBox(height: 20),
          GodropButton(
            label: submitting ? 'Processing...' : 'Withdraw Earnings',
            gradientColors: [GodropColors.orange, const Color(0xFFE05500)],
            onTap: (state.summary.pendingBalanceKobo < 10000 || submitting)
                ? null
                : () => _showWithdrawDialog(ctx, state.summary.pendingBalanceKobo),
            isLoading: submitting,
          ),
          if (state.summary.pendingBalanceKobo < 10000) ...[
            const SizedBox(height: 8),
            Center(
              child: Text(
                'Minimum withdrawal is ₦100',
                style: TextStyle(
                    color: GodropColors.white.withOpacity(0.6), fontSize: 12),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _statsRow(RiderEarningsSummary s) {
    return Row(
      children: [
        Expanded(child: _statBox('Today', _fmt(s.todayKobo))),
        const SizedBox(width: 10),
        Expanded(child: _statBox('This Week', _fmt(s.thisWeekKobo))),
        const SizedBox(width: 10),
        Expanded(child: _statBox('This Month', _fmt(s.thisMonthKobo))),
      ],
    );
  }

  Widget _statBox(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
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

  Widget _section(String title) => Text(
        title,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: GodropColors.ink,
        ),
      );

  void _showWithdrawDialog(BuildContext ctx, int maxKobo) {
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
            Text('Available: ${_fmt(maxKobo)}',
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
                    int.tryParse(controller.text.replaceAll(',', ''));
                if (amount == null || amount < 100) return;
                Navigator.pop(bctx);
                ctx.read<EarningsCubit>().requestWithdrawal(amount * 100);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _error(BuildContext ctx, String message) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, color: GodropColors.mute, size: 40),
          const SizedBox(height: 12),
          Text(message,
              style: const TextStyle(color: GodropColors.slate, fontSize: 14)),
          const SizedBox(height: 16),
          TextButton(
              onPressed: () => ctx.read<EarningsCubit>().load(),
              child: const Text('Retry')),
        ],
      ),
    );
  }

  Widget _shimmer() {
    return Shimmer.fromColors(
      baseColor: GodropColors.border,
      highlightColor: GodropColors.white,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
              height: 200,
              decoration: BoxDecoration(
                  color: GodropColors.white,
                  borderRadius: BorderRadius.circular(20))),
          const SizedBox(height: 16),
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
      'COMPLETED' => (GodropColors.success, GodropColors.success.withOpacity(0.1)),
      'PENDING' || 'PROCESSING' => (GodropColors.orange, GodropColors.orange.withOpacity(0.1)),
      _ => (GodropColors.error, GodropColors.error.withOpacity(0.1)),
    };
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
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
              Text(_fmt(w.amountKobo),
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
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: GodropColors.orange.withOpacity(0.1),
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
                _fmt(earning.amountKobo),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.orange,
                ),
              ),
              Text(
                earning.status,
                style: const TextStyle(fontSize: 11, color: GodropColors.mute),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
