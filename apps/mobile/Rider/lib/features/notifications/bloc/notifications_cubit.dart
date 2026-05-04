import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import 'notifications_state.dart';

class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit() : super(const NotificationsInitial());

  final _service = RiderNotificationsService(DioClient.instance);

  Future<void> load() async {
    emit(const NotificationsLoading());
    try {
      final listData =
          await _service.listNotifications() as Map<String, dynamic>;
      final countData =
          await _service.getUnreadCount() as Map<String, dynamic>;

      final notifications = (listData['data'] as List)
          .map((n) => RiderNotification.fromJson(n as Map<String, dynamic>))
          .toList();

      final count = countData['count'] as int? ?? 0;

      emit(NotificationsLoaded(
          notifications: notifications, unreadCount: count));
    } on DioException catch (e) {
      emit(NotificationsError(_parseError(e)));
    }
  }

  Future<void> markAllRead() async {
    try {
      await _service.markAllRead();
      await load();
    } catch (_) {}
  }

  Future<void> markRead(String id) async {
    try {
      await _service.markRead(id);
      final current = state;
      if (current is NotificationsLoaded) {
        final updated = current.notifications
            .map((n) => n.id == id
                ? RiderNotification(
                    id: n.id,
                    title: n.title,
                    body: n.body,
                    data: n.data,
                    isRead: true,
                    createdAt: n.createdAt,
                  )
                : n)
            .toList();
        emit(NotificationsLoaded(
          notifications: updated,
          unreadCount: (current.unreadCount - 1).clamp(0, 9999),
        ));
      }
    } catch (_) {}
  }

  String _parseError(DioException e) => 'Failed to load notifications.';
}
