import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'rider_earnings_service.g.dart';

@RestApi()
abstract class RiderEarningsService {
  factory RiderEarningsService(Dio dio) = _RiderEarningsService;

  @GET('/rider/earnings')
  Future<dynamic> listEarnings({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/rider/earnings/summary')
  Future<dynamic> getSummary();

  @POST('/rider/earnings/withdrawal')
  Future<dynamic> requestWithdrawal(@Body() Map<String, dynamic> body);

  @GET('/rider/earnings/withdrawals')
  Future<dynamic> listWithdrawals({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });
}
