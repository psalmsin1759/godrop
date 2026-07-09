import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/admin_models.dart';
import '../../../shared/services/token_storage.dart';
import '../../../shared/services/user_prefs.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());

  final _authService = AuthService(DioClient.instance);

  Future<void> login(String email, String password) async {
    emit(AuthLoading());
    try {
      final res = await _authService
          .login(AdminLoginBody(email: email, password: password));
      if (res.admin.type != 'VENDOR') {
        emit(AuthError(
            'This app is for vendor accounts. Use the dashboard for system admin access.'));
        return;
      }
      await TokenStorage.saveToken(res.token);
      await UserPrefs.saveSession(
        name: res.admin.fullName,
        email: res.admin.email,
        role: res.admin.role,
        vendorName: res.admin.vendor?.name ?? '',
      );
      emit(AuthAuthenticated(res.admin));
    } on DioException catch (e) {
      emit(AuthError(parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> forgotPassword(String email) async {
    emit(AuthLoading());
    try {
      await _authService.forgotPassword(ForgotPasswordBody(email: email));
      emit(AuthForgotPasswordSent());
    } on DioException catch (e) {
      emit(AuthError(parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> resetPassword(String token, String newPassword) async {
    emit(AuthLoading());
    try {
      await _authService.resetPassword(
          ResetPasswordBody(token: token, newPassword: newPassword));
      emit(AuthPasswordReset());
    } on DioException catch (e) {
      emit(AuthError(parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> logout() async {
    await TokenStorage.clear();
    await UserPrefs.clear();
    emit(AuthLoggedOut());
  }

  void reset() => emit(AuthInitial());
}

/// Shared Dio error → user message. The API returns `{success:false, error}`.
String parseDioError(DioException e) {
  final data = e.response?.data;
  if (data is Map<String, dynamic>) {
    final msg = data['error'] ?? data['message'];
    if (msg is String && msg.isNotEmpty) return msg;
  }
  return 'Something went wrong. Please try again.';
}
