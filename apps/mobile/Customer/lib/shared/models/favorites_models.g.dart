// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'favorites_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FavoritesResponse _$FavoritesResponseFromJson(Map<String, dynamic> json) =>
    FavoritesResponse(
      vendorIds:
          (json['vendorIds'] as List<dynamic>).map((e) => e as String).toList(),
    );

Map<String, dynamic> _$FavoritesResponseToJson(FavoritesResponse instance) =>
    <String, dynamic>{
      'vendorIds': instance.vendorIds,
    };

ToggleFavoriteBody _$ToggleFavoriteBodyFromJson(Map<String, dynamic> json) =>
    ToggleFavoriteBody(
      vendorId: json['vendorId'] as String,
    );

Map<String, dynamic> _$ToggleFavoriteBodyToJson(ToggleFavoriteBody instance) =>
    <String, dynamic>{
      'vendorId': instance.vendorId,
    };
