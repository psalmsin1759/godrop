import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
          _showPaystackSheet(ctx, state);
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
          body: CustomScrollView(
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
                          Icon(Icons.more_horiz_rounded, color: Colors.white.withOpacity(0.8)),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 18),
                        decoration: BoxDecoration(color: Colors.black.withOpacity(0.19), borderRadius: BorderRadius.circular(14)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('GODROP WALLET BALANCE', style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13, letterSpacing: 0.8, fontWeight: FontWeight.bold)),
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
                                        style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 22, fontWeight: FontWeight.w400),
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
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _WalletBtn(label: '↓ Withdraw', onTap: () {}, outlined: true),
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
                              final isCredit = tx.type == 'credit' || tx.amountKobo > 0 && tx.type != 'debit';
                              final sign = isCredit ? '+' : '-';
                              final amtStr = '${sign}₦${_fmtKobo(tx.amountKobo.abs())}';
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
                                            color: isCredit ? GodropColors.success.withOpacity(0.08) : GodropColors.background,
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: Icon(
                                            isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                                            size: 18,
                                            color: isCredit ? GodropColors.success : GodropColors.slate,
                                          ),
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
        );
      },
    );
  }

  void _showPaystackSheet(BuildContext ctx, WalletTopUpReady state) {
    showModalBottomSheet(
      context: ctx,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _PaystackSheet(
        url: state.paystackAuthUrl,
        reference: state.reference,
        onDone: () {
          Navigator.pop(ctx);
          ctx.read<WalletCubit>().verifyTopUp(state.reference);
        },
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
                    color: GodropColors.blue.withOpacity(0.07),
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

class _PaystackSheet extends StatelessWidget {
  final String url;
  final String reference;
  final VoidCallback onDone;
  const _PaystackSheet({required this.url, required this.reference, required this.onDone});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(color: GodropColors.border, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 24),
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(color: GodropColors.blue.withOpacity(0.08), shape: BoxShape.circle),
            child: const Icon(Icons.open_in_new_rounded, color: GodropColors.blue, size: 30),
          ),
          const SizedBox(height: 16),
          const Text('Complete payment on Paystack', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: GodropColors.ink)),
          const SizedBox(height: 8),
          const Text(
            'Copy the link below and open it in your browser to complete payment.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: GodropColors.slate),
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: GodropColors.background,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: GodropColors.border),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    url,
                    style: const TextStyle(fontSize: 12, color: GodropColors.blue),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: url));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Payment link copied!'), duration: Duration(seconds: 2)),
                    );
                  },
                  child: const Icon(Icons.copy_rounded, size: 18, color: GodropColors.slate),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text('Ref: $reference', style: const TextStyle(fontSize: 11, color: GodropColors.mute)),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onDone,
              style: ElevatedButton.styleFrom(
                backgroundColor: GodropColors.blue,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Text("I've paid — verify payment", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
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
  final bool outlined;
  const _WalletBtn({required this.label, required this.onTap, this.outlined = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        decoration: BoxDecoration(
          color: outlined ? Colors.transparent : GodropColors.orange,
          borderRadius: BorderRadius.circular(20),
          border: outlined ? Border.all(color: Colors.white.withOpacity(0.5)) : null,
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
