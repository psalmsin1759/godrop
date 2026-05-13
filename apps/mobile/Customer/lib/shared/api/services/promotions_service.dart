import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/promotion_models.dart';

part 'promotions_service.g.dart';

@RestApi()
abstract class PromotionsService {
  factory PromotionsService(Dio dio, {String? baseUrl}) = _PromotionsService;

  @POST('/promotions/apply')
  Future<PromoApplyResponse> applyPromo(@Body() PromoApplyBody body);

  @GET('/promotions/banners')
  Future<BannersResponse> getBanners();
}
