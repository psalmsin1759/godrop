import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/store_models.dart';

part 'grocery_service.g.dart';

@RestApi()
abstract class GroceryService {
  factory GroceryService(Dio dio, {String? baseUrl}) = _GroceryService;

  @GET('/grocery/stores')
  Future<StoreListResponse> listStores({
    @Query('lat') required double lat,
    @Query('lng') required double lng,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
    @Query('search') String? search,
  });

  @GET('/grocery/stores/{id}')
  Future<StoreDetailResponse> getStore(@Path('id') String id);

  @GET('/grocery/stores/{id}/products')
  Future<StoreProductListResponse> getProducts(
    @Path('id') String id, {
    @Query('categoryId') String? categoryId,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
    @Query('search') String? search,
  });

  @GET('/grocery/search')
  Future<StoreSearchResponse> search({
    @Query('q') required String q,
    @Query('lat') required double lat,
    @Query('lng') required double lng,
  });

  @POST('/grocery/checkout')
  Future<StoreOrderResponse> checkout(@Body() StoreCheckoutRequest body);
}
