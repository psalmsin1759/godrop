import 'package:json_annotation/json_annotation.dart';

part 'common_models.g.dart';

@JsonSerializable()
class Pagination {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const Pagination({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) =>
      _$PaginationFromJson(json);
  Map<String, dynamic> toJson() => _$PaginationToJson(this);
}

@JsonSerializable()
class MessageResponse {
  final String message;

  const MessageResponse({required this.message});

  factory MessageResponse.fromJson(Map<String, dynamic> json) =>
      _$MessageResponseFromJson(json);
  Map<String, dynamic> toJson() => _$MessageResponseToJson(this);
}

@JsonSerializable()
class SavedAddress {
  final String id;
  final String label;
  final String address;
  final double lat;
  final double lng;
  final bool isDefault;

  const SavedAddress({
    required this.id,
    required this.label,
    required this.address,
    required this.lat,
    required this.lng,
    required this.isDefault,
  });

  factory SavedAddress.fromJson(Map<String, dynamic> json) =>
      _$SavedAddressFromJson(json);
  Map<String, dynamic> toJson() => _$SavedAddressToJson(this);
}

@JsonSerializable()
class AddressListResponse {
  final List<SavedAddress> addresses;

  const AddressListResponse({required this.addresses});

  factory AddressListResponse.fromJson(Map<String, dynamic> json) =>
      _$AddressListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AddressListResponseToJson(this);
}

@JsonSerializable()
class LocationPoint {
  final double lat;
  final double lng;
  final String address;

  const LocationPoint({
    required this.lat,
    required this.lng,
    required this.address,
  });

  factory LocationPoint.fromJson(Map<String, dynamic> json) =>
      _$LocationPointFromJson(json);
  Map<String, dynamic> toJson() => _$LocationPointToJson(this);
}
