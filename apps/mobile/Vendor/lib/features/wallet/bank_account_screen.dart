import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/wallet_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import 'bloc/bank_setup_cubit.dart';
import 'bloc/wallet_cubit.dart';

class BankAccountScreen extends StatelessWidget {
  const BankAccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => BankSetupCubit()..loadBanks(),
      child: const _BankAccountView(),
    );
  }
}

class _BankAccountView extends StatefulWidget {
  const _BankAccountView();

  @override
  State<_BankAccountView> createState() => _BankAccountViewState();
}

class _BankAccountViewState extends State<_BankAccountView> {
  final _accountCtrl = TextEditingController();

  @override
  void dispose() {
    _accountCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickBank(BuildContext ctx, BankSetupState state) async {
    final searchCtrl = TextEditingController();
    final cubit = ctx.read<BankSetupCubit>();
    final bank = await showModalBottomSheet<Bank>(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: GodropColors.card,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sheetCtx, setSheetState) {
          final q = searchCtrl.text.trim().toLowerCase();
          final banks = q.isEmpty
              ? state.banks
              : state.banks
                  .where((b) => b.name.toLowerCase().contains(q))
                  .toList();
          return SizedBox(
            height: MediaQuery.of(sheetCtx).size.height * 0.75,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                  child: TextField(
                    controller: searchCtrl,
                    onChanged: (_) => setSheetState(() {}),
                    decoration: InputDecoration(
                      hintText: 'Search banks',
                      prefixIcon: const Icon(Icons.search_rounded,
                          color: GodropColors.mute),
                      filled: true,
                      fillColor: GodropColors.background,
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none),
                    ),
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: banks.length,
                    itemBuilder: (_, i) => ListTile(
                      title: Text(banks[i].name,
                          style: const TextStyle(
                              fontSize: 14, color: GodropColors.ink)),
                      onTap: () => Navigator.of(sheetCtx).pop(banks[i]),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
    if (bank != null) cubit.selectBank(bank);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Payout account'),
          backgroundColor: GodropColors.background),
      body: BlocBuilder<BankSetupCubit, BankSetupState>(
        builder: (ctx, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Withdrawals are paid into this account. The account name must match your registered business.',
                  style: TextStyle(
                      fontSize: 13, color: GodropColors.slate, height: 1.5),
                ),
                const SizedBox(height: 24),
                const Text('Bank',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.slate)),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: state.loadingBanks
                      ? null
                      : () => _pickBank(ctx, state),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      color: GodropColors.card,
                      border:
                          Border.all(color: GodropColors.border, width: 1.5),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            state.loadingBanks
                                ? 'Loading banks...'
                                : state.selectedBank?.name ?? 'Select bank',
                            style: TextStyle(
                              fontSize: 15,
                              color: state.selectedBank == null
                                  ? GodropColors.mute
                                  : GodropColors.ink,
                            ),
                          ),
                        ),
                        const Icon(Icons.expand_more_rounded,
                            color: GodropColors.mute),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                GodropField(
                  controller: _accountCtrl,
                  label: 'Account number',
                  hint: '10-digit account number',
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  onChanged: (v) {
                    ctx.read<BankSetupCubit>().accountNumberChanged();
                    if (v.length == 10) {
                      ctx.read<BankSetupCubit>().resolve(v);
                    }
                  },
                ),
                const SizedBox(height: 16),
                if (state.resolving)
                  const Row(
                    children: [
                      SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2)),
                      SizedBox(width: 10),
                      Text('Verifying account...',
                          style: TextStyle(
                              fontSize: 13, color: GodropColors.slate)),
                    ],
                  )
                else if (state.resolvedName != null)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: GodropColors.success.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.verified_rounded,
                            color: GodropColors.success, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(state.resolvedName!,
                              style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: GodropColors.ink)),
                        ),
                      ],
                    ),
                  )
                else if (state.error != null)
                  Text(state.error!,
                      style: const TextStyle(
                          fontSize: 13, color: GodropColors.error)),
                const SizedBox(height: 28),
                GodropButton(
                  label: state.saving ? 'Saving...' : 'Save account',
                  onTap: state.saving || state.resolvedName == null
                      ? null
                      : () async {
                          final err = await ctx
                              .read<BankSetupCubit>()
                              .save(_accountCtrl.text);
                          if (!ctx.mounted) return;
                          if (err != null) {
                            ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
                              content: Text(err),
                              backgroundColor: Colors.red.shade700,
                              behavior: SnackBarBehavior.floating,
                            ));
                          } else {
                            ctx.read<WalletCubit>().load(silent: true);
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              const SnackBar(
                                content: Text('Payout account saved'),
                                backgroundColor: GodropColors.success,
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                            ctx.pop();
                          }
                        },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
