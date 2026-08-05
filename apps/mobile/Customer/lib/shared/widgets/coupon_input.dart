import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../api/api.dart';
import '../models/promotion_models.dart' as promo;

/// A successfully validated coupon, held by the parent checkout screen so it
/// can adjust the displayed total and forward the code when placing the
/// order. `discountKobo` only ever discounts the delivery fee — see the
/// Promotion model docs on the backend for why rider earnings are unaffected.
class AppliedCoupon {
  final String code;
  final int discountKobo;
  final String description;
  const AppliedCoupon({
    required this.code,
    required this.discountKobo,
    required this.description,
  });
}

/// Coupon code entry, shared by every checkout screen (food/store, parcel,
/// truck). Validates the code against the backend (without redeeming it —
/// redemption happens once when the order is actually placed) so the
/// customer sees the discount amount before checking out.
class CouponInputCard extends StatefulWidget {
  final String orderType; // uppercase OrderType key, e.g. 'FOOD', 'PARCEL', 'TRUCK'
  final int deliveryFeeKobo;
  final int orderValueKobo;
  final AppliedCoupon? applied;
  final ValueChanged<AppliedCoupon?> onChanged;

  const CouponInputCard({
    super.key,
    required this.orderType,
    required this.deliveryFeeKobo,
    required this.orderValueKobo,
    required this.applied,
    required this.onChanged,
  });

  @override
  State<CouponInputCard> createState() => _CouponInputCardState();
}

class _CouponInputCardState extends State<CouponInputCard> {
  final _controller = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _apply() async {
    final code = _controller.text.trim();
    if (code.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await PromotionsService(DioClient.instance).applyPromo(
        promo.PromoApplyBody(
          code: code,
          orderType: widget.orderType,
          deliveryFeeKobo: widget.deliveryFeeKobo,
          orderValueKobo: widget.orderValueKobo,
        ),
      );
      if (!mounted) return;
      widget.onChanged(AppliedCoupon(
        code: code.toUpperCase(),
        discountKobo: res.discountKobo,
        description: res.description,
      ));
      setState(() => _loading = false);
    } on DioException catch (e) {
      if (!mounted) return;
      final data = e.response?.data;
      final msg = (data is Map && data['error'] is String)
          ? data['error'] as String
          : 'Invalid coupon code';
      setState(() {
        _loading = false;
        _error = msg;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Could not apply coupon. Please try again.';
      });
    }
  }

  void _remove() {
    _controller.clear();
    setState(() => _error = null);
    widget.onChanged(null);
  }

  @override
  Widget build(BuildContext context) {
    final applied = widget.applied;
    if (applied != null) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: GodropColors.success.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: GodropColors.success.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            const Icon(Icons.local_offer_rounded, size: 18, color: GodropColors.success),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(applied.code,
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 14, color: GodropColors.ink)),
                  Text(applied.description,
                      style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                ],
              ),
            ),
            GestureDetector(
              onTap: _remove,
              child: const Icon(Icons.close_rounded, size: 18, color: GodropColors.mute),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                textCapitalization: TextCapitalization.characters,
                decoration: InputDecoration(
                  hintText: 'Enter coupon code',
                  isDense: true,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  filled: true,
                  fillColor: GodropColors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: GodropColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: GodropColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: GodropColors.blue),
                  ),
                ),
                onSubmitted: (_) => _apply(),
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              height: 44,
              child: ElevatedButton(
                onPressed: _loading ? null : _apply,
                style: ElevatedButton.styleFrom(
                  backgroundColor: GodropColors.ink,
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _loading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Apply',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
        if (_error != null) ...[
          const SizedBox(height: 6),
          Text(_error!, style: const TextStyle(fontSize: 12, color: Colors.red)),
        ],
      ],
    );
  }
}
