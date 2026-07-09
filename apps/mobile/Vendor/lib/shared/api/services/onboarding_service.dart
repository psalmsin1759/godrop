import 'dart:convert';
import 'package:dio/dio.dart';

/// Unauthenticated vendor application: `POST /vendor` (multipart).
/// Plain Dio — retrofit's multipart codegen adds little for one endpoint.
class OnboardingService {
  final Dio _dio;
  OnboardingService(this._dio);

  Future<void> apply({
    required String name,
    required String type, // RESTAURANT | GROCERY | RETAIL | PHARMACY
    String? description,
    required String address,
    required double lat,
    required double lng,
    required String phone, // +234XXXXXXXXXX
    required String email,
    List<String> cuisines = const [],
    Map<String, dynamic>? openingHours,
    required String ownerFirstName,
    required String ownerLastName,
    required String ownerPassword,
    required String businessRegistrationPath,
    required String governmentIdPath,
    String? utilityBillPath,
  }) async {
    final form = FormData.fromMap({
      'name': name,
      'type': type,
      if (description != null && description.isNotEmpty)
        'description': description,
      'address': address,
      'lat': lat.toString(),
      'lng': lng.toString(),
      'phone': phone,
      'email': email,
      // Multipart fields are strings — the API JSON-decodes these two.
      'cuisines': jsonEncode(cuisines),
      if (openingHours != null) 'openingHours': jsonEncode(openingHours),
      'ownerFirstName': ownerFirstName,
      'ownerLastName': ownerLastName,
      'ownerPassword': ownerPassword,
      'businessRegistration':
          await MultipartFile.fromFile(businessRegistrationPath),
      'governmentId': await MultipartFile.fromFile(governmentIdPath),
      if (utilityBillPath != null)
        'utilityBill': await MultipartFile.fromFile(utilityBillPath),
    });
    await _dio.post(
      '/vendor',
      data: form,
      options: Options(
        contentType: 'multipart/form-data',
        sendTimeout: const Duration(minutes: 3),
      ),
    );
  }
}
