import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'notifications_state.dart';

class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit() : super(NotificationsInitial());

  final _service = NotificationsService(DioClient.instance);

  Future<void> load({bool silent = false}) async {
    if (!silent) emit(NotificationsLoading());
    try {
      final res = await _service.list(limit: 50);
      emit(NotificationsLoaded(res.data, res.unreadCount));
    } on DioException catch (e) {
      emit(NotificationsError(parseDioError(e)));
    } catch (_) {
      emit(NotificationsError('Failed to load notifications.'));
    }
  }

  Future<void> markRead(String id) async {
    try {
      await _service.markRead(id);
      await load(silent: true);
    } catch (_) {}
  }

  Future<void> markAllRead() async {
    try {
      await _service.markAllRead();
      await load(silent: true);
    } catch (_) {}
  }
}
