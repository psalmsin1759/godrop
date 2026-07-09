import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/order_models.dart';
import '../../models/common_models.dart';

part 'orders_service.g.dart';

@RestApi()
abstract class OrdersService {
  factory OrdersService(Dio dio, {String? baseUrl}) = _OrdersService;

  @GET('/vendor-admin/orders')
  Future<OrderListResponse> listOrders({
    @Query('status') String? status,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/vendor-admin/orders/{id}')
  Future<OrderResponse> getOrder(@Path('id') String id);

  @PATCH('/vendor-admin/orders/{id}/accept')
  Future<OrderResponse> acceptOrder(@Path('id') String id);

  @PATCH('/vendor-admin/orders/{id}/preparing')
  Future<OrderResponse> markPreparing(@Path('id') String id);

  @PATCH('/vendor-admin/orders/{id}/ready')
  Future<OrderResponse> markReady(@Path('id') String id);

  @PATCH('/vendor-admin/orders/{id}/reject')
  Future<MessageResponse> rejectOrder(
      @Path('id') String id, @Body() OrderReasonBody body);

  @PATCH('/vendor-admin/orders/{id}/cancel')
  Future<MessageResponse> cancelOrder(
      @Path('id') String id, @Body() OrderReasonBody body);
}
