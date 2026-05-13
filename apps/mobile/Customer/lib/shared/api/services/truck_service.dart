import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/delivery_models.dart';

part 'truck_service.g.dart';

@RestApi()
abstract class TruckService {
  factory TruckService(Dio dio, {String? baseUrl}) = _TruckService;

  @GET('/truck/pricing')
  Future<TruckPricingResponse> getPricing();

  @GET('/truck/types')
  Future<TruckTypesResponse> listTruckTypes();

  @POST('/truck/quote')
  Future<TruckQuoteResponse> getQuote(@Body() TruckQuoteBody body);

  @POST('/truck/orders')
  Future<TruckOrderResponse> bookTruck(@Body() TruckOrderBody body);
}
