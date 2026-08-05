import 'package:json_annotation/json_annotation.dart';

part 'analytics_models.g.dart';

@JsonSerializable()
class AnalyticsSummary {
  @JsonKey(defaultValue: 0)
  final int totalOrders;
  @JsonKey(defaultValue: 0)
  final int completedOrders;
  @JsonKey(defaultValue: 0)
  final int cancelledOrders;
  @JsonKey(defaultValue: 0)
  final int totalRevenueKobo;
  @JsonKey(defaultValue: 0)
  final int avgOrderValueKobo;

  const AnalyticsSummary({
    required this.totalOrders,
    required this.completedOrders,
    required this.cancelledOrders,
    required this.totalRevenueKobo,
    required this.avgOrderValueKobo,
  });

  factory AnalyticsSummary.fromJson(Map<String, dynamic> json) =>
      _$AnalyticsSummaryFromJson(json);
  Map<String, dynamic> toJson() => _$AnalyticsSummaryToJson(this);
}

@JsonSerializable()
class StatusCount {
  final String status;
  @JsonKey(defaultValue: 0)
  final int count;

  const StatusCount({required this.status, required this.count});

  factory StatusCount.fromJson(Map<String, dynamic> json) =>
      _$StatusCountFromJson(json);
  Map<String, dynamic> toJson() => _$StatusCountToJson(this);
}

@JsonSerializable()
class RevenuePoint {
  final String date;
  @JsonKey(defaultValue: 0)
  final int orders;
  @JsonKey(defaultValue: 0)
  final int revenueKobo;

  const RevenuePoint({
    required this.date,
    required this.orders,
    required this.revenueKobo,
  });

  factory RevenuePoint.fromJson(Map<String, dynamic> json) =>
      _$RevenuePointFromJson(json);
  Map<String, dynamic> toJson() => _$RevenuePointToJson(this);
}

@JsonSerializable()
class TopProduct {
  final String name;
  @JsonKey(defaultValue: 0)
  final int orders;
  @JsonKey(defaultValue: 0)
  final int revenueKobo;

  const TopProduct({
    required this.name,
    required this.orders,
    required this.revenueKobo,
  });

  factory TopProduct.fromJson(Map<String, dynamic> json) =>
      _$TopProductFromJson(json);
  Map<String, dynamic> toJson() => _$TopProductToJson(this);
}

@JsonSerializable()
class VendorAnalytics {
  final AnalyticsSummary summary;
  @JsonKey(defaultValue: [])
  final List<StatusCount> ordersByStatus;
  @JsonKey(defaultValue: [])
  final List<RevenuePoint> revenueByDay;
  @JsonKey(defaultValue: [])
  final List<TopProduct> topProducts;

  const VendorAnalytics({
    required this.summary,
    required this.ordersByStatus,
    required this.revenueByDay,
    required this.topProducts,
  });

  factory VendorAnalytics.fromJson(Map<String, dynamic> json) =>
      _$VendorAnalyticsFromJson(json);
  Map<String, dynamic> toJson() => _$VendorAnalyticsToJson(this);
}

@JsonSerializable()
class VendorAnalyticsResponse {
  final VendorAnalytics data;

  const VendorAnalyticsResponse({required this.data});

  factory VendorAnalyticsResponse.fromJson(Map<String, dynamic> json) =>
      _$VendorAnalyticsResponseFromJson(json);
  Map<String, dynamic> toJson() => _$VendorAnalyticsResponseToJson(this);
}

@JsonSerializable()
class GraphData {
  final String granularity;
  @JsonKey(defaultValue: [])
  final List<RevenuePoint> points;

  const GraphData({required this.granularity, required this.points});

  factory GraphData.fromJson(Map<String, dynamic> json) =>
      _$GraphDataFromJson(json);
  Map<String, dynamic> toJson() => _$GraphDataToJson(this);
}

@JsonSerializable()
class GraphDataResponse {
  final GraphData data;

  const GraphDataResponse({required this.data});

  factory GraphDataResponse.fromJson(Map<String, dynamic> json) =>
      _$GraphDataResponseFromJson(json);
  Map<String, dynamic> toJson() => _$GraphDataResponseToJson(this);
}

@JsonSerializable()
class LifetimeStats {
  @JsonKey(defaultValue: 0)
  final int totalOrders;
  @JsonKey(defaultValue: 0)
  final int completedOrders;
  @JsonKey(defaultValue: 0)
  final int totalRevenueKobo;

  const LifetimeStats({
    required this.totalOrders,
    required this.completedOrders,
    required this.totalRevenueKobo,
  });

  factory LifetimeStats.fromJson(Map<String, dynamic> json) =>
      _$LifetimeStatsFromJson(json);
  Map<String, dynamic> toJson() => _$LifetimeStatsToJson(this);
}

@JsonSerializable()
class LifetimeStatsResponse {
  final LifetimeStats data;

  const LifetimeStatsResponse({required this.data});

  factory LifetimeStatsResponse.fromJson(Map<String, dynamic> json) =>
      _$LifetimeStatsResponseFromJson(json);
  Map<String, dynamic> toJson() => _$LifetimeStatsResponseToJson(this);
}
