import '../../../shared/models/order_models.dart';

class OrderBucket {
  final List<Order> items;
  final bool hasMore;
  final bool loadingMore;
  final int page;

  const OrderBucket({
    this.items = const [],
    this.hasMore = false,
    this.loadingMore = false,
    this.page = 1,
  });

  OrderBucket copyWith({
    List<Order>? items,
    bool? hasMore,
    bool? loadingMore,
    int? page,
  }) =>
      OrderBucket(
        items: items ?? this.items,
        hasMore: hasMore ?? this.hasMore,
        loadingMore: loadingMore ?? this.loadingMore,
        page: page ?? this.page,
      );
}

abstract class RemoteOrdersState {}

class RemoteOrdersInitial extends RemoteOrdersState {}

class RemoteOrdersLoading extends RemoteOrdersState {}

class RemoteOrdersLoaded extends RemoteOrdersState {
  final OrderBucket active;
  final OrderBucket history;

  RemoteOrdersLoaded({required this.active, required this.history});

  RemoteOrdersLoaded copyWith({OrderBucket? active, OrderBucket? history}) =>
      RemoteOrdersLoaded(
        active: active ?? this.active,
        history: history ?? this.history,
      );
}

class RemoteOrdersError extends RemoteOrdersState {
  final String message;
  RemoteOrdersError(this.message);
}
