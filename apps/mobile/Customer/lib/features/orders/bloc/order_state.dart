import 'package:equatable/equatable.dart';
import '../models/active_order.dart';

class OrderState extends Equatable {
  final List<ActiveOrderData> orders;

  const OrderState({this.orders = const []});

  /// Most recently placed order — shown on home screen
  ActiveOrderData? get latestOrder => orders.isEmpty ? null : orders.last;

  @override
  List<Object?> get props => [orders];
}
