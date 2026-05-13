import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import 'bloc/remote_orders_cubit.dart';
import 'bloc/remote_orders_state.dart';
import '../../shared/models/order_models.dart';

class AllActiveOrdersScreen extends StatefulWidget {
  const AllActiveOrdersScreen({super.key});

  @override
  State<AllActiveOrdersScreen> createState() => _AllActiveOrdersScreenState();
}

class _AllActiveOrdersScreenState extends State<AllActiveOrdersScreen> {
  @override
  void initState() {
    super.initState();
    context.read<RemoteOrdersCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        backgroundColor: GodropColors.white,
        leading: GestureDetector(onTap: () => context.pop(), child: const Icon(Icons.chevron_left_rounded, size: 28)),
        title: const Text('Active orders'),
      ),
      body: BlocBuilder<RemoteOrdersCubit, RemoteOrdersState>(
        builder: (ctx, state) {
          if (state is RemoteOrdersLoading) {
            return const Center(child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5));
          }
          final orders = state is RemoteOrdersLoaded ? state.active : <Order>[];
          if (orders.isEmpty) {
            return const Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.receipt_long_rounded, size: 48, color: GodropColors.mute),
                SizedBox(height: 12),
                Text('No active orders', style: TextStyle(color: GodropColors.slate, fontSize: 15, fontWeight: FontWeight.w600)),
                Text('Your current orders will appear here', style: TextStyle(color: GodropColors.mute, fontSize: 13)),
              ]),
            );
          }
          return RefreshIndicator(
            onRefresh: () => ctx.read<RemoteOrdersCubit>().load(),
            color: GodropColors.blue,
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) => _ActiveOrderCard(order: orders[i]),
            ),
          );
        },
      ),
    );
  }
}

class _ActiveOrderCard extends StatelessWidget {
  final Order order;
  const _ActiveOrderCard({required this.order});

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING': return Colors.orange;
      case 'ACCEPTED':
      case 'PREPARING':
      case 'READY_FOR_PICKUP': return GodropColors.blue;
      case 'IN_TRANSIT':
      case 'PICKED_UP': return GodropColors.success;
      default: return GodropColors.mute;
    }
  }

  String _statusLabel(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'Waiting';
      case 'ACCEPTED': return 'Confirmed';
      case 'PREPARING': return 'Preparing';
      case 'READY_FOR_PICKUP': return 'Ready';
      case 'PICKED_UP': return 'Picked up';
      case 'IN_TRANSIT': return 'On the way';
      default: return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go('/orders/${order.id}'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Expanded(child: Text('#${order.trackingCode ?? order.id.substring(0, 8)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: GodropColors.ink))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: _statusColor(order.status).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
                child: Text(_statusLabel(order.status), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _statusColor(order.status))),
              ),
            ]),
            const SizedBox(height: 6),
            if (order.dropoffAddress != null)
              Text(order.dropoffAddress!, style: const TextStyle(fontSize: 13, color: GodropColors.slate), maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 6),
            Row(children: [
              Text(_fmtKobo(order.totalKobo), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: GodropColors.ink)),
              const SizedBox(width: 8),
              if (order.confirmationCode != null && order.confirmationCode!.isNotEmpty) ...[
                const Text('·', style: TextStyle(color: GodropColors.mute)),
                const SizedBox(width: 8),
                Text('Code: ${order.confirmationCode}', style: const TextStyle(fontSize: 12, color: GodropColors.orange, fontWeight: FontWeight.w600)),
              ],
            ]),
          ],
        ),
      ),
    );
  }
}
