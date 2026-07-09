// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

KycStep _$KycStepFromJson(Map<String, dynamic> json) => KycStep(
      key: json['key'] as String,
      label: json['label'] as String,
      status: json['status'] as String,
    );

Map<String, dynamic> _$KycStepToJson(KycStep instance) => <String, dynamic>{
      'key': instance.key,
      'label': instance.label,
      'status': instance.status,
    };

InvestorKyc _$InvestorKycFromJson(Map<String, dynamic> json) => InvestorKyc(
      tier: (json['tier'] as num?)?.toInt() ?? 0,
      tierName: json['tierName'] as String? ?? 'Unverified',
      investmentLimitKobo: (json['investmentLimitKobo'] as num?)?.toInt() ?? 0,
      progressPct: (json['progressPct'] as num?)?.toInt() ?? 0,
      steps: (json['steps'] as List<dynamic>?)
              ?.map((e) => KycStep.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$InvestorKycToJson(InvestorKyc instance) =>
    <String, dynamic>{
      'tier': instance.tier,
      'tierName': instance.tierName,
      'investmentLimitKobo': instance.investmentLimitKobo,
      'progressPct': instance.progressPct,
      'steps': instance.steps,
    };

Investor _$InvestorFromJson(Map<String, dynamic> json) => Investor(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      username: json['username'] as String?,
      email: json['email'] as String,
      phone: json['phone'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      address: json['address'] as String?,
      referralCode: json['referralCode'] as String?,
      isPhoneVerified: json['isPhoneVerified'] as bool? ?? false,
      isEmailVerified: json['isEmailVerified'] as bool? ?? false,
      kyc: json['kyc'] == null
          ? null
          : InvestorKyc.fromJson(json['kyc'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$InvestorToJson(Investor instance) => <String, dynamic>{
      'id': instance.id,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'username': instance.username,
      'email': instance.email,
      'phone': instance.phone,
      'avatarUrl': instance.avatarUrl,
      'dateOfBirth': instance.dateOfBirth,
      'address': instance.address,
      'referralCode': instance.referralCode,
      'isPhoneVerified': instance.isPhoneVerified,
      'isEmailVerified': instance.isEmailVerified,
      'kyc': instance.kyc,
    };

RegisterBody _$RegisterBodyFromJson(Map<String, dynamic> json) => RegisterBody(
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      password: json['password'] as String,
    );

Map<String, dynamic> _$RegisterBodyToJson(RegisterBody instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'email': instance.email,
      'phone': instance.phone,
      'password': instance.password,
    };

RegisterResponse _$RegisterResponseFromJson(Map<String, dynamic> json) =>
    RegisterResponse(
      investor: Investor.fromJson(json['investor'] as Map<String, dynamic>),
      message: json['message'] as String?,
    );

Map<String, dynamic> _$RegisterResponseToJson(RegisterResponse instance) =>
    <String, dynamic>{
      'investor': instance.investor,
      'message': instance.message,
    };

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
      code: json['code'] as String,
    );

Map<String, dynamic> _$OtpVerifyBodyToJson(OtpVerifyBody instance) =>
    <String, dynamic>{
      'phone': instance.phone,
      'code': instance.code,
    };

LoginBody _$LoginBodyFromJson(Map<String, dynamic> json) => LoginBody(
      identifier: json['identifier'] as String,
      password: json['password'] as String,
    );

Map<String, dynamic> _$LoginBodyToJson(LoginBody instance) => <String, dynamic>{
      'identifier': instance.identifier,
      'password': instance.password,
    };

AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) => AuthResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      investor: Investor.fromJson(json['investor'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AuthResponseToJson(AuthResponse instance) =>
    <String, dynamic>{
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
      'investor': instance.investor,
    };

LogoutBody _$LogoutBodyFromJson(Map<String, dynamic> json) => LogoutBody(
      refreshToken: json['refreshToken'] as String,
    );

Map<String, dynamic> _$LogoutBodyToJson(LogoutBody instance) =>
    <String, dynamic>{
      'refreshToken': instance.refreshToken,
    };
