import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/order_models.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'order_detail_state.dart';

class OrderDetailCubit extends Cubit<OrderDetailState> {
  OrderDetailCubit() : super(OrderDetailInitial());

  final _service = OrdersService(DioClient.instance);

  Future<void> load(String orderId) async {
    emit(OrderDetailLoading());
    try {
      final res = await _service.getOrder(orderId);
      emit(OrderDetailLoaded(res.data));
    } on DioException catch (e) {
      emit(OrderDetailError(parseDioError(e)));
    } catch (_) {
      emit(OrderDetailError('Failed to load order. Please try again.'));
    }
  }

  /// Runs a status transition and reloads the order. Returns an error
  /// message on failure, null on success.
  Future<String?> act(String orderId, String action, {String? reason}) async {
    final current = state;
    if (current is OrderDetailLoaded) {
      emit(OrderDetailLoaded(current.order, acting: true));
    }
    try {
      switch (action) {
        case 'accept':
          await _service.acceptOrder(orderId);
        case 'preparing':
          await _service.markPreparing(orderId);
        case 'ready':
          await _service.markReady(orderId);
        case 'reject':
          await _service.rejectOrder(orderId, OrderReasonBody(reason: reason));
        case 'cancel':
          await _service.cancelOrder(orderId, OrderReasonBody(reason: reason));
      }
      await load(orderId);
      return null;
    } on DioException catch (e) {
      await load(orderId);
      return parseDioError(e);
    } catch (_) {
      await load(orderId);
      return 'Action failed. Please try again.';
    }
  }
}
