import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'wallet_models.g.dart';

@JsonSerializable()
class WalletBalance {
  final int balanceKobo;

  const WalletBalance({required this.balanceKobo});

  factory WalletBalance.fromJson(Map<String, dynamic> json) =>
      _$WalletBalanceFromJson(json);
  Map<String, dynamic> toJson() => _$WalletBalanceToJson(this);
}

@JsonSerializable()
class WalletTx {
  final String id;
  final String type;
  final int amountKobo;
  final String description;
  final String status;
  final String createdAt;

  const WalletTx({
    required this.id,
    required this.type,
    required this.amountKobo,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  factory WalletTx.fromJson(Map<String, dynamic> json) =>
      _$WalletTxFromJson(json);
  Map<String, dynamic> toJson() => _$WalletTxToJson(this);
}

@JsonSerializable()
class WalletTxListResponse {
  final List<WalletTx> data;
  final Pagination meta;

  const WalletTxListResponse({required this.data, required this.meta});

  factory WalletTxListResponse.fromJson(Map<String, dynamic> json) =>
      _$WalletTxListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$WalletTxListResponseToJson(this);
}

@JsonSerializable()
class TopUpInitBody {
  final int amountKobo;

  const TopUpInitBody({required this.amountKobo});

  factory TopUpInitBody.fromJson(Map<String, dynamic> json) =>
      _$TopUpInitBodyFromJson(json);
  Map<String, dynamic> toJson() => _$TopUpInitBodyToJson(this);
}

@JsonSerializable()
class TopUpInitResponse {
  final String paystackAuthUrl;
  final String reference;

  const TopUpInitResponse({
    required this.paystackAuthUrl,
    required this.reference,
  });

  factory TopUpInitResponse.fromJson(Map<String, dynamic> json) =>
      _$TopUpInitResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TopUpInitResponseToJson(this);
}

@JsonSerializable()
class TopUpVerifyBody {
  final String reference;

  const TopUpVerifyBody({required this.reference});

  factory TopUpVerifyBody.fromJson(Map<String, dynamic> json) =>
      _$TopUpVerifyBodyFromJson(json);
  Map<String, dynamic> toJson() => _$TopUpVerifyBodyToJson(this);
}

@JsonSerializable()
class TopUpVerifyResponse {
  final int balanceKobo;
  final WalletTx transaction;

  const TopUpVerifyResponse({
    required this.balanceKobo,
    required this.transaction,
  });

  factory TopUpVerifyResponse.fromJson(Map<String, dynamic> json) =>
      _$TopUpVerifyResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TopUpVerifyResponseToJson(this);
}

// ── Payment models ────────────────────────────────────────────────────────────

@JsonSerializable(includeIfNull: false)
class PaymentInitBody {
  final String orderId;
  final String method;

  const PaymentInitBody({required this.orderId, required this.method});

  factory PaymentInitBody.fromJson(Map<String, dynamic> json) =>
      _$PaymentInitBodyFromJson(json);
  Map<String, dynamic> toJson() => _$PaymentInitBodyToJson(this);
}

@JsonSerializable(includeIfNull: false)
class PaymentInitResponse {
  final String? paystackAuthUrl;
  final String reference;
  final String method;

  const PaymentInitResponse({
    this.paystackAuthUrl,
    required this.reference,
    required this.method,
  });

  factory PaymentInitResponse.fromJson(Map<String, dynamic> json) =>
      _$PaymentInitResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PaymentInitResponseToJson(this);
}

@JsonSerializable()
class PaymentVerifyBody {
  final String reference;

  const PaymentVerifyBody({required this.reference});

  factory PaymentVerifyBody.fromJson(Map<String, dynamic> json) =>
      _$PaymentVerifyBodyFromJson(json);
  Map<String, dynamic> toJson() => _$PaymentVerifyBodyToJson(this);
}

@JsonSerializable()
class PaymentVerifyResponse {
  final String status;
  final Map<String, dynamic> order;

  const PaymentVerifyResponse({required this.status, required this.order});

  factory PaymentVerifyResponse.fromJson(Map<String, dynamic> json) =>
      _$PaymentVerifyResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PaymentVerifyResponseToJson(this);
}
