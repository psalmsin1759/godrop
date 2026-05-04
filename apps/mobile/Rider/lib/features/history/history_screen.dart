import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import 'bloc/history_cubit.dart';
import 'bloc/history_state.dart';

String _fmt(int kobo) {
  final naira = kobo / 100;
  return '₦${naira.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')}';
}

String _relativeDate(String isoDate) {
  try {
    final dt = DateTime.parse(isoDate).toLocal();
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  } catch (_) {
    return isoDate;
  }
}

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    context.read<HistoryCubit>().loadHistory();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final state = context.read<HistoryCubit>().state;
      if (state is HistoryLoaded && state.hasMore) {
        context.read<HistoryCubit>().loadHistory();
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              color: GodropColors.white,
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              child: const Text(
                'Delivery History',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink,
                  letterSpacing: -0.4,
                ),
              ),
            ),
            Expanded(
              child: BlocBuilder<HistoryCubit, HistoryState>(
                builder: (ctx, state) {
                  if (state is HistoryLoading) return _shimmer();
                  if (state is HistoryError) return _error(ctx, state.message);
                  if (state is HistoryLoaded) {
                    if (state.orders.isEmpty) return _empty();
                    return _list(ctx, state);
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _list(BuildContext ctx, HistoryLoaded state) {
    return RefreshIndicator(
      onRefresh: () => ctx.read<HistoryCubit>().loadHistory(refresh: true),
      color: GodropColors.blue,
      child: ListView.separated(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: state.orders.length + (state.hasMore ? 1 : 0),
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, i) {
          if (i == state.orders.length) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(
                    color: GodropColors.blue, strokeWidth: 2),
              ),
            );
          }
          return _HistoryCard(order: state.orders[i]);
        },
      ),
    );
  }

  Widget _empty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: GodropColors.blue.withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.history_rounded,
                color: GodropColors.blue, size: 32),
          ),
          const SizedBox(height: 16),
          const Text('No deliveries yet',
              style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink)),
          const SizedBox(height: 6),
          const Text('Your completed deliveries will appear here.',
              style: TextStyle(fontSize: 14, color: GodropColors.mute)),
        ],
      ),
    );
  }

  Widget _error(BuildContext ctx, String message) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, color: GodropColors.mute, size: 40),
          const SizedBox(height: 12),
          Text(message,
              style: const TextStyle(color: GodropColors.slate, fontSize: 14)),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () =>
                ctx.read<HistoryCubit>().loadHistory(refresh: true),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _shimmer() {
    return Shimmer.fromColors(
      baseColor: GodropColors.border,
      highlightColor: GodropColors.white,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 8,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, __) => Container(
          height: 80,
          decoration: BoxDecoration(
            color: GodropColors.white,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final RiderOrder order;

  const _HistoryCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: GodropColors.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.check_circle_outline_rounded,
                color: GodropColors.success, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.vendor?.name ?? _typeLabel(order.type),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: GodropColors.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  order.dropoffAddress,
                  style: const TextStyle(fontSize: 12, color: GodropColors.mute),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  _relativeDate(order.createdAt),
                  style: const TextStyle(fontSize: 11, color: GodropColors.mute),
                ),
              ],
            ),
          ),
          Text(
            _fmt(order.deliveryFeeKobo),
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: GodropColors.orange,
            ),
          ),
        ],
      ),
    );
  }

  String _typeLabel(String type) => switch (type) {
        'FOOD' => 'Food Order',
        'GROCERY' => 'Grocery',
        'PARCEL' => 'Parcel',
        'TRUCK' => 'Truck',
        _ => 'Order',
      };
}
