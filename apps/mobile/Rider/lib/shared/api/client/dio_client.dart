import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'auth_interceptor.dart';
import 'refresh_interceptor.dart';

class DioClient {
  DioClient._();

  static const String _baseUrl =
      'https://godrop-production.up.railway.app/api/v1';

  static Dio? _instance;

  static Dio get instance {
    _instance ??= _create();
    return _instance!;
  }

  static Dio _create() {
    final dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.addAll([
      AuthInterceptor(),
      RefreshInterceptor(dio),
      if (kDebugMode) LogInterceptor(requestBody: true, responseBody: true),
    ]);

    return dio;
  }
}
