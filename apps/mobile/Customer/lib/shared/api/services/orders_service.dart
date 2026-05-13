import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/order_models.dart';

part 'orders_service.g.dart';

@RestApi()
abstract class OrdersService {
  factory OrdersService(Dio dio, {String? baseUrl}) = _OrdersService;

  @GET('/orders')
  Future<OrderListResponse> listOrders({
    @Query('status') String? status,
    @Query('type') String? type,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/orders/{id}')
  Future<OrderDetailResponse> getOrder(@Path('id') String id);

  @POST('/orders/{id}/cancel')
  Future<CancelOrderResponse> cancelOrder(
    @Path('id') String id,
    @Body() CancelOrderBody body,
  );

  @POST('/orders/{id}/rating')
  Future<RateOrderResponse> rateOrder(
    @Path('id') String id,
    @Body() RateOrderBody body,
  );

  @POST('/orders/{id}/reorder')
  Future<ReorderResponse> reorder(@Path('id') String id);

  @GET('/orders/{id}/tracking')
  Future<TrackingResponse> getTracking(@Path('id') String id);
}
