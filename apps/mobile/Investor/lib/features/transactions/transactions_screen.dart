import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/wallet_models.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/chips.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/tx_tile.dart';
import 'bloc/transactions_cubit.dart';

/// Screen 23 — full transaction history, filter chips, grouped by day.
class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  final _scroll = ScrollController();

  static const _filters = [
    (label: 'All', value: null),
    (label: 'Payouts', value: 'PAYOUT'),
    (label: 'Investments', value: 'INVESTMENT'),
    (label: 'Top-ups', value: 'TOPUP'),
    (label: 'Withdrawals', value: 'WITHDRAWAL'),
  ];

  @override
  void initState() {
    super.initState();
    context.read<TransactionsCubit>().load(clearFilter: true);
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 300) {
        context.read<TransactionsCubit>().loadMore();
      }
    });
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  /// Groups by calendar day label like `TODAY · JUL 1` / `JUN 30`.
  List<(String, List<InvestorTx>)> _group(List<InvestorTx> txs) {
    final groups = <String, List<InvestorTx>>{};
    for (final tx in txs) {
      final dt = DateTime.tryParse(tx.createdAt)?.toLocal();
      final now = DateTime.now();
      final isToday = dt != null &&
          dt.year == now.year &&
          dt.month == now.month &&
          dt.day == now.day;
      final label = isToday
          ? 'TODAY · ${formatMonthDay(tx.createdAt).toUpperCase()}'
          : formatMonthDay(tx.createdAt).toUpperCase();
      groups.putIfAbsent(label, () => []).add(tx);
    }
    return groups.entries.map((e) => (e.key, e.value)).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<TransactionsCubit, TransactionsState>(
          builder: (context, state) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 10, 18, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Transactions',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5,
                          color: InvestColors.text,
                        ),
                      ),
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: InvestColors.raise2,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: InvestColors.line),
                        ),
                        child: const Icon(Icons.tune,
                            size: 20, color: InvestColors.text),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  height: 44,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.fromLTRB(18, 4, 18, 0),
                    itemCount: _filters.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      final f = _filters[i];
                      return SelectChip(
                        label: f.label,
                        pill: true,
                        selected: state.filter == f.value,
                        onTap: () => context.read<TransactionsCubit>().load(
                              filter: f.value,
                              clearFilter: f.value == null,
                            ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 14),
                Expanded(
                  child: state.loading
                      ? const LoadingView()
                      : state.error != null
                          ? ErrorView(
                              message: state.error!,
                              onRetry: () =>
                                  context.read<TransactionsCubit>().load(),
                            )
                          : state.transactions.isEmpty
                              ? const EmptyView(
                                  title: 'No transactions yet',
                                  subtitle:
                                      'Your payouts, top-ups and withdrawals will appear here.',
                                  icon: Icons.receipt_long_outlined,
                                )
                              : ListView(
                                  controller: _scroll,
                                  padding:
                                      const EdgeInsets.fromLTRB(18, 0, 18, 20),
                                  children: [
                                    for (final (label, txs)
                                        in _group(state.transactions)) ...[
                                      Padding(
                                        padding: const EdgeInsets.only(
                                            bottom: 10, top: 8),
                                        child: Text(
                                          label,
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                            letterSpacing: 0.3,
                                            color: InvestColors.mute,
                                          ),
                                        ),
                                      ),
                                      for (final tx in txs) ...[
                                        TxTile(tx: tx),
                                        const SizedBox(height: 10),
                                      ],
                                    ],
                                    if (state.loadingMore)
                                      const Padding(
                                        padding: EdgeInsets.all(12),
                                        child: Center(
                                          child: SizedBox(
                                            width: 22,
                                            height: 22,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2.4,
                                              color: InvestColors.blue,
                                            ),
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
}
