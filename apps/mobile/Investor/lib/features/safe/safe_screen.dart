import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/wallet_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/progress_bar.dart';
import '../../shared/widgets/section_header.dart';
import '../../shared/widgets/state_views.dart';
import 'bloc/safe_cubit.dart';
import 'widgets/create_vault_sheet.dart';

/// Screen 22 — Flow Safe: locked balance card, vaults, info note.
class SafeScreen extends StatefulWidget {
  const SafeScreen({super.key});

  @override
  State<SafeScreen> createState() => _SafeScreenState();
}

class _SafeScreenState extends State<SafeScreen> {
  @override
  void initState() {
    super.initState();
    context.read<SafeCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<SafeCubit, SafeState>(
          listener: (context, state) {
            if (state is SafeLoaded && state.error != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text(state.error!),
                    backgroundColor: InvestColors.red),
              );
            }
          },
          builder: (context, state) {
            return switch (state) {
              SafeInitial() || SafeLoading() => const LoadingView(),
              SafeError(message: final m) => ErrorView(
                  message: m,
                  onRetry: () => context.read<SafeCubit>().load(),
                ),
              SafeLoaded(summary: final summary) =>
                _buildLoaded(context, summary),
            };
          },
        ),
      ),
    );
  }

  Widget _buildLoaded(BuildContext context, SafeSummary summary) {
    return RefreshIndicator(
      color: InvestColors.blue,
      onRefresh: () => context.read<SafeCubit>().load(),
      child: ListView(
        padding: const EdgeInsets.only(bottom: 16),
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(18, 10, 18, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Flow Safe',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                    color: InvestColors.text,
                  ),
                ),
                SizedBox(height: 3),
                Text(
                  'Lock payouts. Earn up to 16% p.a. Build capital.',
                  style: TextStyle(fontSize: 13, color: InvestColors.sub),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: InvestColors.cardDark,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: InvestColors.line2),
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
                          color: InvestColors.orangeSoft,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.savings_outlined,
                            size: 22, color: InvestColors.orange),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Locked in Safe',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: InvestColors.sub,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    formatKobo(summary.totalKobo, decimals: true),
                    style: const TextStyle(
                      fontSize: 34,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.6,
                      color: InvestColors.text,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: InvestColors.greenSoft,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${formatKobo(summary.interestThisQuarterKobo, sign: true)} interest',
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w800,
                            color: InvestColors.green,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'earned this quarter',
                        style:
                            TextStyle(fontSize: 11.5, color: InvestColors.mute),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: 220,
                    child: InvestButton(
                      label: 'Lock more into Safe',
                      kind: InvestButtonKind.orange,
                      small: true,
                      trailingIcon: Icons.add,
                      onPressed: () => showCreateVaultSheet(context),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 20, 18, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(title: 'Your vaults'),
                const SizedBox(height: 12),
                if (summary.vaults.isEmpty)
                  const EmptyView(
                    title: 'No vaults yet',
                    subtitle:
                        'Lock part of your wallet to start earning interest.',
                    icon: Icons.savings_outlined,
                  )
                else
                  for (final v in summary.vaults) ...[
                    _VaultCard(vault: v),
                    const SizedBox(height: 12),
                  ],
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: InvestColors.blueSoft,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.shield_outlined,
                          size: 18, color: InvestColors.blueBright),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Flow Safe holds part of your monthly payouts and pays interest on top. Locked vaults earn more; flexible vaults let you withdraw anytime.',
                          style: TextStyle(
                            fontSize: 12,
                            height: 1.5,
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
    );
  }
}

class _VaultCard extends StatelessWidget {
  const _VaultCard({required this.vault});

  final FlowSafeVault vault;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showWithdrawDialog(context),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: InvestColors.raise,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: InvestColors.line),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: InvestColors.orangeSoft,
                    borderRadius: BorderRadius.circular(11),
                  ),
                  child: const Icon(Icons.savings_outlined,
                      size: 20, color: InvestColors.orange),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        vault.name,
                        style: const TextStyle(
                          fontSize: 14.5,
                          fontWeight: FontWeight.w700,
                          color: InvestColors.text,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${formatBps(vault.interestRateBps)} p.a.',
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: InvestColors.green,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  formatKobo(vault.balanceKobo),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: InvestColors.text,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            InvestProgressBar(
              value: vault.progressPct / 100,
              gradient: InvestColors.ctaOrange,
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                vault.isFlexible
                    ? 'Withdraw anytime'
                    : 'Unlocks ${formatMonthDay(vault.unlocksAt)}',
                style: const TextStyle(fontSize: 11.5, color: InvestColors.mute),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showWithdrawDialog(BuildContext context) {
    final locked = !vault.isFlexible &&
        vault.unlocksAt != null &&
        DateTime.tryParse(vault.unlocksAt!)?.isAfter(DateTime.now()) == true;
    if (locked) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:
              Text('This vault is locked until ${formatDate(vault.unlocksAt)}.'),
        ),
      );
      return;
    }
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: InvestColors.raise,
        title: Text('Withdraw from ${vault.name}?',
            style: const TextStyle(color: InvestColors.text, fontSize: 17)),
        content: Text(
          'The full balance of ${formatKobo(vault.balanceKobo)} will move to your Main Wallet and the vault will close.',
          style: const TextStyle(color: InvestColors.sub, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: InvestColors.sub)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              context
                  .read<SafeCubit>()
                  .withdrawFromVault(vault.id, vault.balanceKobo);
            },
            child: const Text('Withdraw',
                style: TextStyle(
                    color: InvestColors.blueBright, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}
