import '../../../shared/models/order_models.dart';

abstract class OrdersState {}

class OrdersInitial extends OrdersState {}

class OrdersLoading extends OrdersState {}

class OrdersLoaded extends OrdersState {
  final List<VendorOrder> orders;
  final String? statusFilter;
  final int total;
  final int page;
  final bool loadingMore;

  OrdersLoaded({
    required this.orders,
    this.statusFilter,
    required this.total,
    required this.page,
    this.loadingMore = false,
  });

  bool get hasMore => orders.length < total;

  OrdersLoaded copyWith({
    List<VendorOrder>? orders,
    int? total,
    int? page,
    bool? loadingMore,
  }) =>
      OrdersLoaded(
        orders: orders ?? this.orders,
        statusFilter: statusFilter,
        total: total ?? this.total,
        page: page ?? this.page,
        loadingMore: loadingMore ?? this.loadingMore,
      );
}

class OrdersError extends OrdersState {
  final String message;
  OrdersError(this.message);
}
