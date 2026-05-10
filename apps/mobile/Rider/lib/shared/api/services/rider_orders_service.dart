import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'rider_orders_service.g.dart';

@RestApi()
abstract class RiderOrdersService {
  factory RiderOrdersService(Dio dio) = _RiderOrdersService;

  @GET('/rider/orders/available')
  Future<dynamic> listAvailableOrders({
    @Query('page') int page = 1,
    @Query('limit') int limit = 50,
  });

  @GET('/rider/orders')
  Future<dynamic> listOrders({
    @Query('status') String? status,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/rider/orders/active')
  Future<dynamic> getActiveOrder();

  @GET('/rider/orders/{id}')
  Future<dynamic> getOrder(@Path('id') String id);

  @PATCH('/rider/orders/{id}/accept')
  Future<dynamic> acceptOrder(@Path('id') String id);

  @PATCH('/rider/orders/{id}/reject')
  Future<dynamic> rejectOrder(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @PATCH('/rider/orders/{id}/picked-up')
  Future<dynamic> markPickedUp(@Path('id') String id);

  @PATCH('/rider/orders/{id}/in-transit')
  Future<dynamic> markInTransit(@Path('id') String id);

  @PATCH('/rider/orders/{id}/delivered')
  Future<dynamic> markDelivered(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @PATCH('/rider/orders/{id}/failed')
  Future<dynamic> markFailed(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @POST('/rider/orders/{id}/location')
  Future<dynamic> pushLocation(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );
}
