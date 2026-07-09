import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/profile_models.dart';
import '../../../shared/utils/errors.dart';

sealed class NotificationsState extends Equatable {
  const NotificationsState();
  @override
  List<Object?> get props => [];
}

class NotificationsLoading extends NotificationsState {}

class NotificationsLoaded extends NotificationsState {
  const NotificationsLoaded(this.notifications, {required this.unread});
  final List<InvestorNotification> notifications;
  final int unread;
  @override
  List<Object?> get props => [notifications, unread];
}

class NotificationsError extends NotificationsState {
  const NotificationsError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit() : super(NotificationsLoading());

  final _profileService = ProfileService(DioClient.instance);

  Future<void> load() async {
    emit(NotificationsLoading());
    try {
      final res = await _profileService.getNotifications(limit: 50);
      emit(NotificationsLoaded(res.data, unread: res.unread));
    } on DioException catch (e) {
      emit(NotificationsError(parseDioError(e)));
    } catch (_) {
      emit(const NotificationsError('Something went wrong. Please try again.'));
    }
  }

  Future<void> markAllRead() async {
    try {
      await _profileService.markAllNotificationsRead();
      await load();
    } on DioException {
      // Non-fatal — inbox stays as-is.
    }
  }

  Future<void> markRead(String id) async {
    try {
      await _profileService.markNotificationRead(id);
      await load();
    } on DioException {
      // Non-fatal.
    }
  }
}
