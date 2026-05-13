import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/notification_models.dart';
import 'bloc/notifications_cubit.dart';
import 'bloc/notifications_state.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _filter = 'All';
  static const _filters = ['All', 'Orders', 'Promos', 'Wallet', 'System'];

  @override
  void initState() {
    super.initState();
    context.read<NotificationsCubit>().load();
  }

  List<AppNotification> _applyFilter(List<AppNotification> all) {
    if (_filter == 'All') return all;
    return all.where((n) {
      final type = (n.data?['type'] as String?) ?? '';
      return type.toLowerCase().contains(_filter.toLowerCase()) ||
          n.title.toLowerCase().contains(_filter.toLowerCase()) ||
          n.body.toLowerCase().contains(_filter.toLowerCase());
    }).toList();
  }

  IconData _iconFor(AppNotification n) {
    final type = (n.data?['type'] as String?) ?? '';
    if (type.contains('order') || n.title.toLowerCase().contains('order')) {
      return Icons.check_circle_rounded;
    }
    if (type.contains('promo') || n.title.toLowerCase().contains('promo')) {
      return Icons.local_offer_rounded;
    }
    if (type.contains('wallet') || n.title.toLowerCase().contains('wallet')) {
      return Icons.account_balance_wallet_rounded;
    }
    if (type.contains('rider') || n.title.toLowerCase().contains('rider')) {
      return Icons.directions_bike_rounded;
    }
    return Icons.notifications_rounded;
  }

  Color _iconBgFor(AppNotification n) {
    final type = (n.data?['type'] as String?) ?? '';
    if (type.contains('promo')) return const Color(0xFFFFF0E8);
    if (type.contains('wallet')) return const Color(0xFFE8EFFF);
    return const Color(0xFFE8F5EE);
  }

  Color _iconColorFor(AppNotification n) {
    final type = (n.data?['type'] as String?) ?? '';
    if (type.contains('promo')) return GodropColors.orange;
    if (type.contains('wallet')) return GodropColors.blue;
    return GodropColors.success;
  }

  String _fmtTime(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays == 1) return 'Yesterday';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return '${months[dt.month - 1]} ${dt.day}';
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        backgroundColor: GodropColors.white,
        leading: GestureDetector(
          onTap: () => context.go('/profile'),
          child: const Icon(Icons.chevron_left_rounded, size: 28),
        ),
        title: BlocBuilder<NotificationsCubit, NotificationsState>(
          builder: (_, state) {
            final unread = state is NotificationsLoaded ? state.unreadCount : 0;
            return Row(
              children: [
                const Text('Notifications'),
                if (unread > 0) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(color: GodropColors.blue, borderRadius: BorderRadius.circular(20)),
                    child: Text('$unread', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                  ),
                ],
              ],
            );
          },
        ),
        actions: [
          TextButton(
            onPressed: () => context.read<NotificationsCubit>().markAllRead(),
            child: const Text('Mark read', style: TextStyle(color: GodropColors.blue, fontSize: 14)),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: GodropColors.white,
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _filters.map((f) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => setState(() => _filter = f),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: _filter == f ? GodropColors.blue : GodropColors.background,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(f, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: _filter == f ? Colors.white : GodropColors.slate)),
                    ),
                  ),
                )).toList(),
              ),
            ),
          ),
          Expanded(
            child: BlocBuilder<NotificationsCubit, NotificationsState>(
              builder: (ctx, state) {
                if (state is NotificationsLoading) {
                  return const Center(child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2));
                }

                if (state is NotificationsError) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline_rounded, color: GodropColors.mute, size: 40),
                        const SizedBox(height: 12),
                        Text(state.message, style: const TextStyle(fontSize: 14, color: GodropColors.mute)),
                        const SizedBox(height: 16),
                        TextButton(
                          onPressed: () => ctx.read<NotificationsCubit>().load(),
                          child: const Text('Retry', style: TextStyle(color: GodropColors.blue)),
                        ),
                      ],
                    ),
                  );
                }

                final notifications = state is NotificationsLoaded
                    ? _applyFilter(state.notifications)
                    : <AppNotification>[];

                if (notifications.isEmpty) {
                  return const Center(
                    child: Text('No notifications yet', style: TextStyle(fontSize: 14, color: GodropColors.mute)),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: notifications.length,
                  itemBuilder: (_, i) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: GestureDetector(
                      onTap: () {
                        final n = notifications[i];
                        if (!n.isRead) {
                          ctx.read<NotificationsCubit>().markRead([n.id]);
                        }
                      },
                      child: _NotifCard(
                        notif: notifications[i],
                        icon: _iconFor(notifications[i]),
                        iconBg: _iconBgFor(notifications[i]),
                        iconColor: _iconColorFor(notifications[i]),
                        timeStr: _fmtTime(notifications[i].createdAt),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _NotifCard extends StatelessWidget {
  final AppNotification notif;
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String timeStr;
  const _NotifCard({
    required this.notif,
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.timeStr,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: notif.isRead ? GodropColors.white : GodropColors.blue.withOpacity(0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: notif.isRead ? Colors.transparent : GodropColors.blue.withOpacity(0.12)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, size: 20, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(notif.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink))),
                    if (!notif.isRead) Container(width: 6, height: 6, decoration: const BoxDecoration(shape: BoxShape.circle, color: GodropColors.blue)),
                  ],
                ),
                const SizedBox(height: 3),
                Text(notif.body, style: const TextStyle(fontSize: 13, color: GodropColors.slate, height: 1.4)),
                const SizedBox(height: 4),
                Text(timeStr, style: const TextStyle(fontSize: 11, color: GodropColors.mute)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
