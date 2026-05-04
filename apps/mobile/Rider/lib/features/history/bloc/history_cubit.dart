import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import 'history_state.dart';

class HistoryCubit extends Cubit<HistoryState> {
  HistoryCubit() : super(const HistoryInitial());

  final _service = RiderOrdersService(DioClient.instance);
  int _page = 1;

  Future<void> loadHistory({bool refresh = false}) async {
    if (refresh) _page = 1;
    if (_page == 1) emit(const HistoryLoading());

    try {
      final data = await _service.listOrders(
        status: 'DELIVERED',
        page: _page,
        limit: 20,
      ) as Map<String, dynamic>;

      final orders = (data['data'] as List)
          .map((j) => RiderOrder.fromJson(j as Map<String, dynamic>))
          .toList();

      final meta = data['meta'] as Map<String, dynamic>?;
      final pages = meta?['pages'] as int? ?? 1;

      final existing = (state is HistoryLoaded && !refresh)
          ? (state as HistoryLoaded).orders
          : <RiderOrder>[];

      emit(HistoryLoaded(
        orders: [...existing, ...orders],
        hasMore: _page < pages,
      ));

      _page++;
    } on DioException catch (e) {
      emit(HistoryError(_parseError(e)));
    }
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['message'];
    if (message is String) return message;
    return 'Failed to load history.';
  }
}
