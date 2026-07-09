import 'package:json_annotation/json_annotation.dart';

part 'invest_models.g.dart';

/// Vehicle asset open for investment. All money in Kobo, rates in bps.
@JsonSerializable()
class InvestmentAsset {
  final String id;
  final String name;
  final String shortCode;
  final String vehicleClass; // KEKE | SHUTTLE | RIDE_CAR | BIKE
  final String? description;
  final String? location;
  final String? imageUrl;
  @JsonKey(defaultValue: 0)
  final int unitPriceKobo;
  @JsonKey(defaultValue: 0)
  final int minInvestKobo;
  @JsonKey(defaultValue: 0)
  final int projectedRoiBps;
  @JsonKey(defaultValue: 0)
  final int tenureMonths;
  @JsonKey(defaultValue: 0)
  final int monthlyPayoutKobo;
  @JsonKey(defaultValue: 0)
  final int targetKobo;
  @JsonKey(defaultValue: 0)
  final int raisedKobo;
  @JsonKey(defaultValue: 0)
  final int fundedPct;
  @JsonKey(defaultValue: 0)
  final int slotsTotal;
  @JsonKey(defaultValue: 0)
  final int slotsLeft;
  @JsonKey(defaultValue: 0)
  final int investorCount;
  @JsonKey(defaultValue: false)
  final bool isHot;
  @JsonKey(defaultValue: 'OPEN')
  final String status;

  const InvestmentAsset({
    required this.id,
    required this.name,
    required this.shortCode,
    required this.vehicleClass,
    this.description,
    this.location,
    this.imageUrl,
    required this.unitPriceKobo,
    required this.minInvestKobo,
    required this.projectedRoiBps,
    required this.tenureMonths,
    required this.monthlyPayoutKobo,
    required this.targetKobo,
    required this.raisedKobo,
    required this.fundedPct,
    required this.slotsTotal,
    required this.slotsLeft,
    required this.investorCount,
    required this.isHot,
    required this.status,
  });

  factory InvestmentAsset.fromJson(Map<String, dynamic> json) =>
      _$InvestmentAssetFromJson(json);
  Map<String, dynamic> toJson() => _$InvestmentAssetToJson(this);
}

@JsonSerializable()
class AssetClassInfo {
  final String vehicleClass;
  final String label;
  @JsonKey(defaultValue: 0)
  final int count;

  const AssetClassInfo({
    required this.vehicleClass,
    required this.label,
    required this.count,
  });

  factory AssetClassInfo.fromJson(Map<String, dynamic> json) =>
      _$AssetClassInfoFromJson(json);
  Map<String, dynamic> toJson() => _$AssetClassInfoToJson(this);
}

@JsonSerializable()
class AssetListResponse {
  @JsonKey(defaultValue: [])
  final List<InvestmentAsset> data;

  const AssetListResponse({required this.data});

  factory AssetListResponse.fromJson(Map<String, dynamic> json) =>
      _$AssetListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AssetListResponseToJson(this);
}

@JsonSerializable()
class AssetResponse {
  final InvestmentAsset data;

  const AssetResponse({required this.data});

  factory AssetResponse.fromJson(Map<String, dynamic> json) =>
      _$AssetResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AssetResponseToJson(this);
}

@JsonSerializable()
class InvestmentPlan {
  final String id;
  final String name;
  @JsonKey(defaultValue: 0)
  final int tenureMonths;
  @JsonKey(defaultValue: 0)
  final int monthlyRateBps;
  @JsonKey(defaultValue: 0)
  final int minAmountKobo;
  final String? note;
  @JsonKey(defaultValue: false)
  final bool isPopular;

  const InvestmentPlan({
    required this.id,
    required this.name,
    required this.tenureMonths,
    required this.monthlyRateBps,
    required this.minAmountKobo,
    this.note,
    required this.isPopular,
  });

  /// Total ROI over the full tenure, in bps (rate × months).
  int get totalRoiBps => monthlyRateBps * tenureMonths;

  factory InvestmentPlan.fromJson(Map<String, dynamic> json) =>
      _$InvestmentPlanFromJson(json);
  Map<String, dynamic> toJson() => _$InvestmentPlanToJson(this);
}

@JsonSerializable()
class PlanListResponse {
  @JsonKey(defaultValue: [])
  final List<InvestmentPlan> data;

  const PlanListResponse({required this.data});

  factory PlanListResponse.fromJson(Map<String, dynamic> json) =>
      _$PlanListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PlanListResponseToJson(this);
}

@JsonSerializable()
class PreviewBody {
  final String assetId;
  final String planId;
  final int amountKobo;

  const PreviewBody({
    required this.assetId,
    required this.planId,
    required this.amountKobo,
  });

  factory PreviewBody.fromJson(Map<String, dynamic> json) =>
      _$PreviewBodyFromJson(json);
  Map<String, dynamic> toJson() => _$PreviewBodyToJson(this);
}

@JsonSerializable()
class InvestmentPreview {
  final InvestmentAsset asset;
  final InvestmentPlan plan;
  @JsonKey(defaultValue: 0)
  final int amountKobo;
  @JsonKey(defaultValue: 0)
  final int minKobo;
  @JsonKey(defaultValue: 0)
  final int remainingKobo;
  @JsonKey(defaultValue: 0)
  final int monthlyPayoutKobo;
  @JsonKey(defaultValue: 0)
  final int totalReturnKobo;
  @JsonKey(defaultValue: 0)
  final int tenureMonths;
  final String? maturesAt;
  final String? firstPayoutAt;

  const InvestmentPreview({
    required this.asset,
    required this.plan,
    required this.amountKobo,
    required this.minKobo,
    required this.remainingKobo,
    required this.monthlyPayoutKobo,
    required this.totalReturnKobo,
    required this.tenureMonths,
    this.maturesAt,
    this.firstPayoutAt,
  });

  factory InvestmentPreview.fromJson(Map<String, dynamic> json) =>
      _$InvestmentPreviewFromJson(json);
  Map<String, dynamic> toJson() => _$InvestmentPreviewToJson(this);
}

@JsonSerializable()
class PreviewResponse {
  final InvestmentPreview data;

  const PreviewResponse({required this.data});

  factory PreviewResponse.fromJson(Map<String, dynamic> json) =>
      _$PreviewResponseFromJson(json);
  Map<String, dynamic> toJson() => _$PreviewResponseToJson(this);
}

@JsonSerializable()
class CreateInvestmentBody {
  final String assetId;
  final String planId;
  final int amountKobo;
  final String paymentMethod; // WALLET | CARD | TRANSFER | USSD

  const CreateInvestmentBody({
    required this.assetId,
    required this.planId,
    required this.amountKobo,
    required this.paymentMethod,
  });

  factory CreateInvestmentBody.fromJson(Map<String, dynamic> json) =>
      _$CreateInvestmentBodyFromJson(json);
  Map<String, dynamic> toJson() => _$CreateInvestmentBodyToJson(this);
}

@JsonSerializable()
class InvestmentPayout {
  @JsonKey(defaultValue: 0)
  final int sequence;
  final String dueDate;
  @JsonKey(defaultValue: 0)
  final int amountKobo;
  @JsonKey(defaultValue: 'SCHEDULED')
  final String status; // SCHEDULED | PAID
  final String? paidAt;

  const InvestmentPayout({
    required this.sequence,
    required this.dueDate,
    required this.amountKobo,
    required this.status,
    this.paidAt,
  });

  bool get isPaid => status == 'PAID';

  factory InvestmentPayout.fromJson(Map<String, dynamic> json) =>
      _$InvestmentPayoutFromJson(json);
  Map<String, dynamic> toJson() => _$InvestmentPayoutToJson(this);
}

@JsonSerializable()
class NextPayout {
  final String dueDate;
  @JsonKey(defaultValue: 0)
  final int amountKobo;
  final String? assetName;

  const NextPayout({
    required this.dueDate,
    required this.amountKobo,
    this.assetName,
  });

  factory NextPayout.fromJson(Map<String, dynamic> json) =>
      _$NextPayoutFromJson(json);
  Map<String, dynamic> toJson() => _$NextPayoutToJson(this);
}

@JsonSerializable()
class Investment {
  final String id;
  final String reference;
  final String status; // PENDING_PAYMENT | ACTIVE | MATURED | CANCELLED
  @JsonKey(defaultValue: 0)
  final int amountKobo;
  @JsonKey(defaultValue: 0)
  final int monthlyPayoutKobo;
  final String? startedAt;
  final String? maturesAt;
  @JsonKey(defaultValue: 0)
  final int monthsPaid;
  @JsonKey(defaultValue: 0)
  final int totalMonths;
  @JsonKey(defaultValue: 0)
  final int earnedKobo;
  @JsonKey(defaultValue: 0)
  final int projectedKobo;
  final NextPayout? nextPayout;
  final InvestmentAsset asset;
  final InvestmentPlan plan;
  @JsonKey(defaultValue: [])
  final List<InvestmentPayout> payouts;

  const Investment({
    required this.id,
    required this.reference,
    required this.status,
    required this.amountKobo,
    required this.monthlyPayoutKobo,
    this.startedAt,
    this.maturesAt,
    required this.monthsPaid,
    required this.totalMonths,
    required this.earnedKobo,
    required this.projectedKobo,
    this.nextPayout,
    required this.asset,
    required this.plan,
    required this.payouts,
  });

  bool get isActive => status == 'ACTIVE';
  bool get isMatured => status == 'MATURED';
  double get progress => totalMonths == 0 ? 0 : monthsPaid / totalMonths;

  factory Investment.fromJson(Map<String, dynamic> json) =>
      _$InvestmentFromJson(json);
  Map<String, dynamic> toJson() => _$InvestmentToJson(this);
}

@JsonSerializable()
class CreateInvestmentResponse {
  @JsonKey(defaultValue: false)
  final bool paymentRequired;
  final Investment? investment;
  final String? reference;
  final String? authorizationUrl;

  const CreateInvestmentResponse({
    required this.paymentRequired,
    this.investment,
    this.reference,
    this.authorizationUrl,
  });

  factory CreateInvestmentResponse.fromJson(Map<String, dynamic> json) =>
      _$CreateInvestmentResponseFromJson(json);
  Map<String, dynamic> toJson() => _$CreateInvestmentResponseToJson(this);
}

@JsonSerializable()
class VerifyReferenceBody {
  final String reference;

  const VerifyReferenceBody({required this.reference});

  factory VerifyReferenceBody.fromJson(Map<String, dynamic> json) =>
      _$VerifyReferenceBodyFromJson(json);
  Map<String, dynamic> toJson() => _$VerifyReferenceBodyToJson(this);
}

@JsonSerializable()
class InvestorPortfolio {
  @JsonKey(defaultValue: 0)
  final int portfolioValueKobo;
  @JsonKey(defaultValue: 0)
  final int investedKobo;
  @JsonKey(defaultValue: 0)
  final int earnedKobo;
  @JsonKey(defaultValue: 0)
  final int thisMonthKobo;
  @JsonKey(defaultValue: 0)
  final int activeCount;
  @JsonKey(defaultValue: 0)
  final int maturedCount;
  final NextPayout? nextPayout;

  const InvestorPortfolio({
    required this.portfolioValueKobo,
    required this.investedKobo,
    required this.earnedKobo,
    required this.thisMonthKobo,
    required this.activeCount,
    required this.maturedCount,
    this.nextPayout,
  });

  factory InvestorPortfolio.fromJson(Map<String, dynamic> json) =>
      _$InvestorPortfolioFromJson(json);
  Map<String, dynamic> toJson() => _$InvestorPortfolioToJson(this);
}

@JsonSerializable()
class InvestmentListResponse {
  final InvestorPortfolio? portfolio;
  @JsonKey(defaultValue: [])
  final List<Investment> data;

  const InvestmentListResponse({this.portfolio, required this.data});

  factory InvestmentListResponse.fromJson(Map<String, dynamic> json) =>
      _$InvestmentListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$InvestmentListResponseToJson(this);
}

@JsonSerializable()
class InvestmentResponse {
  final Investment data;

  const InvestmentResponse({required this.data});

  factory InvestmentResponse.fromJson(Map<String, dynamic> json) =>
      _$InvestmentResponseFromJson(json);
  Map<String, dynamic> toJson() => _$InvestmentResponseToJson(this);
}
