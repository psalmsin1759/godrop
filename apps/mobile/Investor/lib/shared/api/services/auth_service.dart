import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/auth_models.dart';
import '../../models/common_models.dart';

part 'auth_service.g.dart';

@RestApi()
abstract class AuthService {
  factory AuthService(Dio dio, {String? baseUrl}) = _AuthService;

  @POST('/investor/auth/register')
  Future<RegisterResponse> register(@Body() RegisterBody body);

  @POST('/investor/auth/otp/request')
  Future<MessageResponse> requestOtp(@Body() OtpRequestBody body);

  @POST('/investor/auth/otp/verify')
  Future<AuthResponse> verifyOtp(@Body() OtpVerifyBody body);

  @POST('/investor/auth/login')
  Future<AuthResponse> login(@Body() LoginBody body);

  @POST('/investor/auth/logout')
  Future<MessageResponse> logout(@Body() LogoutBody body);
}
