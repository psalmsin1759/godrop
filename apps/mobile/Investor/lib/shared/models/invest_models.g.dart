// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'invest_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

InvestmentAsset _$InvestmentAssetFromJson(Map<String, dynamic> json) =>
    InvestmentAsset(
      id: json['id'] as String,
      name: json['name'] as String,
      shortCode: json['shortCode'] as String,
      vehicleClass: json['vehicleClass'] as String,
      description: json['description'] as String?,
      location: json['location'] as String?,
      imageUrl: json['imageUrl'] as String?,
      unitPriceKobo: (json['unitPriceKobo'] as num?)?.toInt() ?? 0,
      minInvestKobo: (json['minInvestKobo'] as num?)?.toInt() ?? 0,
      projectedRoiBps: (json['projectedRoiBps'] as num?)?.toInt() ?? 0,
      tenureMonths: (json['tenureMonths'] as num?)?.toInt() ?? 0,
      monthlyPayoutKobo: (json['monthlyPayoutKobo'] as num?)?.toInt() ?? 0,
      targetKobo: (json['targetKobo'] as num?)?.toInt() ?? 0,
      raisedKobo: (json['raisedKobo'] as num?)?.toInt() ?? 0,
      fundedPct: (json['fundedPct'] as num?)?.toInt() ?? 0,
      slotsTotal: (json['slotsTotal'] as num?)?.toInt() ?? 0,
      slotsLeft: (json['slotsLeft'] as num?)?.toInt() ?? 0,
      investorCount: (json['investorCount'] as num?)?.toInt() ?? 0,
      isHot: json['isHot'] as bool? ?? false,
      status: json['status'] as String? ?? 'OPEN',
    );

Map<String, dynamic> _$InvestmentAssetToJson(InvestmentAsset instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'shortCode': instance.shortCode,
      'vehicleClass': instance.vehicleClass,
      'description': instance.description,
      'location': instance.location,
      'imageUrl': instance.imageUrl,
      'unitPriceKobo': instance.unitPriceKobo,
      'minInvestKobo': instance.minInvestKobo,
      'projectedRoiBps': instance.projectedRoiBps,
      'tenureMonths': instance.tenureMonths,
      'monthlyPayoutKobo': instance.monthlyPayoutKobo,
      'targetKobo': instance.targetKobo,
      'raisedKobo': instance.raisedKobo,
      'fundedPct': instance.fundedPct,
      'slotsTotal': instance.slotsTotal,
      'slotsLeft': instance.slotsLeft,
      'investorCount': instance.investorCount,
      'isHot': instance.isHot,
      'status': instance.status,
    };

AssetClassInfo _$AssetClassInfoFromJson(Map<String, dynamic> json) =>
    AssetClassInfo(
      vehicleClass: json['vehicleClass'] as String,
      label: json['label'] as String,
      count: (json['count'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$AssetClassInfoToJson(AssetClassInfo instance) =>
    <String, dynamic>{
      'vehicleClass': instance.vehicleClass,
      'label': instance.label,
      'count': instance.count,
    };

AssetListResponse _$AssetListResponseFromJson(Map<String, dynamic> json) =>
    AssetListResponse(
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => InvestmentAsset.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$AssetListResponseToJson(AssetListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

AssetResponse _$AssetResponseFromJson(Map<String, dynamic> json) =>
    AssetResponse(
      data: InvestmentAsset.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AssetResponseToJson(AssetResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

InvestmentPlan _$InvestmentPlanFromJson(Map<String, dynamic> json) =>
    InvestmentPlan(
      id: json['id'] as String,
      name: json['name'] as String,
      tenureMonths: (json['tenureMonths'] as num?)?.toInt() ?? 0,
      monthlyRateBps: (json['monthlyRateBps'] as num?)?.toInt() ?? 0,
      minAmountKobo: (json['minAmountKobo'] as num?)?.toInt() ?? 0,
      note: json['note'] as String?,
      isPopular: json['isPopular'] as bool? ?? false,
    );

Map<String, dynamic> _$InvestmentPlanToJson(InvestmentPlan instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'tenureMonths': instance.tenureMonths,
      'monthlyRateBps': instance.monthlyRateBps,
      'minAmountKobo': instance.minAmountKobo,
      'note': instance.note,
      'isPopular': instance.isPopular,
    };

PlanListResponse _$PlanListResponseFromJson(Map<String, dynamic> json) =>
    PlanListResponse(
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => InvestmentPlan.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$PlanListResponseToJson(PlanListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

PreviewBody _$PreviewBodyFromJson(Map<String, dynamic> json) => PreviewBody(
      assetId: json['assetId'] as String,
      planId: json['planId'] as String,
      amountKobo: (json['amountKobo'] as num).toInt(),
    );

Map<String, dynamic> _$PreviewBodyToJson(PreviewBody instance) =>
    <String, dynamic>{
      'assetId': instance.assetId,
      'planId': instance.planId,
      'amountKobo': instance.amountKobo,
    };

InvestmentPreview _$InvestmentPreviewFromJson(Map<String, dynamic> json) =>
    InvestmentPreview(
      asset: InvestmentAsset.fromJson(json['asset'] as Map<String, dynamic>),
      plan: InvestmentPlan.fromJson(json['plan'] as Map<String, dynamic>),
      amountKobo: (json['amountKobo'] as num?)?.toInt() ?? 0,
      minKobo: (json['minKobo'] as num?)?.toInt() ?? 0,
      remainingKobo: (json['remainingKobo'] as num?)?.toInt() ?? 0,
      monthlyPayoutKobo: (json['monthlyPayoutKobo'] as num?)?.toInt() ?? 0,
      totalReturnKobo: (json['totalReturnKobo'] as num?)?.toInt() ?? 0,
      tenureMonths: (json['tenureMonths'] as num?)?.toInt() ?? 0,
      maturesAt: json['maturesAt'] as String?,
      firstPayoutAt: json['firstPayoutAt'] as String?,
    );

Map<String, dynamic> _$InvestmentPreviewToJson(InvestmentPreview instance) =>
    <String, dynamic>{
      'asset': instance.asset,
      'plan': instance.plan,
      'amountKobo': instance.amountKobo,
      'minKobo': instance.minKobo,
      'remainingKobo': instance.remainingKobo,
      'monthlyPayoutKobo': instance.monthlyPayoutKobo,
      'totalReturnKobo': instance.totalReturnKobo,
      'tenureMonths': instance.tenureMonths,
      'maturesAt': instance.maturesAt,
      'firstPayoutAt': instance.firstPayoutAt,
    };

PreviewResponse _$PreviewResponseFromJson(Map<String, dynamic> json) =>
    PreviewResponse(
      data: InvestmentPreview.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$PreviewResponseToJson(PreviewResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

CreateInvestmentBody _$CreateInvestmentBodyFromJson(
        Map<String, dynamic> json) =>
    CreateInvestmentBody(
      assetId: json['assetId'] as String,
      planId: json['planId'] as String,
      amountKobo: (json['amountKobo'] as num).toInt(),
      paymentMethod: json['paymentMethod'] as String,
    );

Map<String, dynamic> _$CreateInvestmentBodyToJson(
        CreateInvestmentBody instance) =>
    <String, dynamic>{
      'assetId': instance.assetId,
      'planId': instance.planId,
      'amountKobo': instance.amountKobo,
      'paymentMethod': instance.paymentMethod,
    };

InvestmentPayout _$InvestmentPayoutFromJson(Map<String, dynamic> json) =>
    InvestmentPayout(
      sequence: (json['sequence'] as num?)?.toInt() ?? 0,
      dueDate: json['dueDate'] as String,
      amountKobo: (json['amountKobo'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? 'SCHEDULED',
      paidAt: json['paidAt'] as String?,
    );

Map<String, dynamic> _$InvestmentPayoutToJson(InvestmentPayout instance) =>
    <String, dynamic>{
      'sequence': instance.sequence,
      'dueDate': instance.dueDate,
      'amountKobo': instance.amountKobo,
      'status': instance.status,
      'paidAt': instance.paidAt,
    };

NextPayout _$NextPayoutFromJson(Map<String, dynamic> json) => NextPayout(
      dueDate: json['dueDate'] as String,
      amountKobo: (json['amountKobo'] as num?)?.toInt() ?? 0,
      assetName: json['assetName'] as String?,
    );

Map<String, dynamic> _$NextPayoutToJson(NextPayout instance) =>
    <String, dynamic>{
      'dueDate': instance.dueDate,
      'amountKobo': instance.amountKobo,
      'assetName': instance.assetName,
    };

Investment _$InvestmentFromJson(Map<String, dynamic> json) => Investment(
      id: json['id'] as String,
      reference: json['reference'] as String,
      status: json['status'] as String,
      amountKobo: (json['amountKobo'] as num?)?.toInt() ?? 0,
      monthlyPayoutKobo: (json['monthlyPayoutKobo'] as num?)?.toInt() ?? 0,
      startedAt: json['startedAt'] as String?,
      maturesAt: json['maturesAt'] as String?,
      monthsPaid: (json['monthsPaid'] as num?)?.toInt() ?? 0,
      totalMonths: (json['totalMonths'] as num?)?.toInt() ?? 0,
      earnedKobo: (json['earnedKobo'] as num?)?.toInt() ?? 0,
      projectedKobo: (json['projectedKobo'] as num?)?.toInt() ?? 0,
      nextPayout: json['nextPayout'] == null
          ? null
          : NextPayout.fromJson(json['nextPayout'] as Map<String, dynamic>),
      asset: InvestmentAsset.fromJson(json['asset'] as Map<String, dynamic>),
      plan: InvestmentPlan.fromJson(json['plan'] as Map<String, dynamic>),
      payouts: (json['payouts'] as List<dynamic>?)
              ?.map((e) => InvestmentPayout.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$InvestmentToJson(Investment instance) =>
    <String, dynamic>{
      'id': instance.id,
      'reference': instance.reference,
      'status': instance.status,
      'amountKobo': instance.amountKobo,
      'monthlyPayoutKobo': instance.monthlyPayoutKobo,
      'startedAt': instance.startedAt,
      'maturesAt': instance.maturesAt,
      'monthsPaid': instance.monthsPaid,
      'totalMonths': instance.totalMonths,
      'earnedKobo': instance.earnedKobo,
      'projectedKobo': instance.projectedKobo,
      'nextPayout': instance.nextPayout,
      'asset': instance.asset,
      'plan': instance.plan,
      'payouts': instance.payouts,
    };

CreateInvestmentResponse _$CreateInvestmentResponseFromJson(
        Map<String, dynamic> json) =>
    CreateInvestmentResponse(
      paymentRequired: json['paymentRequired'] as bool? ?? false,
      investment: json['investment'] == null
          ? null
          : Investment.fromJson(json['investment'] as Map<String, dynamic>),
      reference: json['reference'] as String?,
      authorizationUrl: json['authorizationUrl'] as String?,
    );

Map<String, dynamic> _$CreateInvestmentResponseToJson(
        CreateInvestmentResponse instance) =>
    <String, dynamic>{
      'paymentRequired': instance.paymentRequired,
      'investment': instance.investment,
      'reference': instance.reference,
      'authorizationUrl': instance.authorizationUrl,
    };

VerifyReferenceBody _$VerifyReferenceBodyFromJson(Map<String, dynamic> json) =>
    VerifyReferenceBody(
      reference: json['reference'] as String,
    );

Map<String, dynamic> _$VerifyReferenceBodyToJson(
        VerifyReferenceBody instance) =>
    <String, dynamic>{
      'reference': instance.reference,
    };

InvestorPortfolio _$InvestorPortfolioFromJson(Map<String, dynamic> json) =>
    InvestorPortfolio(
      portfolioValueKobo: (json['portfolioValueKobo'] as num?)?.toInt() ?? 0,
      investedKobo: (json['investedKobo'] as num?)?.toInt() ?? 0,
      earnedKobo: (json['earnedKobo'] as num?)?.toInt() ?? 0,
      thisMonthKobo: (json['thisMonthKobo'] as num?)?.toInt() ?? 0,
      activeCount: (json['activeCount'] as num?)?.toInt() ?? 0,
      maturedCount: (json['maturedCount'] as num?)?.toInt() ?? 0,
      nextPayout: json['nextPayout'] == null
          ? null
          : NextPayout.fromJson(json['nextPayout'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$InvestorPortfolioToJson(InvestorPortfolio instance) =>
    <String, dynamic>{
      'portfolioValueKobo': instance.portfolioValueKobo,
      'investedKobo': instance.investedKobo,
      'earnedKobo': instance.earnedKobo,
      'thisMonthKobo': instance.thisMonthKobo,
      'activeCount': instance.activeCount,
      'maturedCount': instance.maturedCount,
      'nextPayout': instance.nextPayout,
    };

InvestmentListResponse _$InvestmentListResponseFromJson(
        Map<String, dynamic> json) =>
    InvestmentListResponse(
      portfolio: json['portfolio'] == null
          ? null
          : InvestorPortfolio.fromJson(
              json['portfolio'] as Map<String, dynamic>),
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => Investment.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$InvestmentListResponseToJson(
        InvestmentListResponse instance) =>
    <String, dynamic>{
      'portfolio': instance.portfolio,
      'data': instance.data,
    };

InvestmentResponse _$InvestmentResponseFromJson(Map<String, dynamic> json) =>
    InvestmentResponse(
      data: Investment.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$InvestmentResponseToJson(InvestmentResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };
