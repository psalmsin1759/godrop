import 'package:dio/dio.dart';
import '../../../app/router.dart';
import '../../services/token_storage.dart';

/// Attaches the access token and transparently refreshes it once on 401
/// using the rotating refresh token (`POST /investor/auth/refresh`).
class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor(this._dio);

  final Dio _dio;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await TokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final isAuthCall = err.requestOptions.path.contains('/investor/auth/');
    if (err.response?.statusCode != 401 ||
        isAuthCall ||
        err.requestOptions.extra['retried'] == true) {
      return handler.next(err);
    }

    final refreshToken = await TokenStorage.getRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      await TokenStorage.clear();
      _redirectToLogin();
      return handler.next(err);
    }

    try {
      final refreshDio = Dio(BaseOptions(baseUrl: _dio.options.baseUrl));
      final res = await refreshDio.post(
        '/investor/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      final data = res.data as Map<String, dynamic>;
      await TokenStorage.saveTokens(
        accessToken: data['accessToken'] as String,
        refreshToken: data['refreshToken'] as String,
      );

      final retry = err.requestOptions;
      retry.headers['Authorization'] = 'Bearer ${data['accessToken']}';
      retry.extra['retried'] = true;
      final response = await _dio.fetch(retry);
      return handler.resolve(response);
    } catch (_) {
      await TokenStorage.clear();
      _redirectToLogin();
      return handler.next(err);
    }
  }
}

/// Session is no longer valid — bounce the user to the sign-in screen.
void _redirectToLogin() {
  appRouter.go('/auth/sign-in');
}
