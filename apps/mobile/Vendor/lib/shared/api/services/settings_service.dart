import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/vendor_models.dart';

part 'settings_service.g.dart';

@RestApi()
abstract class SettingsService {
  factory SettingsService(Dio dio, {String? baseUrl}) = _SettingsService;

  @GET('/vendor-admin/settings')
  Future<VendorSettingsResponse> getSettings();

  @PUT('/vendor-admin/settings')
  Future<VendorSettingsResponse> updateSettings(
      @Body() UpdateVendorSettingsBody body);
}
