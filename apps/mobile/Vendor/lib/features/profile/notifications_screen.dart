import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/notification_models.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/empty_state.dart';
import 'bloc/notifications_cubit.dart';
import 'bloc/notifications_state.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => NotificationsCubit()..load(),
      child: const _NotificationsView(),
    );
  }
}

class _NotificationsView extends StatelessWidget {
  const _NotificationsView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: GodropColors.background,
        actions: [
          BlocBuilder<NotificationsCubit, NotificationsState>(
            builder: (ctx, state) {
              final hasUnread =
                  state is NotificationsLoaded && state.unreadCount > 0;
              if (!hasUnread) return const SizedBox.shrink();
              return TextButton(
                onPressed: () =>
                    ctx.read<NotificationsCubit>().markAllRead(),
                child: const Text('Mark all read',
                    style: TextStyle(
                        color: GodropColors.blue,
                        fontWeight: FontWeight.w600)),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<NotificationsCubit, NotificationsState>(
        builder: (ctx, state) {
          if (state is NotificationsLoading ||
              state is NotificationsInitial) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is NotificationsError) {
            return EmptyState(
              icon: Icons.cloud_off_rounded,
              title: 'Could not load notifications',
              subtitle: state.message,
              actionLabel: 'Retry',
              onAction: () => ctx.read<NotificationsCubit>().load(),
            );
          }
          final loaded = state as NotificationsLoaded;
          if (loaded.notifications.isEmpty) {
            return const EmptyState(
              icon: Icons.notifications_none_rounded,
              title: 'Nothing here yet',
              subtitle: 'Order alerts and payout updates will show up here.',
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                ctx.read<NotificationsCubit>().load(silent: true),
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
              itemCount: loaded.notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, i) =>
                  _NotificationCard(notification: loaded.notifications[i]),
            ),
          );
        },
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final AdminNotification notification;
  const _NotificationCard({required this.notification});

  IconData get _icon {
    final t = notification.type.toUpperCase();
    if (t.contains('ORDER')) return Icons.receipt_long_rounded;
    if (t.contains('WALLET') || t.contains('PAYOUT')) {
      return Icons.account_balance_wallet_rounded;
    }
    return Icons.notifications_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final unread = !notification.isRead;
    return GestureDetector(
      onTap: () {
        if (unread) {
          context.read<NotificationsCubit>().markRead(notification.id);
        }
        final orderId = notification.data?['orderId'];
        if (orderId is String && orderId.isNotEmpty) {
          context.push('/orders/$orderId');
        }
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.circular(18),
          border: unread
              ? Border.all(
                  color: GodropColors.blue.withValues(alpha: 0.35))
              : null,
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: GodropColors.blue.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_icon, color: GodropColors.blue, size: 19),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(notification.title,
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight:
                              unread ? FontWeight.w700 : FontWeight.w600,
                          color: GodropColors.ink)),
                  const SizedBox(height: 2),
                  Text(notification.body,
                      style: const TextStyle(
                          fontSize: 13,
                          color: GodropColors.slate,
                          height: 1.4)),
                  const SizedBox(height: 4),
                  Text(timeAgo(notification.createdAt),
                      style: const TextStyle(
                          fontSize: 11, color: GodropColors.mute)),
                ],
              ),
            ),
            if (unread)
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 6),
                decoration: const BoxDecoration(
                    shape: BoxShape.circle, color: GodropColors.blue),
              ),
          ],
        ),
      ),
    );
  }
}
