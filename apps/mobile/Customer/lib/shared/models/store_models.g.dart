// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'store_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Store _$StoreFromJson(Map<String, dynamic> json) => Store(
      id: json['id'] as String,
      name: json['name'] as String,
      logoUrl: json['logoUrl'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num?)?.toInt(),
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt(),
      isOpen: json['isOpen'] as bool,
    );

Map<String, dynamic> _$StoreToJson(Store instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'logoUrl': instance.logoUrl,
      'rating': instance.rating,
      'deliveryFeeKobo': instance.deliveryFeeKobo,
      'estimatedMinutes': instance.estimatedMinutes,
      'isOpen': instance.isOpen,
    };

StoreListResponse _$StoreListResponseFromJson(Map<String, dynamic> json) =>
    StoreListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => Store.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$StoreListResponseToJson(StoreListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
    };

ProductCategory _$ProductCategoryFromJson(Map<String, dynamic> json) =>
    ProductCategory(
      id: json['id'] as String,
      name: json['name'] as String,
    );

Map<String, dynamic> _$ProductCategoryToJson(ProductCategory instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
    };

StoreProduct _$StoreProductFromJson(Map<String, dynamic> json) => StoreProduct(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      priceKobo: (json['priceKobo'] as num).toInt(),
      imageUrl: json['imageUrl'] as String?,
      categoryId: json['categoryId'] as String?,
      category: json['category'] as String?,
      stock: (json['stock'] as num?)?.toInt(),
    );

Map<String, dynamic> _$StoreProductToJson(StoreProduct instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'priceKobo': instance.priceKobo,
      'imageUrl': instance.imageUrl,
      'categoryId': instance.categoryId,
      'category': instance.category,
      'stock': instance.stock,
    };

StoreProductListResponse _$StoreProductListResponseFromJson(
        Map<String, dynamic> json) =>
    StoreProductListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => StoreProduct.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$StoreProductListResponseToJson(
        StoreProductListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
    };

StoreDetailResponse _$StoreDetailResponseFromJson(Map<String, dynamic> json) =>
    StoreDetailResponse(
      store: Store.fromJson(json['store'] as Map<String, dynamic>),
      categories: (json['categories'] as List<dynamic>)
          .map((e) => ProductCategory.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$StoreDetailResponseToJson(
        StoreDetailResponse instance) =>
    <String, dynamic>{
      'store': instance.store,
      'categories': instance.categories,
    };

PharmacyDetailResponse _$PharmacyDetailResponseFromJson(
        Map<String, dynamic> json) =>
    PharmacyDetailResponse(
      pharmacy: Store.fromJson(json['pharmacy'] as Map<String, dynamic>),
      categories: (json['categories'] as List<dynamic>)
          .map((e) => ProductCategory.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$PharmacyDetailResponseToJson(
        PharmacyDetailResponse instance) =>
    <String, dynamic>{
      'pharmacy': instance.pharmacy,
      'categories': instance.categories,
    };

StoreSearchResponse _$StoreSearchResponseFromJson(Map<String, dynamic> json) =>
    StoreSearchResponse(
      stores: (json['stores'] as List<dynamic>)
          .map((e) => Store.fromJson(e as Map<String, dynamic>))
          .toList(),
      products: (json['products'] as List<dynamic>)
          .map((e) => StoreProduct.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$StoreSearchResponseToJson(
        StoreSearchResponse instance) =>
    <String, dynamic>{
      'stores': instance.stores,
      'products': instance.products,
    };

RetailCategoriesResponse _$RetailCategoriesResponseFromJson(
        Map<String, dynamic> json) =>
    RetailCategoriesResponse(
      categories: (json['categories'] as List<dynamic>)
          .map((e) => ProductCategory.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$RetailCategoriesResponseToJson(
        RetailCategoriesResponse instance) =>
    <String, dynamic>{
      'categories': instance.categories,
    };

PharmacyListResponse _$PharmacyListResponseFromJson(
        Map<String, dynamic> json) =>
    PharmacyListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => Store.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$PharmacyListResponseToJson(
        PharmacyListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
    };

PharmacySearchResponse _$PharmacySearchResponseFromJson(
        Map<String, dynamic> json) =>
    PharmacySearchResponse(
      pharmacies: (json['pharmacies'] as List<dynamic>)
          .map((e) => Store.fromJson(e as Map<String, dynamic>))
          .toList(),
      products: (json['products'] as List<dynamic>)
          .map((e) => StoreProduct.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$PharmacySearchResponseToJson(
        PharmacySearchResponse instance) =>
    <String, dynamic>{
      'pharmacies': instance.pharmacies,
      'products': instance.products,
    };

StoreCheckoutItem _$StoreCheckoutItemFromJson(Map<String, dynamic> json) =>
    StoreCheckoutItem(
      productId: json['productId'] as String,
      quantity: (json['quantity'] as num).toInt(),
    );

Map<String, dynamic> _$StoreCheckoutItemToJson(StoreCheckoutItem instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'quantity': instance.quantity,
    };

StoreCheckoutRequest _$StoreCheckoutRequestFromJson(
        Map<String, dynamic> json) =>
    StoreCheckoutRequest(
      vendorId: json['vendorId'] as String,
      items: (json['items'] as List<dynamic>)
          .map((e) => StoreCheckoutItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      deliveryAddress: json['deliveryAddress'] as String,
      paymentMethod: json['paymentMethod'] as String,
    );

Map<String, dynamic> _$StoreCheckoutRequestToJson(
        StoreCheckoutRequest instance) =>
    <String, dynamic>{
      'vendorId': instance.vendorId,
      'items': instance.items,
      'deliveryAddress': instance.deliveryAddress,
      'paymentMethod': instance.paymentMethod,
    };

StorePlacedOrder _$StorePlacedOrderFromJson(Map<String, dynamic> json) =>
    StorePlacedOrder(
      id: json['id'] as String,
      status: json['status'] as String,
      totalKobo: (json['totalKobo'] as num).toInt(),
    );

Map<String, dynamic> _$StorePlacedOrderToJson(StorePlacedOrder instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': instance.status,
      'totalKobo': instance.totalKobo,
    };

StoreOrderResponse _$StoreOrderResponseFromJson(Map<String, dynamic> json) =>
    StoreOrderResponse(
      success: json['success'] as bool,
      order: StorePlacedOrder.fromJson(json['order'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$StoreOrderResponseToJson(StoreOrderResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'order': instance.order,
    };
