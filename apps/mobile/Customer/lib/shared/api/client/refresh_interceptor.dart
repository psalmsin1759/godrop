import 'package:dio/dio.dart';
import '../../services/token_storage.dart';

class RefreshInterceptor extends Interceptor {
  final Dio _dio;
  final Dio _refreshDio;

  bool _isRefreshing = false;
  final List<(RequestOptions, ErrorInterceptorHandler)> _queue = [];

  RefreshInterceptor({required Dio dio, required Dio refreshDio})
      : _dio = dio,
        _refreshDio = refreshDio;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }
    if (err.requestOptions.path.contains('/auth/')) {
      return handler.next(err);
    }
    if (err.requestOptions.extra['_retried'] == true) {
      return handler.next(err);
    }

    if (_isRefreshing) {
      _queue.add((err.requestOptions, handler));
      return;
    }

    _isRefreshing = true;

    try {
      final refreshToken = await TokenStorage.getRefreshToken();
      if (refreshToken == null) {
        await _failAll(err, handler);
        return;
      }

      final response = await _refreshDio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final data = response.data as Map<String, dynamic>;
      final newAccess = data['accessToken'] as String;
      final newRefresh = data['refreshToken'] as String;

      await TokenStorage.saveTokens(
        accessToken: newAccess,
        refreshToken: newRefresh,
      );

      // Retry original + queued requests with new token
      await _retryRequest(err.requestOptions, newAccess, handler);
      for (final (opts, h) in _queue) {
        await _retryRequest(opts, newAccess, h);
      }
      _queue.clear();
    } catch (_) {
      await TokenStorage.clear();
      await _failAll(err, handler);
    } finally {
      _isRefreshing = false;
    }
  }

  Future<void> _retryRequest(
    RequestOptions options,
    String token,
    ErrorInterceptorHandler handler,
  ) async {
    try {
      options.headers['Authorization'] = 'Bearer $token';
      options.extra['_retried'] = true;
      final response = await _dio.fetch(options);
      handler.resolve(response);
    } catch (e) {
      if (e is DioException) {
        handler.next(e);
      }
    }
  }

  Future<void> _failAll(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    for (final (_, h) in _queue) {
      h.next(err);
    }
    _queue.clear();
    handler.next(err);
  }
}
