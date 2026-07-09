import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/amount_keypad.dart';
import '../../shared/widgets/chips.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/invest_flow_cubit.dart';

/// Screen 13 — amount entry with keypad, quick chips, live projection.
class AmountScreen extends StatefulWidget {
  const AmountScreen({super.key});

  @override
  State<AmountScreen> createState() => _AmountScreenState();
}

class _AmountScreenState extends State<AmountScreen> {
  String _raw = '';

  int get _kobo => parseNairaToKobo(_raw);

  String get _display {
    if (_raw.isEmpty) return '0';
    final parts = _raw.split('.');
    final grouped = _groupDigits(parts[0]);
    return parts.length > 1 ? '$grouped.${parts[1]}' : grouped;
  }

  String _groupDigits(String digits) {
    final buf = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buf.write(',');
      buf.write(digits[i]);
    }
    return buf.isEmpty ? '0' : buf.toString();
  }

  void _append(String key) {
    if (key == '.' && _raw.contains('.')) return;
    if (_raw.length > 11) return;
    setState(() => _raw = _raw == '0' && key != '.' ? key : _raw + key);
    context.read<InvestFlowCubit>().setAmount(_kobo);
  }

  void _backspace() {
    if (_raw.isEmpty) return;
    setState(() => _raw = _raw.substring(0, _raw.length - 1));
    context.read<InvestFlowCubit>().setAmount(_kobo);
  }

  void _setKobo(int kobo) {
    setState(() => _raw = (kobo ~/ 100).toString());
    context.read<InvestFlowCubit>().setAmount(kobo);
  }

  Future<void> _review() async {
    final ok = await context.read<InvestFlowCubit>().preview();
    if (ok && mounted) context.push('/invest/review');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<InvestFlowCubit, InvestFlowState>(
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
            final plan = state.plan;
            final asset = state.asset;
            final quick = <(String, int)>[
              ('₦250K', 25000000),
              ('₦500K', 50000000),
              ('₦1M', 100000000),
              if (asset != null)
                ('Full unit', asset.unitPriceKobo - asset.raisedKobo),
            ];
            return Column(
              children: [
                InvestTopBar(
                  title: 'Investment amount',
                  subtitle: plan == null
                      ? null
                      : '${plan.name} plan · ${plan.tenureMonths} months',
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                    child: Column(
                      children: [
                        const SizedBox(height: 18),
                        const Text(
                          "YOU'RE INVESTING",
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
                            Flexible(
                              child: Text(
                                _display,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 46,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -1,
                                  color: InvestColors.text,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Min ${formatKobo(state.minKobo)}'
                          '${asset != null ? ' · ${formatKobo(asset.targetKobo - asset.raisedKobo)} left to fund' : ''}',
                          style: const TextStyle(
                              fontSize: 12.5, color: InvestColors.mute),
                        ),
                        const SizedBox(height: 22),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          alignment: WrapAlignment.center,
                          children: quick.map((q) {
                            return SelectChip(
                              label: q.$1,
                              selected: _kobo == q.$2 && _kobo > 0,
                              onTap: () => _setKobo(q.$2),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 22),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: InvestColors.raise,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: InvestColors.line),
                          ),
                          child: Column(
                            children: [
                              _projRow(
                                'Est. monthly payout',
                                formatKobo(state.estMonthlyKobo, sign: true),
                                InvestColors.green,
                              ),
                              const Divider(height: 17),
                              _projRow(
                                'Total return over ${plan?.tenureMonths ?? 0} mo',
                                formatKobo(state.estTotalReturnKobo),
                                InvestColors.text,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
                  child: Column(
                    children: [
                      AmountKeypad(onKey: _append, onBackspace: _backspace),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(8, 4, 8, 8),
                        child: InvestButton(
                          label: 'Review investment',
                          trailingIcon: Icons.arrow_forward,
                          loading: state.submitting,
                          onPressed: _kobo >= state.minKobo && !state.submitting
                              ? _review
                              : null,
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

  Widget _projRow(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: InvestColors.sub)),
        Text(
          value,
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: color),
        ),
      ],
    );
  }
}
