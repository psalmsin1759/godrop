import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/wallet_models.dart';

part 'wallet_service.g.dart';

@RestApi()
abstract class WalletService {
  factory WalletService(Dio dio, {String? baseUrl}) = _WalletService;

  @GET('/me/wallet')
  Future<WalletBalance> getBalance();

  @GET('/me/wallet/transactions')
  Future<WalletTxListResponse> getTransactions({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @POST('/me/wallet/topup')
  Future<TopUpInitResponse> initTopUp(@Body() TopUpInitBody body);

  @POST('/me/wallet/topup/verify')
  Future<TopUpVerifyResponse> verifyTopUp(@Body() TopUpVerifyBody body);
}
