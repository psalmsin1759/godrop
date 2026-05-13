import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/delivery_models.dart';

part 'parcel_service.g.dart';

@RestApi()
abstract class ParcelService {
  factory ParcelService(Dio dio, {String? baseUrl}) = _ParcelService;

  @GET('/parcel/vehicle-types')
  Future<ParcelVehicleTypesResponse> getVehicleTypes();

  @POST('/parcel/quote')
  Future<ParcelQuoteResponse> getQuote(@Body() ParcelQuoteBody body);

  @POST('/parcel/orders')
  Future<ParcelOrderResponse> placeOrder(@Body() ParcelOrderBody body);
}
