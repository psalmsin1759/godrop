import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/section_header.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/tx_tile.dart';
import 'bloc/wallet_cubit.dart';

/// Screen 19 — Wallet: gradient balance card with Add money / Withdraw,
/// quick actions, recent transactions.
class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    context.read<WalletCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<WalletCubit, WalletState>(
          builder: (context, state) {
            if (state.loading && state.wallets == null) {
              return const LoadingView();
            }
            if (state.error != null && state.wallets == null) {
              return ErrorView(
                message: state.error!,
                onRetry: () => context.read<WalletCubit>().load(),
              );
            }
            final wallets = state.wallets;
            return RefreshIndicator(
              color: InvestColors.blue,
              onRefresh: () => context.read<WalletCubit>().load(),
              child: ListView(
                padding: const EdgeInsets.only(bottom: 12),
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(18, 10, 18, 0),
                    child: Text(
                      'Wallet',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                        color: InvestColors.text,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: InvestColors.card,
                        borderRadius: BorderRadius.circular(22),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Main Wallet balance',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  color: Colors.white.withValues(alpha: 0.85),
                                ),
                              ),
                              const Icon(Icons.visibility_outlined,
                                  size: 22, color: Colors.white),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            formatKobo(wallets?.mainBalanceKobo ?? 0,
                                decimals: true),
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.8,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 18),
                          Row(
                            children: [
                              Expanded(
                                child: _cardAction(
                                  'Add money',
                                  Icons.add,
                                  InvestColors.orange,
                                  () => context.push('/wallet/fund'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _cardAction(
                                  'Withdraw',
                                  Icons.arrow_downward,
                                  Colors.white.withValues(alpha: 0.18),
                                  () => context.push('/wallet/withdraw'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(18, 14, 18, 0),
                    child: Row(
                      children: [
                        _quick(context, 'Invest', Icons.trending_up,
                            () => context.push('/assets')),
                        const SizedBox(width: 10),
                        _quick(context, 'Flow Safe', Icons.savings_outlined,
                            () => context.go('/safe'),
                            color: InvestColors.orange),
                        const SizedBox(width: 10),
                        _quick(context, 'Statement', Icons.description_outlined,
                            () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content:
                                    Text('Statement will be emailed to you.')),
                          );
                        }),
                        const SizedBox(width: 10),
                        _quick(context, 'Bank', Icons.account_balance,
                            () => context.push('/profile/bank')),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(18, 20, 18, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SectionHeader(
                          title: 'Transactions',
                          action: 'View all',
                          onAction: () => context.go('/transactions'),
                        ),
                        const SizedBox(height: 12),
                        for (final tx in state.recentTx) ...[
                          TxTile(tx: tx),
                          const SizedBox(height: 10),
                        ],
                        if (state.recentTx.isEmpty)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 12),
                            child: Text(
                              'No transactions yet.',
                              style: TextStyle(
                                  fontSize: 13, color: InvestColors.mute),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _cardAction(
      String label, IconData icon, Color bg, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: Colors.white),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _quick(BuildContext context, String label, IconData icon,
      VoidCallback onTap,
      {Color color = InvestColors.blueBright}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 6),
          decoration: BoxDecoration(
            color: InvestColors.raise,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: InvestColors.line),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: InvestColors.raise3,
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(icon, size: 22, color: color),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: InvestColors.text,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
