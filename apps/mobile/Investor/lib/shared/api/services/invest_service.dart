import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/home_models.dart';
import '../../models/invest_models.dart';

part 'invest_service.g.dart';

/// Home, assets, plans, and the invest flow. All money in Kobo.
@RestApi()
abstract class InvestService {
  factory InvestService(Dio dio, {String? baseUrl}) = _InvestService;

  @GET('/investor/home')
  Future<HomeResponse> getHome();

  @GET('/investor/assets')
  Future<AssetListResponse> getAssets({@Query('class') String? vehicleClass});

  @GET('/investor/assets/{id}')
  Future<AssetResponse> getAsset(@Path('id') String id);

  @GET('/investor/plans')
  Future<PlanListResponse> getPlans();

  @POST('/investor/investments/preview')
  Future<PreviewResponse> previewInvestment(@Body() PreviewBody body);

  @POST('/investor/investments')
  Future<CreateInvestmentResponse> createInvestment(
      @Body() CreateInvestmentBody body);

  @POST('/investor/investments/verify')
  Future<InvestmentResponse> verifyInvestment(@Body() VerifyReferenceBody body);

  @GET('/investor/investments')
  Future<InvestmentListResponse> getInvestments({@Query('status') String? status});

  @GET('/investor/investments/{id}')
  Future<InvestmentResponse> getInvestment(@Path('id') String id);
}
