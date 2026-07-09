import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/wallet_models.dart';

part 'wallet_service.g.dart';

/// Wallet endpoints speak Naira decimals (not Kobo).
@RestApi()
abstract class WalletService {
  factory WalletService(Dio dio, {String? baseUrl}) = _WalletService;

  @GET('/vendor-admin/wallet')
  Future<VendorWalletBalance> getBalance();

  @GET('/vendor-admin/wallet/transactions')
  Future<WalletTxListResponse> getTransactions({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/vendor-admin/wallet/banks')
  Future<BankListResponse> getBanks();

  @POST('/vendor-admin/wallet/resolve-account')
  Future<ResolvedAccount> resolveAccount(@Body() ResolveAccountBody body);

  @GET('/vendor-admin/wallet/bank-account')
  Future<BankAccountResponse> getBankAccount();

  @POST('/vendor-admin/wallet/bank-account')
  Future<BankAccountResponse> saveBankAccount(@Body() SaveBankAccountBody body);

  @POST('/vendor-admin/wallet/withdraw')
  Future<WithdrawResponse> withdraw(@Body() WithdrawBody body);
}
