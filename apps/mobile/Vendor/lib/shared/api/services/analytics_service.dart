import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/analytics_models.dart';

part 'analytics_service.g.dart';

@RestApi()
abstract class AnalyticsService {
  factory AnalyticsService(Dio dio, {String? baseUrl}) = _AnalyticsService;

  @GET('/vendor-admin/analytics')
  Future<VendorAnalyticsResponse> getAnalytics({
    @Query('from') String? from,
    @Query('to') String? to,
  });

  @GET('/vendor-admin/analytics/graph')
  Future<GraphDataResponse> getGraph({
    @Query('from') String? from,
    @Query('to') String? to,
    @Query('granularity') String granularity = 'day',
  });

  @GET('/vendor-admin/analytics/lifetime')
  Future<LifetimeStatsResponse> getLifetime();
}
