import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/amount_keypad.dart';
import '../../shared/widgets/chips.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/option_tile.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/wallet_cubit.dart';

/// Screen 20 — Add money: amount, quick chips, fund via transfer/card.
class FundScreen extends StatefulWidget {
  const FundScreen({super.key});

  @override
  State<FundScreen> createState() => _FundScreenState();
}

class _FundScreenState extends State<FundScreen> {
  String _raw = '';
  String _method = 'TRANSFER';

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

  Future<void> _fund() async {
    final cubit = context.read<WalletCubit>();
    final ok = await cubit.startFunding(_kobo, _method);
    if (!ok || !mounted) return;
    final url = cubit.state.fundUrl;
    if (url != null) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
    if (!mounted) return;
    final paid = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: InvestColors.raise,
        title: const Text('Complete your top-up',
            style: TextStyle(color: InvestColors.text, fontSize: 17)),
        content: const Text(
          'Finish the Paystack checkout, then come back and tap "I have paid" to credit your wallet.',
          style: TextStyle(color: InvestColors.sub, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: InvestColors.sub)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('I have paid',
                style: TextStyle(
                    color: InvestColors.blueBright, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
    if (paid == true && mounted) {
      final done = await cubit.verifyFunding();
      if (done && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${formatKobo(_kobo)} added to your wallet 🎉'),
            backgroundColor: InvestColors.green,
          ),
        );
        context.pop();
      }
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
            return Column(
              children: [
                const InvestTopBar(title: 'Add money'),
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
                                'ENTER AMOUNT',
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
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        Center(
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              ('₦20K', 2000000),
                              ('₦50K', 5000000),
                              ('₦100K', 10000000),
                              ('₦500K', 50000000),
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
                          'FUND VIA',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: InvestColors.sub,
                          ),
                        ),
                        const SizedBox(height: 10),
                        OptionTile(
                          title: 'Bank transfer',
                          subtitle: 'Instant · to virtual account',
                          icon: const Icon(Icons.account_balance,
                              size: 20, color: InvestColors.blueBright),
                          selected: _method == 'TRANSFER',
                          onTap: () => setState(() => _method = 'TRANSFER'),
                        ),
                        OptionTile(
                          title: 'Debit card',
                          subtitle: 'Visa, Verve, Mastercard',
                          icon: const Icon(Icons.credit_card,
                              size: 20, color: InvestColors.blueBright),
                          selected: _method == 'CARD',
                          onTap: () => setState(() => _method = 'CARD'),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: AmountKeypad(
                            onKey: (k) {
                              if (k == '.') return; // whole Naira only
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
                    label: _kobo > 0 ? 'Add ${formatKobo(_kobo)}' : 'Add money',
                    loading: state.submitting,
                    onPressed:
                        _kobo >= 10000 && !state.submitting ? _fund : null,
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
