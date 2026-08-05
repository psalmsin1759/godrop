import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import 'remote_orders_state.dart';

class RemoteOrdersCubit extends Cubit<RemoteOrdersState> {
  RemoteOrdersCubit() : super(RemoteOrdersInitial());

  final _service = OrdersService(DioClient.instance);
  static const _pageSize = 20;

  Future<void> load() async {
    if (state is RemoteOrdersLoading) return;
    emit(RemoteOrdersLoading());
    try {
      final results = await Future.wait([
        _service.listOrders(status: 'active', page: 1, limit: _pageSize),
        _service.listOrders(status: 'history', page: 1, limit: _pageSize),
      ]);
      final activeRes = results[0];
      final historyRes = results[1];
      emit(RemoteOrdersLoaded(
        active: OrderBucket(
          items: activeRes.data,
          hasMore: 1 < activeRes.meta.totalPages,
        ),
        history: OrderBucket(
          items: historyRes.data,
          hasMore: 1 < historyRes.meta.totalPages,
        ),
      ));
    } on DioException catch (e) {
      emit(RemoteOrdersError(_parseDioError(e)));
    } catch (_) {
      emit(RemoteOrdersError('Failed to load orders.'));
    }
  }

  Future<void> loadMoreActive() => _loadMore(isActive: true);
  Future<void> loadMoreHistory() => _loadMore(isActive: false);

  Future<void> _loadMore({required bool isActive}) async {
    final current = state;
    if (current is! RemoteOrdersLoaded) return;
    final bucket = isActive ? current.active : current.history;
    if (!bucket.hasMore || bucket.loadingMore) return;

    emit(isActive
        ? current.copyWith(active: bucket.copyWith(loadingMore: true))
        : current.copyWith(history: bucket.copyWith(loadingMore: true)));

    try {
      final nextPage = bucket.page + 1;
      final res = await _service.listOrders(
        status: isActive ? 'active' : 'history',
        page: nextPage,
        limit: _pageSize,
      );
      final merged = bucket.copyWith(
        items: [...bucket.items, ...res.data],
        hasMore: nextPage < res.meta.totalPages,
        loadingMore: false,
        page: nextPage,
      );
      final latest = state;
      if (latest is! RemoteOrdersLoaded) return;
      emit(isActive
          ? latest.copyWith(active: merged)
          : latest.copyWith(history: merged));
    } catch (_) {
      final latest = state;
      if (latest is! RemoteOrdersLoaded) return;
      final reverted = bucket.copyWith(loadingMore: false);
      emit(isActive
          ? latest.copyWith(active: reverted)
          : latest.copyWith(history: reverted));
    }
  }

  String _parseDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final msg = data['error'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return 'Something went wrong. Please try again.';
  }
}
