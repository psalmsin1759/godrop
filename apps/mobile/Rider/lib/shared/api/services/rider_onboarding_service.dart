import 'dart:convert';
import 'package:dio/dio.dart';

/// Unauthenticated rider application: `POST /rider/onboard` (multipart).
/// Plain Dio — retrofit's multipart codegen adds little for one endpoint.
class RiderOnboardingService {
  final Dio _dio;
  RiderOnboardingService(this._dio);

  Future<void> apply({
    required String firstName,
    required String lastName,
    required String phone, // +234XXXXXXXXXX
    String? email,
    String? dateOfBirth, // YYYY-MM-DD
    String? gender, // MALE | FEMALE | OTHER
    String? streetAddress,
    String? city,
    String? state,
    required String vehicleType, // BICYCLE | MOTORCYCLE | CAR | VAN
    String? vehiclePlate,
    String? vehicleColor,
    String? vehicleModel,
    int? vehicleYear,
    String? driverLicenseNumber,
    String? driverLicenseExpiry, // YYYY-MM-DD
    String? vehicleInsuranceExpiry, // YYYY-MM-DD
    String? bvn,
    String? nin,
    Map<String, String>? guarantor, // {name, phone, address}
    required String avatarPath,
    String? governmentIdPath,
    List<String> vehiclePaperPaths = const [],
    String? guarantorGovernmentIdPath,
  }) async {
    final form = FormData.fromMap({
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      if (email != null && email.isNotEmpty) 'email': email,
      if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
      if (gender != null) 'gender': gender,
      if (streetAddress != null && streetAddress.isNotEmpty)
        'streetAddress': streetAddress,
      if (city != null && city.isNotEmpty) 'city': city,
      if (state != null && state.isNotEmpty) 'state': state,
      'vehicleType': vehicleType,
      if (vehiclePlate != null && vehiclePlate.isNotEmpty)
        'vehiclePlate': vehiclePlate,
      if (vehicleColor != null && vehicleColor.isNotEmpty)
        'vehicleColor': vehicleColor,
      if (vehicleModel != null && vehicleModel.isNotEmpty)
        'vehicleModel': vehicleModel,
      if (vehicleYear != null) 'vehicleYear': vehicleYear.toString(),
      if (driverLicenseNumber != null && driverLicenseNumber.isNotEmpty)
        'driverLicenseNumber': driverLicenseNumber,
      if (driverLicenseExpiry != null)
        'driverLicenseExpiry': driverLicenseExpiry,
      if (vehicleInsuranceExpiry != null)
        'vehicleInsuranceExpiry': vehicleInsuranceExpiry,
      if (bvn != null && bvn.isNotEmpty) 'bvn': bvn,
      if (nin != null && nin.isNotEmpty) 'nin': nin,
      if (guarantor != null) 'guarantors': jsonEncode([guarantor]),
      'avatar': await MultipartFile.fromFile(avatarPath),
      if (governmentIdPath != null)
        'governmentId': await MultipartFile.fromFile(governmentIdPath),
      if (vehiclePaperPaths.isNotEmpty)
        // A List value under one key makes FormData.fromMap repeat the
        // field name for each file — required since multer expects
        // several `vehiclePapers` parts, not one field per path.
        'vehiclePapers': await Future.wait(
          vehiclePaperPaths.map((path) => MultipartFile.fromFile(path)),
        ),
      if (guarantorGovernmentIdPath != null)
        'guarantorGovernmentId':
            await MultipartFile.fromFile(guarantorGovernmentIdPath),
    });
    await _dio.post(
      '/rider/onboard',
      data: form,
      options: Options(
        contentType: 'multipart/form-data',
        sendTimeout: const Duration(minutes: 3),
      ),
    );
  }
}
