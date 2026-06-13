import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/common_models.dart';
import '../../models/favorites_models.dart';

part 'favorites_service.g.dart';

@RestApi()
abstract class FavoritesService {
  factory FavoritesService(Dio dio, {String? baseUrl}) = _FavoritesService;

  @GET('/me/favorites')
  Future<FavoritesResponse> listFavorites();

  @POST('/me/favorites')
  Future<MessageResponse> addFavorite(@Body() ToggleFavoriteBody body);

  @DELETE('/me/favorites/{vendorId}')
  Future<MessageResponse> removeFavorite(@Path('vendorId') String vendorId);
}
