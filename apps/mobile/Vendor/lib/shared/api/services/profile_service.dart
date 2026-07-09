import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/admin_models.dart';
import '../../models/common_models.dart';

part 'profile_service.g.dart';

@RestApi()
abstract class ProfileService {
  factory ProfileService(Dio dio, {String? baseUrl}) = _ProfileService;

  @GET('/vendor-admin/me')
  Future<VendorAdminResponse> getProfile();

  @PATCH('/vendor-admin/me/profile')
  Future<VendorAdminResponse> updateProfile(@Body() UpdateProfileBody body);

  @POST('/vendor-admin/me/change-password')
  Future<MessageResponse> changePassword(@Body() ChangePasswordBody body);

  @GET('/vendor-admin/me/settings')
  Future<ProfileSettingsResponse> getSettings();

  @PATCH('/vendor-admin/me/settings')
  Future<ProfileSettingsResponse> updateSettings(
      @Body() UpdateProfileSettingsBody body);
}
