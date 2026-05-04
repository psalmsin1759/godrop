import 'dart:async';
import 'package:dio/dio.dart';
import '../../services/token_storage.dart';

class RefreshInterceptor extends Interceptor {
  final Dio _dio;
  bool _isRefreshing = false;
  final _queue = <Completer<void>>[];

  RefreshInterceptor(this._dio);

  @override
  Future<void> onError(
      DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) {
      handler.next(err);
      return;
    }

    final refreshToken = await TokenStorage.getRefreshToken();
    if (refreshToken == null) {
      await TokenStorage.clear();
      handler.next(err);
      return;
    }

    if (_isRefreshing) {
      final completer = Completer<void>();
      _queue.add(completer);
      await completer.future;
      handler.resolve(await _retry(err.requestOptions));
      return;
    }

    _isRefreshing = true;
    try {
      final response = await _dio.post(
        '/rider/auth/refresh',
        data: {'refreshToken': refreshToken},
        options: Options(extra: {'skipAuth': true}),
      );
      final newAccess = response.data['accessToken'] as String;
      final newRefresh = response.data['refreshToken'] as String;
      await TokenStorage.saveTokens(
          accessToken: newAccess, refreshToken: newRefresh);

      for (final c in _queue) {
        c.complete();
      }
      _queue.clear();
      handler.resolve(await _retry(err.requestOptions));
    } catch (_) {
      await TokenStorage.clear();
      for (final c in _queue) {
        c.completeError(err);
      }
      _queue.clear();
      handler.next(err);
    } finally {
      _isRefreshing = false;
    }
  }

  Future<Response> _retry(RequestOptions options) async {
    final token = await TokenStorage.getAccessToken();
    options.headers['Authorization'] = 'Bearer $token';
    return _dio.fetch(options);
  }
}
