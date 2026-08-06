import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'rider_disputes_service.g.dart';

@RestApi()
abstract class RiderDisputesService {
  factory RiderDisputesService(Dio dio) = _RiderDisputesService;

  @POST('/rider/disputes/upload')
  Future<dynamic> uploadEvidence(@Body() FormData formData);

  @POST('/rider/disputes')
  Future<dynamic> createDispute(@Body() Map<String, dynamic> body);

  @GET('/rider/disputes')
  Future<dynamic> listDisputes({
    @Query('status') String? status,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/rider/disputes/{id}')
  Future<dynamic> getDispute(@Path('id') String id);

  @POST('/rider/disputes/{id}/messages')
  Future<dynamic> addMessage(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );
}
