import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/analytics_models.dart';
import '../../../shared/models/vendor_models.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'dashboard_state.dart';

class DashboardCubit extends Cubit<DashboardState> {
  DashboardCubit() : super(DashboardInitial());

  final _analytics = AnalyticsService(DioClient.instance);
  final _orders = OrdersService(DioClient.instance);
  final _notifications = NotificationsService(DioClient.instance);
  final _profile = ProfileService(DioClient.instance);

  Future<void> load({bool silent = false}) async {
    if (!silent && state is DashboardLoading) return;
    if (!silent) emit(DashboardLoading());
    try {
      // Analytics is MANAGER+ — a STAFF login gets 403 and a slimmer home.
      VendorAnalytics? analytics;
      GraphData? graph;
      try {
        final results = await Future.wait([
          _analytics.getAnalytics(),
          _analytics.getGraph(),
        ]);
        analytics = (results[0] as VendorAnalyticsResponse).data;
        graph = (results[1] as GraphDataResponse).data;
      } on DioException catch (e) {
        if (e.response?.statusCode != 403) rethrow;
      }

      final pending = await _orders.listOrders(status: 'PENDING', limit: 5);

      var unread = 0;
      try {
        unread = (await _notifications.unreadCount()).data.count;
      } catch (_) {}

      var storeOpen = true;
      try {
        final me = await _profile.getProfile();
        storeOpen = me.data.vendor?.isOpen ?? true;
      } catch (_) {}

      emit(DashboardLoaded(
        analytics: analytics,
        graph: graph,
        pendingOrders: pending.data,
        pendingTotal: pending.total,
        unreadNotifications: unread,
        storeOpen: storeOpen,
      ));
    } on DioException catch (e) {
      emit(DashboardError(parseDioError(e)));
    } catch (_) {
      emit(DashboardError('Failed to load dashboard. Pull to refresh.'));
    }
  }

  /// Optimistically flips the open/closed switch (OWNER only server-side).
  Future<String?> toggleStoreOpen(bool open) async {
    final current = state;
    if (current is! DashboardLoaded) return null;
    emit(current.copyWith(storeOpen: open));
    try {
      await SettingsService(DioClient.instance)
          .updateSettings(UpdateVendorSettingsBody(isOpen: open));
      return null;
    } on DioException catch (e) {
      emit(current.copyWith(storeOpen: !open));
      return parseDioError(e);
    } catch (_) {
      emit(current.copyWith(storeOpen: !open));
      return 'Could not update store status.';
    }
  }
}
