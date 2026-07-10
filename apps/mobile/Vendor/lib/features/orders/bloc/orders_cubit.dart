import 'dart:async';
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'orders_state.dart';

class OrdersCubit extends Cubit<OrdersState> {
  OrdersCubit() : super(OrdersInitial()) {
    _listenFcm();
  }

  final _service = OrdersService(DioClient.instance);
  String? _statusFilter;
  StreamSubscription? _fcmSub;

  String? get statusFilter => _statusFilter;

  void _listenFcm() {
    _fcmSub ??= FirebaseMessaging.onMessage.listen((message) {
      final type = message.data['type'] as String? ?? 'unknown';
      debugPrint('[FCM/Vendor] Foreground message | type=$type');
      // Only refresh a list that's already loaded — before login (or before the
      // vendor opens the orders tab) there's nothing to reload.
      if (type == 'NEW_ORDER' && state is OrdersLoaded) refresh();
    });
  }

  @override
  Future<void> close() {
    _fcmSub?.cancel();
    return super.close();
  }

  Future<void> load({String? status, bool silent = false}) async {
    _statusFilter = status;
    if (!silent) emit(OrdersLoading());
    try {
      final res = await _service.listOrders(status: status);
      emit(OrdersLoaded(
        orders: res.data,
        statusFilter: status,
        total: res.total,
        page: res.page,
      ));
    } on DioException catch (e) {
      emit(OrdersError(parseDioError(e)));
    } catch (_) {
      emit(OrdersError('Failed to load orders. Please try again.'));
    }
  }

  Future<void> loadMore() async {
    final current = state;
    if (current is! OrdersLoaded || current.loadingMore || !current.hasMore) {
      return;
    }
    emit(current.copyWith(loadingMore: true));
    try {
      final res = await _service.listOrders(
          status: _statusFilter, page: current.page + 1);
      emit(current.copyWith(
        orders: [...current.orders, ...res.data],
        total: res.total,
        page: res.page,
        loadingMore: false,
      ));
    } catch (_) {
      emit(current.copyWith(loadingMore: false));
    }
  }

  Future<void> refresh() => load(status: _statusFilter, silent: true);
}
