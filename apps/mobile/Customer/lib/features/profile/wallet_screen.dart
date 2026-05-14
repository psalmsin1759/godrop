import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../app/theme.dart';
import '../../shared/models/wallet_models.dart';
import 'bloc/wallet_cubit.dart';
import 'bloc/wallet_state.dart';

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

  String _fmtKobo(int kobo) {
    final naira = kobo / 100;
    final str = naira.toStringAsFixed(2);
    final parts = str.split('.');
    final intPart = parts[0].replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (_) => ',',
    );
    return '$intPart.${parts[1]}';
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
        onTopUp: (amountKobo) {
          Navigator.pop(ctx);
          context.read<WalletCubit>().initTopUp(amountKobo);
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
        } else if (state is WalletError && state.balanceKobo == null) {
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
        int balanceKobo = 0;
        List<WalletTx> transactions = [];
        bool loading = false;
        bool toppingUp = false;

        if (state is WalletLoaded) {
          balanceKobo = state.balanceKobo;
          transactions = state.transactions;
        } else if (state is WalletTopUpSuccess) {
          balanceKobo = state.balanceKobo;
          transactions = state.transactions;
        } else if (state is WalletToppingUp) {
          balanceKobo = state.balanceKobo;
          transactions = state.transactions;
          toppingUp = true;
        } else if (state is WalletTopUpReady) {
          balanceKobo = state.balanceKobo;
          transactions = state.transactions;
        } else if (state is WalletLoading) {
          loading = true;
        } else if (state is WalletError && state.balanceKobo != null) {
          balanceKobo = state.balanceKobo!;
          transactions = state.transactions ?? [];
        }

        final balStr = _fmtKobo(balanceKobo);
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
                  padding: EdgeInsets.fromLTRB(16, MediaQuery.of(context).padding.top + 16, 16, 20),
                  decoration: const BoxDecoration(gradient: GodropColors.blueGradient),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Expanded(child: Text('Wallet', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700))),
                          Icon(Icons.more_horiz_rounded, color: Colors.white.withValues(alpha: 0.8)),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 18),
                        decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.19), borderRadius: BorderRadius.circular(14)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('GODROP WALLET BALANCE', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13, letterSpacing: 0.8, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            loading
                                ? const Padding(
                                    padding: EdgeInsets.symmetric(vertical: 14),
                                    child: SizedBox(
                                      width: 28,
                                      height: 28,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    ),
                                  )
                                : Row(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      const Text('₦ ', style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w400)),
                                      Text(
                                        balParts[0],
                                        style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w800, letterSpacing: -1),
                                      ),
                                      Text(
                                        '.${balParts.length > 1 ? balParts[1] : '00'}',
                                        style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 22, fontWeight: FontWeight.w400),
                                      ),
                                    ],
                                  ),
                            const SizedBox(height: 20),
                            Row(
                              children: [
                                Expanded(
                                  child: _WalletBtn(
                                    label: toppingUp ? '...' : '↑ Top up',
                                    onTap: toppingUp || loading ? null : _showTopUpSheet,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Recent activity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                          Text('See all', style: TextStyle(fontSize: 14, color: GodropColors.blue)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (loading)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 32),
                            child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2),
                          ),
                        )
                      else if (transactions.isEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 40),
                          alignment: Alignment.center,
                          child: const Text('No transactions yet', style: TextStyle(fontSize: 14, color: GodropColors.mute)),
                        )
                      else
                        Container(
                          decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
                          child: Column(
                            children: transactions.asMap().entries.map((e) {
                              final tx = e.value;
                              final typeUpper = tx.type.toUpperCase();
                              // Determine credit/debit from the actual transaction type
                              final isCredit = typeUpper == 'TOPUP' || typeUpper == 'REFUND';
                              final sign = isCredit ? '+' : '-';
                              final amtStr = '$sign₦${_fmtKobo(tx.amountKobo.abs())}';

                              // Pick icon and colour by transaction type
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

                              return Column(
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                    child: Row(
                                      children: [
                                        Container(
                                          width: 38,
                                          height: 38,
                                          decoration: BoxDecoration(
                                            color: txIconBg,
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: Icon(txIcon, size: 18, color: txIconColor),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(tx.description, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: GodropColors.ink)),
                                              Text(_fmtDate(tx.createdAt), style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                                            ],
                                          ),
                                        ),
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
                                  ),
                                  if (e.key < transactions.length - 1) const Divider(height: 1, indent: 62),
                                ],
                              );
                            }).toList(),
                          ),
                        ),
                      if (state is WalletError && state.balanceKobo != null) ...[
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
            topUpAmountKobo: ctx.read<WalletCubit>().pendingTopUpAmountKobo,
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
        amountKobo: state.topUpAmountKobo,
        newBalanceKobo: state.balanceKobo,
        onDone: () => Navigator.pop(sheetCtx),
      ),
    );
  }
}

class _TopUpSheet extends StatefulWidget {
  final ValueChanged<int> onTopUp;
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
    final amount = int.tryParse(text);
    if (amount == null || amount < 100) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid amount (min ₦100)')),
      );
      return;
    }
    widget.onTopUp(amount * 100);
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
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: GodropColors.blue,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Continue to payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
              ),
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
  final int amountKobo;
  final int newBalanceKobo;
  final VoidCallback onDone;
  const _TopUpSuccessSheet({
    required this.amountKobo,
    required this.newBalanceKobo,
    required this.onDone,
  });

  String _fmt(int kobo) {
    final n = (kobo / 100).toStringAsFixed(2);
    final parts = n.split('.');
    final intPart = parts[0].replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',');
    return '₦$intPart.${parts[1]}';
  }

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
            '${_fmt(amountKobo)} has been added\nto your Godrop wallet.',
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
                Text(_fmt(newBalanceKobo), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: GodropColors.ink)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onDone,
              style: ElevatedButton.styleFrom(
                backgroundColor: GodropColors.blue,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Done', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}

class _WalletBtn extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  const _WalletBtn({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        decoration: BoxDecoration(
          color: GodropColors.orange,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: onTap == null ? Colors.white54 : Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
