import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/catalog_models.dart';
import '../../models/common_models.dart';

part 'catalog_service.g.dart';

@RestApi()
abstract class CatalogService {
  factory CatalogService(Dio dio, {String? baseUrl}) = _CatalogService;

  // ── Categories ──────────────────────────────────────────────

  @GET('/vendor-admin/categories')
  Future<CategoryListResponse> listCategories();

  @GET('/vendor-admin/categories/{id}')
  Future<CategoryResponse> getCategory(@Path('id') String id);

  @POST('/vendor-admin/categories')
  Future<CategoryResponse> createCategory(@Body() CategoryBody body);

  @PUT('/vendor-admin/categories/{id}')
  Future<CategoryResponse> updateCategory(
      @Path('id') String id, @Body() CategoryBody body);

  @PATCH('/vendor-admin/categories/{id}/active')
  Future<CategoryResponse> toggleCategoryActive(
      @Path('id') String id, @Body() ToggleActiveBody body);

  @DELETE('/vendor-admin/categories/{id}')
  Future<MessageResponse> deleteCategory(@Path('id') String id);

  // ── Products ────────────────────────────────────────────────

  @GET('/vendor-admin/products')
  Future<ProductListResponse> listProducts({
    @Query('categoryId') String? categoryId,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/vendor-admin/products/{id}')
  Future<ProductResponse> getProduct(@Path('id') String id);

  @POST('/vendor-admin/products')
  Future<ProductResponse> createProduct(@Body() ProductBody body);

  @PUT('/vendor-admin/products/{id}')
  Future<ProductResponse> updateProduct(
      @Path('id') String id, @Body() ProductBody body);

  @PATCH('/vendor-admin/products/{id}/availability')
  Future<ProductResponse> toggleAvailability(
      @Path('id') String id, @Body() ToggleAvailabilityBody body);

  @DELETE('/vendor-admin/products/{id}')
  Future<MessageResponse> deleteProduct(@Path('id') String id);
}
