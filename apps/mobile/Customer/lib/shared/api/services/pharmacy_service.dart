import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/store_models.dart';

part 'pharmacy_service.g.dart';

@RestApi()
abstract class PharmacyService {
  factory PharmacyService(Dio dio, {String? baseUrl}) = _PharmacyService;

  @GET('/pharmacy/stores')
  Future<PharmacyListResponse> listPharmacies({
    @Query('lat') required double lat,
    @Query('lng') required double lng,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
    @Query('search') String? search,
    @Query('isOpen') bool? isOpen,
  });

  @GET('/pharmacy/stores/{id}')
  Future<PharmacyDetailResponse> getPharmacy(@Path('id') String id);

  @GET('/pharmacy/stores/{id}/products')
  Future<StoreProductListResponse> getProducts(
    @Path('id') String id, {
    @Query('categoryId') String? categoryId,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
    @Query('search') String? search,
  });

  @GET('/pharmacy/search')
  Future<PharmacySearchResponse> search({
    @Query('q') required String q,
    @Query('lat') required double lat,
    @Query('lng') required double lng,
  });

  @POST('/pharmacy/checkout')
  Future<StoreOrderResponse> checkout(@Body() StoreCheckoutRequest body);
}
