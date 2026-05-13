import '../../../shared/models/notification_models.dart';

abstract class NotificationsState {}

class NotificationsInitial extends NotificationsState {}

class NotificationsLoading extends NotificationsState {}

class NotificationsLoaded extends NotificationsState {
  final List<AppNotification> notifications;
  final int unreadCount;
  NotificationsLoaded({required this.notifications, required this.unreadCount});
}

class NotificationsError extends NotificationsState {
  final String message;
  NotificationsError(this.message);
}
