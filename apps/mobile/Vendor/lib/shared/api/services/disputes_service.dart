import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/dispute_models.dart';

part 'disputes_service.g.dart';

@RestApi()
abstract class DisputesService {
  factory DisputesService(Dio dio, {String? baseUrl}) = _DisputesService;

  @POST('/vendor-admin/disputes')
  Future<DisputeResponse> createDispute(@Body() CreateDisputeBody body);

  @GET('/vendor-admin/disputes')
  Future<DisputeListResponse> listDisputes({
    @Query('status') String? status,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/vendor-admin/disputes/{id}')
  Future<DisputeDetailResponse> getDispute(@Path('id') String id);

  @POST('/vendor-admin/disputes/{id}/messages')
  Future<DisputeMessageResponse> addMessage(
    @Path('id') String id,
    @Body() AddDisputeMessageBody body,
  );
}
