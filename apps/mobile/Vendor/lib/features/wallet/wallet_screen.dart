import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/wallet_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/section_header.dart';
import '../profile/bloc/session_cubit.dart';
import 'bloc/wallet_cubit.dart';
import 'bloc/wallet_state.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    final cubit = context.read<WalletCubit>();
    if (cubit.state is WalletInitial) cubit.load();
  }

  Future<void> _openWithdrawSheet(
      BuildContext ctx, WalletLoaded loaded) async {
    if (loaded.bankAccount == null) {
      final go = await showDialog<bool>(
        context: ctx,
        builder: (dCtx) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Add a bank account'),
          content: const Text(
              'You need a payout bank account on file before you can withdraw.'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(dCtx, false),
                child: const Text('Later')),
            TextButton(
                onPressed: () => Navigator.pop(dCtx, true),
                child: const Text('Add account')),
          ],
        ),
      );
      if (go == true && ctx.mounted) ctx.push('/wallet/bank-account');
      return;
    }

    final amountCtrl = TextEditingController();
    final amount = await showModalBottomSheet<double>(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: GodropColors.card,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) => Padding(
        padding: EdgeInsets.fromLTRB(
            20, 20, 20, MediaQuery.of(sheetCtx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Withdraw to bank',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink)),
            const SizedBox(height: 4),
            Text(
              '${loaded.bankAccount!.bankName} · ${loaded.bankAccount!.accountNumber}\n${loaded.bankAccount!.accountName}',
              style:
                  const TextStyle(fontSize: 13, color: GodropColors.slate),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: amountCtrl,
              autofocus: true,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[\d.]')),
              ],
              style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink),
              decoration: InputDecoration(
                prefixText: '₦ ',
                hintText: '0.00',
                helperText:
                    'Available: ${formatNaira(loaded.balance)} · minimum ₦100',
                filled: true,
                fillColor: GodropColors.background,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            GodropButton(
              label: 'Withdraw',
              onTap: () {
                final v = double.tryParse(amountCtrl.text);
                if (v == null || v < 100 || v > loaded.balance) return;
                Navigator.of(sheetCtx).pop(v);
              },
            ),
          ],
        ),
      ),
    );
    if (amount == null || !ctx.mounted) return;
    final err = await ctx.read<WalletCubit>().withdraw(amount);
    if (!ctx.mounted) return;
    ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
      content: Text(err ??
          '${formatNaira(amount)} is on its way to your bank account.'),
      backgroundColor:
          err == null ? GodropColors.success : Colors.red.shade700,
      behavior: SnackBarBehavior.floating,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final isOwner = context.watch<SessionCubit>().isOwner;
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: const Text('Wallet'),
        automaticallyImplyLeading: false,
        backgroundColor: GodropColors.background,
      ),
      body: BlocBuilder<WalletCubit, WalletState>(
        builder: (ctx, state) {
          if (state is WalletLoading || state is WalletInitial) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is WalletError) {
            return EmptyState(
              icon: Icons.cloud_off_rounded,
              title: 'Could not load wallet',
              subtitle: state.message,
              actionLabel: 'Retry',
              onAction: () => ctx.read<WalletCubit>().load(),
            );
          }
          final loaded = state as WalletLoaded;
          return RefreshIndicator(
            onRefresh: () => ctx.read<WalletCubit>().load(silent: true),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 96),
              children: [
                _BalanceCard(
                  loaded: loaded,
                  isOwner: isOwner,
                  onWithdraw: () => _openWithdrawSheet(ctx, loaded),
                ),
                const SizedBox(height: 16),
                _BankAccountCard(account: loaded.bankAccount, isOwner: isOwner),
                const SizedBox(height: 24),
                const GodropSectionHeader(title: 'Transactions'),
                const SizedBox(height: 12),
                if (loaded.transactions.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: GodropColors.card,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: GodropColors.softShadow,
                    ),
                    child: const Text(
                      'No transactions yet. Earnings from delivered orders land here.',
                      style:
                          TextStyle(fontSize: 13, color: GodropColors.slate),
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 4),
                    decoration: BoxDecoration(
                      color: GodropColors.card,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: GodropColors.softShadow,
                    ),
                    child: Column(
                      children: [
                        for (var i = 0; i < loaded.transactions.length; i++) ...[
                          if (i > 0) const Divider(height: 1),
                          _TxRow(tx: loaded.transactions[i]),
                        ],
                      ],
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _BalanceCard extends StatelessWidget {
  final WalletLoaded loaded;
  final bool isOwner;
  final VoidCallback onWithdraw;

  const _BalanceCard({
    required this.loaded,
    required this.isOwner,
    required this.onWithdraw,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: GodropColors.blueGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: GodropColors.blue.withValues(alpha: 0.30),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Available balance',
              style: TextStyle(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.75))),
          const SizedBox(height: 6),
          Text(formatNaira(loaded.balance),
              style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.white,
                  letterSpacing: -0.6)),
          const SizedBox(height: 16),
          if (isOwner)
            GodropButton(
              label: loaded.withdrawing ? 'Processing...' : 'Withdraw',
              color: GodropColors.white,
              textColor: GodropColors.blue,
              height: 48,
              onTap: loaded.withdrawing ? null : onWithdraw,
            )
          else
            Text('Only the owner can withdraw funds',
                style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withValues(alpha: 0.65))),
        ],
      ),
    );
  }
}

class _BankAccountCard extends StatelessWidget {
  final BankAccount? account;
  final bool isOwner;
  const _BankAccountCard({required this.account, required this.isOwner});

  @override
  Widget build(BuildContext context) {
    // Managers can see the payout account; only the owner can change it
    // (enforced server-side too).
    return GestureDetector(
      onTap: isOwner ? () => context.push('/wallet/bank-account') : null,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.circular(18),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: GodropColors.orange.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(13),
              ),
              child: const Icon(Icons.account_balance_rounded,
                  color: GodropColors.orange, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    account == null
                        ? 'Add payout bank account'
                        : account!.bankName,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink),
                  ),
                  Text(
                    account == null
                        ? 'Needed before you can withdraw'
                        : '${account!.accountNumber} · ${account!.accountName}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.mute),
                  ),
                ],
              ),
            ),
            if (isOwner)
              const Icon(Icons.chevron_right_rounded,
                  color: GodropColors.mute),
          ],
        ),
      ),
    );
  }
}

class _TxRow extends StatelessWidget {
  final VendorWalletTx tx;
  const _TxRow({required this.tx});

  @override
  Widget build(BuildContext context) {
    final credit = tx.isCredit;
    final color = credit ? GodropColors.success : GodropColors.error;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              credit
                  ? Icons.arrow_downward_rounded
                  : Icons.arrow_upward_rounded,
              color: color,
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.description ?? (credit ? 'Credit' : 'Withdrawal'),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: GodropColors.ink),
                ),
                Text(formatDateTime(tx.createdAt),
                    style: const TextStyle(
                        fontSize: 11, color: GodropColors.mute)),
              ],
            ),
          ),
          Text('${credit ? '+' : '-'}${formatNaira(tx.amount)}',
              style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.w700, color: color)),
        ],
      ),
    );
  }
}
