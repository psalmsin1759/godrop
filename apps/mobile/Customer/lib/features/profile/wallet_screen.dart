import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../app/theme.dart';
import '../../shared/models/wallet_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/wallet_cubit.dart';
import 'bloc/wallet_state.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  bool _hideBalance = false;

  @override
  void initState() {
    super.initState();
    context.read<WalletCubit>().load();
  }

  String _fmtDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inDays == 0) return 'Today · ${_timeStr(dt)}';
      if (diff.inDays == 1) return 'Yesterday · ${_timeStr(dt)}';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[dt.month - 1]} ${dt.day} · ${_timeStr(dt)}';
    } catch (_) {
      return iso;
    }
  }

  String _timeStr(DateTime dt) {
    final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
    final m = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '$h:$m $period';
  }

  void _showTopUpSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _TopUpSheet(
        onTopUp: (amount) {
          Navigator.pop(ctx);
          context.read<WalletCubit>().initTopUp(amount);
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<WalletCubit, WalletState>(
      listener: (ctx, state) {
        if (state is WalletTopUpReady) {
          _showPaystackWebView(ctx, state);
        } else if (state is WalletTopUpSuccess) {
          _showSuccessSheet(ctx, state);
        } else if (state is WalletError && state.balance == null) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red.shade700,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              margin: const EdgeInsets.all(16),
            ),
          );
        }
      },
      builder: (ctx, state) {
        double balance = 0;
        List<WalletTx> transactions = [];
        bool loading = false;
        bool toppingUp = false;

        if (state is WalletLoaded) {
          balance = state.balance;
          transactions = state.transactions;
        } else if (state is WalletTopUpSuccess) {
          balance = state.balance;
          transactions = state.transactions;
        } else if (state is WalletToppingUp) {
          balance = state.balance;
          transactions = state.transactions;
          toppingUp = true;
        } else if (state is WalletTopUpReady) {
          balance = state.balance;
          transactions = state.transactions;
        } else if (state is WalletLoading) {
          loading = true;
        } else if (state is WalletError && state.balance != null) {
          balance = state.balance!;
          transactions = state.transactions ?? [];
        }

        final balStr = formatNaira(balance).replaceFirst('₦', '');
        final balParts = balStr.split('.');

        return Scaffold(
          backgroundColor: GodropColors.background,
          body: RefreshIndicator(
            onRefresh: () => ctx.read<WalletCubit>().refresh(),
            color: GodropColors.blue,
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Container(
                    width: double.infinity,
                    padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 16, 20, 32),
                    decoration: const BoxDecoration(
                      gradient: GodropColors.blueGradient,
                      borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.14),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 20),
                            ),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Text('My Wallet', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 22),
                        AnimatedEntrance(
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      'AVAILABLE BALANCE',
                                      style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1),
                                    ),
                                    const Spacer(),
                                    if (!loading)
                                      GestureDetector(
                                        onTap: () => setState(() => _hideBalance = !_hideBalance),
                                        child: Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), shape: BoxShape.circle),
                                          child: Icon(
                                            _hideBalance ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                                            color: Colors.white.withValues(alpha: 0.8),
                                            size: 16,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                loading
                                    ? Shimmer.fromColors(
                                        baseColor: Colors.white.withValues(alpha: 0.15),
                                        highlightColor: Colors.white.withValues(alpha: 0.35),
                                        child: Container(
                                          width: 150,
                                          height: 38,
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                        ),
                                      )
                                    : _hideBalance
                                        ? const Text(
                                            '₦ • • • • • •',
                                            style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800, letterSpacing: 2),
                                          )
                                        : Row(
                                            crossAxisAlignment: CrossAxisAlignment.end,
                                            children: [
                                              const Padding(
                                                padding: EdgeInsets.only(bottom: 5),
                                                child: Text('₦', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w500)),
                                              ),
                                              const SizedBox(width: 2),
                                              Text(
                                                balParts[0],
                                                style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w800, letterSpacing: -1),
                                              ),
                                              Padding(
                                                padding: const EdgeInsets.only(bottom: 5),
                                                child: Text(
                                                  '.${balParts.length > 1 ? balParts[1] : '00'}',
                                                  style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 20, fontWeight: FontWeight.w600),
                                                ),
                                              ),
                                            ],
                                          ),
                                const SizedBox(height: 22),
                                GodropButton(
                                  label: toppingUp ? 'Processing…' : 'Top up wallet',
                                  onTap: toppingUp || loading ? null : _showTopUpSheet,
                                  color: Colors.white,
                                  textColor: GodropColors.blue,
                                  trailingIcon: Icons.add_circle_rounded,
                                  height: 50,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 22, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Recent activity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: GodropColors.ink)),
                            if (!loading && transactions.isNotEmpty)
                              Text(
                                '${transactions.length} ${transactions.length == 1 ? 'transaction' : 'transactions'}',
                                style: const TextStyle(fontSize: 12, color: GodropColors.mute),
                              ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        if (loading)
                          Column(
                            children: List.generate(4, (i) => _TxSkeleton(key: ValueKey('skeleton_$i'))),
                          )
                        else if (transactions.isEmpty)
                          const _EmptyTransactions()
                        else
                          Column(
                            children: transactions.asMap().entries.map((e) {
                              final tx = e.value;
                              return AnimatedEntrance(
                                delay: Duration(milliseconds: 60 * e.key.clamp(0, 6)),
                                child: _TransactionCard(
                                  tx: tx,
                                  amountLabel: formatNaira(tx.amount.abs()).replaceFirst('₦', ''),
                                  dateLabel: _fmtDate(tx.createdAt),
                                ),
                              );
                            }).toList(),
                          ),
                        if (state is WalletError && state.balance != null) ...[
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              const Icon(Icons.error_outline_rounded, color: GodropColors.orange, size: 16),
                              const SizedBox(width: 8),
                              Expanded(child: Text(state.message, style: const TextStyle(fontSize: 12, color: GodropColors.slate))),
                              TextButton(
                                onPressed: () => ctx.read<WalletCubit>().load(),
                                child: const Text('Retry', style: TextStyle(color: GodropColors.blue, fontSize: 12)),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showPaystackWebView(BuildContext ctx, WalletTopUpReady state) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
      builder: (sheetCtx) => _PaystackWebViewSheet(
        url: state.paystackAuthUrl,
        onPaymentDone: () {
          Navigator.pop(sheetCtx);
          ctx.read<WalletCubit>().verifyTopUp(
            state.reference,
            topUpAmount: ctx.read<WalletCubit>().pendingTopUpAmount,
          );
        },
        onCancel: () => Navigator.pop(sheetCtx),
      ),
    );
  }

  void _showSuccessSheet(BuildContext ctx, WalletTopUpSuccess state) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => _TopUpSuccessSheet(
        amount: state.topUpAmount,
        newBalance: state.balance,
        onDone: () => Navigator.pop(sheetCtx),
      ),
    );
  }
}

// ── Transaction card ──────────────────────────────────────────────────────────

class _TransactionCard extends StatelessWidget {
  final WalletTx tx;
  final String amountLabel;
  final String dateLabel;

  const _TransactionCard({
    required this.tx,
    required this.amountLabel,
    required this.dateLabel,
  });

  @override
  Widget build(BuildContext context) {
    final typeUpper = tx.type.toUpperCase();
    final isCredit = typeUpper == 'TOPUP' || typeUpper == 'REFUND';
    final sign = isCredit ? '+' : '-';
    final amtStr = '$sign₦$amountLabel';

    final IconData txIcon;
    final Color txIconColor;
    final Color txIconBg;
    switch (typeUpper) {
      case 'TOPUP':
        txIcon = Icons.account_balance_wallet_rounded;
        txIconColor = GodropColors.success;
        txIconBg = GodropColors.success.withValues(alpha: 0.08);
      case 'REFUND':
        txIcon = Icons.undo_rounded;
        txIconColor = GodropColors.blue;
        txIconBg = GodropColors.blue.withValues(alpha: 0.08);
      case 'PAYMENT':
        txIcon = Icons.shopping_bag_outlined;
        txIconColor = GodropColors.orange;
        txIconBg = GodropColors.orange.withValues(alpha: 0.08);
      default:
        txIcon = isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded;
        txIconColor = isCredit ? GodropColors.success : GodropColors.slate;
        txIconBg = isCredit ? GodropColors.success.withValues(alpha: 0.08) : GodropColors.background;
    }

    final statusLower = tx.status.toLowerCase();
    final showStatus = statusLower != 'completed' && statusLower != 'success';
    final statusColor = statusLower == 'failed' ? GodropColors.error : GodropColors.orange;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: txIconBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(txIcon, size: 19, color: txIconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.description,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(dateLabel, style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                    if (showStatus) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          tx.status[0].toUpperCase() + tx.status.substring(1).toLowerCase(),
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: statusColor),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            amtStr,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: isCredit ? GodropColors.success : GodropColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Skeleton / empty states ─────────────────────────────────────────────────────

class _TxSkeleton extends StatelessWidget {
  const _TxSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(14),
        boxShadow: GodropColors.softShadow,
      ),
      child: Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.grey.shade50,
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 13, width: 130, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4))),
                  const SizedBox(height: 8),
                  Container(height: 11, width: 80, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4))),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(height: 13, width: 56, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(4))),
          ],
        ),
      ),
    );
  }
}

class _EmptyTransactions extends StatelessWidget {
  const _EmptyTransactions();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 44),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(color: GodropColors.blue.withValues(alpha: 0.08), shape: BoxShape.circle),
            child: const Icon(Icons.receipt_long_rounded, color: GodropColors.blue, size: 28),
          ),
          const SizedBox(height: 14),
          const Text('No transactions yet', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink)),
          const SizedBox(height: 4),
          const Text('Your wallet activity will show up here', style: TextStyle(fontSize: 12, color: GodropColors.mute)),
        ],
      ),
    );
  }
}

class _TopUpSheet extends StatefulWidget {
  final ValueChanged<double> onTopUp;
  const _TopUpSheet({required this.onTopUp});

  @override
  State<_TopUpSheet> createState() => _TopUpSheetState();
}

class _TopUpSheetState extends State<_TopUpSheet> {
  final _ctrl = TextEditingController();
  static const _presets = [1000, 2000, 5000, 10000, 20000, 50000];

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _submit() {
    final text = _ctrl.text.replaceAll(',', '').trim();
    final amount = double.tryParse(text);
    if (amount == null || amount < 100) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid amount (min ₦100)')),
      );
      return;
    }
    widget.onTopUp(amount);
  }

  @override
  Widget build(BuildContext context) {
    final viewInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: viewInset),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: GodropColors.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Top up wallet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: GodropColors.ink)),
            const SizedBox(height: 4),
            const Text('Enter amount in Naira to add to your wallet', style: TextStyle(fontSize: 13, color: GodropColors.slate)),
            const SizedBox(height: 20),
            TextField(
              controller: _ctrl,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              autofocus: true,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: GodropColors.ink),
              decoration: InputDecoration(
                prefixText: '₦ ',
                prefixStyle: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: GodropColors.slate),
                hintText: '0',
                hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 20),
                filled: true,
                fillColor: GodropColors.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: GodropColors.blue, width: 1.5),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _presets.map((p) => GestureDetector(
                onTap: () => _ctrl.text = '$p',
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: GodropColors.blue.withValues(alpha: 0.07),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '₦${p.toString().replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}',
                    style: const TextStyle(fontSize: 13, color: GodropColors.blue, fontWeight: FontWeight.w600),
                  ),
                ),
              )).toList(),
            ),
            const SizedBox(height: 24),
            GodropButton(
              label: 'Continue to payment',
              onTap: _submit,
              height: 54,
            ),
          ],
        ),
      ),
    );
  }
}

class _PaystackWebViewSheet extends StatefulWidget {
  final String url;
  final VoidCallback onPaymentDone;
  final VoidCallback onCancel;
  const _PaystackWebViewSheet({
    required this.url,
    required this.onPaymentDone,
    required this.onCancel,
  });

  @override
  State<_PaystackWebViewSheet> createState() => _PaystackWebViewSheetState();
}

class _PaystackWebViewSheetState extends State<_PaystackWebViewSheet> {
  late final WebViewController _ctrl;
  bool _loading = true;
  bool _done = false;

  @override
  void initState() {
    super.initState();
    _ctrl = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) {
          if (mounted) setState(() => _loading = false);
        },
        onNavigationRequest: (req) {
          // Paystack redirects to the callback URL when payment is done.
          // Detect any navigation away from Paystack domains that has a
          // trxref or reference query parameter — that signals completion.
          final uri = Uri.tryParse(req.url);
          final isPaystack = req.url.contains('paystack.co') ||
              req.url.contains('paystack.com') ||
              req.url.contains('checkout.paystack');
          if (!isPaystack && uri != null &&
              (uri.queryParameters.containsKey('trxref') ||
                  uri.queryParameters.containsKey('reference'))) {
            if (!_done) {
              _done = true;
              widget.onPaymentDone();
            }
            return NavigationDecision.prevent;
          }
          return NavigationDecision.navigate;
        },
      ))
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).padding.bottom;
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                GestureDetector(
                  onTap: widget.onCancel,
                  child: Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(color: GodropColors.background, borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.close_rounded, size: 18, color: GodropColors.slate),
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text('Complete Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: GodropColors.ink)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFFE8F5EE), borderRadius: BorderRadius.circular(6)),
                  child: const Text('Secured by Paystack', style: TextStyle(fontSize: 10, color: GodropColors.success, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: Stack(
              children: [
                WebViewWidget(controller: _ctrl),
                if (_loading)
                  const Center(
                    child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5),
                  ),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(16, 10, 16, bottomPad + 12),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _done ? null : () {
                  if (!_done) {
                    _done = true;
                    widget.onPaymentDone();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: GodropColors.blue,
                  disabledBackgroundColor: GodropColors.border,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text("I've paid — verify now", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TopUpSuccessSheet extends StatelessWidget {
  final double amount;
  final double newBalance;
  final VoidCallback onDone;
  const _TopUpSuccessSheet({
    required this.amount,
    required this.newBalance,
    required this.onDone,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).padding.bottom + 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(color: GodropColors.success.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: const Icon(Icons.check_circle_rounded, color: GodropColors.success, size: 36),
          ),
          const SizedBox(height: 16),
          const Text('Payment successful!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: GodropColors.ink)),
          const SizedBox(height: 8),
          Text(
            '${formatNaira(amount)} has been added\nto your Godrop wallet.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14, color: GodropColors.slate),
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: GodropColors.background,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                const Text('New wallet balance', style: TextStyle(fontSize: 12, color: GodropColors.mute)),
                const SizedBox(height: 4),
                Text(formatNaira(newBalance), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: GodropColors.ink)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          GodropButton(
            label: 'Done',
            onTap: onDone,
            height: 54,
          ),
        ],
      ),
    );
  }
}
