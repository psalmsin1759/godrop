// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'catalog_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CategoryCount _$CategoryCountFromJson(Map<String, dynamic> json) =>
    CategoryCount(
      products: (json['products'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$CategoryCountToJson(CategoryCount instance) =>
    <String, dynamic>{
      'products': instance.products,
    };

ProductCategory _$ProductCategoryFromJson(Map<String, dynamic> json) =>
    ProductCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      count: json['_count'] == null
          ? null
          : CategoryCount.fromJson(json['_count'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$ProductCategoryToJson(ProductCategory instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'isActive': instance.isActive,
      'sortOrder': instance.sortOrder,
      '_count': instance.count,
    };

CategoryListResponse _$CategoryListResponseFromJson(
        Map<String, dynamic> json) =>
    CategoryListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => ProductCategory.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$CategoryListResponseToJson(
        CategoryListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

CategoryResponse _$CategoryResponseFromJson(Map<String, dynamic> json) =>
    CategoryResponse(
      data: ProductCategory.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$CategoryResponseToJson(CategoryResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

CategoryBody _$CategoryBodyFromJson(Map<String, dynamic> json) => CategoryBody(
      name: json['name'] as String?,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      isActive: json['isActive'] as bool?,
      sortOrder: (json['sortOrder'] as num?)?.toInt(),
    );

Map<String, dynamic> _$CategoryBodyToJson(CategoryBody instance) =>
    <String, dynamic>{
      if (instance.name case final value?) 'name': value,
      if (instance.description case final value?) 'description': value,
      if (instance.imageUrl case final value?) 'imageUrl': value,
      if (instance.isActive case final value?) 'isActive': value,
      if (instance.sortOrder case final value?) 'sortOrder': value,
    };

ToggleActiveBody _$ToggleActiveBodyFromJson(Map<String, dynamic> json) =>
    ToggleActiveBody(
      isActive: json['isActive'] as bool,
    );

Map<String, dynamic> _$ToggleActiveBodyToJson(ToggleActiveBody instance) =>
    <String, dynamic>{
      'isActive': instance.isActive,
    };

ProductCategoryRef _$ProductCategoryRefFromJson(Map<String, dynamic> json) =>
    ProductCategoryRef(
      id: json['id'] as String,
      name: json['name'] as String,
    );

Map<String, dynamic> _$ProductCategoryRefToJson(ProductCategoryRef instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
    };

Product _$ProductFromJson(Map<String, dynamic> json) => Product(
      id: json['id'] as String,
      categoryId: json['categoryId'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      priceKobo: (json['priceKobo'] as num).toInt(),
      imageUrl: json['imageUrl'] as String?,
      isAvailable: json['isAvailable'] as bool? ?? true,
      stock: (json['stock'] as num?)?.toInt(),
      category: json['category'] == null
          ? null
          : ProductCategoryRef.fromJson(
              json['category'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$ProductToJson(Product instance) => <String, dynamic>{
      'id': instance.id,
      'categoryId': instance.categoryId,
      'name': instance.name,
      'description': instance.description,
      'priceKobo': instance.priceKobo,
      'imageUrl': instance.imageUrl,
      'isAvailable': instance.isAvailable,
      'stock': instance.stock,
      'category': instance.category,
    };

ProductListResponse _$ProductListResponseFromJson(Map<String, dynamic> json) =>
    ProductListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => Product.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: (json['total'] as num?)?.toInt() ?? 0,
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 20,
    );

Map<String, dynamic> _$ProductListResponseToJson(
        ProductListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'total': instance.total,
      'page': instance.page,
      'limit': instance.limit,
    };

ProductResponse _$ProductResponseFromJson(Map<String, dynamic> json) =>
    ProductResponse(
      data: Product.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$ProductResponseToJson(ProductResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

ProductBody _$ProductBodyFromJson(Map<String, dynamic> json) => ProductBody(
      categoryId: json['categoryId'] as String?,
      name: json['name'] as String?,
      description: json['description'] as String?,
      priceKobo: (json['priceKobo'] as num?)?.toInt(),
      imageUrl: json['imageUrl'] as String?,
      isAvailable: json['isAvailable'] as bool?,
      stock: (json['stock'] as num?)?.toInt(),
    );

Map<String, dynamic> _$ProductBodyToJson(ProductBody instance) =>
    <String, dynamic>{
      if (instance.categoryId case final value?) 'categoryId': value,
      if (instance.name case final value?) 'name': value,
      if (instance.description case final value?) 'description': value,
      if (instance.priceKobo case final value?) 'priceKobo': value,
      if (instance.imageUrl case final value?) 'imageUrl': value,
      if (instance.isAvailable case final value?) 'isAvailable': value,
      if (instance.stock case final value?) 'stock': value,
    };

ToggleAvailabilityBody _$ToggleAvailabilityBodyFromJson(
        Map<String, dynamic> json) =>
    ToggleAvailabilityBody(
      isAvailable: json['isAvailable'] as bool,
    );

Map<String, dynamic> _$ToggleAvailabilityBodyToJson(
        ToggleAvailabilityBody instance) =>
    <String, dynamic>{
      'isAvailable': instance.isAvailable,
    };

UploadedImage _$UploadedImageFromJson(Map<String, dynamic> json) =>
    UploadedImage(
      url: json['url'] as String,
    );

Map<String, dynamic> _$UploadedImageToJson(UploadedImage instance) =>
    <String, dynamic>{
      'url': instance.url,
    };
