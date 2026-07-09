import 'package:json_annotation/json_annotation.dart';

part 'vendor_models.g.dart';

/// The vendor (store) record. Money fields are integer Kobo.
@JsonSerializable()
class Vendor {
  final String id;
  final String type; // RESTAURANT | GROCERY | RETAIL | PHARMACY
  final String status; // PENDING | APPROVED | REJECTED | SUSPENDED
  final String name;
  final String? description;
  final String? logoUrl;
  final String? coverUrl;
  final String address;
  final double lat;
  final double lng;
  final String? phone;
  final String? email;
  @JsonKey(defaultValue: [])
  final List<String> cuisines;
  @JsonKey(defaultValue: 0)
  final double rating;
  @JsonKey(defaultValue: 0)
  final int ratingCount;
  @JsonKey(defaultValue: 30)
  final int estimatedMinutes;
  @JsonKey(defaultValue: true)
  final bool isOpen;
  @JsonKey(defaultValue: true)
  final bool isActive;
  final Map<String, dynamic>? openingHours;
  @JsonKey(defaultValue: false)
  final bool cashOnDeliveryEnabled;
  final String? createdAt;

  const Vendor({
    required this.id,
    required this.type,
    required this.status,
    required this.name,
    this.description,
    this.logoUrl,
    this.coverUrl,
    required this.address,
    required this.lat,
    required this.lng,
    this.phone,
    this.email,
    required this.cuisines,
    required this.rating,
    required this.ratingCount,
    required this.estimatedMinutes,
    required this.isOpen,
    required this.isActive,
    this.openingHours,
    required this.cashOnDeliveryEnabled,
    this.createdAt,
  });

  factory Vendor.fromJson(Map<String, dynamic> json) => _$VendorFromJson(json);
  Map<String, dynamic> toJson() => _$VendorToJson(this);
}

/// Vendor settings payload: the vendor record plus the platform-wide
/// (read-only) delivery fee.
@JsonSerializable()
class VendorSettings extends Vendor {
  @JsonKey(defaultValue: 0)
  final int deliveryFeeKobo;

  const VendorSettings({
    required super.id,
    required super.type,
    required super.status,
    required super.name,
    super.description,
    super.logoUrl,
    super.coverUrl,
    required super.address,
    required super.lat,
    required super.lng,
    super.phone,
    super.email,
    required super.cuisines,
    required super.rating,
    required super.ratingCount,
    required super.estimatedMinutes,
    required super.isOpen,
    required super.isActive,
    super.openingHours,
    required super.cashOnDeliveryEnabled,
    super.createdAt,
    required this.deliveryFeeKobo,
  });

  factory VendorSettings.fromJson(Map<String, dynamic> json) =>
      _$VendorSettingsFromJson(json);
  @override
  Map<String, dynamic> toJson() => _$VendorSettingsToJson(this);
}

@JsonSerializable()
class VendorSettingsResponse {
  final VendorSettings data;

  const VendorSettingsResponse({required this.data});

  factory VendorSettingsResponse.fromJson(Map<String, dynamic> json) =>
      _$VendorSettingsResponseFromJson(json);
  Map<String, dynamic> toJson() => _$VendorSettingsResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class UpdateVendorSettingsBody {
  final String? name;
  final String? description;
  final String? phone;
  final String? email;
  final int? estimatedMinutes;
  final bool? isOpen;
  final Map<String, dynamic>? openingHours;
  final bool? cashOnDeliveryEnabled;

  const UpdateVendorSettingsBody({
    this.name,
    this.description,
    this.phone,
    this.email,
    this.estimatedMinutes,
    this.isOpen,
    this.openingHours,
    this.cashOnDeliveryEnabled,
  });

  factory UpdateVendorSettingsBody.fromJson(Map<String, dynamic> json) =>
      _$UpdateVendorSettingsBodyFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateVendorSettingsBodyToJson(this);
}
