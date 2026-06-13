import 'package:json_annotation/json_annotation.dart';

part 'favorites_models.g.dart';

@JsonSerializable()
class FavoritesResponse {
  final List<String> vendorIds;

  const FavoritesResponse({required this.vendorIds});

  factory FavoritesResponse.fromJson(Map<String, dynamic> json) =>
      _$FavoritesResponseFromJson(json);
  Map<String, dynamic> toJson() => _$FavoritesResponseToJson(this);
}

@JsonSerializable()
class ToggleFavoriteBody {
  final String vendorId;

  const ToggleFavoriteBody({required this.vendorId});

  factory ToggleFavoriteBody.fromJson(Map<String, dynamic> json) =>
      _$ToggleFavoriteBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ToggleFavoriteBodyToJson(this);
}
