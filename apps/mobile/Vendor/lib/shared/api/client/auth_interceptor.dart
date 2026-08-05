import 'package:dio/dio.dart';
import '../../../app/router.dart';
import '../../services/token_storage.dart';
import '../../services/user_prefs.dart';

class AuthInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await TokenStorage.getToken();
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
    // Wrong-credentials errors on the auth endpoints themselves shouldn't
    // clear the session or redirect — the user is already on that screen.
    if (err.response?.statusCode == 401 &&
        !err.requestOptions.path.contains('/auth/')) {
      await TokenStorage.clear();
      await UserPrefs.clear();
      appRouter.go('/auth/login');
    }
    handler.next(err);
  }
}
