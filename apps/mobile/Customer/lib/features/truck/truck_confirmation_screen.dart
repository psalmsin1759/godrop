import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/common_models.dart';
import '../../shared/models/delivery_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../orders/bloc/order_cubit.dart';
import '../orders/models/active_order.dart';
import 'models/truck_booking_data.dart';

class TruckConfirmationScreen extends StatefulWidget {
  final TruckBookingData booking;
  const TruckConfirmationScreen({super.key, required this.booking});

  @override
  State<TruckConfirmationScreen> createState() =>
      _TruckConfirmationScreenState();
}

class _TruckConfirmationScreenState extends State<TruckConfirmationScreen> {
  int _paymentMethod = 0; // 0=card, 1=cash
  bool _placing = false;

  TruckBookingData get b => widget.booking;

  String _fmt(int kobo) {
    final n = (kobo ~/ 100).toString();
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  String _parseDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final msg = data['message'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return 'Something went wrong. Please try again.';
  }

  Future<void> _confirmBooking() async {
    if (_placing) return;
    setState(() => _placing = true);

    try {
      final service = TruckService(DioClient.instance);
      final scheduledAt = DateTime(
        b.scheduledDate.year,
        b.scheduledDate.month,
        b.scheduledDate.day,
        b.scheduledTime.hour,
        b.scheduledTime.minute,
      ).toUtc().toIso8601String();

      await service.bookTruck(TruckOrderBody(
        apartmentTypeId: b.apartmentTypeId ?? '',
        numLoaders: b.loaderCount > 0 ? b.loaderCount : null,
        pickup: LocationPoint(
            lat: b.pickup.lat, lng: b.pickup.lng, address: b.pickup.name),
        dropoff: LocationPoint(
            lat: b.dropoff.lat, lng: b.dropoff.lng, address: b.dropoff.name),
        scheduledAt: scheduledAt,
        paymentMethod: _paymentMethod == 0 ? 'card' : 'cash',
      ));
    } on DioException catch (e) {
      if (!mounted) return;
      setState(() => _placing = false);
      _showError(_parseDioError(e));
      return;
    } catch (_) {
      if (!mounted) return;
      setState(() => _placing = false);
      _showError('Failed to book truck. Please try again.');
      return;
    }

    if (!mounted) return;

    final order = ActiveOrderData(
      riderName: 'Pending Assignment',
      riderRating: 0.0,
      riderTrips: 0,
      riderVehicleNo: '—',
      riderDistance: '—',
      pickup: b.pickup,
      dropoff: b.dropoff,
      vehicleIndex: 0,
      orderType: 'truck',
      scheduledDate: b.scheduledDateLabel,
      scheduledTime: b.scheduledTimeLabel,
      apartmentType: b.apartmentTypeName,
      loaderCount: b.loaderCount,
    );

    context.read<OrderCubit>().placeOrder(order);
    context.go('/orders');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: const BoxDecoration(
                color: GodropColors.success,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_rounded,
                  color: Colors.white, size: 16),
            ),
            const SizedBox(width: 10),
            const Text(
              'Truck booked! We\'ll confirm shortly.',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ],
        ),
        backgroundColor: GodropColors.ink,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;
    final bd = b.priceBreakdown;

    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Column(
        children: [
          // ── Blue header ──
          Container(
            decoration: const BoxDecoration(gradient: GodropColors.blueGradient),
            padding: EdgeInsets.fromLTRB(16, topPad + 10, 16, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.chevron_left_rounded,
                            color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Confirm Booking',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('FROM',
                                style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.white60,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.4)),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                      color: GodropColors.orange,
                                      shape: BoxShape.circle),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    b.pickup.name,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            const Text('TO',
                                style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.white60,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.4)),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.6),
                                      shape: BoxShape.circle),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    b.dropoff.name,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${b.distanceKm.toStringAsFixed(1)} km',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Text('distance',
                              style: TextStyle(
                                  color: Colors.white60, fontSize: 11)),
                          if (b.estimatedMinutes != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              '~${b.estimatedMinutes} min',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Scrollable details ──
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(16, 20, 16, bottomPad + 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Move details card ──
                  _SectionCard(
                    title: 'Move Details',
                    icon: Icons.local_shipping_rounded,
                    children: [
                      _DetailRow(
                        icon: Icons.calendar_today_rounded,
                        iconColor: GodropColors.blue,
                        label: 'Date',
                        value: b.scheduledDateLabel,
                      ),
                      _DetailRow(
                        icon: Icons.access_time_rounded,
                        iconColor: GodropColors.orange,
                        label: 'Time',
                        value: b.scheduledTimeLabel,
                      ),
                      if (b.apartmentTypeName != null)
                        _DetailRow(
                          icon: Icons.home_rounded,
                          iconColor: GodropColors.slate,
                          label: 'Apartment',
                          value: b.apartmentTypeName!,
                        ),
                      if (b.truckTypeName.isNotEmpty)
                        _DetailRow(
                          icon: Icons.airport_shuttle_rounded,
                          iconColor: GodropColors.blue,
                          label: 'Truck',
                          value: b.truckTypeName,
                        ),
                      _DetailRow(
                        icon: Icons.people_rounded,
                        iconColor: GodropColors.slate,
                        label: 'Loaders',
                        value: '${b.loaderCount} loader${b.loaderCount != 1 ? 's' : ''}',
                        isLast: true,
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // ── Price breakdown card ──
                  _SectionCard(
                    title: 'Price Breakdown',
                    icon: Icons.receipt_long_rounded,
                    children: bd != null
                        ? [
                            if (bd.apartmentCostKobo != null)
                              _PriceRow(
                                label: b.apartmentTypeName ?? 'Apartment',
                                value: _fmt(bd.apartmentCostKobo!),
                              ),
                            if (bd.kmCostKobo != null && bd.distanceKm != null)
                              _PriceRow(
                                label:
                                    '${bd.distanceKm!.toStringAsFixed(1)} km distance',
                                value: _fmt(bd.kmCostKobo!),
                              ),
                            if (bd.loadersCostKobo != null &&
                                bd.loadersCostKobo! > 0)
                              _PriceRow(
                                label:
                                    '${b.loaderCount} loader${b.loaderCount != 1 ? 's' : ''}',
                                value: _fmt(bd.loadersCostKobo!),
                              ),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 8),
                              child: Divider(
                                  height: 1, color: GodropColors.border),
                            ),
                            _PriceRow(
                              label: 'Total',
                              value: _fmt(bd.totalKobo),
                              isTotal: true,
                            ),
                          ]
                        : [
                            Shimmer.fromColors(
                              baseColor: Colors.grey.shade200,
                              highlightColor: Colors.grey.shade50,
                              child: Column(
                                children: List.generate(
                                  3,
                                  (_) => Padding(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 6),
                                    child: Container(
                                      height: 16,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                  ),

                  const SizedBox(height: 16),

                  // ── Payment method ──
                  _SectionCard(
                    title: 'Payment Method',
                    icon: Icons.payments_rounded,
                    children: [
                      _PaymentOption(
                        icon: Icons.credit_card_rounded,
                        label: 'Pay with Card',
                        sublabel: 'Paystack · Debit / Credit card',
                        selected: _paymentMethod == 0,
                        onTap: () => setState(() => _paymentMethod = 0),
                      ),
                      const SizedBox(height: 10),
                      _PaymentOption(
                        icon: Icons.money_rounded,
                        label: 'Cash on Delivery',
                        sublabel: 'Pay the driver in cash',
                        selected: _paymentMethod == 1,
                        onTap: () => setState(() => _paymentMethod = 1),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: GodropColors.blue.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: GodropColors.blue.withValues(alpha: 0.15)),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.info_outline_rounded,
                            size: 16, color: GodropColors.blue),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'A driver will be assigned to your booking and you\'ll get a notification with their details before your move.',
                            style: TextStyle(
                                fontSize: 12,
                                color: GodropColors.blue,
                                height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── CTA ──
          Container(
            padding: EdgeInsets.fromLTRB(16, 12, 16, bottomPad + 16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 12,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total',
                        style:
                            TextStyle(fontSize: 13, color: GodropColors.slate)),
                    bd != null
                        ? Text(
                            _fmt(bd.totalKobo),
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.ink,
                            ),
                          )
                        : Shimmer.fromColors(
                            baseColor: Colors.grey.shade200,
                            highlightColor: Colors.grey.shade50,
                            child: Container(
                              width: 80,
                              height: 20,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                  ],
                ),
                const SizedBox(height: 10),
                GodropButton(
                  label: _placing ? 'Booking...' : 'Confirm & Book',
                  onTap: _placing ? null : _confirmBooking,
                  color: GodropColors.orange,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Section card ──────────────────────────────────────────────────────────────

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 15, color: GodropColors.blue),
              const SizedBox(width: 6),
              Text(
                title.toUpperCase(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.slate,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }
}

// ── Detail row ────────────────────────────────────────────────────────────────

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final bool isLast;

  const _DetailRow({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, size: 16, color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label,
                  style: const TextStyle(
                      fontSize: 13, color: GodropColors.slate)),
            ),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: GodropColors.ink,
              ),
            ),
          ],
        ),
        if (!isLast)
          const Padding(
            padding: EdgeInsets.only(left: 44, top: 8, bottom: 8),
            child: Divider(height: 1, color: GodropColors.border),
          ),
      ],
    );
  }
}

// ── Price row ─────────────────────────────────────────────────────────────────

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;

  const _PriceRow(
      {required this.label, required this.value, this.isTotal = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 15 : 13,
              fontWeight: isTotal ? FontWeight.w700 : FontWeight.w400,
              color: isTotal ? GodropColors.ink : GodropColors.slate,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 16 : 14,
              fontWeight: FontWeight.w700,
              color: isTotal ? GodropColors.orange : GodropColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Payment option ────────────────────────────────────────────────────────────

class _PaymentOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final String sublabel;
  final bool selected;
  final VoidCallback onTap;

  const _PaymentOption({
    required this.icon,
    required this.label,
    required this.sublabel,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected
              ? GodropColors.blue.withValues(alpha: 0.06)
              : GodropColors.background,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? GodropColors.blue : GodropColors.border,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: selected
                    ? GodropColors.blue.withValues(alpha: 0.1)
                    : Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon,
                  size: 20,
                  color: selected ? GodropColors.blue : GodropColors.slate),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: selected ? GodropColors.blue : GodropColors.ink,
                    ),
                  ),
                  Text(sublabel,
                      style: const TextStyle(
                          fontSize: 12, color: GodropColors.mute)),
                ],
              ),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: selected ? GodropColors.blue : GodropColors.border,
                  width: selected ? 5 : 1.5,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
