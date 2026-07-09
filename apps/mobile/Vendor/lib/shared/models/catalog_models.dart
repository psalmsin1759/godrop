import 'package:json_annotation/json_annotation.dart';

part 'catalog_models.g.dart';

@JsonSerializable()
class CategoryCount {
  @JsonKey(defaultValue: 0)
  final int products;

  const CategoryCount({required this.products});

  factory CategoryCount.fromJson(Map<String, dynamic> json) =>
      _$CategoryCountFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryCountToJson(this);
}

@JsonSerializable()
class ProductCategory {
  final String id;
  final String name;
  final String? description;
  final String? imageUrl;
  @JsonKey(defaultValue: true)
  final bool isActive;
  @JsonKey(defaultValue: 0)
  final int sortOrder;
  @JsonKey(name: '_count')
  final CategoryCount? count;

  const ProductCategory({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
    required this.isActive,
    required this.sortOrder,
    this.count,
  });

  int get productCount => count?.products ?? 0;

  factory ProductCategory.fromJson(Map<String, dynamic> json) =>
      _$ProductCategoryFromJson(json);
  Map<String, dynamic> toJson() => _$ProductCategoryToJson(this);
}

@JsonSerializable()
class CategoryListResponse {
  final List<ProductCategory> data;

  const CategoryListResponse({required this.data});

  factory CategoryListResponse.fromJson(Map<String, dynamic> json) =>
      _$CategoryListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryListResponseToJson(this);
}

@JsonSerializable()
class CategoryResponse {
  final ProductCategory data;

  const CategoryResponse({required this.data});

  factory CategoryResponse.fromJson(Map<String, dynamic> json) =>
      _$CategoryResponseFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class CategoryBody {
  final String? name;
  final String? description;
  final String? imageUrl;
  final bool? isActive;
  final int? sortOrder;

  const CategoryBody({
    this.name,
    this.description,
    this.imageUrl,
    this.isActive,
    this.sortOrder,
  });

  factory CategoryBody.fromJson(Map<String, dynamic> json) =>
      _$CategoryBodyFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryBodyToJson(this);
}

@JsonSerializable()
class ToggleActiveBody {
  final bool isActive;

  const ToggleActiveBody({required this.isActive});

  factory ToggleActiveBody.fromJson(Map<String, dynamic> json) =>
      _$ToggleActiveBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ToggleActiveBodyToJson(this);
}

// ── Products ─────────────────────────────────────────────────────────────────

@JsonSerializable()
class ProductCategoryRef {
  final String id;
  final String name;

  const ProductCategoryRef({required this.id, required this.name});

  factory ProductCategoryRef.fromJson(Map<String, dynamic> json) =>
      _$ProductCategoryRefFromJson(json);
  Map<String, dynamic> toJson() => _$ProductCategoryRefToJson(this);
}

@JsonSerializable()
class Product {
  final String id;
  final String categoryId;
  final String name;
  final String? description;
  final int priceKobo;
  final String? imageUrl;
  @JsonKey(defaultValue: true)
  final bool isAvailable;
  final int? stock;
  final ProductCategoryRef? category;

  const Product({
    required this.id,
    required this.categoryId,
    required this.name,
    this.description,
    required this.priceKobo,
    this.imageUrl,
    required this.isAvailable,
    this.stock,
    this.category,
  });

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);
  Map<String, dynamic> toJson() => _$ProductToJson(this);
}

@JsonSerializable()
class ProductListResponse {
  final List<Product> data;
  @JsonKey(defaultValue: 0)
  final int total;
  @JsonKey(defaultValue: 1)
  final int page;
  @JsonKey(defaultValue: 20)
  final int limit;

  const ProductListResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory ProductListResponse.fromJson(Map<String, dynamic> json) =>
      _$ProductListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ProductListResponseToJson(this);
}

@JsonSerializable()
class ProductResponse {
  final Product data;

  const ProductResponse({required this.data});

  factory ProductResponse.fromJson(Map<String, dynamic> json) =>
      _$ProductResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ProductResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class ProductBody {
  final String? categoryId;
  final String? name;
  final String? description;
  final int? priceKobo;
  final String? imageUrl;
  final bool? isAvailable;
  final int? stock;

  const ProductBody({
    this.categoryId,
    this.name,
    this.description,
    this.priceKobo,
    this.imageUrl,
    this.isAvailable,
    this.stock,
  });

  factory ProductBody.fromJson(Map<String, dynamic> json) =>
      _$ProductBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ProductBodyToJson(this);
}

@JsonSerializable()
class ToggleAvailabilityBody {
  final bool isAvailable;

  const ToggleAvailabilityBody({required this.isAvailable});

  factory ToggleAvailabilityBody.fromJson(Map<String, dynamic> json) =>
      _$ToggleAvailabilityBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ToggleAvailabilityBodyToJson(this);
}

@JsonSerializable()
class UploadedImage {
  final String url;

  const UploadedImage({required this.url});

  factory UploadedImage.fromJson(Map<String, dynamic> json) =>
      _$UploadedImageFromJson(json);
  Map<String, dynamic> toJson() => _$UploadedImageToJson(this);
}
