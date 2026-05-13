// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'promotion_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PromoApplyBody _$PromoApplyBodyFromJson(Map<String, dynamic> json) =>
    PromoApplyBody(
      code: json['code'] as String,
      orderType: json['orderType'] as String,
      amountKobo: (json['amountKobo'] as num).toInt(),
    );

Map<String, dynamic> _$PromoApplyBodyToJson(PromoApplyBody instance) =>
    <String, dynamic>{
      'code': instance.code,
      'orderType': instance.orderType,
      'amountKobo': instance.amountKobo,
    };

PromoApplyResponse _$PromoApplyResponseFromJson(Map<String, dynamic> json) =>
    PromoApplyResponse(
      discountKobo: (json['discountKobo'] as num).toInt(),
      description: json['description'] as String,
      validUntil: json['validUntil'] as String,
    );

Map<String, dynamic> _$PromoApplyResponseToJson(PromoApplyResponse instance) =>
    <String, dynamic>{
      'discountKobo': instance.discountKobo,
      'description': instance.description,
      'validUntil': instance.validUntil,
    };

Banner _$BannerFromJson(Map<String, dynamic> json) => Banner(
      id: json['id'] as String,
      imageUrl: json['imageUrl'] as String,
      title: json['title'] as String,
      link: json['link'] as String?,
    );

Map<String, dynamic> _$BannerToJson(Banner instance) => <String, dynamic>{
      'id': instance.id,
      'imageUrl': instance.imageUrl,
      'title': instance.title,
      if (instance.link case final value?) 'link': value,
    };

BannersResponse _$BannersResponseFromJson(Map<String, dynamic> json) =>
    BannersResponse(
      banners: (json['banners'] as List<dynamic>)
          .map((e) => Banner.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$BannersResponseToJson(BannersResponse instance) =>
    <String, dynamic>{
      'banners': instance.banners,
    };
