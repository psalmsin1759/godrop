import 'package:json_annotation/json_annotation.dart';

part 'profile_models.g.dart';

@JsonSerializable()
class UserProfile {
  final String id;
  final String firstName;
  final String lastName;
  final String phone;
  final String? email;
  final String? avatarUrl;
  @JsonKey(defaultValue: 0)
  final int walletBalanceKobo;

  const UserProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.phone,
    this.email,
    this.avatarUrl,
    this.walletBalanceKobo = 0,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
  Map<String, dynamic> toJson() => _$UserProfileToJson(this);
}

@JsonSerializable()
class UserProfileResponse {
  final UserProfile user;

  const UserProfileResponse({required this.user});

  factory UserProfileResponse.fromJson(Map<String, dynamic> json) =>
      _$UserProfileResponseFromJson(json);
  Map<String, dynamic> toJson() => _$UserProfileResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class UpdateProfileBody {
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? avatarUrl;

  const UpdateProfileBody({
    this.firstName,
    this.lastName,
    this.email,
    this.avatarUrl,
  });

  factory UpdateProfileBody.fromJson(Map<String, dynamic> json) =>
      _$UpdateProfileBodyFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateProfileBodyToJson(this);
}

@JsonSerializable()
class AvatarUploadResponse {
  final String avatarUrl;

  const AvatarUploadResponse({required this.avatarUrl});

  factory AvatarUploadResponse.fromJson(Map<String, dynamic> json) =>
      _$AvatarUploadResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AvatarUploadResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class AddAddressBody {
  final String label;
  final String address;
  final double lat;
  final double lng;
  final bool? isDefault;

  const AddAddressBody({
    required this.label,
    required this.address,
    required this.lat,
    required this.lng,
    this.isDefault,
  });

  factory AddAddressBody.fromJson(Map<String, dynamic> json) =>
      _$AddAddressBodyFromJson(json);
  Map<String, dynamic> toJson() => _$AddAddressBodyToJson(this);
}

@JsonSerializable(includeIfNull: false)
class UpdateAddressBody {
  final String? label;
  final String? address;
  final double? lat;
  final double? lng;
  final bool? isDefault;

  const UpdateAddressBody({
    this.label,
    this.address,
    this.lat,
    this.lng,
    this.isDefault,
  });

  factory UpdateAddressBody.fromJson(Map<String, dynamic> json) =>
      _$UpdateAddressBodyFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateAddressBodyToJson(this);
}

@JsonSerializable()
class SingleAddressResponse {
  final Map<String, dynamic> address;

  const SingleAddressResponse({required this.address});

  factory SingleAddressResponse.fromJson(Map<String, dynamic> json) =>
      _$SingleAddressResponseFromJson(json);
  Map<String, dynamic> toJson() => _$SingleAddressResponseToJson(this);
}
