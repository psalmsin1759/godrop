import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'auth_interceptor.dart';
import 'refresh_interceptor.dart';

class DioClient {
  DioClient._();

  static Dio? _instance;

  static Dio get instance {
    _instance ??= _create();
    return _instance!;
  }

  static Dio _create() {
    final dio = Dio(
      BaseOptions(
        baseUrl: kDebugMode
            ? 'http://${Platform.isAndroid ? '10.0.2.2' : 'localhost'}:4000/api/v1'
            : 'https://api.godrop.ng/v1',
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
