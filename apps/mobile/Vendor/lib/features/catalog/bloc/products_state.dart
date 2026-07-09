import '../../../shared/models/catalog_models.dart';

abstract class ProductsState {}

class ProductsInitial extends ProductsState {}

class ProductsLoading extends ProductsState {}

class ProductsLoaded extends ProductsState {
  final List<Product> products;
  final String? categoryFilter;
  final int total;
  final int page;
  final bool loadingMore;

  ProductsLoaded({
    required this.products,
    this.categoryFilter,
    required this.total,
    required this.page,
    this.loadingMore = false,
  });

  bool get hasMore => products.length < total;

  ProductsLoaded copyWith({
    List<Product>? products,
    int? total,
    int? page,
    bool? loadingMore,
  }) =>
      ProductsLoaded(
        products: products ?? this.products,
        categoryFilter: categoryFilter,
        total: total ?? this.total,
        page: page ?? this.page,
        loadingMore: loadingMore ?? this.loadingMore,
      );
}

class ProductsError extends ProductsState {
  final String message;
  ProductsError(this.message);
}
