import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/auth_models.dart';
import '../../../shared/services/push_notification_service.dart';
import '../../../shared/services/token_storage.dart';
import '../../../shared/services/user_prefs.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());

  String? _pendingPhone;
  String? get pendingPhone => _pendingPhone;

  final _authService = AuthService(DioClient.instance);

  Future<void> requestOtp(String phone) async {
    emit(AuthLoading());
    try {
      await _authService.requestOtp(OtpRequestBody(phone: phone));
      _pendingPhone = phone;
      emit(AuthOtpSent(phone));
    } on DioException catch (e) {
      emit(AuthError(_parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> verifyOtp(String phone, String code) async {
    emit(AuthLoading());
    try {
      final res = await _authService.verifyOtp(OtpVerifyBody(phone: phone, otp: code));
      _pendingPhone = phone;
      await TokenStorage.saveTokens(
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      );
      if (!res.isNewUser) {
        emit(AuthAuthenticated());
        PushNotificationService.init();
      } else {
        emit(AuthOtpVerified(phone: phone, isNewUser: true));
      }
    } on DioException catch (e) {
      emit(AuthError(_parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> register({
    required String phone,
    required String firstName,
    required String lastName,
    String? email,
    String? referralCode,
    String? password,
  }) async {
    emit(AuthLoading());
    try {
      final res = await _authService.register(RegisterBody(
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        email: (email?.isNotEmpty ?? false) ? email : null,
        referralCode: (referralCode?.isNotEmpty ?? false) ? referralCode : null,
        password: (password?.isNotEmpty ?? false) ? password : null,
      ));
      print('Registration successful: ${res.user}');
      await TokenStorage.saveTokens(
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      );
      await UserPrefs.saveProfile(
        name: '${res.user.firstName} ${res.user.lastName}',
        email: res.user.email ?? email ?? '',
      );
      emit(AuthAuthenticated());
      PushNotificationService.init();
    } on DioException catch (e) {
      emit(AuthError(_parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> loginWithPassword(String identifier, String password) async {
    emit(AuthLoading());
    try {
      final res = await _authService.loginWithPassword(
        PasswordLoginBody(identifier: identifier, password: password),
      );
      await TokenStorage.saveTokens(accessToken: res.accessToken, refreshToken: res.refreshToken);
      emit(AuthAuthenticated());
      PushNotificationService.init();
    } on DioException catch (e) {
      emit(AuthError(_parseDioError(e)));
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
      emit(AuthError(_parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    emit(AuthLoading());
    try {
      await _authService.changePassword(
        ChangePasswordBody(currentPassword: currentPassword, newPassword: newPassword),
      );
      emit(AuthPasswordChanged());
    } on DioException catch (e) {
      emit(AuthError(_parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> deleteAccount() async {
    emit(AuthLoading());
    try {
      await _authService.deleteAccount();
      await _clearLocalData();
      emit(AuthAccountDeleted());
    } on DioException catch (e) {
      emit(AuthError(_parseDioError(e)));
    } catch (_) {
      emit(AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> logout() async {
    await PushNotificationService.removeToken();
    try {
      final refreshToken = await TokenStorage.getRefreshToken();
      if (refreshToken != null) {
        await _authService.logout(LogoutBody(refreshToken: refreshToken));
      }
    } catch (_) {}
    await _clearLocalData();
    emit(AuthLoggedOut());
  }

  Future<void> _clearLocalData() async {
    await TokenStorage.clear();
    await UserPrefs.clear();
  }

  String _parseDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final msg = data['error'] ?? data['message'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return 'Something went wrong. Please try again.';
  }

  void reset() => emit(AuthInitial());
}
