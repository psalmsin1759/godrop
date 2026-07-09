// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InvestorResponse _$InvestorResponseFromJson(Map<String, dynamic> json) =>
    InvestorResponse(
      data: Investor.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$InvestorResponseToJson(InvestorResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

UpdateProfileBody _$UpdateProfileBodyFromJson(Map<String, dynamic> json) =>
    UpdateProfileBody(
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      username: json['username'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      address: json['address'] as String?,
    );

Map<String, dynamic> _$UpdateProfileBodyToJson(UpdateProfileBody instance) =>
    <String, dynamic>{
      if (instance.firstName case final value?) 'firstName': value,
      if (instance.lastName case final value?) 'lastName': value,
      if (instance.username case final value?) 'username': value,
      if (instance.avatarUrl case final value?) 'avatarUrl': value,
      if (instance.dateOfBirth case final value?) 'dateOfBirth': value,
      if (instance.address case final value?) 'address': value,
    };

Bank _$BankFromJson(Map<String, dynamic> json) => Bank(
      name: json['name'] as String,
      code: json['code'] as String,
      slug: json['slug'] as String?,
    );

Map<String, dynamic> _$BankToJson(Bank instance) => <String, dynamic>{
      'name': instance.name,
      'code': instance.code,
      'slug': instance.slug,
    };

BankListResponse _$BankListResponseFromJson(Map<String, dynamic> json) =>
    BankListResponse(
      banks: (json['banks'] as List<dynamic>?)
              ?.map((e) => Bank.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$BankListResponseToJson(BankListResponse instance) =>
    <String, dynamic>{
      'banks': instance.banks,
    };

InvestorBankAccount _$InvestorBankAccountFromJson(Map<String, dynamic> json) =>
    InvestorBankAccount(
      id: json['id'] as String,
      bankName: json['bankName'] as String,
      bankCode: json['bankCode'] as String,
      accountNumber: json['accountNumber'] as String,
      accountName: json['accountName'] as String,
      isPrimary: json['isPrimary'] as bool? ?? false,
    );

Map<String, dynamic> _$InvestorBankAccountToJson(
        InvestorBankAccount instance) =>
    <String, dynamic>{
      'id': instance.id,
      'bankName': instance.bankName,
      'bankCode': instance.bankCode,
      'accountNumber': instance.accountNumber,
      'accountName': instance.accountName,
      'isPrimary': instance.isPrimary,
    };

BankAccountListResponse _$BankAccountListResponseFromJson(
        Map<String, dynamic> json) =>
    BankAccountListResponse(
      data: (json['data'] as List<dynamic>?)
              ?.map((e) =>
                  InvestorBankAccount.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$BankAccountListResponseToJson(
        BankAccountListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

BankAccountResponse _$BankAccountResponseFromJson(Map<String, dynamic> json) =>
    BankAccountResponse(
      data: InvestorBankAccount.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$BankAccountResponseToJson(
        BankAccountResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

AddBankAccountBody _$AddBankAccountBodyFromJson(Map<String, dynamic> json) =>
    AddBankAccountBody(
      bankCode: json['bankCode'] as String,
      bankName: json['bankName'] as String,
      accountNumber: json['accountNumber'] as String,
    );

Map<String, dynamic> _$AddBankAccountBodyToJson(AddBankAccountBody instance) =>
    <String, dynamic>{
      'bankCode': instance.bankCode,
      'bankName': instance.bankName,
      'accountNumber': instance.accountNumber,
    };

KycResponse _$KycResponseFromJson(Map<String, dynamic> json) => KycResponse(
      data: InvestorKyc.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$KycResponseToJson(KycResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

BvnBody _$BvnBodyFromJson(Map<String, dynamic> json) => BvnBody(
      bvn: json['bvn'] as String,
    );

Map<String, dynamic> _$BvnBodyToJson(BvnBody instance) => <String, dynamic>{
      'bvn': instance.bvn,
    };

InvestorSettings _$InvestorSettingsFromJson(Map<String, dynamic> json) =>
    InvestorSettings(
      biometricLogin: json['biometricLogin'] as bool? ?? false,
      twoFactorAuth: json['twoFactorAuth'] as bool? ?? false,
      payoutAlerts: json['payoutAlerts'] as bool? ?? true,
      investmentUpdates: json['investmentUpdates'] as bool? ?? true,
      promotions: json['promotions'] as bool? ?? false,
      emailStatements: json['emailStatements'] as bool? ?? true,
      currency: json['currency'] as String? ?? 'NGN',
      language: json['language'] as String? ?? 'English',
      appLockTimeoutMin: (json['appLockTimeoutMin'] as num?)?.toInt() ?? 1,
    );

Map<String, dynamic> _$InvestorSettingsToJson(InvestorSettings instance) =>
    <String, dynamic>{
      'biometricLogin': instance.biometricLogin,
      'twoFactorAuth': instance.twoFactorAuth,
      'payoutAlerts': instance.payoutAlerts,
      'investmentUpdates': instance.investmentUpdates,
      'promotions': instance.promotions,
      'emailStatements': instance.emailStatements,
      'currency': instance.currency,
      'language': instance.language,
      'appLockTimeoutMin': instance.appLockTimeoutMin,
    };

SettingsResponse _$SettingsResponseFromJson(Map<String, dynamic> json) =>
    SettingsResponse(
      data: InvestorSettings.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$SettingsResponseToJson(SettingsResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

InvestorNotification _$InvestorNotificationFromJson(
        Map<String, dynamic> json) =>
    InvestorNotification(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      category: json['category'] as String?,
      read: json['read'] as bool? ?? false,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$InvestorNotificationToJson(
        InvestorNotification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'body': instance.body,
      'category': instance.category,
      'read': instance.read,
      'createdAt': instance.createdAt,
    };

NotificationListResponse _$NotificationListResponseFromJson(
        Map<String, dynamic> json) =>
    NotificationListResponse(
      data: (json['data'] as List<dynamic>?)
              ?.map((e) =>
                  InvestorNotification.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      unread: (json['unread'] as num?)?.toInt() ?? 0,
      meta: json['meta'] == null
          ? null
          : Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$NotificationListResponseToJson(
        NotificationListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'unread': instance.unread,
      'meta': instance.meta,
    };

Faq _$FaqFromJson(Map<String, dynamic> json) => Faq(
      question: json['question'] as String,
      answer: json['answer'] as String,
    );

Map<String, dynamic> _$FaqToJson(Faq instance) => <String, dynamic>{
      'question': instance.question,
      'answer': instance.answer,
    };

FaqListResponse _$FaqListResponseFromJson(Map<String, dynamic> json) =>
    FaqListResponse(
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => Faq.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$FaqListResponseToJson(FaqListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };
