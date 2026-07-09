// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InvestorWallets _$InvestorWalletsFromJson(Map<String, dynamic> json) =>
    InvestorWallets(
      mainBalanceKobo: (json['mainBalanceKobo'] as num?)?.toInt() ?? 0,
      payoutBalanceKobo: (json['payoutBalanceKobo'] as num?)?.toInt() ?? 0,
      safeBalanceKobo: (json['safeBalanceKobo'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$InvestorWalletsToJson(InvestorWallets instance) =>
    <String, dynamic>{
      'mainBalanceKobo': instance.mainBalanceKobo,
      'payoutBalanceKobo': instance.payoutBalanceKobo,
      'safeBalanceKobo': instance.safeBalanceKobo,
    };

WalletResponse _$WalletResponseFromJson(Map<String, dynamic> json) =>
    WalletResponse(
      data: InvestorWallets.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$WalletResponseToJson(WalletResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

InvestorTx _$InvestorTxFromJson(Map<String, dynamic> json) => InvestorTx(
      id: json['id'] as String,
      type: json['type'] as String,
      wallet: json['wallet'] as String? ?? 'MAIN',
      amountKobo: (json['amountKobo'] as num?)?.toInt() ?? 0,
      reference: json['reference'] as String?,
      description: json['description'] as String?,
      status: json['status'] as String? ?? 'COMPLETED',
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$InvestorTxToJson(InvestorTx instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'wallet': instance.wallet,
      'amountKobo': instance.amountKobo,
      'reference': instance.reference,
      'description': instance.description,
      'status': instance.status,
      'createdAt': instance.createdAt,
    };

TxListResponse _$TxListResponseFromJson(Map<String, dynamic> json) =>
    TxListResponse(
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => InvestorTx.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      meta: json['meta'] == null
          ? null
          : Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$TxListResponseToJson(TxListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
    };

FundBody _$FundBodyFromJson(Map<String, dynamic> json) => FundBody(
      amountKobo: (json['amountKobo'] as num).toInt(),
      method: json['method'] as String,
    );

Map<String, dynamic> _$FundBodyToJson(FundBody instance) => <String, dynamic>{
      'amountKobo': instance.amountKobo,
      'method': instance.method,
    };

FundResponse _$FundResponseFromJson(Map<String, dynamic> json) => FundResponse(
      reference: json['reference'] as String,
      authorizationUrl: json['authorizationUrl'] as String?,
    );

Map<String, dynamic> _$FundResponseToJson(FundResponse instance) =>
    <String, dynamic>{
      'reference': instance.reference,
      'authorizationUrl': instance.authorizationUrl,
    };

WithdrawBody _$WithdrawBodyFromJson(Map<String, dynamic> json) => WithdrawBody(
      amountKobo: (json['amountKobo'] as num).toInt(),
      wallet: json['wallet'] as String,
      bankAccountId: json['bankAccountId'] as String,
    );

Map<String, dynamic> _$WithdrawBodyToJson(WithdrawBody instance) =>
    <String, dynamic>{
      'amountKobo': instance.amountKobo,
      'wallet': instance.wallet,
      'bankAccountId': instance.bankAccountId,
    };

TxEnvelope _$TxEnvelopeFromJson(Map<String, dynamic> json) => TxEnvelope(
      data: json['data'] == null
          ? null
          : InvestorTx.fromJson(json['data'] as Map<String, dynamic>),
      wallets: json['wallets'] == null
          ? null
          : InvestorWallets.fromJson(json['wallets'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$TxEnvelopeToJson(TxEnvelope instance) =>
    <String, dynamic>{
      'data': instance.data,
      'wallets': instance.wallets,
    };

FlowSafeVault _$FlowSafeVaultFromJson(Map<String, dynamic> json) =>
    FlowSafeVault(
      id: json['id'] as String,
      name: json['name'] as String,
      kind: json['kind'] as String,
      principalKobo: (json['principalKobo'] as num?)?.toInt() ?? 0,
      interestRateBps: (json['interestRateBps'] as num?)?.toInt() ?? 0,
      interestEarnedKobo: (json['interestEarnedKobo'] as num?)?.toInt() ?? 0,
      lockDays: (json['lockDays'] as num?)?.toInt(),
      unlocksAt: json['unlocksAt'] as String?,
      status: json['status'] as String? ?? 'ACTIVE',
      progressPct: (json['progressPct'] as num?)?.toInt() ?? 100,
    );

Map<String, dynamic> _$FlowSafeVaultToJson(FlowSafeVault instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'kind': instance.kind,
      'principalKobo': instance.principalKobo,
      'interestRateBps': instance.interestRateBps,
      'interestEarnedKobo': instance.interestEarnedKobo,
      'lockDays': instance.lockDays,
      'unlocksAt': instance.unlocksAt,
      'status': instance.status,
      'progressPct': instance.progressPct,
    };

SafeSummary _$SafeSummaryFromJson(Map<String, dynamic> json) => SafeSummary(
      totalKobo: (json['totalKobo'] as num?)?.toInt() ?? 0,
      interestThisQuarterKobo:
          (json['interestThisQuarterKobo'] as num?)?.toInt() ?? 0,
      vaults: (json['vaults'] as List<dynamic>?)
              ?.map((e) => FlowSafeVault.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$SafeSummaryToJson(SafeSummary instance) =>
    <String, dynamic>{
      'totalKobo': instance.totalKobo,
      'interestThisQuarterKobo': instance.interestThisQuarterKobo,
      'vaults': instance.vaults,
    };

SafeResponse _$SafeResponseFromJson(Map<String, dynamic> json) => SafeResponse(
      data: SafeSummary.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$SafeResponseToJson(SafeResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

CreateVaultBody _$CreateVaultBodyFromJson(Map<String, dynamic> json) =>
    CreateVaultBody(
      name: json['name'] as String,
      amountKobo: (json['amountKobo'] as num).toInt(),
      lockDays: (json['lockDays'] as num?)?.toInt(),
    );

Map<String, dynamic> _$CreateVaultBodyToJson(CreateVaultBody instance) =>
    <String, dynamic>{
      'name': instance.name,
      'amountKobo': instance.amountKobo,
      'lockDays': instance.lockDays,
    };

VaultResponse _$VaultResponseFromJson(Map<String, dynamic> json) =>
    VaultResponse(
      data: FlowSafeVault.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$VaultResponseToJson(VaultResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

VaultWithdrawBody _$VaultWithdrawBodyFromJson(Map<String, dynamic> json) =>
    VaultWithdrawBody(
      amountKobo: (json['amountKobo'] as num).toInt(),
    );

Map<String, dynamic> _$VaultWithdrawBodyToJson(VaultWithdrawBody instance) =>
    <String, dynamic>{
      'amountKobo': instance.amountKobo,
    };

WalletsEnvelope _$WalletsEnvelopeFromJson(Map<String, dynamic> json) =>
    WalletsEnvelope(
      wallets: json['wallets'] == null
          ? null
          : InvestorWallets.fromJson(json['wallets'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$WalletsEnvelopeToJson(WalletsEnvelope instance) =>
    <String, dynamic>{
      'wallets': instance.wallets,
    };
