// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserProfile _$UserProfileFromJson(Map<String, dynamic> json) => UserProfile(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      walletBalanceKobo: (json['walletBalanceKobo'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$UserProfileToJson(UserProfile instance) =>
    <String, dynamic>{
      'id': instance.id,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'phone': instance.phone,
      'email': instance.email,
      'avatarUrl': instance.avatarUrl,
      'walletBalanceKobo': instance.walletBalanceKobo,
    };

UserProfileResponse _$UserProfileResponseFromJson(Map<String, dynamic> json) =>
    UserProfileResponse(
      user: UserProfile.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$UserProfileResponseToJson(
        UserProfileResponse instance) =>
    <String, dynamic>{
      'user': instance.user,
    };

UpdateProfileBody _$UpdateProfileBodyFromJson(Map<String, dynamic> json) =>
    UpdateProfileBody(
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      email: json['email'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
    );

Map<String, dynamic> _$UpdateProfileBodyToJson(UpdateProfileBody instance) =>
    <String, dynamic>{
      if (instance.firstName case final value?) 'firstName': value,
      if (instance.lastName case final value?) 'lastName': value,
      if (instance.email case final value?) 'email': value,
      if (instance.avatarUrl case final value?) 'avatarUrl': value,
    };

AvatarUploadResponse _$AvatarUploadResponseFromJson(
        Map<String, dynamic> json) =>
    AvatarUploadResponse(
      avatarUrl: json['avatarUrl'] as String,
    );

Map<String, dynamic> _$AvatarUploadResponseToJson(
        AvatarUploadResponse instance) =>
    <String, dynamic>{
      'avatarUrl': instance.avatarUrl,
    };

AddAddressBody _$AddAddressBodyFromJson(Map<String, dynamic> json) =>
    AddAddressBody(
      label: json['label'] as String,
      address: json['address'] as String,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      isDefault: json['isDefault'] as bool?,
    );

Map<String, dynamic> _$AddAddressBodyToJson(AddAddressBody instance) =>
    <String, dynamic>{
      'label': instance.label,
      'address': instance.address,
      'lat': instance.lat,
      'lng': instance.lng,
      if (instance.isDefault case final value?) 'isDefault': value,
    };

UpdateAddressBody _$UpdateAddressBodyFromJson(Map<String, dynamic> json) =>
    UpdateAddressBody(
      label: json['label'] as String?,
      address: json['address'] as String?,
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
      isDefault: json['isDefault'] as bool?,
    );

Map<String, dynamic> _$UpdateAddressBodyToJson(UpdateAddressBody instance) =>
    <String, dynamic>{
      if (instance.label case final value?) 'label': value,
      if (instance.address case final value?) 'address': value,
      if (instance.lat case final value?) 'lat': value,
      if (instance.lng case final value?) 'lng': value,
      if (instance.isDefault case final value?) 'isDefault': value,
    };

SingleAddressResponse _$SingleAddressResponseFromJson(
        Map<String, dynamic> json) =>
    SingleAddressResponse(
      address: json['address'] as Map<String, dynamic>,
    );

Map<String, dynamic> _$SingleAddressResponseToJson(
        SingleAddressResponse instance) =>
    <String, dynamic>{
      'address': instance.address,
    };
