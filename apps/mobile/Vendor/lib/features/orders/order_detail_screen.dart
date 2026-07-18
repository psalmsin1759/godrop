import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/order_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/section_header.dart';
import '../../shared/widgets/skeleton.dart';
import '../../shared/widgets/status_chip.dart';
import '../profile/bloc/session_cubit.dart';
import 'bloc/order_detail_cubit.dart';
import 'bloc/order_detail_state.dart';

class OrderDetailScreen extends StatelessWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => OrderDetailCubit()..load(orderId),
      child: _OrderDetailView(orderId: orderId),
    );
  }
}

class _OrderDetailView extends StatelessWidget {
  final String orderId;
  const _OrderDetailView({required this.orderId});

  Future<void> _runAction(BuildContext ctx, String action,
      {bool askReason = false}) async {
    final cubit = ctx.read<OrderDetailCubit>();
    String? reason;
    if (askReason) {
      reason = await _promptReason(ctx, action);
      if (reason == null) return; // dismissed
    }
    final err = await cubit.act(orderId, action,
        reason: reason?.isEmpty ?? true ? null : reason);
    if (err != null && ctx.mounted) {
      ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
        content: Text(err),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
    }
  }

  Future<String?> _promptReason(BuildContext ctx, String action) {
    final ctrl = TextEditingController();
    return showModalBottomSheet<String>(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: GodropColors.card,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) => Padding(
        padding: EdgeInsets.fromLTRB(
            20, 20, 20, MediaQuery.of(sheetCtx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              action == 'reject' ? 'Reject this order?' : 'Cancel this order?',
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink),
            ),
            const SizedBox(height: 6),
            const Text(
              'If the customer already paid, the amount is refunded to their Godrop wallet.',
              style: TextStyle(fontSize: 13, color: GodropColors.slate),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: ctrl,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: 'Reason (optional)',
                filled: true,
                fillColor: GodropColors.background,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            GodropButton(
              label: action == 'reject' ? 'Reject order' : 'Cancel order',
              color: GodropColors.error,
              onTap: () => Navigator.of(sheetCtx).pop(ctrl.text.trim()),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Order'),
          backgroundColor: GodropColors.background),
      body: BlocBuilder<OrderDetailCubit, OrderDetailState>(
        builder: (ctx, state) {
          if (state is OrderDetailLoading || state is OrderDetailInitial) {
            return const DetailSkeleton();
          }
          if (state is OrderDetailError) {
            return EmptyState(
              icon: Icons.cloud_off_rounded,
              title: 'Could not load order',
              subtitle: state.message,
              actionLabel: 'Retry',
              onAction: () => ctx.read<OrderDetailCubit>().load(orderId),
            );
          }
          final loaded = state as OrderDetailLoaded;
          final order = loaded.order;
          return Column(
            children: [
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () =>
                      ctx.read<OrderDetailCubit>().load(orderId),
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                    children: [
                      _SummaryCard(order: order),
                      const SizedBox(height: 20),
                      const GodropSectionHeader(title: 'Items'),
                      const SizedBox(height: 12),
                      _ItemsCard(order: order),
                      const SizedBox(height: 20),
                      const GodropSectionHeader(title: 'Delivery'),
                      const SizedBox(height: 12),
                      _DeliveryCard(order: order),
                      if (order.events.isNotEmpty) ...[
                        const SizedBox(height: 20),
                        const GodropSectionHeader(title: 'Timeline'),
                        const SizedBox(height: 12),
                        _TimelineCard(events: order.events),
                      ],
                    ],
                  ),
                ),
              ),
              _ActionBar(
                order: order,
                acting: loaded.acting,
                onAction: (a, {askReason = false}) =>
                    _runAction(ctx, a, askReason: askReason),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final VendorOrder order;
  const _SummaryCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('#${order.trackingCode}',
                    style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink,
                        letterSpacing: -0.3)),
              ),
              StatusChip(status: order.status),
            ],
          ),
          const SizedBox(height: 4),
          Text(formatDateTime(order.createdAt),
              style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
          const Divider(height: 24),
          if (order.customer != null) ...[
            _InfoRow(
                icon: Icons.person_outline_rounded,
                label: 'Customer',
                value: order.customer!.fullName),
            if (order.customer!.phone != null)
              _InfoRow(
                  icon: Icons.phone_outlined,
                  label: 'Phone',
                  value: order.customer!.phone!),
          ],
          _InfoRow(
              icon: Icons.payments_outlined,
              label: 'Payment',
              value:
                  '${_paymentMethodLabel(order.paymentMethod)} · ${order.paymentStatus}'),
          if (order.notes != null && order.notes!.isNotEmpty)
            _InfoRow(
                icon: Icons.sticky_note_2_outlined,
                label: 'Notes',
                value: order.notes!),
          if (order.cancellationReason != null)
            _InfoRow(
                icon: Icons.cancel_outlined,
                label: 'Cancellation',
                value: order.cancellationReason!),
        ],
      ),
    );
  }

  String _paymentMethodLabel(String method) => switch (method) {
        'CARD' => 'Card',
        'WALLET' => 'Wallet',
        'CASH' => 'Cash on delivery',
        'WALLET_CARD' => 'Wallet + Card',
        _ => method,
      };
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow(
      {required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: GodropColors.mute),
          const SizedBox(width: 10),
          SizedBox(
            width: 90,
            child: Text(label,
                style:
                    const TextStyle(fontSize: 13, color: GodropColors.mute)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: GodropColors.ink)),
          ),
        ],
      ),
    );
  }
}

class _ItemsCard extends StatelessWidget {
  final VendorOrder order;
  const _ItemsCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          for (final item in order.items) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: GodropColors.blue.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text('${item.quantity}×',
                          style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.blue)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.name,
                            style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink)),
                        if (item.notes != null && item.notes!.isNotEmpty)
                          Text(item.notes!,
                              style: const TextStyle(
                                  fontSize: 12, color: GodropColors.mute)),
                      ],
                    ),
                  ),
                  Text(formatKobo(item.totalKobo),
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: GodropColors.ink)),
                ],
              ),
            ),
          ],
          const Divider(height: 20),
          _TotalRow(label: 'Subtotal', kobo: order.subtotalKobo),
          _TotalRow(label: 'Delivery fee', kobo: order.deliveryFeeKobo),
          if (order.serviceFeeKobo > 0)
            _TotalRow(label: 'Service fee', kobo: order.serviceFeeKobo),
          if (order.discountKobo > 0)
            _TotalRow(label: 'Discount', kobo: -order.discountKobo),
          const SizedBox(height: 6),
          Row(
            children: [
              const Expanded(
                child: Text('Total',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink)),
              ),
              Text(formatKobo(order.totalKobo),
                  style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.orange)),
            ],
          ),
        ],
      ),
    );
  }
}

class _TotalRow extends StatelessWidget {
  final String label;
  final int kobo;
  const _TotalRow({required this.label, required this.kobo});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Expanded(
            child: Text(label,
                style:
                    const TextStyle(fontSize: 13, color: GodropColors.slate)),
          ),
          Text(formatKobo(kobo),
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: GodropColors.ink)),
        ],
      ),
    );
  }
}

class _DeliveryCard extends StatelessWidget {
  final VendorOrder order;
  const _DeliveryCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          _InfoRow(
              icon: Icons.storefront_outlined,
              label: 'Pickup',
              value: order.pickupAddress),
          _InfoRow(
              icon: Icons.location_on_outlined,
              label: 'Drop-off',
              value: order.dropoffAddress),
          if (order.recipientName != null)
            _InfoRow(
                icon: Icons.person_pin_circle_outlined,
                label: 'Recipient',
                value:
                    '${order.recipientName}${order.recipientPhone != null ? ' · ${order.recipientPhone}' : ''}'),
        ],
      ),
    );
  }
}

class _TimelineCard extends StatelessWidget {
  final List<OrderEvent> events;
  const _TimelineCard({required this.events});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(20),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          for (var i = 0; i < events.length; i++)
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        margin: const EdgeInsets.only(top: 4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: i == events.length - 1
                              ? GodropColors.blue
                              : GodropColors.border,
                        ),
                      ),
                      if (i < events.length - 1)
                        Expanded(
                          child: Container(
                              width: 2, color: GodropColors.divider),
                        ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            events[i].description ?? events[i].status,
                            style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: GodropColors.ink),
                          ),
                          Text(formatDateTime(events[i].createdAt),
                              style: const TextStyle(
                                  fontSize: 11, color: GodropColors.mute)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _ActionBar extends StatelessWidget {
  final VendorOrder order;
  final bool acting;
  final void Function(String action, {bool askReason}) onAction;

  const _ActionBar({
    required this.order,
    required this.acting,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final isManagerOrAbove = context.watch<SessionCubit>().isManagerOrAbove;

    final buttons = <Widget>[];
    switch (order.status) {
      case 'PENDING':
        buttons.addAll([
          Expanded(
            child: GodropButton(
              label: acting ? 'Working...' : 'Accept order',
              onTap: acting ? null : () => onAction('accept'),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: GodropButton(
              label: 'Reject',
              color: GodropColors.error,
              onTap: acting
                  ? null
                  : () => onAction('reject', askReason: true),
            ),
          ),
        ]);
      case 'ACCEPTED':
        buttons.addAll([
          Expanded(
            child: GodropButton(
              label: acting ? 'Working...' : 'Start preparing',
              onTap: acting ? null : () => onAction('preparing'),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: GodropButton(
              label: 'Mark ready',
              color: GodropColors.success,
              onTap: acting ? null : () => onAction('ready'),
            ),
          ),
        ]);
      case 'PREPARING':
        buttons.add(
          Expanded(
            child: GodropButton(
              label: acting ? 'Working...' : 'Mark ready for pickup',
              color: GodropColors.success,
              onTap: acting ? null : () => onAction('ready'),
            ),
          ),
        );
    }

    final canCancel = isManagerOrAbove &&
        const ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP']
            .contains(order.status);

    if (buttons.isEmpty && !canCancel) return const SizedBox.shrink();

    return Container(
      padding: EdgeInsets.fromLTRB(
          20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: GodropColors.white,
        boxShadow: [
          BoxShadow(
            color: GodropColors.ink.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (buttons.isNotEmpty) Row(children: buttons),
          if (canCancel) ...[
            if (buttons.isNotEmpty) const SizedBox(height: 8),
            GestureDetector(
              onTap: acting ? null : () => onAction('cancel', askReason: true),
              child: const Padding(
                padding: EdgeInsets.all(8),
                child: Text('Cancel order',
                    style: TextStyle(
                        color: GodropColors.error,
                        fontSize: 14,
                        fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
