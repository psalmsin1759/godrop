// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'food_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Restaurant _$RestaurantFromJson(Map<String, dynamic> json) => Restaurant(
      id: json['id'] as String,
      name: json['name'] as String,
      logoUrl: json['logoUrl'] as String?,
      cuisines:
          (json['cuisines'] as List<dynamic>).map((e) => e as String).toList(),
      rating: (json['rating'] as num).toDouble(),
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num).toInt(),
      estimatedMinutes: (json['estimatedMinutes'] as num).toInt(),
      isOpen: json['isOpen'] as bool,
    );

Map<String, dynamic> _$RestaurantToJson(Restaurant instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'logoUrl': instance.logoUrl,
      'cuisines': instance.cuisines,
      'rating': instance.rating,
      'deliveryFeeKobo': instance.deliveryFeeKobo,
      'estimatedMinutes': instance.estimatedMinutes,
      'isOpen': instance.isOpen,
    };

RestaurantListResponse _$RestaurantListResponseFromJson(
        Map<String, dynamic> json) =>
    RestaurantListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => Restaurant.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$RestaurantListResponseToJson(
        RestaurantListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
    };

MenuCategory _$MenuCategoryFromJson(Map<String, dynamic> json) => MenuCategory(
      id: json['id'] as String,
      name: json['name'] as String,
    );

Map<String, dynamic> _$MenuCategoryToJson(MenuCategory instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
    };

FoodMenuItemCategory _$FoodMenuItemCategoryFromJson(
        Map<String, dynamic> json) =>
    FoodMenuItemCategory(
      id: json['id'] as String,
      name: json['name'] as String,
    );

Map<String, dynamic> _$FoodMenuItemCategoryToJson(
        FoodMenuItemCategory instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
    };

FoodMenuItem _$FoodMenuItemFromJson(Map<String, dynamic> json) => FoodMenuItem(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      priceKobo: (json['priceKobo'] as num).toInt(),
      imageUrl: json['imageUrl'] as String?,
      categoryId: json['categoryId'] as String?,
      category: json['category'] == null
          ? null
          : FoodMenuItemCategory.fromJson(
              json['category'] as Map<String, dynamic>),
      isAvailable: json['isAvailable'] as bool,
    );

Map<String, dynamic> _$FoodMenuItemToJson(FoodMenuItem instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'priceKobo': instance.priceKobo,
      'imageUrl': instance.imageUrl,
      'categoryId': instance.categoryId,
      'category': instance.category,
      'isAvailable': instance.isAvailable,
    };

MenuItemListResponse _$MenuItemListResponseFromJson(
        Map<String, dynamic> json) =>
    MenuItemListResponse(
      items: (json['items'] as List<dynamic>)
          .map((e) => FoodMenuItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$MenuItemListResponseToJson(
        MenuItemListResponse instance) =>
    <String, dynamic>{
      'items': instance.items,
    };

RestaurantDetailResponse _$RestaurantDetailResponseFromJson(
        Map<String, dynamic> json) =>
    RestaurantDetailResponse(
      restaurant:
          Restaurant.fromJson(json['restaurant'] as Map<String, dynamic>),
      categories: (json['categories'] as List<dynamic>)
          .map((e) => MenuCategory.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$RestaurantDetailResponseToJson(
        RestaurantDetailResponse instance) =>
    <String, dynamic>{
      'restaurant': instance.restaurant,
      'categories': instance.categories,
    };

Review _$ReviewFromJson(Map<String, dynamic> json) => Review(
      id: json['id'] as String,
      rating: (json['rating'] as num).toInt(),
      comment: json['comment'] as String?,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$ReviewToJson(Review instance) => <String, dynamic>{
      'id': instance.id,
      'rating': instance.rating,
      'comment': instance.comment,
      'createdAt': instance.createdAt,
    };

ReviewsResponse _$ReviewsResponseFromJson(Map<String, dynamic> json) =>
    ReviewsResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => Review.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
      averageRating: (json['averageRating'] as num).toDouble(),
    );

Map<String, dynamic> _$ReviewsResponseToJson(ReviewsResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
      'averageRating': instance.averageRating,
    };

FoodSearchResponse _$FoodSearchResponseFromJson(Map<String, dynamic> json) =>
    FoodSearchResponse(
      restaurants: (json['restaurants'] as List<dynamic>)
          .map((e) => Restaurant.fromJson(e as Map<String, dynamic>))
          .toList(),
      items: (json['items'] as List<dynamic>)
          .map((e) => FoodMenuItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$FoodSearchResponseToJson(FoodSearchResponse instance) =>
    <String, dynamic>{
      'restaurants': instance.restaurants,
      'items': instance.items,
    };

CheckoutItem _$CheckoutItemFromJson(Map<String, dynamic> json) => CheckoutItem(
      productId: json['productId'] as String,
      quantity: (json['quantity'] as num).toInt(),
    );

Map<String, dynamic> _$CheckoutItemToJson(CheckoutItem instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'quantity': instance.quantity,
    };

FoodCheckoutRequest _$FoodCheckoutRequestFromJson(Map<String, dynamic> json) =>
    FoodCheckoutRequest(
      vendorId: json['vendorId'] as String,
      items: (json['items'] as List<dynamic>)
          .map((e) => CheckoutItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      deliveryAddress: json['deliveryAddress'] as String,
      paymentMethod: json['paymentMethod'] as String,
    );

Map<String, dynamic> _$FoodCheckoutRequestToJson(
        FoodCheckoutRequest instance) =>
    <String, dynamic>{
      'vendorId': instance.vendorId,
      'items': instance.items,
      'deliveryAddress': instance.deliveryAddress,
      'paymentMethod': instance.paymentMethod,
    };

PlacedOrder _$PlacedOrderFromJson(Map<String, dynamic> json) => PlacedOrder(
      id: json['id'] as String,
      status: json['status'] as String,
      totalKobo: (json['totalKobo'] as num).toInt(),
    );

Map<String, dynamic> _$PlacedOrderToJson(PlacedOrder instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': instance.status,
      'totalKobo': instance.totalKobo,
    };

FoodOrderResponse _$FoodOrderResponseFromJson(Map<String, dynamic> json) =>
    FoodOrderResponse(
      success: json['success'] as bool,
      order: PlacedOrder.fromJson(json['order'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$FoodOrderResponseToJson(FoodOrderResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'order': instance.order,
    };
