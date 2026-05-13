import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/food_models.dart';

part 'food_service.g.dart';

@RestApi()
abstract class FoodService {
  factory FoodService(Dio dio, {String? baseUrl}) = _FoodService;

  @GET('/food/restaurants')
  Future<RestaurantListResponse> listRestaurants({
    @Query('lat') required double lat,
    @Query('lng') required double lng,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
    @Query('search') String? search,
    @Query('isOpen') bool? isOpen,
  });

  @GET('/food/restaurants/{id}')
  Future<RestaurantDetailResponse> getRestaurant(@Path('id') String id);

  @GET('/food/restaurants/{id}/menu')
  Future<MenuItemListResponse> getMenuItems(
    @Path('id') String id, {
    @Query('categoryId') String? categoryId,
  });

  @GET('/food/search')
  Future<FoodSearchResponse> search({
    @Query('q') required String q,
    @Query('lat') required double lat,
    @Query('lng') required double lng,
  });

  @GET('/food/restaurants/{id}/reviews')
  Future<ReviewsResponse> getReviews(
    @Path('id') String id, {
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @POST('/food/checkout')
  Future<FoodOrderResponse> checkout(@Body() FoodCheckoutRequest body);
}
