// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VendorWalletBalance _$VendorWalletBalanceFromJson(Map<String, dynamic> json) =>
    VendorWalletBalance(
      balance: (json['balance'] as num?)?.toDouble() ?? 0,
    );

Map<String, dynamic> _$VendorWalletBalanceToJson(
        VendorWalletBalance instance) =>
    <String, dynamic>{
      'balance': instance.balance,
    };

VendorWalletTx _$VendorWalletTxFromJson(Map<String, dynamic> json) =>
    VendorWalletTx(
      id: json['id'] as String,
      type: json['type'] as String,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      reference: json['reference'] as String?,
      description: json['description'] as String?,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$VendorWalletTxToJson(VendorWalletTx instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'amount': instance.amount,
      'reference': instance.reference,
      'description': instance.description,
      'createdAt': instance.createdAt,
    };

WalletTxListResponse _$WalletTxListResponseFromJson(
        Map<String, dynamic> json) =>
    WalletTxListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => VendorWalletTx.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$WalletTxListResponseToJson(
        WalletTxListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
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

ResolveAccountBody _$ResolveAccountBodyFromJson(Map<String, dynamic> json) =>
    ResolveAccountBody(
      accountNumber: json['accountNumber'] as String,
      bankCode: json['bankCode'] as String,
    );

Map<String, dynamic> _$ResolveAccountBodyToJson(ResolveAccountBody instance) =>
    <String, dynamic>{
      'accountNumber': instance.accountNumber,
      'bankCode': instance.bankCode,
    };

ResolvedAccount _$ResolvedAccountFromJson(Map<String, dynamic> json) =>
    ResolvedAccount(
      accountName: json['accountName'] as String,
      accountNumber: json['accountNumber'] as String,
    );

Map<String, dynamic> _$ResolvedAccountToJson(ResolvedAccount instance) =>
    <String, dynamic>{
      'accountName': instance.accountName,
      'accountNumber': instance.accountNumber,
    };

BankAccount _$BankAccountFromJson(Map<String, dynamic> json) => BankAccount(
      id: json['id'] as String,
      bankName: json['bankName'] as String,
      bankCode: json['bankCode'] as String,
      accountNumber: json['accountNumber'] as String,
      accountName: json['accountName'] as String,
    );

Map<String, dynamic> _$BankAccountToJson(BankAccount instance) =>
    <String, dynamic>{
      'id': instance.id,
      'bankName': instance.bankName,
      'bankCode': instance.bankCode,
      'accountNumber': instance.accountNumber,
      'accountName': instance.accountName,
    };

BankAccountResponse _$BankAccountResponseFromJson(Map<String, dynamic> json) =>
    BankAccountResponse(
      account: json['account'] == null
          ? null
          : BankAccount.fromJson(json['account'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$BankAccountResponseToJson(
        BankAccountResponse instance) =>
    <String, dynamic>{
      'account': instance.account,
    };

SaveBankAccountBody _$SaveBankAccountBodyFromJson(Map<String, dynamic> json) =>
    SaveBankAccountBody(
      bankName: json['bankName'] as String,
      bankCode: json['bankCode'] as String,
      accountNumber: json['accountNumber'] as String,
      accountName: json['accountName'] as String,
    );

Map<String, dynamic> _$SaveBankAccountBodyToJson(
        SaveBankAccountBody instance) =>
    <String, dynamic>{
      'bankName': instance.bankName,
      'bankCode': instance.bankCode,
      'accountNumber': instance.accountNumber,
      'accountName': instance.accountName,
    };

WithdrawBody _$WithdrawBodyFromJson(Map<String, dynamic> json) => WithdrawBody(
      amount: (json['amount'] as num).toDouble(),
    );

Map<String, dynamic> _$WithdrawBodyToJson(WithdrawBody instance) =>
    <String, dynamic>{
      'amount': instance.amount,
    };

WithdrawResponse _$WithdrawResponseFromJson(Map<String, dynamic> json) =>
    WithdrawResponse(
      message: json['message'] as String?,
      reference: json['reference'] as String?,
    );

Map<String, dynamic> _$WithdrawResponseToJson(WithdrawResponse instance) =>
    <String, dynamic>{
      'message': instance.message,
      'reference': instance.reference,
    };
