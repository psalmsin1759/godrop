import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/notification_models.dart';
import 'notifications_state.dart';

class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit() : super(NotificationsInitial());

  final _service = NotificationsService(DioClient.instance);

  Future<void> load() async {
    if (state is NotificationsLoading) return;
    emit(NotificationsLoading());
    try {
      final res = await _service.listNotifications();
      emit(NotificationsLoaded(
        notifications: res.data,
        unreadCount: res.unreadCount,
      ));
    } on DioException catch (e) {
      emit(NotificationsError(_parseDioError(e)));
    } catch (_) {
      emit(NotificationsError('Failed to load notifications.'));
    }
  }

  String _parseDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final msg = data['message'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return 'Something went wrong. Please try again.';
  }

  Future<void> markAllRead() async {
    try {
      await _service.markRead(const MarkNotificationsReadBody());
      await load();
    } catch (_) {}
  }

  Future<void> markRead(List<String> ids) async {
    try {
      await _service.markRead(MarkNotificationsReadBody(ids: ids));
      if (state is NotificationsLoaded) {
        final current = state as NotificationsLoaded;
        final updated = current.notifications
            .map((n) => ids.contains(n.id)
                ? AppNotification(
                    id: n.id,
                    title: n.title,
                    body: n.body,
                    isRead: true,
                    createdAt: n.createdAt,
                    data: n.data,
                  )
                : n)
            .toList();
        final unread = updated.where((n) => !n.isRead).length;
        emit(NotificationsLoaded(notifications: updated, unreadCount: unread));
      }
    } catch (_) {}
  }
}
