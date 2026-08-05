import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import '../../../shared/services/push_notification_service.dart';
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
      if (data['requiresPasswordSetup'] == true) {
        emit(AuthPasswordSetupRequired(data['riderId'] as String));
        return;
      }
      await _handleAuthenticated(data);
    } on DioException catch (e) {
      emit(AuthError(_parseError(e)));
    }
  }

  Future<void> loginWithPassword(String identifier, String password) async {
    emit(const AuthLoading());
    try {
      final data = await _authService
          .passwordLogin({'identifier': identifier, 'password': password})
          as Map<String, dynamic>;
      await _handleAuthenticated(data);
    } on DioException catch (e) {
      emit(AuthError(_parseError(e)));
    }
  }

  Future<void> setPassword(String riderId, String password) async {
    emit(const AuthLoading());
    try {
      final data = await _authService
          .setPassword({'riderId': riderId, 'password': password})
          as Map<String, dynamic>;
      await _handleAuthenticated(data);
    } on DioException catch (e) {
      emit(AuthError(_parseError(e)));
    }
  }

  Future<void> forgotPassword(String email) async {
    emit(const AuthLoading());
    try {
      await _authService.forgotPassword({'email': email});
      emit(const AuthForgotPasswordSent());
    } on DioException catch (e) {
      emit(AuthError(_parseError(e)));
    }
  }

  Future<void> _handleAuthenticated(Map<String, dynamic> data) async {
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
    RiderPushNotificationService.init();
  }

  Future<void> logout() async {
    await RiderPushNotificationService.removeToken();
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
    final message = e.response?.data?['error'];
    if (message is String && message.isNotEmpty) return message;
    final statusCode = e.response?.statusCode;
    if (statusCode == 404) return 'No rider account found for this number.';
    if (statusCode == 400) return 'Invalid or expired OTP. Please try again.';
    if (statusCode == 403) {
      return 'Your account has been deactivated. Contact support.';
    }
    return 'Something went wrong. Please try again.';
  }
}
