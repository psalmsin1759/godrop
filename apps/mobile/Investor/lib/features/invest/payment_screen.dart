import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/option_tile.dart';
import '../../shared/widgets/top_bar.dart';
import '../../shared/widgets/vehicle_tile.dart';
import 'bloc/invest_flow_cubit.dart';

/// Screen 15 — payment method: wallet, card, transfer, USSD via Paystack.
class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key});

  Future<void> _pay(BuildContext context) async {
    final cubit = context.read<InvestFlowCubit>();
    final ok = await cubit.confirm();
    if (!ok || !context.mounted) return;

    final result = cubit.state.result;
    if (result == null) return;
    if (!result.paymentRequired) {
      context.go('/invest/success');
      return;
    }
    // Paystack checkout in the browser, then verify on return.
    final url = result.authorizationUrl;
    if (url != null) {
      await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
    if (!context.mounted) return;
    final verified = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: InvestColors.raise,
        title: const Text('Complete your payment',
            style: TextStyle(color: InvestColors.text, fontSize: 17)),
        content: const Text(
          'Finish the Paystack checkout in your browser, then come back and tap "I have paid".',
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
    if (verified == true && context.mounted) {
      final done = await cubit.verifyPayment();
      if (done && context.mounted) context.go('/invest/success');
    }
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
            final asset = state.asset;
            final wallets = state.wallets;
            final walletBalance = wallets?.mainBalanceKobo ?? 0;
            final walletLow = walletBalance < state.amountKobo;
            return Column(
              children: [
                const InvestTopBar(title: 'Payment method'),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(18, 4, 18, 20),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 18),
                        decoration: BoxDecoration(
                          color: InvestColors.raise,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: InvestColors.line),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Amount due',
                                  style: TextStyle(
                                      fontSize: 12, color: InvestColors.sub),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  formatKobo(state.amountKobo, decimals: true),
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                    color: InvestColors.text,
                                  ),
                                ),
                              ],
                            ),
                            if (asset != null)
                              SizedBox(
                                width: 52,
                                child: VehicleTile(
                                  vehicleClass: asset.vehicleClass,
                                  height: 42,
                                  radius: 10,
                                ),
                              ),
                          ],
                        ),
                      ),
                      const Text(
                        'SELECT METHOD',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: InvestColors.sub,
                        ),
                      ),
                      const SizedBox(height: 12),
                      OptionTile(
                        title: 'GoDrop Wallet',
                        subtitle: walletLow
                            ? 'Insufficient balance — top up'
                            : 'Balance ${formatKobo(walletBalance)}',
                        subtitleColor: walletLow ? InvestColors.red : null,
                        icon: const Icon(Icons.account_balance_wallet_outlined,
                            size: 22, color: InvestColors.blueBright),
                        selected: state.paymentMethod == 'WALLET',
                        disabled: walletLow,
                        onTap: () => context
                            .read<InvestFlowCubit>()
                            .selectPaymentMethod('WALLET'),
                      ),
                      OptionTile(
                        title: 'Debit card',
                        subtitle: 'Paystack · Visa, Verve, Mastercard',
                        icon: const Icon(Icons.credit_card,
                            size: 22, color: InvestColors.blueBright),
                        selected: state.paymentMethod == 'CARD',
                        onTap: () => context
                            .read<InvestFlowCubit>()
                            .selectPaymentMethod('CARD'),
                      ),
                      OptionTile(
                        title: 'Bank transfer',
                        subtitle: 'Pay to a virtual account',
                        icon: const Icon(Icons.account_balance,
                            size: 22, color: InvestColors.blueBright),
                        selected: state.paymentMethod == 'TRANSFER',
                        onTap: () => context
                            .read<InvestFlowCubit>()
                            .selectPaymentMethod('TRANSFER'),
                      ),
                      OptionTile(
                        title: 'USSD',
                        subtitle: '*737# and others',
                        icon: const Icon(Icons.dialpad,
                            size: 22, color: InvestColors.blueBright),
                        selected: state.paymentMethod == 'USSD',
                        onTap: () => context
                            .read<InvestFlowCubit>()
                            .selectPaymentMethod('USSD'),
                      ),
                      const SizedBox(height: 16),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.shield_outlined,
                              size: 16, color: InvestColors.green),
                          SizedBox(width: 8),
                          Text(
                            'Secured by Paystack · 256-bit encryption',
                            style:
                                TextStyle(fontSize: 12, color: InvestColors.sub),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 10, 18, 16),
                  child: InvestButton(
                    label: 'Pay ${formatKobo(state.amountKobo)}',
                    loading: state.submitting,
                    onPressed: state.submitting ? null : () => _pay(context),
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
