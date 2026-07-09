import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/admin_models.dart';
import '../../models/common_models.dart';

part 'auth_service.g.dart';

/// Vendor admins share the admin auth endpoints (`/admin/*`).
@RestApi()
abstract class AuthService {
  factory AuthService(Dio dio, {String? baseUrl}) = _AuthService;

  @POST('/admin/login')
  Future<AdminLoginResponse> login(@Body() AdminLoginBody body);

  @POST('/admin/forgot-password')
  Future<MessageResponse> forgotPassword(@Body() ForgotPasswordBody body);

  @POST('/admin/reset-password')
  Future<MessageResponse> resetPassword(@Body() ResetPasswordBody body);
}
