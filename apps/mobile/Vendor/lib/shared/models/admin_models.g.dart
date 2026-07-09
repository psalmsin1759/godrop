// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorAdmin _$VendorAdminFromJson(Map<String, dynamic> json) => VendorAdmin(
      id: json['id'] as String,
      type: json['type'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String,
      isActive: json['isActive'] as bool? ?? true,
      vendorId: json['vendorId'] as String?,
      vendor: json['vendor'] == null
          ? null
          : Vendor.fromJson(json['vendor'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$VendorAdminToJson(VendorAdmin instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'email': instance.email,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'role': instance.role,
      'isActive': instance.isActive,
      'vendorId': instance.vendorId,
      'vendor': instance.vendor,
      'createdAt': instance.createdAt,
    };

AdminLoginBody _$AdminLoginBodyFromJson(Map<String, dynamic> json) =>
    AdminLoginBody(
      email: json['email'] as String,
      password: json['password'] as String,
    );

Map<String, dynamic> _$AdminLoginBodyToJson(AdminLoginBody instance) =>
    <String, dynamic>{
      'email': instance.email,
      'password': instance.password,
    };

AdminLoginResponse _$AdminLoginResponseFromJson(Map<String, dynamic> json) =>
    AdminLoginResponse(
      token: json['token'] as String,
      admin: VendorAdmin.fromJson(json['admin'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AdminLoginResponseToJson(AdminLoginResponse instance) =>
    <String, dynamic>{
      'token': instance.token,
      'admin': instance.admin,
    };

ForgotPasswordBody _$ForgotPasswordBodyFromJson(Map<String, dynamic> json) =>
    ForgotPasswordBody(
      email: json['email'] as String,
    );

Map<String, dynamic> _$ForgotPasswordBodyToJson(ForgotPasswordBody instance) =>
    <String, dynamic>{
      'email': instance.email,
    };

ResetPasswordBody _$ResetPasswordBodyFromJson(Map<String, dynamic> json) =>
    ResetPasswordBody(
      token: json['token'] as String,
      newPassword: json['newPassword'] as String,
    );

Map<String, dynamic> _$ResetPasswordBodyToJson(ResetPasswordBody instance) =>
    <String, dynamic>{
      'token': instance.token,
      'newPassword': instance.newPassword,
    };

ChangePasswordBody _$ChangePasswordBodyFromJson(Map<String, dynamic> json) =>
    ChangePasswordBody(
      currentPassword: json['currentPassword'] as String,
      newPassword: json['newPassword'] as String,
    );

Map<String, dynamic> _$ChangePasswordBodyToJson(ChangePasswordBody instance) =>
    <String, dynamic>{
      'currentPassword': instance.currentPassword,
      'newPassword': instance.newPassword,
    };

VendorAdminResponse _$VendorAdminResponseFromJson(Map<String, dynamic> json) =>
    VendorAdminResponse(
      data: VendorAdmin.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$VendorAdminResponseToJson(
        VendorAdminResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

UpdateProfileBody _$UpdateProfileBodyFromJson(Map<String, dynamic> json) =>
    UpdateProfileBody(
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      email: json['email'] as String?,
    );

Map<String, dynamic> _$UpdateProfileBodyToJson(UpdateProfileBody instance) =>
    <String, dynamic>{
      if (instance.firstName case final value?) 'firstName': value,
      if (instance.lastName case final value?) 'lastName': value,
      if (instance.email case final value?) 'email': value,
    };

ProfileSettings _$ProfileSettingsFromJson(Map<String, dynamic> json) =>
    ProfileSettings(
      emailNotifications: json['emailNotifications'] as bool? ?? true,
      orderAlerts: json['orderAlerts'] as bool? ?? true,
    );

Map<String, dynamic> _$ProfileSettingsToJson(ProfileSettings instance) =>
    <String, dynamic>{
      'emailNotifications': instance.emailNotifications,
      'orderAlerts': instance.orderAlerts,
    };

ProfileSettingsResponse _$ProfileSettingsResponseFromJson(
        Map<String, dynamic> json) =>
    ProfileSettingsResponse(
      data: ProfileSettings.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$ProfileSettingsResponseToJson(
        ProfileSettingsResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

UpdateProfileSettingsBody _$UpdateProfileSettingsBodyFromJson(
        Map<String, dynamic> json) =>
    UpdateProfileSettingsBody(
      emailNotifications: json['emailNotifications'] as bool?,
      orderAlerts: json['orderAlerts'] as bool?,
    );

Map<String, dynamic> _$UpdateProfileSettingsBodyToJson(
        UpdateProfileSettingsBody instance) =>
    <String, dynamic>{
      if (instance.emailNotifications case final value?)
        'emailNotifications': value,
      if (instance.orderAlerts case final value?) 'orderAlerts': value,
    };
