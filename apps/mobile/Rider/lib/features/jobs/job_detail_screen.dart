import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/jobs_cubit.dart';
import 'bloc/jobs_state.dart';

String _fmt(int kobo) {
  final naira = kobo / 100;
  return '₦${naira.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')}';
}

class JobDetailScreen extends StatefulWidget {
  final String orderId;
  const JobDetailScreen({super.key, required this.orderId});

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  @override
  void initState() {
    super.initState();
    context.read<JobDetailCubit>().loadOrder(widget.orderId);
  }

  void _accept() => context.read<JobDetailCubit>().acceptOrder(widget.orderId);

  void _reject() => _showRejectDialog();

  void _showRejectDialog() {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: GodropColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
            24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Reject Order?',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink),
            ),
            const SizedBox(height: 8),
            const Text(
              'Please provide a reason (optional)',
              style: TextStyle(color: GodropColors.slate, fontSize: 14),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: InputDecoration(
                hintText: 'e.g. Too far away',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: GodropColors.border),
                ),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
              ),
            ),
            const SizedBox(height: 20),
            GodropButton(
              label: 'Confirm Rejection',
              gradientColors: [GodropColors.error, GodropColors.error],
              onTap: () {
                Navigator.pop(ctx);
                context.read<JobDetailCubit>().rejectOrder(
                    widget.orderId,
                    reason: controller.text.isNotEmpty ? controller.text : null);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<JobDetailCubit, JobDetailState>(
      listener: (ctx, state) {
        if (state is JobActionSuccess) {
          if (state.action == 'accepted') {
            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
              content: Text('Order accepted! Head to pickup.'),
              backgroundColor: GodropColors.success,
              behavior: SnackBarBehavior.floating,
            ));
            ctx.go('/active');
          } else {
            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
              content: Text('Order rejected.'),
              behavior: SnackBarBehavior.floating,
            ));
            ctx.pop();
          }
        } else if (state is JobDetailError) {
          ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
            content: Text(state.message),
            backgroundColor: GodropColors.error,
            behavior: SnackBarBehavior.floating,
          ));
        }
      },
      builder: (ctx, state) {
        if (state is JobDetailLoading || state is JobDetailInitial) {
          return const Scaffold(
            body: Center(
                child: CircularProgressIndicator(color: GodropColors.blue)),
          );
        }
        if (state is JobDetailError) {
          return Scaffold(
            appBar: AppBar(),
            body: Center(
              child: Text(state.message,
                  style: const TextStyle(color: GodropColors.slate)),
            ),
          );
        }
        if (state is JobDetailLoaded) {
          return _buildDetail(ctx, state.order);
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildDetail(BuildContext ctx, RiderOrderDetail order) {
    final isPending = order.status == 'PENDING';
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: Text('#${order.trackingCode}'),
        leading: GestureDetector(
          onTap: () => ctx.pop(),
          child: const Icon(Icons.chevron_left_rounded, size: 26),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Earnings card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: GodropColors.blueGradient,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                const Text('Delivery Fee',
                    style: TextStyle(color: GodropColors.white, fontSize: 13)),
                const SizedBox(height: 6),
                Text(
                  _fmt(order.deliveryFeeKobo),
                  style: const TextStyle(
                    color: GodropColors.white,
                    fontSize: 36,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Order total: ${_fmt(order.totalKobo)} · ${order.paymentMethod}',
                  style: TextStyle(
                      color: GodropColors.white.withOpacity(0.7), fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Route card
          _card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _cardTitle('Route'),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: GodropColors.blue,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Container(
                            width: 1, height: 32, color: GodropColors.border),
                        const Icon(Icons.location_on_rounded,
                            color: GodropColors.error, size: 16),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _addressBlock(
                            label: 'Pickup',
                            address: order.pickupAddress,
                            subtext: order.vendor?.name,
                          ),
                          const SizedBox(height: 20),
                          _addressBlock(
                            label: 'Dropoff',
                            address: order.dropoffAddress,
                            subtext: order.recipientName != null
                                ? '${order.recipientName} · ${order.recipientPhone ?? ''}'
                                : null,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Items card
          if (order.items.isNotEmpty)
            _card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _cardTitle('Order Items'),
                  const SizedBox(height: 12),
                  ...order.items.map((item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            Text(
                              '${item.quantity}×',
                              style: const TextStyle(
                                  color: GodropColors.mute, fontSize: 13),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(item.name,
                                  style: const TextStyle(
                                      color: GodropColors.ink, fontSize: 14)),
                            ),
                            Text(
                              _fmt(item.totalKobo),
                              style: const TextStyle(
                                  color: GodropColors.slate, fontSize: 13),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          const SizedBox(height: 12),

          // Status timeline
          if (order.events.isNotEmpty)
            _card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _cardTitle('Status Timeline'),
                  const SizedBox(height: 12),
                  ...order.events.asMap().entries.map((entry) {
                    final event = entry.value;
                    final isLast = entry.key == order.events.length - 1;
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                color: isLast
                                    ? GodropColors.success
                                    : GodropColors.blue,
                                shape: BoxShape.circle,
                              ),
                            ),
                            if (!isLast)
                              Container(
                                  width: 1,
                                  height: 28,
                                  color: GodropColors.border),
                          ],
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  event.status,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: GodropColors.ink),
                                ),
                                if (event.description != null)
                                  Text(event.description!,
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: GodropColors.mute)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    );
                  }),
                ],
              ),
            ),

          const SizedBox(height: 80),
        ],
      ),
      bottomNavigationBar: isPending
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Row(
                  children: [
                    Expanded(
                      child: GodropOutlineButton(
                        label: 'Reject',
                        color: GodropColors.error,
                        onTap: _reject,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: GodropButton(
                        label: 'Accept Order',
                        onTap: _accept,
                      ),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }

  Widget _card({required Widget child}) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: child,
      );

  Widget _cardTitle(String title) => Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: GodropColors.ink,
        ),
      );

  Widget _addressBlock({
    required String label,
    required String address,
    String? subtext,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(fontSize: 11, color: GodropColors.mute)),
        const SizedBox(height: 2),
        Text(address,
            style: const TextStyle(
                fontSize: 14, fontWeight: FontWeight.w500, color: GodropColors.ink)),
        if (subtext != null)
          Text(subtext,
              style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
      ],
    );
  }
}
