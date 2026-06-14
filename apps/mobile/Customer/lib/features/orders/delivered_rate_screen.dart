import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/client/dio_client.dart';
import '../../shared/api/services/orders_service.dart';
import '../../shared/models/order_models.dart';
import '../../shared/widgets/godrop_button.dart';

/// Shown automatically (pushed on top of whatever screen the customer is on)
/// the moment an order is marked DELIVERED. Displays an order-complete
/// summary and lets the customer rate the rider.
class DeliveredRateScreen extends StatefulWidget {
  final String orderId;
  const DeliveredRateScreen({super.key, required this.orderId});

  @override
  State<DeliveredRateScreen> createState() => _DeliveredRateScreenState();
}

class _DeliveredRateScreenState extends State<DeliveredRateScreen> {
  final _ordersService = OrdersService(DioClient.instance);

  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _order;
  Map<String, dynamic>? _rider;
  String? _deliveredAt;

  int _rating = 0;
  final Map<String, bool> _tags = {
    'On time': false,
    'Friendly': false,
    'Careful with parcel': false,
    'Great comms': false,
    'Clean vehicle': false,
  };
  final _commentController = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await DioClient.instance.get('/orders/${widget.orderId}');
      final data = res.data as Map<String, dynamic>;
      final order = data['order'] as Map<String, dynamic>?;
      final timeline = (data['timeline'] as List? ?? [])
          .map((e) => e as Map<String, dynamic>)
          .toList();
      final deliveredEvent = timeline.cast<Map<String, dynamic>?>().firstWhere(
            (e) => (e?['status'] as String? ?? '').toUpperCase() == 'DELIVERED',
            orElse: () => null,
          );
      setState(() {
        _order = order;
        _rider = data['rider'] as Map<String, dynamic>?;
        _deliveredAt = deliveredEvent?['createdAt'] as String? ??
            order?['updatedAt'] as String?;
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Could not load your order details.';
        _loading = false;
      });
    }
  }

  void _dismiss() {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go('/orders');
    }
  }

  Future<void> _submit() async {
    if (_rating == 0 || _submitting) return;
    setState(() => _submitting = true);

    final selectedTags = _tags.entries.where((e) => e.value).map((e) => e.key);
    final commentParts = [
      ...selectedTags,
      if (_commentController.text.trim().isNotEmpty) _commentController.text.trim(),
    ];
    final comment = commentParts.isEmpty ? null : commentParts.join(', ');

    try {
      await _ordersService.rateOrder(
        widget.orderId,
        RateOrderBody(rating: _rating, comment: comment),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Thanks for your feedback!'),
          backgroundColor: GodropColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
      _dismiss();
    } catch (_) {
      if (!mounted) return;
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not submit your rating. Please try again.'),
          backgroundColor: GodropColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: GodropColors.background,
        body: Center(
          child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5),
        ),
      );
    }

    if (_error != null || _order == null) {
      return Scaffold(
        backgroundColor: GodropColors.background,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(_error ?? 'Order not found',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: GodropColors.slate, fontSize: 14)),
                const SizedBox(height: 20),
                GodropButton(label: 'Close', onTap: _dismiss, fullWidth: false, height: 46),
              ],
            ),
          ),
        ),
      );
    }

    final order = _order!;
    final dropoffAddress = order['dropoffAddress'] as String? ?? '';

    final riderFirstName = _rider?['firstName'] as String? ?? '';
    final riderLastName = _rider?['lastName'] as String? ?? '';
    final riderName = '$riderFirstName $riderLastName'.trim();
    final vehicleType = _rider?['vehicleType'] as String?;
    final vehiclePlate = _rider?['vehiclePlate'] as String?;
    final vehicleInfo = [vehicleType, vehiclePlate]
        .where((v) => v != null && v.isNotEmpty)
        .join(' · ');
    final deliveryFeeKobo = (order['deliveryFeeKobo'] as num?)?.toInt() ??
        (order['totalKobo'] as num?)?.toInt() ??
        0;

    return Scaffold(
      backgroundColor: GodropColors.background,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Success header
            Container(
              width: double.infinity,
              padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 24, 20, 32),
              decoration: const BoxDecoration(gradient: GodropColors.blueGradient),
              child: Column(
                children: [
                  Align(
                    alignment: Alignment.topLeft,
                    child: GestureDetector(
                      onTap: _dismiss,
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withOpacity(0.15),
                        ),
                        child: const Icon(Icons.close_rounded, color: Colors.white, size: 20),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.4), width: 3),
                      color: Colors.white.withOpacity(0.15),
                    ),
                    child: const Icon(Icons.check_rounded, color: Colors.white, size: 36),
                  ),
                  const SizedBox(height: 16),
                  const Text('Delivered!', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(
                    dropoffAddress.isEmpty
                        ? 'Your order arrived${_deliveredAt != null ? ' · ${_fmtTime(_deliveredAt!)}' : ''}'
                        : 'Your order arrived at ${dropoffAddress.split(',').first}${_deliveredAt != null ? ' · ${_fmtTime(_deliveredAt!)}' : ''}',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_rider != null) ...[
                    // Rider card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [Color(0xFF7B4FA3), Color(0xFFC4478A)])),
                            child: Center(
                              child: Text(_initials(riderName), style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(riderName.isEmpty ? 'Your Rider' : riderName, style: const TextStyle(fontWeight: FontWeight.w600, color: GodropColors.ink, fontSize: 15)),
                                if (vehicleInfo.isNotEmpty)
                                  Text(vehicleInfo, style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
                              ],
                            ),
                          ),
                          Text(_fmtKobo(deliveryFeeKobo), style: const TextStyle(fontWeight: FontWeight.w700, color: GodropColors.ink, fontSize: 15)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Center(child: Text('How was your delivery?', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: GodropColors.ink))),
                    const SizedBox(height: 4),
                    Center(child: Text('Your feedback helps ${riderName.isEmpty ? 'your rider' : riderName.split(' ').first} get more trips.', style: const TextStyle(fontSize: 13, color: GodropColors.slate))),
                    const SizedBox(height: 16),
                    // Stars
                    Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: List.generate(5, (i) => GestureDetector(
                          onTap: () => setState(() => _rating = i + 1),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: Icon(
                              i < _rating ? Icons.star_rounded : Icons.star_border_rounded,
                              size: 40,
                              color: GodropColors.orange,
                            ),
                          ),
                        )),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text('What went well?', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _tags.entries.map((e) => GestureDetector(
                        onTap: () => setState(() => _tags[e.key] = !e.value),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: e.value ? GodropColors.blue.withOpacity(0.08) : GodropColors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: e.value ? GodropColors.blue : GodropColors.border, width: e.value ? 1.5 : 1),
                          ),
                          child: Text(e.key, style: TextStyle(fontSize: 13, color: e.value ? GodropColors.blue : GodropColors.ink, fontWeight: e.value ? FontWeight.w600 : FontWeight.w400)),
                        ),
                      )).toList(),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _commentController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Anything else you\'d like to share? (optional)',
                        hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 13),
                        filled: true,
                        fillColor: GodropColors.white,
                        contentPadding: const EdgeInsets.all(14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: GodropColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: GodropColors.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: const BorderSide(color: GodropColors.blue),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    GodropButton(
                      label: _submitting ? 'Submitting…' : 'Submit',
                      onTap: _rating == 0 || _submitting ? null : _submit,
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: TextButton(
                        onPressed: _submitting ? null : _dismiss,
                        child: const Text('Skip', style: TextStyle(color: GodropColors.mute, fontSize: 13)),
                      ),
                    ),
                  ] else ...[
                    const SizedBox(height: 8),
                    GodropButton(label: 'Done', onTap: _dismiss),
                  ],
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    if (parts.isNotEmpty) return parts[0][0].toUpperCase();
    return '?';
  }

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  String _fmtTime(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final m = dt.minute.toString().padLeft(2, '0');
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      return '$h:$m $period';
    } catch (_) {
      return '';
    }
  }
}
