import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'rider_analytics_service.g.dart';

@RestApi()
abstract class RiderAnalyticsService {
  factory RiderAnalyticsService(Dio dio) = _RiderAnalyticsService;

  @GET('/rider/analytics')
  Future<dynamic> getAnalytics({@Query('days') int days = 30});
}
