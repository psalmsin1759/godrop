// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vendor_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Vendor _$VendorFromJson(Map<String, dynamic> json) => Vendor(
      id: json['id'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      logoUrl: json['logoUrl'] as String?,
      coverUrl: json['coverUrl'] as String?,
      address: json['address'] as String,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      cuisines: (json['cuisines'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      ratingCount: (json['ratingCount'] as num?)?.toInt() ?? 0,
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt() ?? 30,
      isOpen: json['isOpen'] as bool? ?? true,
      isActive: json['isActive'] as bool? ?? true,
      openingHours: json['openingHours'] as Map<String, dynamic>?,
      cashOnDeliveryEnabled: json['cashOnDeliveryEnabled'] as bool? ?? false,
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$VendorToJson(Vendor instance) => <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'status': instance.status,
      'name': instance.name,
      'description': instance.description,
      'logoUrl': instance.logoUrl,
      'coverUrl': instance.coverUrl,
      'address': instance.address,
      'lat': instance.lat,
      'lng': instance.lng,
      'phone': instance.phone,
      'email': instance.email,
      'cuisines': instance.cuisines,
      'rating': instance.rating,
      'ratingCount': instance.ratingCount,
      'estimatedMinutes': instance.estimatedMinutes,
      'isOpen': instance.isOpen,
      'isActive': instance.isActive,
      'openingHours': instance.openingHours,
      'cashOnDeliveryEnabled': instance.cashOnDeliveryEnabled,
      'createdAt': instance.createdAt,
    };

VendorSettings _$VendorSettingsFromJson(Map<String, dynamic> json) =>
    VendorSettings(
      id: json['id'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      logoUrl: json['logoUrl'] as String?,
      coverUrl: json['coverUrl'] as String?,
      address: json['address'] as String,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      cuisines: (json['cuisines'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      ratingCount: (json['ratingCount'] as num?)?.toInt() ?? 0,
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt() ?? 30,
      isOpen: json['isOpen'] as bool? ?? true,
      isActive: json['isActive'] as bool? ?? true,
      openingHours: json['openingHours'] as Map<String, dynamic>?,
      cashOnDeliveryEnabled: json['cashOnDeliveryEnabled'] as bool? ?? false,
      createdAt: json['createdAt'] as String?,
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$VendorSettingsToJson(VendorSettings instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'status': instance.status,
      'name': instance.name,
      'description': instance.description,
      'logoUrl': instance.logoUrl,
      'coverUrl': instance.coverUrl,
      'address': instance.address,
      'lat': instance.lat,
      'lng': instance.lng,
      'phone': instance.phone,
      'email': instance.email,
      'cuisines': instance.cuisines,
      'rating': instance.rating,
      'ratingCount': instance.ratingCount,
      'estimatedMinutes': instance.estimatedMinutes,
      'isOpen': instance.isOpen,
      'isActive': instance.isActive,
      'openingHours': instance.openingHours,
      'cashOnDeliveryEnabled': instance.cashOnDeliveryEnabled,
      'createdAt': instance.createdAt,
      'deliveryFeeKobo': instance.deliveryFeeKobo,
    };

VendorSettingsResponse _$VendorSettingsResponseFromJson(
        Map<String, dynamic> json) =>
    VendorSettingsResponse(
      data: VendorSettings.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$VendorSettingsResponseToJson(
        VendorSettingsResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

UpdateVendorSettingsBody _$UpdateVendorSettingsBodyFromJson(
        Map<String, dynamic> json) =>
    UpdateVendorSettingsBody(
      name: json['name'] as String?,
      description: json['description'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt(),
      isOpen: json['isOpen'] as bool?,
      openingHours: json['openingHours'] as Map<String, dynamic>?,
      cashOnDeliveryEnabled: json['cashOnDeliveryEnabled'] as bool?,
    );

Map<String, dynamic> _$UpdateVendorSettingsBodyToJson(
        UpdateVendorSettingsBody instance) =>
    <String, dynamic>{
      if (instance.name case final value?) 'name': value,
      if (instance.description case final value?) 'description': value,
      if (instance.phone case final value?) 'phone': value,
      if (instance.email case final value?) 'email': value,
      if (instance.estimatedMinutes case final value?)
        'estimatedMinutes': value,
      if (instance.isOpen case final value?) 'isOpen': value,
      if (instance.openingHours case final value?) 'openingHours': value,
      if (instance.cashOnDeliveryEnabled case final value?)
        'cashOnDeliveryEnabled': value,
    };
