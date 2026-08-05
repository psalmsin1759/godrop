// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'promotion_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PromoApplyBody _$PromoApplyBodyFromJson(Map<String, dynamic> json) =>
    PromoApplyBody(
      code: json['code'] as String,
      orderType: json['orderType'] as String,
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num).toInt(),
      orderValueKobo: (json['orderValueKobo'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$PromoApplyBodyToJson(PromoApplyBody instance) =>
    <String, dynamic>{
      'code': instance.code,
      'orderType': instance.orderType,
      'deliveryFeeKobo': instance.deliveryFeeKobo,
      'orderValueKobo': instance.orderValueKobo,
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
      imageUrl: json['imageUrl'] as String?,
      badge: json['badge'] as String?,
      title: json['title'] as String?,
      ctaLabel: json['ctaLabel'] as String?,
      linkType: json['linkType'] as String?,
      linkValue: json['linkValue'] as String?,
    );

Map<String, dynamic> _$BannerToJson(Banner instance) => <String, dynamic>{
      'id': instance.id,
      if (instance.imageUrl case final value?) 'imageUrl': value,
      if (instance.badge case final value?) 'badge': value,
      if (instance.title case final value?) 'title': value,
      if (instance.ctaLabel case final value?) 'ctaLabel': value,
      if (instance.linkType case final value?) 'linkType': value,
      if (instance.linkValue case final value?) 'linkValue': value,
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
