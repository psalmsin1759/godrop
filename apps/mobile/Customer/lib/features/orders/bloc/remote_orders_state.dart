import '../../../shared/models/order_models.dart';

abstract class RemoteOrdersState {}

class RemoteOrdersInitial extends RemoteOrdersState {}

class RemoteOrdersLoading extends RemoteOrdersState {}

class RemoteOrdersLoaded extends RemoteOrdersState {
  final List<Order> active;
  final List<Order> completed;
  final List<Order> cancelled;
  RemoteOrdersLoaded({
    required this.active,
    required this.completed,
    required this.cancelled,
  });
}

class RemoteOrdersError extends RemoteOrdersState {
  final String message;
  RemoteOrdersError(this.message);
}
