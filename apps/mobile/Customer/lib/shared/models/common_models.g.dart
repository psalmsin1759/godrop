// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'common_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Pagination _$PaginationFromJson(Map<String, dynamic> json) => Pagination(
      page: (json['page'] as num).toInt(),
      limit: (json['limit'] as num).toInt(),
      total: (json['total'] as num).toInt(),
      totalPages: (json['totalPages'] as num).toInt(),
    );

Map<String, dynamic> _$PaginationToJson(Pagination instance) =>
    <String, dynamic>{
      'page': instance.page,
      'limit': instance.limit,
      'total': instance.total,
      'totalPages': instance.totalPages,
    };

MessageResponse _$MessageResponseFromJson(Map<String, dynamic> json) =>
    MessageResponse(
      message: json['message'] as String,
    );

Map<String, dynamic> _$MessageResponseToJson(MessageResponse instance) =>
    <String, dynamic>{
      'message': instance.message,
    };

SavedAddress _$SavedAddressFromJson(Map<String, dynamic> json) => SavedAddress(
      id: json['id'] as String,
      label: json['label'] as String,
      address: json['address'] as String,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      isDefault: json['isDefault'] as bool,
    );

Map<String, dynamic> _$SavedAddressToJson(SavedAddress instance) =>
    <String, dynamic>{
      'id': instance.id,
      'label': instance.label,
      'address': instance.address,
      'lat': instance.lat,
      'lng': instance.lng,
      'isDefault': instance.isDefault,
    };

AddressListResponse _$AddressListResponseFromJson(Map<String, dynamic> json) =>
    AddressListResponse(
      addresses: (json['addresses'] as List<dynamic>)
          .map((e) => SavedAddress.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$AddressListResponseToJson(
        AddressListResponse instance) =>
    <String, dynamic>{
      'addresses': instance.addresses,
    };

LocationPoint _$LocationPointFromJson(Map<String, dynamic> json) =>
    LocationPoint(
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      address: json['address'] as String,
    );

Map<String, dynamic> _$LocationPointToJson(LocationPoint instance) =>
    <String, dynamic>{
      'lat': instance.lat,
      'lng': instance.lng,
      'address': instance.address,
    };
