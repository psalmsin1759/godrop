import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import 'remote_orders_state.dart';

class RemoteOrdersCubit extends Cubit<RemoteOrdersState> {
  RemoteOrdersCubit() : super(RemoteOrdersInitial());

  final _service = OrdersService(DioClient.instance);

  Future<void> load() async {
    if (state is RemoteOrdersLoading) return;
    emit(RemoteOrdersLoading());
    try {
      final results = await Future.wait([
        _service.listOrders(status: 'active'),
        _service.listOrders(status: 'completed'),
        _service.listOrders(status: 'cancelled'),
      ]);
      emit(RemoteOrdersLoaded(
        active: results[0].data,
        completed: results[1].data,
        cancelled: results[2].data,
      ));
    } on DioException catch (e) {
      emit(RemoteOrdersError(_parseDioError(e)));
    } catch (_) {
      emit(RemoteOrdersError('Failed to load orders.'));
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
