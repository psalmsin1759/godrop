import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/profile_models.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/invest_field.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/bank_accounts_cubit.dart';

/// Screen 26 — withdrawal bank: primary bank gradient card, other accounts,
/// dashed add-new row.
class BankScreen extends StatefulWidget {
  const BankScreen({super.key});

  @override
  State<BankScreen> createState() => _BankScreenState();
}

class _BankScreenState extends State<BankScreen> {
  @override
  void initState() {
    super.initState();
    context.read<BankAccountsCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<BankAccountsCubit, BankAccountsState>(
          listener: (context, state) {
            if (state.error != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text(state.error!),
                    backgroundColor: InvestColors.red),
              );
            }
          },
          builder: (context, state) {
            final primary = state.accounts.where((a) => a.isPrimary).toList();
            final others = state.accounts.where((a) => !a.isPrimary).toList();
            return Column(
              children: [
                const InvestTopBar(title: 'Withdrawal Bank'),
                Expanded(
                  child: state.loading && state.accounts.isEmpty
                      ? const LoadingView()
                      : ListView(
                          padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
                          children: [
                            const Text(
                              'Payouts and withdrawals are sent to your saved bank accounts.',
                              style: TextStyle(
                                fontSize: 13.5,
                                height: 1.5,
                                color: InvestColors.sub,
                              ),
                            ),
                            const SizedBox(height: 18),
                            if (primary.isNotEmpty)
                              _primaryCard(primary.first),
                            for (final account in others) ...[
                              const SizedBox(height: 12),
                              _secondaryTile(context, account),
                            ],
                            const SizedBox(height: 14),
                            GestureDetector(
                              onTap: () => _showAddSheet(context),
                              child: Container(
                                height: 52,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: InvestColors.line2,
                                    width: 1.5,
                                    strokeAlign: BorderSide.strokeAlignInside,
                                  ),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.add,
                                        size: 18,
                                        color: InvestColors.blueBright),
                                    SizedBox(width: 8),
                                    Text(
                                      'Add new bank account',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: InvestColors.blueBright,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _primaryCard(InvestorBankAccount account) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: InvestColors.card,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.account_balance,
                    size: 24, color: Colors.white),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'PRIMARY',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            '•••• •••• ${account.accountNumber.substring(account.accountNumber.length - 4)}',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              letterSpacing: 2,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ACCOUNT NAME',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.white.withValues(alpha: 0.7),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    account.accountName,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'BANK',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.white.withValues(alpha: 0.7),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    account.bankName,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _secondaryTile(BuildContext context, InvestorBankAccount account) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: InvestColors.raise,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: InvestColors.line),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: InvestColors.raise3,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.account_balance,
                size: 24, color: InvestColors.sub),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${account.bankName} · ${account.accountName}',
                  style: const TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w700,
                    color: InvestColors.text,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  account.maskedNumber,
                  style:
                      const TextStyle(fontSize: 12.5, color: InvestColors.sub),
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, size: 20, color: InvestColors.sub),
            color: InvestColors.raise,
            onSelected: (v) {
              final cubit = context.read<BankAccountsCubit>();
              if (v == 'primary') cubit.setPrimary(account.id);
              if (v == 'remove') cubit.remove(account.id);
            },
            itemBuilder: (_) => const [
              PopupMenuItem(
                value: 'primary',
                child: Text('Make primary',
                    style: TextStyle(color: InvestColors.text)),
              ),
              PopupMenuItem(
                value: 'remove',
                child:
                    Text('Remove', style: TextStyle(color: InvestColors.red)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showAddSheet(BuildContext context) {
    context.read<BankAccountsCubit>().loadBanks();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: InvestColors.raise,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => BlocProvider.value(
        value: context.read<BankAccountsCubit>(),
        child: const _AddBankSheet(),
      ),
    );
  }
}

class _AddBankSheet extends StatefulWidget {
  const _AddBankSheet();

  @override
  State<_AddBankSheet> createState() => _AddBankSheetState();
}

class _AddBankSheetState extends State<_AddBankSheet> {
  final _accountNumber = TextEditingController();
  Bank? _bank;

  @override
  void dispose() {
    _accountNumber.dispose();
    super.dispose();
  }

  Future<void> _add() async {
    final bank = _bank;
    if (bank == null || _accountNumber.text.length != 10) return;
    final ok = await context.read<BankAccountsCubit>().addAccount(
          bankCode: bank.code,
          bankName: bank.name,
          accountNumber: _accountNumber.text,
        );
    if (ok && mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BankAccountsCubit, BankAccountsState>(
      builder: (context, state) {
        return Padding(
          padding: EdgeInsets.only(
            left: 22,
            right: 22,
            top: 22,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Add bank account',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.4,
                  color: InvestColors.text,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                "We'll confirm the account name with your bank.",
                style: TextStyle(fontSize: 13, color: InvestColors.sub),
              ),
              const SizedBox(height: 20),
              const Text(
                'Bank',
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: InvestColors.sub,
                ),
              ),
              const SizedBox(height: 7),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: InvestColors.raise2,
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(color: InvestColors.line),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<Bank>(
                    value: _bank,
                    isExpanded: true,
                    hint: const Text('Select bank',
                        style: TextStyle(
                            fontSize: 15, color: InvestColors.mute)),
                    dropdownColor: InvestColors.raise,
                    items: state.banks
                        .map((b) => DropdownMenuItem(
                              value: b,
                              child: Text(b.name,
                                  style: const TextStyle(
                                      fontSize: 15,
                                      color: InvestColors.text)),
                            ))
                        .toList(),
                    onChanged: (b) => setState(() => _bank = b),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              InvestField(
                label: 'Account number',
                controller: _accountNumber,
                hint: '0123454290',
                icon: Icons.tag,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 8),
              InvestButton(
                label: 'Save bank account',
                loading: state.submitting,
                onPressed: state.submitting ? null : _add,
              ),
            ],
          ),
        );
      },
    );
  }
}
