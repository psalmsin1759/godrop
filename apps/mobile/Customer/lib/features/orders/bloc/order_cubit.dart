import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive/hive.dart';
import '../models/active_order.dart';
import 'order_state.dart';

class OrderCubit extends Cubit<OrderState> {
  static const _key = 'active_orders';
  final Box _box;

  OrderCubit(this._box) : super(OrderState(
    orders: (_box.get(_key) as List?)
            ?.whereType<ActiveOrderData>()
            .toList() ??
        [],
  ));

  void placeOrder(ActiveOrderData order) {
    final updated = [...state.orders, order];
    _box.put(_key, updated);
    emit(OrderState(orders: updated));
  }

  void removeOrder(int index) {
    final updated = List<ActiveOrderData>.from(state.orders)..removeAt(index);
    _box.put(_key, updated);
    emit(OrderState(orders: updated));
  }

  void clearOrder() => clearAll();

  void clearAll() {
    _box.delete(_key);
    emit(const OrderState());
  }
}
