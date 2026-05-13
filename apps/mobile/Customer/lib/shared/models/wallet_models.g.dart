// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wallet_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WalletBalance _$WalletBalanceFromJson(Map<String, dynamic> json) =>
    WalletBalance(
      balanceKobo: (json['balanceKobo'] as num).toInt(),
    );

Map<String, dynamic> _$WalletBalanceToJson(WalletBalance instance) =>
    <String, dynamic>{
      'balanceKobo': instance.balanceKobo,
    };

WalletTx _$WalletTxFromJson(Map<String, dynamic> json) => WalletTx(
      id: json['id'] as String,
      type: json['type'] as String,
      amountKobo: (json['amountKobo'] as num).toInt(),
      description: json['description'] as String,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$WalletTxToJson(WalletTx instance) => <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'amountKobo': instance.amountKobo,
      'description': instance.description,
      'status': instance.status,
      'createdAt': instance.createdAt,
    };

WalletTxListResponse _$WalletTxListResponseFromJson(
        Map<String, dynamic> json) =>
    WalletTxListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => WalletTx.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$WalletTxListResponseToJson(
        WalletTxListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
    };

TopUpInitBody _$TopUpInitBodyFromJson(Map<String, dynamic> json) =>
    TopUpInitBody(
      amountKobo: (json['amountKobo'] as num).toInt(),
    );

Map<String, dynamic> _$TopUpInitBodyToJson(TopUpInitBody instance) =>
    <String, dynamic>{
      'amountKobo': instance.amountKobo,
    };

TopUpInitResponse _$TopUpInitResponseFromJson(Map<String, dynamic> json) =>
    TopUpInitResponse(
      paystackAuthUrl: json['paystackAuthUrl'] as String,
      reference: json['reference'] as String,
    );

Map<String, dynamic> _$TopUpInitResponseToJson(TopUpInitResponse instance) =>
    <String, dynamic>{
      'paystackAuthUrl': instance.paystackAuthUrl,
      'reference': instance.reference,
    };

TopUpVerifyBody _$TopUpVerifyBodyFromJson(Map<String, dynamic> json) =>
    TopUpVerifyBody(
      reference: json['reference'] as String,
    );

Map<String, dynamic> _$TopUpVerifyBodyToJson(TopUpVerifyBody instance) =>
    <String, dynamic>{
      'reference': instance.reference,
    };

TopUpVerifyResponse _$TopUpVerifyResponseFromJson(Map<String, dynamic> json) =>
    TopUpVerifyResponse(
      balanceKobo: (json['balanceKobo'] as num).toInt(),
      transaction:
          WalletTx.fromJson(json['transaction'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$TopUpVerifyResponseToJson(
        TopUpVerifyResponse instance) =>
    <String, dynamic>{
      'balanceKobo': instance.balanceKobo,
      'transaction': instance.transaction,
    };

PaymentInitBody _$PaymentInitBodyFromJson(Map<String, dynamic> json) =>
    PaymentInitBody(
      orderId: json['orderId'] as String,
      method: json['method'] as String,
    );

Map<String, dynamic> _$PaymentInitBodyToJson(PaymentInitBody instance) =>
    <String, dynamic>{
      'orderId': instance.orderId,
      'method': instance.method,
    };

PaymentInitResponse _$PaymentInitResponseFromJson(Map<String, dynamic> json) =>
    PaymentInitResponse(
      paystackAuthUrl: json['paystackAuthUrl'] as String?,
      reference: json['reference'] as String,
      method: json['method'] as String,
    );

Map<String, dynamic> _$PaymentInitResponseToJson(
        PaymentInitResponse instance) =>
    <String, dynamic>{
      if (instance.paystackAuthUrl case final value?) 'paystackAuthUrl': value,
      'reference': instance.reference,
      'method': instance.method,
    };

PaymentVerifyBody _$PaymentVerifyBodyFromJson(Map<String, dynamic> json) =>
    PaymentVerifyBody(
      reference: json['reference'] as String,
    );

Map<String, dynamic> _$PaymentVerifyBodyToJson(PaymentVerifyBody instance) =>
    <String, dynamic>{
      'reference': instance.reference,
    };

PaymentVerifyResponse _$PaymentVerifyResponseFromJson(
        Map<String, dynamic> json) =>
    PaymentVerifyResponse(
      status: json['status'] as String,
      order: json['order'] as Map<String, dynamic>,
    );

Map<String, dynamic> _$PaymentVerifyResponseToJson(
        PaymentVerifyResponse instance) =>
    <String, dynamic>{
      'status': instance.status,
      'order': instance.order,
    };
