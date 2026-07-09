import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'wallet_models.g.dart';

/// All investor money is integer Kobo.
@JsonSerializable()
class InvestorWallets {
  @JsonKey(defaultValue: 0)
  final int mainBalanceKobo;
  @JsonKey(defaultValue: 0)
  final int payoutBalanceKobo;
  @JsonKey(defaultValue: 0)
  final int safeBalanceKobo;

  const InvestorWallets({
    required this.mainBalanceKobo,
    required this.payoutBalanceKobo,
    required this.safeBalanceKobo,
  });

  factory InvestorWallets.fromJson(Map<String, dynamic> json) =>
      _$InvestorWalletsFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorWalletsToJson(this);
}

@JsonSerializable()
class WalletResponse {
  final InvestorWallets data;

  const WalletResponse({required this.data});

  factory WalletResponse.fromJson(Map<String, dynamic> json) =>
      _$WalletResponseFromJson(json);
  Map<String, dynamic> toJson() => _$WalletResponseToJson(this);
}

@JsonSerializable()
class InvestorTx {
  final String id;
  final String type;
  @JsonKey(defaultValue: 'MAIN')
  final String wallet;
  @JsonKey(defaultValue: 0)
  final int amountKobo;
  final String? reference;
  final String? description;
  @JsonKey(defaultValue: 'COMPLETED')
  final String status;
  final String createdAt;

  const InvestorTx({
    required this.id,
    required this.type,
    required this.wallet,
    required this.amountKobo,
    this.reference,
    this.description,
    required this.status,
    required this.createdAt,
  });

  /// Money-in types show green with a leading +.
  bool get isCredit => const {
        'TOPUP', 'PAYOUT', 'SAFE_INTEREST', 'REFERRAL_BONUS', 'SAFE_UNLOCK'
      }.contains(type);

  factory InvestorTx.fromJson(Map<String, dynamic> json) =>
      _$InvestorTxFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorTxToJson(this);
}

@JsonSerializable()
class TxListResponse {
  @JsonKey(defaultValue: [])
  final List<InvestorTx> data;
  final Pagination? meta;

  const TxListResponse({required this.data, this.meta});

  factory TxListResponse.fromJson(Map<String, dynamic> json) =>
      _$TxListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TxListResponseToJson(this);
}

@JsonSerializable()
class FundBody {
  final int amountKobo;
  final String method; // CARD | TRANSFER | USSD

  const FundBody({required this.amountKobo, required this.method});

  factory FundBody.fromJson(Map<String, dynamic> json) =>
      _$FundBodyFromJson(json);
  Map<String, dynamic> toJson() => _$FundBodyToJson(this);
}

@JsonSerializable()
class FundResponse {
  final String reference;
  final String? authorizationUrl;

  const FundResponse({required this.reference, this.authorizationUrl});

  factory FundResponse.fromJson(Map<String, dynamic> json) =>
      _$FundResponseFromJson(json);
  Map<String, dynamic> toJson() => _$FundResponseToJson(this);
}

@JsonSerializable()
class WithdrawBody {
  final int amountKobo;
  final String wallet; // MAIN | PAYOUT
  final String bankAccountId;

  const WithdrawBody({
    required this.amountKobo,
    required this.wallet,
    required this.bankAccountId,
  });

  factory WithdrawBody.fromJson(Map<String, dynamic> json) =>
      _$WithdrawBodyFromJson(json);
  Map<String, dynamic> toJson() => _$WithdrawBodyToJson(this);
}

@JsonSerializable()
class TxEnvelope {
  final InvestorTx? data;
  final InvestorWallets? wallets;

  const TxEnvelope({this.data, this.wallets});

  factory TxEnvelope.fromJson(Map<String, dynamic> json) =>
      _$TxEnvelopeFromJson(json);
  Map<String, dynamic> toJson() => _$TxEnvelopeToJson(this);
}

@JsonSerializable()
class FlowSafeVault {
  final String id;
  final String name;
  final String kind; // FLEXIBLE | LOCKED
  @JsonKey(defaultValue: 0)
  final int principalKobo;
  @JsonKey(defaultValue: 0)
  final int interestRateBps;
  @JsonKey(defaultValue: 0)
  final int interestEarnedKobo;
  final int? lockDays;
  final String? unlocksAt;
  @JsonKey(defaultValue: 'ACTIVE')
  final String status;
  @JsonKey(defaultValue: 100)
  final int progressPct;

  const FlowSafeVault({
    required this.id,
    required this.name,
    required this.kind,
    required this.principalKobo,
    required this.interestRateBps,
    required this.interestEarnedKobo,
    this.lockDays,
    this.unlocksAt,
    required this.status,
    required this.progressPct,
  });

  bool get isFlexible => kind == 'FLEXIBLE';
  int get balanceKobo => principalKobo + interestEarnedKobo;

  factory FlowSafeVault.fromJson(Map<String, dynamic> json) =>
      _$FlowSafeVaultFromJson(json);
  Map<String, dynamic> toJson() => _$FlowSafeVaultToJson(this);
}

@JsonSerializable()
class SafeSummary {
  @JsonKey(defaultValue: 0)
  final int totalKobo;
  @JsonKey(defaultValue: 0)
  final int interestThisQuarterKobo;
  @JsonKey(defaultValue: [])
  final List<FlowSafeVault> vaults;

  const SafeSummary({
    required this.totalKobo,
    required this.interestThisQuarterKobo,
    required this.vaults,
  });

  factory SafeSummary.fromJson(Map<String, dynamic> json) =>
      _$SafeSummaryFromJson(json);
  Map<String, dynamic> toJson() => _$SafeSummaryToJson(this);
}

@JsonSerializable()
class SafeResponse {
  final SafeSummary data;

  const SafeResponse({required this.data});

  factory SafeResponse.fromJson(Map<String, dynamic> json) =>
      _$SafeResponseFromJson(json);
  Map<String, dynamic> toJson() => _$SafeResponseToJson(this);
}

@JsonSerializable()
class CreateVaultBody {
  final String name;
  final int amountKobo;
  final int? lockDays;

  const CreateVaultBody({
    required this.name,
    required this.amountKobo,
    this.lockDays,
  });

  factory CreateVaultBody.fromJson(Map<String, dynamic> json) =>
      _$CreateVaultBodyFromJson(json);
  Map<String, dynamic> toJson() => _$CreateVaultBodyToJson(this);
}

@JsonSerializable()
class VaultResponse {
  final FlowSafeVault data;

  const VaultResponse({required this.data});

  factory VaultResponse.fromJson(Map<String, dynamic> json) =>
      _$VaultResponseFromJson(json);
  Map<String, dynamic> toJson() => _$VaultResponseToJson(this);
}

@JsonSerializable()
class VaultWithdrawBody {
  final int amountKobo;

  const VaultWithdrawBody({required this.amountKobo});

  factory VaultWithdrawBody.fromJson(Map<String, dynamic> json) =>
      _$VaultWithdrawBodyFromJson(json);
  Map<String, dynamic> toJson() => _$VaultWithdrawBodyToJson(this);
}

@JsonSerializable()
class WalletsEnvelope {
  final InvestorWallets? wallets;

  const WalletsEnvelope({this.wallets});

  factory WalletsEnvelope.fromJson(Map<String, dynamic> json) =>
      _$WalletsEnvelopeFromJson(json);
  Map<String, dynamic> toJson() => _$WalletsEnvelopeToJson(this);
}
