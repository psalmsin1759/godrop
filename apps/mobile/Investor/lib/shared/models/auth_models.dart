import 'package:json_annotation/json_annotation.dart';

part 'auth_models.g.dart';

@JsonSerializable()
class KycStep {
  final String key;
  final String label;
  final String status; // NOT_STARTED | IN_REVIEW | VERIFIED | REJECTED

  const KycStep({required this.key, required this.label, required this.status});

  bool get isVerified => status == 'VERIFIED';
  bool get isPending => status == 'IN_REVIEW';

  factory KycStep.fromJson(Map<String, dynamic> json) =>
      _$KycStepFromJson(json);
  Map<String, dynamic> toJson() => _$KycStepToJson(this);
}

@JsonSerializable()
class InvestorKyc {
  @JsonKey(defaultValue: 0)
  final int tier;
  @JsonKey(defaultValue: 'Unverified')
  final String tierName;
  @JsonKey(defaultValue: 0)
  final int investmentLimitKobo;
  @JsonKey(defaultValue: 0)
  final int progressPct;
  @JsonKey(defaultValue: [])
  final List<KycStep> steps;

  const InvestorKyc({
    required this.tier,
    required this.tierName,
    required this.investmentLimitKobo,
    required this.progressPct,
    required this.steps,
  });

  factory InvestorKyc.fromJson(Map<String, dynamic> json) =>
      _$InvestorKycFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorKycToJson(this);
}

@JsonSerializable()
class Investor {
  final String id;
  final String firstName;
  final String lastName;
  final String? username;
  final String email;
  final String phone;
  final String? avatarUrl;
  final String? dateOfBirth;
  final String? address;
  final String? referralCode;
  @JsonKey(defaultValue: false)
  final bool isPhoneVerified;
  @JsonKey(defaultValue: false)
  final bool isEmailVerified;
  final InvestorKyc? kyc;

  const Investor({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.username,
    required this.email,
    required this.phone,
    this.avatarUrl,
    this.dateOfBirth,
    this.address,
    this.referralCode,
    required this.isPhoneVerified,
    required this.isEmailVerified,
    this.kyc,
  });

  String get fullName => '$firstName $lastName';

  factory Investor.fromJson(Map<String, dynamic> json) =>
      _$InvestorFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorToJson(this);
}

@JsonSerializable()
class RegisterBody {
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String password;

  const RegisterBody({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.password,
  });

  factory RegisterBody.fromJson(Map<String, dynamic> json) =>
      _$RegisterBodyFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterBodyToJson(this);
}

@JsonSerializable()
class RegisterResponse {
  final Investor investor;
  final String? message;

  const RegisterResponse({required this.investor, this.message});

  factory RegisterResponse.fromJson(Map<String, dynamic> json) =>
      _$RegisterResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterResponseToJson(this);
}

@JsonSerializable()
class OtpRequestBody {
  final String phone;

  const OtpRequestBody({required this.phone});

  factory OtpRequestBody.fromJson(Map<String, dynamic> json) =>
      _$OtpRequestBodyFromJson(json);
  Map<String, dynamic> toJson() => _$OtpRequestBodyToJson(this);
}

@JsonSerializable()
class OtpVerifyBody {
  final String phone;
  final String code;

  const OtpVerifyBody({required this.phone, required this.code});

  factory OtpVerifyBody.fromJson(Map<String, dynamic> json) =>
      _$OtpVerifyBodyFromJson(json);
  Map<String, dynamic> toJson() => _$OtpVerifyBodyToJson(this);
}

@JsonSerializable()
class LoginBody {
  final String identifier;
  final String password;

  const LoginBody({required this.identifier, required this.password});

  factory LoginBody.fromJson(Map<String, dynamic> json) =>
      _$LoginBodyFromJson(json);
  Map<String, dynamic> toJson() => _$LoginBodyToJson(this);
}

@JsonSerializable()
class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final Investor investor;

  const AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.investor,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}

@JsonSerializable()
class LogoutBody {
  final String refreshToken;

  const LogoutBody({required this.refreshToken});

  factory LogoutBody.fromJson(Map<String, dynamic> json) =>
      _$LogoutBodyFromJson(json);
  Map<String, dynamic> toJson() => _$LogoutBodyToJson(this);
}
