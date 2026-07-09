import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Investors authenticate with a short-lived access token + rotating
/// refresh token (see `/investor/auth/*` in openapi.yaml).
class TokenStorage {
  TokenStorage._();

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _accessKey = 'godrop_investor_access_token';
  static const _refreshKey = 'godrop_investor_refresh_token';

  static Future<String?> getAccessToken() => _storage.read(key: _accessKey);
  static Future<String?> getRefreshToken() => _storage.read(key: _refreshKey);

  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessKey, value: accessToken);
    await _storage.write(key: _refreshKey, value: refreshToken);
  }

  static Future<void> clear() async {
    await _storage.delete(key: _accessKey);
    await _storage.delete(key: _refreshKey);
  }

  static Future<bool> hasToken() async {
    final token = await getRefreshToken();
    return token != null && token.isNotEmpty;
  }
}
