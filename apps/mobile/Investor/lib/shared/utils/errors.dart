import 'package:dio/dio.dart';

/// Shared Dio error → user message. The API returns `{success:false, error}`.
String parseDioError(DioException e) {
  final data = e.response?.data;
  if (data is Map<String, dynamic>) {
    final msg = data['error'] ?? data['message'];
    if (msg is String && msg.isNotEmpty) return msg;
  }
  return 'Something went wrong. Please try again.';
}
