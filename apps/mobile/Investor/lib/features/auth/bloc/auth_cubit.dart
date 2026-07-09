import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/auth_models.dart';
import '../../../shared/services/token_storage.dart';
import '../../../shared/services/user_prefs.dart';
import '../../../shared/utils/errors.dart';

sealed class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

/// Account created — OTP sent, waiting for verification.
class AuthOtpPending extends AuthState {
  const AuthOtpPending({required this.phone});
  final String phone;
  @override
  List<Object?> get props => [phone];
}

class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.investor);
  final Investor investor;
  @override
  List<Object?> get props => [investor.id];
}

class AuthError extends AuthState {
  const AuthError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class AuthLoggedOut extends AuthState {}

class AuthCubit extends Cubit<AuthState> {
  AuthCubit() : super(AuthInitial());

  final _authService = AuthService(DioClient.instance);

  Future<void> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String password,
  }) async {
    emit(AuthLoading());
    try {
      await _authService.register(RegisterBody(
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password,
      ));
      emit(AuthOtpPending(phone: phone));
    } on DioException catch (e) {
      emit(AuthError(parseDioError(e)));
    } catch (_) {
      emit(const AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> requestOtp(String phone) async {
    try {
      await _authService.requestOtp(OtpRequestBody(phone: phone));
      emit(AuthOtpPending(phone: phone));
    } on DioException catch (e) {
      emit(AuthError(parseDioError(e)));
    }
  }

  Future<void> verifyOtp(String phone, String code) async {
    emit(AuthLoading());
    try {
      final res =
          await _authService.verifyOtp(OtpVerifyBody(phone: phone, code: code));
      await _persistSession(res);
      emit(AuthAuthenticated(res.investor));
    } on DioException catch (e) {
      emit(AuthError(parseDioError(e)));
    } catch (_) {
      emit(const AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> login(String identifier, String password) async {
    emit(AuthLoading());
    try {
      final res = await _authService
          .login(LoginBody(identifier: identifier, password: password));
      await _persistSession(res);
      emit(AuthAuthenticated(res.investor));
    } on DioException catch (e) {
      emit(AuthError(parseDioError(e)));
    } catch (_) {
      emit(const AuthError('Something went wrong. Please try again.'));
    }
  }

  Future<void> logout() async {
    final refreshToken = await TokenStorage.getRefreshToken();
    if (refreshToken != null && refreshToken.isNotEmpty) {
      try {
        await _authService.logout(LogoutBody(refreshToken: refreshToken));
      } catch (_) {
        // Best-effort revoke; local state clears regardless.
      }
    }
    await TokenStorage.clear();
    await UserPrefs.clear();
    emit(AuthLoggedOut());
  }

  Future<void> _persistSession(AuthResponse res) async {
    await TokenStorage.saveTokens(
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    );
    await UserPrefs.saveSession(
      firstName: res.investor.firstName,
      lastName: res.investor.lastName,
      email: res.investor.email,
      phone: res.investor.phone,
    );
  }

  void reset() => emit(AuthInitial());
}
