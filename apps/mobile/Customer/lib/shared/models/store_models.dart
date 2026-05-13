// Shared models for grocery, retail, and pharmacy stores
import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'store_models.g.dart';

@JsonSerializable()
class Store {
  final String id;
  final String name;
  final String? logoUrl;
  final double? rating;
  final int? deliveryFeeKobo;
  final int? estimatedMinutes;
  final bool isOpen;

  const Store({
    required this.id,
    required this.name,
    this.logoUrl,
    this.rating,
    this.deliveryFeeKobo,
    this.estimatedMinutes,
    required this.isOpen,
  });

  factory Store.fromJson(Map<String, dynamic> json) =>
      _$StoreFromJson(json);
  Map<String, dynamic> toJson() => _$StoreToJson(this);
}

@JsonSerializable()
class StoreListResponse {
  final List<Store> data;
  final Pagination meta;

  const StoreListResponse({required this.data, required this.meta});

  factory StoreListResponse.fromJson(Map<String, dynamic> json) =>
      _$StoreListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$StoreListResponseToJson(this);
}

@JsonSerializable()
class ProductCategory {
  final String id;
  final String name;

  const ProductCategory({required this.id, required this.name});

  factory ProductCategory.fromJson(Map<String, dynamic> json) =>
      _$ProductCategoryFromJson(json);
  Map<String, dynamic> toJson() => _$ProductCategoryToJson(this);
}

@JsonSerializable()
class StoreProduct {
  final String id;
  final String name;
  final String? description;
  final int priceKobo;
  final String? imageUrl;
  final String? categoryId;
  final String? category;
  final int? stock;

  const StoreProduct({
    required this.id,
    required this.name,
    this.description,
    required this.priceKobo,
    this.imageUrl,
    this.categoryId,
    this.category,
    this.stock,
  });

  factory StoreProduct.fromJson(Map<String, dynamic> json) =>
      _$StoreProductFromJson(json);
  Map<String, dynamic> toJson() => _$StoreProductToJson(this);
}

@JsonSerializable()
class StoreProductListResponse {
  final List<StoreProduct> data;
  final Pagination meta;

  const StoreProductListResponse({required this.data, required this.meta});

  factory StoreProductListResponse.fromJson(Map<String, dynamic> json) =>
      _$StoreProductListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$StoreProductListResponseToJson(this);
}

@JsonSerializable()
class StoreDetailResponse {
  final Store store;
  final List<ProductCategory> categories;

  const StoreDetailResponse({required this.store, required this.categories});

  factory StoreDetailResponse.fromJson(Map<String, dynamic> json) =>
      _$StoreDetailResponseFromJson(json);
  Map<String, dynamic> toJson() => _$StoreDetailResponseToJson(this);
}

// Pharmacy uses the same store structure but the detail response wraps differently
@JsonSerializable()
class PharmacyDetailResponse {
  final Store pharmacy;
  final List<ProductCategory> categories;

  const PharmacyDetailResponse({
    required this.pharmacy,
    required this.categories,
  });

  factory PharmacyDetailResponse.fromJson(Map<String, dynamic> json) =>
      _$PharmacyDetailResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PharmacyDetailResponseToJson(this);
}

@JsonSerializable()
class StoreSearchResponse {
  final List<Store> stores;
  final List<StoreProduct> products;

  const StoreSearchResponse({required this.stores, required this.products});

  factory StoreSearchResponse.fromJson(Map<String, dynamic> json) =>
      _$StoreSearchResponseFromJson(json);
  Map<String, dynamic> toJson() => _$StoreSearchResponseToJson(this);
}

@JsonSerializable()
class RetailCategoriesResponse {
  final List<ProductCategory> categories;

  const RetailCategoriesResponse({required this.categories});

  factory RetailCategoriesResponse.fromJson(Map<String, dynamic> json) =>
      _$RetailCategoriesResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RetailCategoriesResponseToJson(this);
}

@JsonSerializable()
class PharmacyListResponse {
  final List<Store> data;
  final Pagination meta;

  const PharmacyListResponse({required this.data, required this.meta});

  factory PharmacyListResponse.fromJson(Map<String, dynamic> json) =>
      _$PharmacyListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PharmacyListResponseToJson(this);
}

@JsonSerializable()
class PharmacySearchResponse {
  final List<Store> pharmacies;
  final List<StoreProduct> products;

  const PharmacySearchResponse({
    required this.pharmacies,
    required this.products,
  });

  factory PharmacySearchResponse.fromJson(Map<String, dynamic> json) =>
      _$PharmacySearchResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PharmacySearchResponseToJson(this);
}

// ── Store checkout models (grocery / retail / pharmacy) ────────────────────────

@JsonSerializable()
class StoreCheckoutItem {
  final String productId;
  final int quantity;

  const StoreCheckoutItem({required this.productId, required this.quantity});

  factory StoreCheckoutItem.fromJson(Map<String, dynamic> json) =>
      _$StoreCheckoutItemFromJson(json);
  Map<String, dynamic> toJson() => _$StoreCheckoutItemToJson(this);
}

@JsonSerializable()
class StoreCheckoutRequest {
  final String vendorId;
  final List<StoreCheckoutItem> items;
  final String deliveryAddress;
  final String paymentMethod;

  const StoreCheckoutRequest({
    required this.vendorId,
    required this.items,
    required this.deliveryAddress,
    required this.paymentMethod,
  });

  factory StoreCheckoutRequest.fromJson(Map<String, dynamic> json) =>
      _$StoreCheckoutRequestFromJson(json);
  Map<String, dynamic> toJson() => _$StoreCheckoutRequestToJson(this);
}

@JsonSerializable()
class StorePlacedOrder {
  final String id;
  final String status;
  final int totalKobo;

  const StorePlacedOrder({
    required this.id,
    required this.status,
    required this.totalKobo,
  });

  factory StorePlacedOrder.fromJson(Map<String, dynamic> json) =>
      _$StorePlacedOrderFromJson(json);
  Map<String, dynamic> toJson() => _$StorePlacedOrderToJson(this);
}

@JsonSerializable()
class StoreOrderResponse {
  final bool success;
  final StorePlacedOrder order;

  const StoreOrderResponse({required this.success, required this.order});

  factory StoreOrderResponse.fromJson(Map<String, dynamic> json) =>
      _$StoreOrderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$StoreOrderResponseToJson(this);
}
