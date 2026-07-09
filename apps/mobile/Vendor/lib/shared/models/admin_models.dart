import 'package:json_annotation/json_annotation.dart';
import 'vendor_models.dart';

part 'admin_models.g.dart';

/// A vendor admin account. `role` is OWNER | MANAGER | STAFF.
@JsonSerializable()
class VendorAdmin {
  final String id;
  final String type; // always VENDOR in this app
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  @JsonKey(defaultValue: true)
  final bool isActive;
  final String? vendorId;
  final Vendor? vendor;
  final String? createdAt;

  const VendorAdmin({
    required this.id,
    required this.type,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.isActive,
    this.vendorId,
    this.vendor,
    this.createdAt,
  });

  String get fullName => '$firstName $lastName';
  bool get isOwner => role == 'OWNER';
  bool get isManagerOrAbove => role == 'OWNER' || role == 'MANAGER';

  factory VendorAdmin.fromJson(Map<String, dynamic> json) =>
      _$VendorAdminFromJson(json);
  Map<String, dynamic> toJson() => _$VendorAdminToJson(this);
}

// ── Auth ─────────────────────────────────────────────────────────────────────

@JsonSerializable()
class AdminLoginBody {
  final String email;
  final String password;

  const AdminLoginBody({required this.email, required this.password});

  factory AdminLoginBody.fromJson(Map<String, dynamic> json) =>
      _$AdminLoginBodyFromJson(json);
  Map<String, dynamic> toJson() => _$AdminLoginBodyToJson(this);
}

@JsonSerializable()
class AdminLoginResponse {
  final String token;
  final VendorAdmin admin;

  const AdminLoginResponse({required this.token, required this.admin});

  factory AdminLoginResponse.fromJson(Map<String, dynamic> json) =>
      _$AdminLoginResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AdminLoginResponseToJson(this);
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
class ResetPasswordBody {
  final String token;
  final String newPassword;

  const ResetPasswordBody({required this.token, required this.newPassword});

  factory ResetPasswordBody.fromJson(Map<String, dynamic> json) =>
      _$ResetPasswordBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ResetPasswordBodyToJson(this);
}

@JsonSerializable()
class ChangePasswordBody {
  final String currentPassword;
  final String newPassword;

  const ChangePasswordBody({
    required this.currentPassword,
    required this.newPassword,
  });

  factory ChangePasswordBody.fromJson(Map<String, dynamic> json) =>
      _$ChangePasswordBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ChangePasswordBodyToJson(this);
}

// ── Profile ──────────────────────────────────────────────────────────────────

@JsonSerializable()
class VendorAdminResponse {
  final VendorAdmin data;

  const VendorAdminResponse({required this.data});

  factory VendorAdminResponse.fromJson(Map<String, dynamic> json) =>
      _$VendorAdminResponseFromJson(json);
  Map<String, dynamic> toJson() => _$VendorAdminResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class UpdateProfileBody {
  final String? firstName;
  final String? lastName;
  final String? email;

  const UpdateProfileBody({this.firstName, this.lastName, this.email});

  factory UpdateProfileBody.fromJson(Map<String, dynamic> json) =>
      _$UpdateProfileBodyFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateProfileBodyToJson(this);
}

/// Personal notification preferences for the signed-in admin.
@JsonSerializable()
class ProfileSettings {
  @JsonKey(defaultValue: true)
  final bool emailNotifications;
  @JsonKey(defaultValue: true)
  final bool orderAlerts;

  const ProfileSettings({
    required this.emailNotifications,
    required this.orderAlerts,
  });

  factory ProfileSettings.fromJson(Map<String, dynamic> json) =>
      _$ProfileSettingsFromJson(json);
  Map<String, dynamic> toJson() => _$ProfileSettingsToJson(this);
}

@JsonSerializable()
class ProfileSettingsResponse {
  final ProfileSettings data;

  const ProfileSettingsResponse({required this.data});

  factory ProfileSettingsResponse.fromJson(Map<String, dynamic> json) =>
      _$ProfileSettingsResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ProfileSettingsResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class UpdateProfileSettingsBody {
  final bool? emailNotifications;
  final bool? orderAlerts;

  const UpdateProfileSettingsBody({this.emailNotifications, this.orderAlerts});

  factory UpdateProfileSettingsBody.fromJson(Map<String, dynamic> json) =>
      _$UpdateProfileSettingsBodyFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateProfileSettingsBodyToJson(this);
}
