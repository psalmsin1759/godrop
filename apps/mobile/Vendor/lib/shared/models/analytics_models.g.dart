// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'analytics_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AnalyticsSummary _$AnalyticsSummaryFromJson(Map<String, dynamic> json) =>
    AnalyticsSummary(
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 0,
      completedOrders: (json['completedOrders'] as num?)?.toInt() ?? 0,
      cancelledOrders: (json['cancelledOrders'] as num?)?.toInt() ?? 0,
      totalRevenueKobo: (json['totalRevenueKobo'] as num?)?.toInt() ?? 0,
      avgOrderValueKobo: (json['avgOrderValueKobo'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$AnalyticsSummaryToJson(AnalyticsSummary instance) =>
    <String, dynamic>{
      'totalOrders': instance.totalOrders,
      'completedOrders': instance.completedOrders,
      'cancelledOrders': instance.cancelledOrders,
      'totalRevenueKobo': instance.totalRevenueKobo,
      'avgOrderValueKobo': instance.avgOrderValueKobo,
    };

StatusCount _$StatusCountFromJson(Map<String, dynamic> json) => StatusCount(
      status: json['status'] as String,
      count: (json['count'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$StatusCountToJson(StatusCount instance) =>
    <String, dynamic>{
      'status': instance.status,
      'count': instance.count,
    };

RevenuePoint _$RevenuePointFromJson(Map<String, dynamic> json) => RevenuePoint(
      date: json['date'] as String,
      orders: (json['orders'] as num?)?.toInt() ?? 0,
      revenueKobo: (json['revenueKobo'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$RevenuePointToJson(RevenuePoint instance) =>
    <String, dynamic>{
      'date': instance.date,
      'orders': instance.orders,
      'revenueKobo': instance.revenueKobo,
    };

TopProduct _$TopProductFromJson(Map<String, dynamic> json) => TopProduct(
      name: json['name'] as String,
      orders: (json['orders'] as num?)?.toInt() ?? 0,
      revenueKobo: (json['revenueKobo'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$TopProductToJson(TopProduct instance) =>
    <String, dynamic>{
      'name': instance.name,
      'orders': instance.orders,
      'revenueKobo': instance.revenueKobo,
    };

VendorAnalytics _$VendorAnalyticsFromJson(Map<String, dynamic> json) =>
    VendorAnalytics(
      summary:
          AnalyticsSummary.fromJson(json['summary'] as Map<String, dynamic>),
      ordersByStatus: (json['ordersByStatus'] as List<dynamic>?)
              ?.map((e) => StatusCount.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      revenueByDay: (json['revenueByDay'] as List<dynamic>?)
              ?.map((e) => RevenuePoint.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      topProducts: (json['topProducts'] as List<dynamic>?)
              ?.map((e) => TopProduct.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$VendorAnalyticsToJson(VendorAnalytics instance) =>
    <String, dynamic>{
      'summary': instance.summary,
      'ordersByStatus': instance.ordersByStatus,
      'revenueByDay': instance.revenueByDay,
      'topProducts': instance.topProducts,
    };

VendorAnalyticsResponse _$VendorAnalyticsResponseFromJson(
        Map<String, dynamic> json) =>
    VendorAnalyticsResponse(
      data: VendorAnalytics.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$VendorAnalyticsResponseToJson(
        VendorAnalyticsResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

GraphData _$GraphDataFromJson(Map<String, dynamic> json) => GraphData(
      granularity: json['granularity'] as String,
      points: (json['points'] as List<dynamic>?)
              ?.map((e) => RevenuePoint.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$GraphDataToJson(GraphData instance) => <String, dynamic>{
      'granularity': instance.granularity,
      'points': instance.points,
    };

GraphDataResponse _$GraphDataResponseFromJson(Map<String, dynamic> json) =>
    GraphDataResponse(
      data: GraphData.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$GraphDataResponseToJson(GraphDataResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };
