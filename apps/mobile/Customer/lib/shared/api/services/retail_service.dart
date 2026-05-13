import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/store_models.dart';

part 'retail_service.g.dart';

@RestApi()
abstract class RetailService {
  factory RetailService(Dio dio, {String? baseUrl}) = _RetailService;

  @GET('/retail/stores')
  Future<StoreListResponse> listStores({
    @Query('lat') required double lat,
    @Query('lng') required double lng,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
    @Query('categoryId') String? categoryId,
    @Query('search') String? search,
  });

  @GET('/retail/stores/{id}')
  Future<StoreDetailResponse> getStore(@Path('id') String id);

  @GET('/retail/stores/{id}/products')
  Future<StoreProductListResponse> getProducts(
    @Path('id') String id, {
    @Query('categoryId') String? categoryId,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
    @Query('search') String? search,
  });

  @GET('/retail/categories')
  Future<RetailCategoriesResponse> listCategories();

  @GET('/retail/search')
  Future<StoreSearchResponse> search({
    @Query('q') required String q,
    @Query('lat') required double lat,
    @Query('lng') required double lng,
  });

  @POST('/retail/checkout')
  Future<StoreOrderResponse> checkout(@Body() StoreCheckoutRequest body);
}
