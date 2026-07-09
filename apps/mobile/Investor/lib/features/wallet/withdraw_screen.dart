import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/amount_keypad.dart';
import '../../shared/widgets/chips.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/wallet_cubit.dart';

/// Screen 21 — Withdraw: amount, quick chips, destination bank, fee note.
class WithdrawScreen extends StatefulWidget {
  const WithdrawScreen({super.key});

  @override
  State<WithdrawScreen> createState() => _WithdrawScreenState();
}

class _WithdrawScreenState extends State<WithdrawScreen> {
  static const _feeKobo = 5000; // flat ₦50, mirrors the backend

  String _raw = '';

  int get _kobo => parseNairaToKobo(_raw);

  String get _display {
    if (_raw.isEmpty) return '0';
    final buf = StringBuffer();
    for (var i = 0; i < _raw.length; i++) {
      if (i > 0 && (_raw.length - i) % 3 == 0) buf.write(',');
      buf.write(_raw[i]);
    }
    return buf.toString();
  }

  @override
  void initState() {
    super.initState();
    final state = context.read<WalletCubit>().state;
    if (state.wallets == null || state.bankAccounts.isEmpty) {
      context.read<WalletCubit>().load();
    }
  }

  Future<void> _withdraw() async {
    final cubit = context.read<WalletCubit>();
    final bank = cubit.state.primaryBank;
    if (bank == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Add a withdrawal bank account first.'),
          backgroundColor: InvestColors.red,
        ),
      );
      context.push('/profile/bank');
      return;
    }
    final ok = await cubit.withdraw(
      amountKobo: _kobo,
      wallet: 'MAIN',
      bankAccountId: bank.id,
    );
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${formatKobo(_kobo)} on its way to ${bank.bankName}.'),
          backgroundColor: InvestColors.green,
        ),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<WalletCubit, WalletState>(
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
            final available = state.wallets?.mainBalanceKobo ?? 0;
            final bank = state.primaryBank;
            return Column(
              children: [
                const InvestTopBar(title: 'Withdraw'),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 14),
                        Center(
                          child: Column(
                            children: [
                              const Text(
                                'WITHDRAW TO BANK',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                  color: InvestColors.sub,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.baseline,
                                textBaseline: TextBaseline.alphabetic,
                                children: [
                                  const Text(
                                    '₦',
                                    style: TextStyle(
                                      fontSize: 26,
                                      fontWeight: FontWeight.w700,
                                      color: InvestColors.sub,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    _display,
                                    style: const TextStyle(
                                      fontSize: 46,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: -1,
                                      color: InvestColors.text,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Available: ${formatKobo(available, decimals: true)}',
                                style: const TextStyle(
                                    fontSize: 12.5, color: InvestColors.mute),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        Center(
                          child: Wrap(
                            spacing: 8,
                            children: [
                              ('₦50K', 5000000),
                              ('₦100K', 10000000),
                              ('Half', available ~/ 2),
                              ('All', available),
                            ].map((q) {
                              return SelectChip(
                                label: q.$1,
                                selected: _kobo == q.$2 && _kobo > 0,
                                onTap: () => setState(
                                    () => _raw = (q.$2 ~/ 100).toString()),
                              );
                            }).toList(),
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'DESTINATION',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: InvestColors.sub,
                          ),
                        ),
                        const SizedBox(height: 10),
                        GestureDetector(
                          onTap: () => context.push('/profile/bank'),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: InvestColors.raise,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: InvestColors.line),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 46,
                                  height: 46,
                                  decoration: BoxDecoration(
                                    color: InvestColors.blueSoft,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.account_balance,
                                      size: 24, color: InvestColors.blueBright),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        bank == null
                                            ? 'No bank account yet'
                                            : '${bank.bankName} · ${bank.accountName}',
                                        style: const TextStyle(
                                          fontSize: 14.5,
                                          fontWeight: FontWeight.w700,
                                          color: InvestColors.text,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        bank == null
                                            ? 'Tap to add one'
                                            : bank.maskedNumber,
                                        style: const TextStyle(
                                            fontSize: 12.5,
                                            color: InvestColors.sub),
                                      ),
                                    ],
                                  ),
                                ),
                                const Text(
                                  'Change',
                                  style: TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w700,
                                    color: InvestColors.blueBright,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: InvestColors.raise2,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Fee ₦50 · Arrives instantly',
                                style: TextStyle(
                                    fontSize: 12.5, color: InvestColors.sub),
                              ),
                              Text(
                                _kobo > _feeKobo
                                    ? 'You get ${formatKobo(_kobo - _feeKobo)}'
                                    : '',
                                style: const TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: InvestColors.text,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: AmountKeypad(
                            onKey: (k) {
                              if (k == '.') return;
                              if (_raw.length > 9) return;
                              setState(() => _raw = _raw == '0' ? k : _raw + k);
                            },
                            onBackspace: () {
                              if (_raw.isEmpty) return;
                              setState(
                                  () => _raw = _raw.substring(0, _raw.length - 1));
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
                  child: InvestButton(
                    label: _kobo > 0
                        ? 'Withdraw ${formatKobo(_kobo)}'
                        : 'Withdraw',
                    loading: state.submitting,
                    onPressed: _kobo >= 10000 &&
                            _kobo <= available &&
                            !state.submitting
                        ? _withdraw
                        : null,
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
