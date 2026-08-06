import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/dispute_models.dart';

part 'disputes_service.g.dart';

@RestApi()
abstract class DisputesService {
  factory DisputesService(Dio dio, {String? baseUrl}) = _DisputesService;

  @POST('/disputes/upload')
  Future<DisputeUploadResponse> uploadEvidence(@Body() FormData formData);

  @POST('/disputes')
  Future<DisputeResponse> createDispute(@Body() CreateDisputeBody body);

  @GET('/disputes')
  Future<DisputeListResponse> listDisputes({
    @Query('status') String? status,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/disputes/{id}')
  Future<DisputeDetailResponse> getDispute(@Path('id') String id);

  @POST('/disputes/{id}/messages')
  Future<DisputeMessageResponse> addMessage(
    @Path('id') String id,
    @Body() AddDisputeMessageBody body,
  );
}
