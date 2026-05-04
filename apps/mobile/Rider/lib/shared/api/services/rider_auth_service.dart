import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'rider_auth_service.g.dart';

@RestApi()
abstract class RiderAuthService {
  factory RiderAuthService(Dio dio) = _RiderAuthService;

  @POST('/rider/auth/request-otp')
  Future<dynamic> requestOtp(@Body() Map<String, dynamic> body);

  @POST('/rider/auth/verify-otp')
  Future<dynamic> verifyOtp(@Body() Map<String, dynamic> body);

  @POST('/rider/auth/refresh')
  Future<dynamic> refresh(@Body() Map<String, dynamic> body);

  @POST('/rider/auth/logout')
  Future<dynamic> logout(@Body() Map<String, dynamic> body);
}
