import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'rider_profile_service.g.dart';

@RestApi()
abstract class RiderProfileService {
  factory RiderProfileService(Dio dio) = _RiderProfileService;

  @GET('/rider/me')
  Future<dynamic> getProfile();

  @PATCH('/rider/me')
  Future<dynamic> updateProfile(@Body() Map<String, dynamic> body);

  @PATCH('/rider/me/avatar')
  Future<dynamic> updateAvatar(@Body() Map<String, dynamic> body);

  @POST('/rider/me/kyc')
  Future<dynamic> submitKyc(@Body() Map<String, dynamic> body);

  @PATCH('/rider/me/bank')
  Future<dynamic> updateBank(@Body() Map<String, dynamic> body);

  @PATCH('/rider/me/availability')
  Future<dynamic> setAvailability(@Body() Map<String, dynamic> body);

  @POST('/rider/me/location')
  Future<dynamic> updateLocation(@Body() Map<String, dynamic> body);

  @POST('/rider/me/push-token')
  Future<dynamic> registerPushToken(@Body() Map<String, dynamic> body);

  @DELETE('/rider/me/push-token')
  Future<dynamic> removePushToken(@Body() Map<String, dynamic> body);
}
