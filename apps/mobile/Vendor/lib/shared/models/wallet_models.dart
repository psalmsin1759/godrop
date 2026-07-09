import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'wallet_models.g.dart';

/// Wallet endpoints speak Naira (already converted server-side).
@JsonSerializable()
class VendorWalletBalance {
  @JsonKey(defaultValue: 0)
  final double balance;

  const VendorWalletBalance({required this.balance});

  factory VendorWalletBalance.fromJson(Map<String, dynamic> json) =>
      _$VendorWalletBalanceFromJson(json);
  Map<String, dynamic> toJson() => _$VendorWalletBalanceToJson(this);
}

@JsonSerializable()
class VendorWalletTx {
  final String id;
  final String type; // CREDIT | WITHDRAWAL
  @JsonKey(defaultValue: 0)
  final double amount;
  final String? reference;
  final String? description;
  final String createdAt;

  const VendorWalletTx({
    required this.id,
    required this.type,
    required this.amount,
    this.reference,
    this.description,
    required this.createdAt,
  });

  bool get isCredit => type == 'CREDIT';

  factory VendorWalletTx.fromJson(Map<String, dynamic> json) =>
      _$VendorWalletTxFromJson(json);
  Map<String, dynamic> toJson() => _$VendorWalletTxToJson(this);
}

@JsonSerializable()
class WalletTxListResponse {
  final List<VendorWalletTx> data;
  final Pagination meta;

  const WalletTxListResponse({required this.data, required this.meta});

  factory WalletTxListResponse.fromJson(Map<String, dynamic> json) =>
      _$WalletTxListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$WalletTxListResponseToJson(this);
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
class ResolveAccountBody {
  final String accountNumber;
  final String bankCode;

  const ResolveAccountBody({
    required this.accountNumber,
    required this.bankCode,
  });

  factory ResolveAccountBody.fromJson(Map<String, dynamic> json) =>
      _$ResolveAccountBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ResolveAccountBodyToJson(this);
}

@JsonSerializable()
class ResolvedAccount {
  final String accountName;
  final String accountNumber;

  const ResolvedAccount({
    required this.accountName,
    required this.accountNumber,
  });

  factory ResolvedAccount.fromJson(Map<String, dynamic> json) =>
      _$ResolvedAccountFromJson(json);
  Map<String, dynamic> toJson() => _$ResolvedAccountToJson(this);
}

@JsonSerializable()
class BankAccount {
  final String id;
  final String bankName;
  final String bankCode;
  final String accountNumber;
  final String accountName;

  const BankAccount({
    required this.id,
    required this.bankName,
    required this.bankCode,
    required this.accountNumber,
    required this.accountName,
  });

  factory BankAccount.fromJson(Map<String, dynamic> json) =>
      _$BankAccountFromJson(json);
  Map<String, dynamic> toJson() => _$BankAccountToJson(this);
}

@JsonSerializable()
class BankAccountResponse {
  final BankAccount? account;

  const BankAccountResponse({this.account});

  factory BankAccountResponse.fromJson(Map<String, dynamic> json) =>
      _$BankAccountResponseFromJson(json);
  Map<String, dynamic> toJson() => _$BankAccountResponseToJson(this);
}

@JsonSerializable()
class SaveBankAccountBody {
  final String bankName;
  final String bankCode;
  final String accountNumber;
  final String accountName;

  const SaveBankAccountBody({
    required this.bankName,
    required this.bankCode,
    required this.accountNumber,
    required this.accountName,
  });

  factory SaveBankAccountBody.fromJson(Map<String, dynamic> json) =>
      _$SaveBankAccountBodyFromJson(json);
  Map<String, dynamic> toJson() => _$SaveBankAccountBodyToJson(this);
}

/// Withdrawal amount is in Naira (minimum ₦100).
@JsonSerializable()
class WithdrawBody {
  final double amount;

  const WithdrawBody({required this.amount});

  factory WithdrawBody.fromJson(Map<String, dynamic> json) =>
      _$WithdrawBodyFromJson(json);
  Map<String, dynamic> toJson() => _$WithdrawBodyToJson(this);
}

@JsonSerializable()
class WithdrawResponse {
  final String? message;
  final String? reference;

  const WithdrawResponse({this.message, this.reference});

  factory WithdrawResponse.fromJson(Map<String, dynamic> json) =>
      _$WithdrawResponseFromJson(json);
  Map<String, dynamic> toJson() => _$WithdrawResponseToJson(this);
}
