import 'package:json_annotation/json_annotation.dart';

part 'promotion_models.g.dart';

@JsonSerializable()
class PromoApplyBody {
  final String code;
  final String orderType;
  final int amountKobo;

  const PromoApplyBody({
    required this.code,
    required this.orderType,
    required this.amountKobo,
  });

  factory PromoApplyBody.fromJson(Map<String, dynamic> json) =>
      _$PromoApplyBodyFromJson(json);
  Map<String, dynamic> toJson() => _$PromoApplyBodyToJson(this);
}

@JsonSerializable()
class PromoApplyResponse {
  final int discountKobo;
  final String description;
  final String validUntil;

  const PromoApplyResponse({
    required this.discountKobo,
    required this.description,
    required this.validUntil,
  });

  factory PromoApplyResponse.fromJson(Map<String, dynamic> json) =>
      _$PromoApplyResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PromoApplyResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class Banner {
  final String id;
  final String imageUrl;
  final String title;
  final String? link;

  const Banner({
    required this.id,
    required this.imageUrl,
    required this.title,
    this.link,
  });

  factory Banner.fromJson(Map<String, dynamic> json) =>
      _$BannerFromJson(json);
  Map<String, dynamic> toJson() => _$BannerToJson(this);
}

@JsonSerializable()
class BannersResponse {
  final List<Banner> banners;

  const BannersResponse({required this.banners});

  factory BannersResponse.fromJson(Map<String, dynamic> json) =>
      _$BannersResponseFromJson(json);
  Map<String, dynamic> toJson() => _$BannersResponseToJson(this);
}
