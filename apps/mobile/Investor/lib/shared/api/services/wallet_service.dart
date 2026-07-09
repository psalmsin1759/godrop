import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/wallet_models.dart';

part 'wallet_service.g.dart';

/// Wallet, funding, withdrawals, Flow Safe, transactions. All money in Kobo.
@RestApi()
abstract class WalletService {
  factory WalletService(Dio dio, {String? baseUrl}) = _WalletService;

  @GET('/investor/wallet')
  Future<WalletResponse> getWallet();

  @POST('/investor/wallet/fund')
  Future<FundResponse> fund(@Body() FundBody body);

  @POST('/investor/wallet/fund/verify')
  Future<TxEnvelope> verifyFunding(@Body() Map<String, dynamic> body);

  @POST('/investor/wallet/withdraw')
  Future<TxEnvelope> withdraw(@Body() WithdrawBody body);

  @GET('/investor/wallet/transactions')
  Future<TxListResponse> getTransactions({
    @Query('type') String? type,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/investor/safe')
  Future<SafeResponse> getSafe();

  @POST('/investor/safe/vaults')
  Future<VaultResponse> createVault(@Body() CreateVaultBody body);

  @POST('/investor/safe/vaults/{id}/withdraw')
  Future<WalletsEnvelope> withdrawFromVault(
    @Path('id') String id,
    @Body() VaultWithdrawBody body,
  );
}
