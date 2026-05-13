import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'food_models.g.dart';

@JsonSerializable()
class Restaurant {
  final String id;
  final String name;
  final String? logoUrl;
  final List<String> cuisines;
  final double rating;
  final int deliveryFeeKobo;
  final int estimatedMinutes;
  final bool isOpen;

  const Restaurant({
    required this.id,
    required this.name,
    this.logoUrl,
    required this.cuisines,
    required this.rating,
    required this.deliveryFeeKobo,
    required this.estimatedMinutes,
    required this.isOpen,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) =>
      _$RestaurantFromJson(json);
  Map<String, dynamic> toJson() => _$RestaurantToJson(this);
}

@JsonSerializable()
class RestaurantListResponse {
  final List<Restaurant> data;
  final Pagination meta;

  const RestaurantListResponse({required this.data, required this.meta});

  factory RestaurantListResponse.fromJson(Map<String, dynamic> json) =>
      _$RestaurantListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RestaurantListResponseToJson(this);
}

@JsonSerializable()
class MenuCategory {
  final String id;
  final String name;

  const MenuCategory({required this.id, required this.name});

  factory MenuCategory.fromJson(Map<String, dynamic> json) =>
      _$MenuCategoryFromJson(json);
  Map<String, dynamic> toJson() => _$MenuCategoryToJson(this);
}

@JsonSerializable()
class FoodMenuItemCategory {
  final String id;
  final String name;

  const FoodMenuItemCategory({required this.id, required this.name});

  factory FoodMenuItemCategory.fromJson(Map<String, dynamic> json) =>
      _$FoodMenuItemCategoryFromJson(json);
  Map<String, dynamic> toJson() => _$FoodMenuItemCategoryToJson(this);
}

@JsonSerializable()
class FoodMenuItem {
  final String id;
  final String name;
  final String? description;
  final int priceKobo;
  final String? imageUrl;
  final String? categoryId;
  final FoodMenuItemCategory? category;
  final bool isAvailable;

  const FoodMenuItem({
    required this.id,
    required this.name,
    this.description,
    required this.priceKobo,
    this.imageUrl,
    this.categoryId,
    this.category,
    required this.isAvailable,
  });

  factory FoodMenuItem.fromJson(Map<String, dynamic> json) =>
      _$FoodMenuItemFromJson(json);
  Map<String, dynamic> toJson() => _$FoodMenuItemToJson(this);
}

@JsonSerializable()
class MenuItemListResponse {
  final List<FoodMenuItem> items;

  const MenuItemListResponse({required this.items});

  factory MenuItemListResponse.fromJson(Map<String, dynamic> json) =>
      _$MenuItemListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$MenuItemListResponseToJson(this);
}

@JsonSerializable()
class RestaurantDetailResponse {
  final Restaurant restaurant;
  final List<MenuCategory> categories;

  const RestaurantDetailResponse({
    required this.restaurant,
    required this.categories,
  });

  factory RestaurantDetailResponse.fromJson(Map<String, dynamic> json) =>
      _$RestaurantDetailResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RestaurantDetailResponseToJson(this);
}

@JsonSerializable()
class Review {
  final String id;
  final int rating;
  final String? comment;
  final String createdAt;

  const Review({
    required this.id,
    required this.rating,
    this.comment,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) =>
      _$ReviewFromJson(json);
  Map<String, dynamic> toJson() => _$ReviewToJson(this);
}

@JsonSerializable()
class ReviewsResponse {
  final List<Review> data;
  final Pagination meta;
  final double averageRating;

  const ReviewsResponse({
    required this.data,
    required this.meta,
    required this.averageRating,
  });

  factory ReviewsResponse.fromJson(Map<String, dynamic> json) =>
      _$ReviewsResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ReviewsResponseToJson(this);
}

@JsonSerializable()
class FoodSearchResponse {
  final List<Restaurant> restaurants;
  final List<FoodMenuItem> items;

  const FoodSearchResponse({required this.restaurants, required this.items});

  factory FoodSearchResponse.fromJson(Map<String, dynamic> json) =>
      _$FoodSearchResponseFromJson(json);
  Map<String, dynamic> toJson() => _$FoodSearchResponseToJson(this);
}

// ── Checkout models ───────────────────────────────────────────────────────────

@JsonSerializable()
class CheckoutItem {
  final String productId;
  final int quantity;

  const CheckoutItem({required this.productId, required this.quantity});

  factory CheckoutItem.fromJson(Map<String, dynamic> json) =>
      _$CheckoutItemFromJson(json);
  Map<String, dynamic> toJson() => _$CheckoutItemToJson(this);
}

@JsonSerializable()
class FoodCheckoutRequest {
  final String vendorId;
  final List<CheckoutItem> items;
  final String deliveryAddress;
  final String paymentMethod;

  const FoodCheckoutRequest({
    required this.vendorId,
    required this.items,
    required this.deliveryAddress,
    required this.paymentMethod,
  });

  factory FoodCheckoutRequest.fromJson(Map<String, dynamic> json) =>
      _$FoodCheckoutRequestFromJson(json);
  Map<String, dynamic> toJson() => _$FoodCheckoutRequestToJson(this);
}

@JsonSerializable()
class PlacedOrder {
  final String id;
  final String status;
  final int totalKobo;

  const PlacedOrder({
    required this.id,
    required this.status,
    required this.totalKobo,
  });

  factory PlacedOrder.fromJson(Map<String, dynamic> json) =>
      _$PlacedOrderFromJson(json);
  Map<String, dynamic> toJson() => _$PlacedOrderToJson(this);
}

@JsonSerializable()
class FoodOrderResponse {
  final bool success;
  final PlacedOrder order;

  const FoodOrderResponse({required this.success, required this.order});

  factory FoodOrderResponse.fromJson(Map<String, dynamic> json) =>
      _$FoodOrderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$FoodOrderResponseToJson(this);
}
