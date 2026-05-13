import 'package:json_annotation/json_annotation.dart';
import 'profile_models.dart';

part 'auth_models.g.dart';

// ── Request bodies ────────────────────────────────────────────────────────────

@JsonSerializable(includeIfNull: false)
class OtpRequestBody {
  final String phone;

  const OtpRequestBody({required this.phone});

  factory OtpRequestBody.fromJson(Map<String, dynamic> json) =>
      _$OtpRequestBodyFromJson(json);
  Map<String, dynamic> toJson() => _$OtpRequestBodyToJson(this);
}

@JsonSerializable(includeIfNull: false)
class OtpVerifyBody {
  final String phone;
  final String otp;

  const OtpVerifyBody({required this.phone, required this.otp});

  factory OtpVerifyBody.fromJson(Map<String, dynamic> json) =>
      _$OtpVerifyBodyFromJson(json);
  Map<String, dynamic> toJson() => _$OtpVerifyBodyToJson(this);
}

@JsonSerializable(includeIfNull: false)
class RegisterBody {
  final String phone;
  final String firstName;
  final String lastName;
  final String? email;
  final String? referralCode;
  final String? password;

  const RegisterBody({
    required this.phone,
    required this.firstName,
    required this.lastName,
    this.email,
    this.referralCode,
    this.password,
  });

  factory RegisterBody.fromJson(Map<String, dynamic> json) =>
      _$RegisterBodyFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterBodyToJson(this);
}

@JsonSerializable()
class PasswordLoginBody {
  final String identifier;
  final String password;

  const PasswordLoginBody({required this.identifier, required this.password});

  factory PasswordLoginBody.fromJson(Map<String, dynamic> json) =>
      _$PasswordLoginBodyFromJson(json);
  Map<String, dynamic> toJson() => _$PasswordLoginBodyToJson(this);
}

@JsonSerializable()
class ForgotPasswordBody {
  final String email;

  const ForgotPasswordBody({required this.email});

  factory ForgotPasswordBody.fromJson(Map<String, dynamic> json) =>
      _$ForgotPasswordBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ForgotPasswordBodyToJson(this);
}

@JsonSerializable()
class ChangePasswordBody {
  final String currentPassword;
  final String newPassword;

  const ChangePasswordBody({required this.currentPassword, required this.newPassword});

  factory ChangePasswordBody.fromJson(Map<String, dynamic> json) =>
      _$ChangePasswordBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ChangePasswordBodyToJson(this);
}

@JsonSerializable()
class LogoutBody {
  final String refreshToken;

  const LogoutBody({required this.refreshToken});

  factory LogoutBody.fromJson(Map<String, dynamic> json) =>
      _$LogoutBodyFromJson(json);
  Map<String, dynamic> toJson() => _$LogoutBodyToJson(this);
}

// ── Response bodies ───────────────────────────────────────────────────────────

@JsonSerializable()
class OtpRequestResponse {
  final String message;
  final int expiresIn;

  const OtpRequestResponse({required this.message, required this.expiresIn});

  factory OtpRequestResponse.fromJson(Map<String, dynamic> json) =>
      _$OtpRequestResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OtpRequestResponseToJson(this);
}

@JsonSerializable()
class OtpVerifyResponse {
  final String accessToken;
  final String refreshToken;
  final bool isNewUser;

  const OtpVerifyResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.isNewUser,
  });

  factory OtpVerifyResponse.fromJson(Map<String, dynamic> json) =>
      _$OtpVerifyResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OtpVerifyResponseToJson(this);
}

@JsonSerializable()
class RegisterResponse {
  final UserProfile user;
  final String accessToken;
  final String refreshToken;

  const RegisterResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  factory RegisterResponse.fromJson(Map<String, dynamic> json) =>
      _$RegisterResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterResponseToJson(this);
}

@JsonSerializable()
class TokenPair {
  final String accessToken;
  final String refreshToken;

  const TokenPair({required this.accessToken, required this.refreshToken});

  factory TokenPair.fromJson(Map<String, dynamic> json) =>
      _$TokenPairFromJson(json);
  Map<String, dynamic> toJson() => _$TokenPairToJson(this);
}
