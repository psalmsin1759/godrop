import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/profile_models.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/notifications_cubit.dart';

/// Screen 30 — notifications inbox with unread dots and "Mark all".
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

  Color _color(InvestorNotification n) {
    return switch (n.category) {
      'INVESTMENT' => InvestColors.blue,
      'PAYOUT' => InvestColors.green,
      'SAFE' => InvestColors.orangeDeep,
      'KYC' => InvestColors.blue,
      'WITHDRAWAL' => InvestColors.raise3,
      _ => InvestColors.orange,
    };
  }

  IconData _icon(InvestorNotification n) {
    return switch (n.category) {
      'INVESTMENT' => Icons.local_mall_outlined,
      'PAYOUT' => Icons.trending_up,
      'SAFE' => Icons.savings_outlined,
      'KYC' => Icons.badge_outlined,
      'WITHDRAWAL' => Icons.account_balance,
      _ => Icons.notifications_none,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocBuilder<NotificationsCubit, NotificationsState>(
          builder: (context, state) {
            final unread =
                state is NotificationsLoaded ? state.unread : 0;
            return Column(
              children: [
                InvestTopBar(
                  title: 'Notifications',
                  subtitle: '$unread unread',
                  action: GestureDetector(
                    onTap: () =>
                        context.read<NotificationsCubit>().markAllRead(),
                    child: const Text(
                      'Mark all',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: InvestColors.blueBright,
                      ),
                    ),
                  ),
                ),
                const Divider(),
                Expanded(
                  child: switch (state) {
                    NotificationsLoading() => const LoadingView(),
                    NotificationsError(message: final m) => ErrorView(
                        message: m,
                        onRetry: () =>
                            context.read<NotificationsCubit>().load(),
                      ),
                    NotificationsLoaded(notifications: final notes) =>
                      notes.isEmpty
                          ? const EmptyView(
                              title: "You're all caught up",
                              subtitle:
                                  'Payout and investment alerts will show here.',
                              icon: Icons.notifications_none,
                            )
                          : ListView.separated(
                              padding:
                                  const EdgeInsets.fromLTRB(18, 8, 18, 20),
                              itemCount: notes.length,
                              separatorBuilder: (_, __) => const Divider(),
                              itemBuilder: (_, i) => _tile(context, notes[i]),
                            ),
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _tile(BuildContext context, InvestorNotification n) {
    final solid = _color(n);
    return GestureDetector(
      onTap: n.read
          ? null
          : () => context.read<NotificationsCubit>().markRead(n.id),
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: solid,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _icon(n),
                size: 18,
                color: solid == InvestColors.raise3
                    ? InvestColors.text
                    : Colors.white,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          n.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: InvestColors.text,
                          ),
                        ),
                      ),
                      if (!n.read)
                        Container(
                          width: 7,
                          height: 7,
                          margin: const EdgeInsets.only(left: 6),
                          decoration: const BoxDecoration(
                            color: InvestColors.orange,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    n.body,
                    style: const TextStyle(
                      fontSize: 12.5,
                      height: 1.45,
                      color: InvestColors.sub,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    timeAgo(n.createdAt),
                    style:
                        const TextStyle(fontSize: 11, color: InvestColors.mute),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
