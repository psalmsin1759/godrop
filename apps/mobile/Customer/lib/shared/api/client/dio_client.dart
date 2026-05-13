import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'auth_interceptor.dart';
import 'refresh_interceptor.dart';
import 'dart:io';

class DioClient {
  DioClient._();



  static Dio? _instance;

  static Dio get instance {
    _instance ??= _build();
    return _instance!;
  }

  static Dio _build() {
    final refreshDio = Dio(
      BaseOptions(
        baseUrl: 'https://godrop-production.up.railway.app/api/v1',
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    final dio = Dio(
      BaseOptions(
        baseUrl: 'https://godrop-production.up.railway.app/api/v1',
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    dio.interceptors.addAll([
      AuthInterceptor(),
      RefreshInterceptor(dio: dio, refreshDio: refreshDio),
      if (kDebugMode)
        LogInterceptor(requestBody: true, responseBody: true, logPrint: (o) => debugPrint(o.toString())),
    ]);

    return dio;
  }
}
