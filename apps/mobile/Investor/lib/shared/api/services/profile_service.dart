import 'dart:io';

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/common_models.dart';
import '../../models/profile_models.dart';

part 'profile_service.g.dart';

@RestApi()
abstract class ProfileService {
  factory ProfileService(Dio dio, {String? baseUrl}) = _ProfileService;

  @GET('/investor/me')
  Future<InvestorResponse> getMe();

  @PATCH('/investor/me')
  Future<InvestorResponse> updateMe(@Body() UpdateProfileBody body);

  @GET('/investor/banks')
  Future<BankListResponse> getBanks();

  @GET('/investor/bank-accounts')
  Future<BankAccountListResponse> getBankAccounts();

  @POST('/investor/bank-accounts')
  Future<BankAccountResponse> addBankAccount(@Body() AddBankAccountBody body);

  @PATCH('/investor/bank-accounts/{id}/primary')
  Future<MessageResponse> setPrimaryBankAccount(@Path('id') String id);

  @DELETE('/investor/bank-accounts/{id}')
  Future<MessageResponse> deleteBankAccount(@Path('id') String id);

  @GET('/investor/kyc')
  Future<KycResponse> getKyc();

  @POST('/investor/kyc/bvn')
  Future<KycResponse> submitBvn(@Body() BvnBody body);

  @POST('/investor/kyc/id')
  @MultiPart()
  Future<KycResponse> uploadIdDocument(@Part(name: 'document') File document);

  @POST('/investor/kyc/address')
  @MultiPart()
  Future<KycResponse> uploadAddressProof(@Part(name: 'document') File document);

  @GET('/investor/settings')
  Future<SettingsResponse> getSettings();

  @PATCH('/investor/settings')
  Future<SettingsResponse> updateSettings(@Body() Map<String, dynamic> body);

  @GET('/investor/notifications')
  Future<NotificationListResponse> getNotifications({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @PATCH('/investor/notifications/read-all')
  Future<MessageResponse> markAllNotificationsRead();

  @PATCH('/investor/notifications/{id}/read')
  Future<MessageResponse> markNotificationRead(@Path('id') String id);

  @GET('/investor/support/faqs')
  Future<FaqListResponse> getFaqs();
}
