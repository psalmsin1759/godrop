import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/bank_account_cubit.dart';
import 'bloc/bank_account_state.dart';
import 'bloc/profile_cubit.dart';
import 'bloc/profile_state.dart';

class BankScreen extends StatelessWidget {
  const BankScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => BankAccountCubit()..loadBanks(),
      child: const _BankScreenBody(),
    );
  }
}

class _BankScreenBody extends StatefulWidget {
  const _BankScreenBody();

  @override
  State<_BankScreenBody> createState() => _BankScreenBodyState();
}

class _BankScreenBodyState extends State<_BankScreenBody> {
  final _formKey = GlobalKey<FormState>();
  final _accountNumber = TextEditingController();

  Bank? _selectedBank;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    final state = context.read<ProfileCubit>().state;
    if (state is ProfileLoaded) {
      _accountNumber.text = state.profile.accountNumber ?? '';
      if (state.profile.bankCode != null && state.profile.bankName != null) {
        _selectedBank = Bank(
          name: state.profile.bankName!,
          code: state.profile.bankCode!,
          slug: '',
        );
      }
    }
    _accountNumber.addListener(_onAccountNumberChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _accountNumber.removeListener(_onAccountNumberChanged);
    _accountNumber.dispose();
    super.dispose();
  }

  void _onAccountNumberChanged() {
    context.read<BankAccountCubit>().clearResolution();
    _debounce?.cancel();
    if (_selectedBank == null || _accountNumber.text.length != 10) return;
    _debounce = Timer(const Duration(milliseconds: 500), () {
      context.read<BankAccountCubit>().resolveAccount(
            accountNumber: _accountNumber.text,
            bankCode: _selectedBank!.code,
          );
    });
  }

  void _onBankSelected(Bank bank) {
    setState(() => _selectedBank = bank);
    context.read<BankAccountCubit>().clearResolution();
    if (_accountNumber.text.length == 10) {
      _debounce?.cancel();
      context.read<BankAccountCubit>().resolveAccount(
            accountNumber: _accountNumber.text,
            bankCode: bank.code,
          );
    }
  }

  void _showBankPicker(List<Bank> banks) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: GodropColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _BankPickerSheet(banks: banks, onSelect: _onBankSelected),
    );
  }

  void _save(String? resolvedAccountName) {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedBank == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please select a bank'),
        backgroundColor: GodropColors.error,
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    if (resolvedAccountName == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Please wait for account verification'),
        backgroundColor: GodropColors.error,
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    context.read<ProfileCubit>().updateBankAccount(
          bankName: _selectedBank!.name,
          bankCode: _selectedBank!.code,
          accountNumber: _accountNumber.text,
          accountName: resolvedAccountName,
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ProfileCubit, ProfileState>(
      listener: (ctx, state) {
        if (state is ProfileLoaded) {
          ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
            content: Text('Bank account updated!'),
            backgroundColor: GodropColors.success,
            behavior: SnackBarBehavior.floating,
          ));
          ctx.pop();
        } else if (state is ProfileError) {
          ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
            content: Text(state.message),
            backgroundColor: GodropColors.error,
            behavior: SnackBarBehavior.floating,
          ));
        }
      },
      builder: (ctx, profileState) {
        final saving = profileState is ProfileSaving;
        return Scaffold(
          backgroundColor: GodropColors.background,
          appBar: AppBar(
            title: const Text('Bank Account'),
            leading: GestureDetector(
              onTap: () => ctx.pop(),
              child: const Icon(Icons.chevron_left_rounded, size: 26),
            ),
          ),
          body: BlocBuilder<BankAccountCubit, BankAccountState>(
            builder: (bctx, bankState) {
              final banks = bankState is BankAccountLoaded ? bankState.banks : <Bank>[];
              final resolving = bankState is BankAccountLoaded && bankState.resolving;
              final resolvedAccountName =
                  bankState is BankAccountLoaded ? bankState.resolvedAccountName : null;
              final resolveError =
                  bankState is BankAccountLoaded ? bankState.resolveError : null;
              final banksLoading = bankState is BankAccountLoading;

              return Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: GodropColors.blue.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline_rounded,
                              color: GodropColors.blue, size: 18),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'This account will be used for earnings withdrawals.',
                              style: TextStyle(
                                  fontSize: 13, color: GodropColors.slate),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: GodropColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: GodropColors.border),
                        boxShadow: GodropColors.softShadow,
                      ),
                      child: Column(
                        children: [
                          _bankPickerField(banks, banksLoading),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _accountNumber,
                            maxLength: 10,
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                            ],
                            decoration: InputDecoration(
                              labelText: 'Account Number',
                              hintText: '0123456789',
                              counterText: '',
                              suffixIcon: resolving
                                  ? const Padding(
                                      padding: EdgeInsets.all(14),
                                      child: SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: GodropColors.blue),
                                      ),
                                    )
                                  : resolvedAccountName != null
                                      ? const Icon(Icons.check_circle_rounded,
                                          color: GodropColors.success)
                                      : null,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide:
                                    const BorderSide(color: GodropColors.border),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 14),
                            ),
                            validator: (v) => (v == null || v.length != 10)
                                ? 'Enter a valid 10-digit account number'
                                : null,
                          ),
                          if (resolveError != null) ...[
                            const SizedBox(height: 8),
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                resolveError,
                                style: const TextStyle(
                                    fontSize: 12, color: GodropColors.error),
                              ),
                            ),
                          ],
                          const SizedBox(height: 14),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: GodropColors.background,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    resolvedAccountName ??
                                        'Account name will appear here',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: resolvedAccountName != null
                                          ? FontWeight.w600
                                          : FontWeight.w400,
                                      color: resolvedAccountName != null
                                          ? GodropColors.ink
                                          : GodropColors.mute,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    GodropButton(
                      label: 'Save Bank Account',
                      onTap: saving ? null : () => _save(resolvedAccountName),
                      isLoading: saving,
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _bankPickerField(List<Bank> banks, bool loading) {
    return GestureDetector(
      onTap: loading || banks.isEmpty ? null : () => _showBankPicker(banks),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: GodropColors.border),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Bank',
                      style:
                          TextStyle(fontSize: 12, color: GodropColors.mute)),
                  const SizedBox(height: 2),
                  Text(
                    loading
                        ? 'Loading banks…'
                        : _selectedBank?.name ?? 'Select your bank',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: _selectedBank != null
                          ? GodropColors.ink
                          : GodropColors.mute,
                    ),
                  ),
                ],
              ),
            ),
            if (loading)
              const SizedBox(
                width: 16,
                height: 16,
                child:
                    CircularProgressIndicator(strokeWidth: 2, color: GodropColors.blue),
              )
            else
              const Icon(Icons.keyboard_arrow_down_rounded,
                  color: GodropColors.mute),
          ],
        ),
      ),
    );
  }
}

class _BankPickerSheet extends StatefulWidget {
  final List<Bank> banks;
  final ValueChanged<Bank> onSelect;

  const _BankPickerSheet({required this.banks, required this.onSelect});

  @override
  State<_BankPickerSheet> createState() => _BankPickerSheetState();
}

class _BankPickerSheetState extends State<_BankPickerSheet> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = _query.isEmpty
        ? widget.banks
        : widget.banks
            .where((b) => b.name.toLowerCase().contains(_query.toLowerCase()))
            .toList();

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.75,
        child: Column(
          children: [
            const SizedBox(height: 12),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: GodropColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select Bank',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink)),
                  const SizedBox(height: 12),
                  TextField(
                    autofocus: true,
                    onChanged: (v) => setState(() => _query = v),
                    decoration: InputDecoration(
                      hintText: 'Search banks',
                      prefixIcon: const Icon(Icons.search_rounded,
                          color: GodropColors.mute),
                      filled: true,
                      fillColor: GodropColors.background,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: filtered.isEmpty
                  ? const Center(
                      child: Text('No banks found',
                          style: TextStyle(color: GodropColors.mute)),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) =>
                          const Divider(height: 1, color: GodropColors.border),
                      itemBuilder: (_, i) {
                        final bank = filtered[i];
                        return ListTile(
                          title: Text(bank.name,
                              style: const TextStyle(
                                  fontSize: 14, color: GodropColors.ink)),
                          onTap: () {
                            widget.onSelect(bank);
                            Navigator.pop(context);
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
