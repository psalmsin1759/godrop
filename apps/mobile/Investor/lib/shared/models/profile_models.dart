import 'package:json_annotation/json_annotation.dart';
import 'auth_models.dart';
import 'common_models.dart';

part 'profile_models.g.dart';

@JsonSerializable()
class InvestorResponse {
  final Investor data;

  const InvestorResponse({required this.data});

  factory InvestorResponse.fromJson(Map<String, dynamic> json) =>
      _$InvestorResponseFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class UpdateProfileBody {
  final String? firstName;
  final String? lastName;
  final String? username;
  final String? avatarUrl;
  final String? dateOfBirth;
  final String? address;

  const UpdateProfileBody({
    this.firstName,
    this.lastName,
    this.username,
    this.avatarUrl,
    this.dateOfBirth,
    this.address,
  });

  factory UpdateProfileBody.fromJson(Map<String, dynamic> json) =>
      _$UpdateProfileBodyFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateProfileBodyToJson(this);
}

@JsonSerializable()
class Bank {
  final String name;
  final String code;
  final String? slug;

  const Bank({required this.name, required this.code, this.slug});

  factory Bank.fromJson(Map<String, dynamic> json) => _$BankFromJson(json);
  Map<String, dynamic> toJson() => _$BankToJson(this);
}

@JsonSerializable()
class BankListResponse {
  @JsonKey(defaultValue: [])
  final List<Bank> banks;

  const BankListResponse({required this.banks});

  factory BankListResponse.fromJson(Map<String, dynamic> json) =>
      _$BankListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$BankListResponseToJson(this);
}

@JsonSerializable()
class InvestorBankAccount {
  final String id;
  final String bankName;
  final String bankCode;
  final String accountNumber;
  final String accountName;
  @JsonKey(defaultValue: false)
  final bool isPrimary;

  const InvestorBankAccount({
    required this.id,
    required this.bankName,
    required this.bankCode,
    required this.accountNumber,
    required this.accountName,
    required this.isPrimary,
  });

  String get maskedNumber =>
      '•••• ${accountNumber.length >= 4 ? accountNumber.substring(accountNumber.length - 4) : accountNumber}';

  factory InvestorBankAccount.fromJson(Map<String, dynamic> json) =>
      _$InvestorBankAccountFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorBankAccountToJson(this);
}

@JsonSerializable()
class BankAccountListResponse {
  @JsonKey(defaultValue: [])
  final List<InvestorBankAccount> data;

  const BankAccountListResponse({required this.data});

  factory BankAccountListResponse.fromJson(Map<String, dynamic> json) =>
      _$BankAccountListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$BankAccountListResponseToJson(this);
}

@JsonSerializable()
class BankAccountResponse {
  final InvestorBankAccount data;

  const BankAccountResponse({required this.data});

  factory BankAccountResponse.fromJson(Map<String, dynamic> json) =>
      _$BankAccountResponseFromJson(json);
  Map<String, dynamic> toJson() => _$BankAccountResponseToJson(this);
}

@JsonSerializable()
class AddBankAccountBody {
  final String bankCode;
  final String bankName;
  final String accountNumber;

  const AddBankAccountBody({
    required this.bankCode,
    required this.bankName,
    required this.accountNumber,
  });

  factory AddBankAccountBody.fromJson(Map<String, dynamic> json) =>
      _$AddBankAccountBodyFromJson(json);
  Map<String, dynamic> toJson() => _$AddBankAccountBodyToJson(this);
}

@JsonSerializable()
class KycResponse {
  final InvestorKyc data;

  const KycResponse({required this.data});

  factory KycResponse.fromJson(Map<String, dynamic> json) =>
      _$KycResponseFromJson(json);
  Map<String, dynamic> toJson() => _$KycResponseToJson(this);
}

@JsonSerializable()
class BvnBody {
  final String bvn;

  const BvnBody({required this.bvn});

  factory BvnBody.fromJson(Map<String, dynamic> json) => _$BvnBodyFromJson(json);
  Map<String, dynamic> toJson() => _$BvnBodyToJson(this);
}

@JsonSerializable()
class InvestorSettings {
  @JsonKey(defaultValue: false)
  final bool biometricLogin;
  @JsonKey(defaultValue: false)
  final bool twoFactorAuth;
  @JsonKey(defaultValue: true)
  final bool payoutAlerts;
  @JsonKey(defaultValue: true)
  final bool investmentUpdates;
  @JsonKey(defaultValue: false)
  final bool promotions;
  @JsonKey(defaultValue: true)
  final bool emailStatements;
  @JsonKey(defaultValue: 'NGN')
  final String currency;
  @JsonKey(defaultValue: 'English')
  final String language;
  @JsonKey(defaultValue: 1)
  final int appLockTimeoutMin;

  const InvestorSettings({
    required this.biometricLogin,
    required this.twoFactorAuth,
    required this.payoutAlerts,
    required this.investmentUpdates,
    required this.promotions,
    required this.emailStatements,
    required this.currency,
    required this.language,
    required this.appLockTimeoutMin,
  });

  InvestorSettings copyWith({
    bool? biometricLogin,
    bool? twoFactorAuth,
    bool? payoutAlerts,
    bool? investmentUpdates,
    bool? promotions,
    bool? emailStatements,
    String? currency,
    String? language,
    int? appLockTimeoutMin,
  }) {
    return InvestorSettings(
      biometricLogin: biometricLogin ?? this.biometricLogin,
      twoFactorAuth: twoFactorAuth ?? this.twoFactorAuth,
      payoutAlerts: payoutAlerts ?? this.payoutAlerts,
      investmentUpdates: investmentUpdates ?? this.investmentUpdates,
      promotions: promotions ?? this.promotions,
      emailStatements: emailStatements ?? this.emailStatements,
      currency: currency ?? this.currency,
      language: language ?? this.language,
      appLockTimeoutMin: appLockTimeoutMin ?? this.appLockTimeoutMin,
    );
  }

  factory InvestorSettings.fromJson(Map<String, dynamic> json) =>
      _$InvestorSettingsFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorSettingsToJson(this);
}

@JsonSerializable()
class SettingsResponse {
  final InvestorSettings data;

  const SettingsResponse({required this.data});

  factory SettingsResponse.fromJson(Map<String, dynamic> json) =>
      _$SettingsResponseFromJson(json);
  Map<String, dynamic> toJson() => _$SettingsResponseToJson(this);
}

@JsonSerializable()
class InvestorNotification {
  final String id;
  final String title;
  final String body;
  final String? category;
  @JsonKey(defaultValue: false)
  final bool read;
  final String createdAt;

  const InvestorNotification({
    required this.id,
    required this.title,
    required this.body,
    this.category,
    required this.read,
    required this.createdAt,
  });

  factory InvestorNotification.fromJson(Map<String, dynamic> json) =>
      _$InvestorNotificationFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorNotificationToJson(this);
}

@JsonSerializable()
class NotificationListResponse {
  @JsonKey(defaultValue: [])
  final List<InvestorNotification> data;
  @JsonKey(defaultValue: 0)
  final int unread;
  final Pagination? meta;

  const NotificationListResponse({
    required this.data,
    required this.unread,
    this.meta,
  });

  factory NotificationListResponse.fromJson(Map<String, dynamic> json) =>
      _$NotificationListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationListResponseToJson(this);
}

@JsonSerializable()
class Faq {
  final String question;
  final String answer;

  const Faq({required this.question, required this.answer});

  factory Faq.fromJson(Map<String, dynamic> json) => _$FaqFromJson(json);
  Map<String, dynamic> toJson() => _$FaqToJson(this);
}

@JsonSerializable()
class FaqListResponse {
  @JsonKey(defaultValue: [])
  final List<Faq> data;

  const FaqListResponse({required this.data});

  factory FaqListResponse.fromJson(Map<String, dynamic> json) =>
      _$FaqListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$FaqListResponseToJson(this);
}
