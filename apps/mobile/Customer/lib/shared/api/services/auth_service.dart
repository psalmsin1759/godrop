import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/auth_models.dart';
import '../../models/common_models.dart';

part 'auth_service.g.dart';

@RestApi()
abstract class AuthService {
  factory AuthService(Dio dio, {String? baseUrl}) = _AuthService;

  @POST('/auth/otp/request')
  Future<OtpRequestResponse> requestOtp(@Body() OtpRequestBody body);

  @POST('/auth/otp/verify')
  Future<OtpVerifyResponse> verifyOtp(@Body() OtpVerifyBody body);

  @POST('/auth/register')
  Future<RegisterResponse> register(@Body() RegisterBody body);

  @POST('/auth/refresh')
  Future<TokenPair> refreshToken(@Body() Map<String, String> body);

  @POST('/auth/logout')
  Future<MessageResponse> logout(@Body() LogoutBody body);

  @POST('/auth/login')
  Future<OtpVerifyResponse> loginWithPassword(@Body() PasswordLoginBody body);

  @POST('/auth/forgot-password')
  Future<MessageResponse> forgotPassword(@Body() ForgotPasswordBody body);

  @PATCH('/auth/change-password')
  Future<MessageResponse> changePassword(@Body() ChangePasswordBody body);

  @DELETE('/auth/account')
  Future<MessageResponse> deleteAccount();
}
