// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OtpRequestBody _$OtpRequestBodyFromJson(Map<String, dynamic> json) =>
    OtpRequestBody(
      phone: json['phone'] as String,
    );

Map<String, dynamic> _$OtpRequestBodyToJson(OtpRequestBody instance) =>
    <String, dynamic>{
      'phone': instance.phone,
    };

OtpVerifyBody _$OtpVerifyBodyFromJson(Map<String, dynamic> json) =>
    OtpVerifyBody(
      phone: json['phone'] as String,
      otp: json['otp'] as String,
    );

Map<String, dynamic> _$OtpVerifyBodyToJson(OtpVerifyBody instance) =>
    <String, dynamic>{
      'phone': instance.phone,
      'otp': instance.otp,
    };

RegisterBody _$RegisterBodyFromJson(Map<String, dynamic> json) => RegisterBody(
      phone: json['phone'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String?,
      referralCode: json['referralCode'] as String?,
      password: json['password'] as String?,
    );

Map<String, dynamic> _$RegisterBodyToJson(RegisterBody instance) =>
    <String, dynamic>{
      'phone': instance.phone,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      if (instance.email case final value?) 'email': value,
      if (instance.referralCode case final value?) 'referralCode': value,
      if (instance.password case final value?) 'password': value,
    };

PasswordLoginBody _$PasswordLoginBodyFromJson(Map<String, dynamic> json) =>
    PasswordLoginBody(
      identifier: json['identifier'] as String,
      password: json['password'] as String,
    );

Map<String, dynamic> _$PasswordLoginBodyToJson(PasswordLoginBody instance) =>
    <String, dynamic>{
      'identifier': instance.identifier,
      'password': instance.password,
    };

ForgotPasswordBody _$ForgotPasswordBodyFromJson(Map<String, dynamic> json) =>
    ForgotPasswordBody(
      email: json['email'] as String,
    );

Map<String, dynamic> _$ForgotPasswordBodyToJson(ForgotPasswordBody instance) =>
    <String, dynamic>{
      'email': instance.email,
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

LogoutBody _$LogoutBodyFromJson(Map<String, dynamic> json) => LogoutBody(
      refreshToken: json['refreshToken'] as String,
    );

Map<String, dynamic> _$LogoutBodyToJson(LogoutBody instance) =>
    <String, dynamic>{
      'refreshToken': instance.refreshToken,
    };

OtpRequestResponse _$OtpRequestResponseFromJson(Map<String, dynamic> json) =>
    OtpRequestResponse(
      message: json['message'] as String,
      expiresIn: (json['expiresIn'] as num).toInt(),
    );

Map<String, dynamic> _$OtpRequestResponseToJson(OtpRequestResponse instance) =>
    <String, dynamic>{
      'message': instance.message,
      'expiresIn': instance.expiresIn,
    };

OtpVerifyResponse _$OtpVerifyResponseFromJson(Map<String, dynamic> json) =>
    OtpVerifyResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      isNewUser: json['isNewUser'] as bool,
    );

Map<String, dynamic> _$OtpVerifyResponseToJson(OtpVerifyResponse instance) =>
    <String, dynamic>{
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
      'isNewUser': instance.isNewUser,
    };

RegisterResponse _$RegisterResponseFromJson(Map<String, dynamic> json) =>
    RegisterResponse(
      user: UserProfile.fromJson(json['user'] as Map<String, dynamic>),
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );

Map<String, dynamic> _$RegisterResponseToJson(RegisterResponse instance) =>
    <String, dynamic>{
      'user': instance.user,
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
    };

TokenPair _$TokenPairFromJson(Map<String, dynamic> json) => TokenPair(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );

Map<String, dynamic> _$TokenPairToJson(TokenPair instance) => <String, dynamic>{
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
    };
