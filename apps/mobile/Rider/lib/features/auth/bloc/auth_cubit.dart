import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import '../../../shared/services/token_storage.dart';
import '../../../shared/services/rider_prefs.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(const AuthInitial());

  final _authService = RiderAuthService(DioClient.instance);

  Future<void> requestOtp(String phone) async {
    emit(const AuthLoading());
    try {
      await _authService.requestOtp({'phone': phone});
      emit(AuthOtpSent(phone));
    } on DioException catch (e) {
      emit(AuthError(_parseError(e)));
    }
  }

  Future<void> verifyOtp(String phone, String otp) async {
    emit(const AuthLoading());
    try {
      final data = await _authService.verifyOtp({'phone': phone, 'otp': otp})
          as Map<String, dynamic>;
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String;
      final riderJson = data['rider'] as Map<String, dynamic>;
      final rider = RiderProfile.fromJson(riderJson);

      await TokenStorage.saveTokens(
          accessToken: accessToken, refreshToken: refreshToken);
      await RiderPrefs.saveProfile(
        id: rider.id,
        name: rider.fullName,
        phone: rider.phone,
        avatarUrl: rider.avatarUrl,
      );

      emit(AuthAuthenticated(rider));
    } on DioException catch (e) {
      emit(AuthError(_parseError(e)));
    }
  }

  Future<void> logout() async {
    try {
      final refreshToken = await TokenStorage.getRefreshToken();
      if (refreshToken != null) {
        await _authService.logout({'refreshToken': refreshToken});
      }
    } catch (_) {}
    await TokenStorage.clear();
    await RiderPrefs.clear();
    emit(const AuthInitial());
  }

  void reset() => emit(const AuthInitial());

  String _parseError(DioException e) {
    final statusCode = e.response?.statusCode;
    if (statusCode == 404) return 'No rider account found for this number.';
    if (statusCode == 400) return 'Invalid or expired OTP. Please try again.';
    if (statusCode == 403) {
      return 'Your account has been deactivated. Contact support.';
    }
    final message = e.response?.data?['message'];
    if (message is String) return message;
    return 'Something went wrong. Please try again.';
  }
}
