import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/wallet_models.dart';

part 'payment_service.g.dart';

@RestApi()
abstract class PaymentService {
  factory PaymentService(Dio dio, {String? baseUrl}) = _PaymentService;

  @POST('/payments/initialize')
  Future<PaymentInitResponse> initPayment(@Body() PaymentInitBody body);

  @POST('/payments/verify')
  Future<PaymentVerifyResponse> verifyPayment(@Body() PaymentVerifyBody body);
}
