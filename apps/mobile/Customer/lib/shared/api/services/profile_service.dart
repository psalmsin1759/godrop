import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/common_models.dart';
import '../../models/profile_models.dart';

part 'profile_service.g.dart';

@RestApi()
abstract class ProfileService {
  factory ProfileService(Dio dio, {String? baseUrl}) = _ProfileService;

  @GET('/me')
  Future<UserProfile> getProfile();

  @PATCH('/me')
  Future<UserProfileResponse> updateProfile(@Body() UpdateProfileBody body);

  @POST('/me/avatar')
  Future<AvatarUploadResponse> uploadAvatar(@Body() FormData formData);

  @GET('/me/addresses')
  Future<AddressListResponse> listAddresses();

  @POST('/me/addresses')
  Future<SingleAddressResponse> addAddress(@Body() AddAddressBody body);

  @PATCH('/me/addresses/{id}')
  Future<SingleAddressResponse> updateAddress(
    @Path('id') String id,
    @Body() UpdateAddressBody body,
  );

  @DELETE('/me/addresses/{id}')
  Future<MessageResponse> deleteAddress(@Path('id') String id);

  @POST('/me/push-token')
  Future<MessageResponse> registerPushToken(
    @Body() Map<String, String> body,
  );
}
