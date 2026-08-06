import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../active/bloc/active_cubit.dart';
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
            ctx.read<JobsCubit>().loadJobs();
            ctx.read<ActiveCubit>().loadActiveOrder();
            ctx.pop();
            ctx.go('/active');
          } else {
            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
              content: Text('Order rejected.'),
              behavior: SnackBarBehavior.floating,
            ));
            ctx.read<JobsCubit>().loadJobs();
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
        if (state is JobDetailLoading ||
            state is JobDetailInitial ||
            state is JobActionSuccess) {
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
    final isPending = order.status == 'READY_FOR_PICKUP';
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
                      color: GodropColors.white.withValues(alpha: 0.7), fontSize: 13),
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
                            label: order.isMultiParcel ? 'Drop-offs' : 'Dropoff',
                            address: order.isMultiParcel
                                ? '${order.parcelCount} destinations'
                                : order.dropoffAddress,
                            subtext: order.isMultiParcel
                                ? null
                                : (isPending
                                    ? 'Recipient details available after you accept'
                                    : (order.recipientName != null
                                        ? '${order.recipientName} · ${order.recipientPhone ?? ''}'
                                        : null)),
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

          // Parcels card (multi-drop-off) — each parcel's recipient + earning
          if (order.isMultiParcel && order.dropoffs != null)
            _card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _cardTitle('Parcels (${order.parcelCount})'),
                  const SizedBox(height: 12),
                  ...order.dropoffs!.map((p) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 22,
                              height: 22,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: GodropColors.blue.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Text('${p.sequence}',
                                  style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: GodropColors.blue)),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p.recipientName,
                                      style: const TextStyle(
                                          fontSize: 13.5,
                                          fontWeight: FontWeight.w600,
                                          color: GodropColors.ink)),
                                  Text(p.address,
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: GodropColors.slate)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(_fmt(p.deliveryFeeKobo),
                                style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: GodropColors.orange)),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          if (order.isMultiParcel) const SizedBox(height: 12),

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
                child: GodropButton(
                  label: 'Accept Order',
                  onTap: _accept,
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
          border: Border.all(color: GodropColors.border),
          boxShadow: GodropColors.softShadow,
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
