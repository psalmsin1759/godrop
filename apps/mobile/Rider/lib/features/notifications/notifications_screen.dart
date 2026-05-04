import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import 'bloc/notifications_cubit.dart';
import 'bloc/notifications_state.dart';

String _relativeDate(String isoDate) {
  try {
    final dt = DateTime.parse(isoDate).toLocal();
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    return '${dt.day}/${dt.month}/${dt.year}';
  } catch (_) {
    return isoDate;
  }
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<NotificationsCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          BlocBuilder<NotificationsCubit, NotificationsState>(
            builder: (ctx, state) {
              if (state is! NotificationsLoaded || state.unreadCount == 0) {
                return const SizedBox.shrink();
              }
              return TextButton(
                onPressed: () => ctx.read<NotificationsCubit>().markAllRead(),
                child: const Text('Mark all read',
                    style: TextStyle(color: GodropColors.blue, fontSize: 13)),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<NotificationsCubit, NotificationsState>(
        builder: (ctx, state) {
          if (state is NotificationsLoading) return _shimmer();
          if (state is NotificationsError) return _error(ctx, state.message);
          if (state is NotificationsLoaded) {
            if (state.notifications.isEmpty) return _empty();
            return _list(ctx, state);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _list(BuildContext ctx, NotificationsLoaded state) {
    return RefreshIndicator(
      onRefresh: () => ctx.read<NotificationsCubit>().load(),
      color: GodropColors.blue,
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: state.notifications.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) =>
            _NotifCard(
              notif: state.notifications[i],
              onTap: () => ctx.read<NotificationsCubit>().markRead(state.notifications[i].id),
            ),
      ),
    );
  }

  Widget _empty() {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.notifications_none_rounded,
              color: GodropColors.mute, size: 48),
          SizedBox(height: 12),
          Text('No notifications',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink)),
          SizedBox(height: 6),
          Text('You\'ll see job alerts and updates here.',
              style: TextStyle(fontSize: 13, color: GodropColors.mute)),
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
            onPressed: () => ctx.read<NotificationsCubit>().load(),
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
        padding: const EdgeInsets.all(12),
        itemCount: 8,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, __) => Container(
          height: 72,
          decoration: BoxDecoration(
              color: GodropColors.white,
              borderRadius: BorderRadius.circular(14)),
        ),
      ),
    );
  }
}

class _NotifCard extends StatelessWidget {
  final RiderNotification notif;
  final VoidCallback onTap;

  const _NotifCard({required this.notif, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notif.isRead ? GodropColors.white : GodropColors.blue.withOpacity(0.05),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: notif.isRead
                ? GodropColors.border
                : GodropColors.blue.withOpacity(0.2),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: notif.isRead
                    ? GodropColors.background
                    : GodropColors.blue.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.notifications_rounded,
                color: notif.isRead ? GodropColors.mute : GodropColors.blue,
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    notif.title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight:
                          notif.isRead ? FontWeight.w400 : FontWeight.w600,
                      color: GodropColors.ink,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    notif.body,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.slate, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              _relativeDate(notif.createdAt),
              style: const TextStyle(fontSize: 11, color: GodropColors.mute),
            ),
          ],
        ),
      ),
    );
  }
}
