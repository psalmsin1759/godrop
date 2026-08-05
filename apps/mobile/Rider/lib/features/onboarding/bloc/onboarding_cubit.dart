import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/api/services/rider_onboarding_service.dart';

abstract class OnboardingState {}

class OnboardingIdle extends OnboardingState {}

class OnboardingSubmitting extends OnboardingState {}

class OnboardingSubmitted extends OnboardingState {}

class OnboardingError extends OnboardingState {
  final String message;
  OnboardingError(this.message);
}

class OnboardingCubit extends Cubit<OnboardingState> {
  OnboardingCubit() : super(OnboardingIdle());

  final _service = RiderOnboardingService(DioClient.instance);

  Future<void> submit({
    required String firstName,
    required String lastName,
    required String phone,
    String? email,
    String? dateOfBirth,
    String? gender,
    String? streetAddress,
    String? city,
    String? state,
    required String vehicleType,
    String? vehiclePlate,
    String? vehicleColor,
    String? vehicleModel,
    int? vehicleYear,
    String? driverLicenseNumber,
    String? driverLicenseExpiry,
    String? vehicleInsuranceExpiry,
    String? bvn,
    String? nin,
    Map<String, String>? guarantor,
    required String avatarPath,
    String? governmentIdPath,
    List<String> vehiclePaperPaths = const [],
    String? guarantorGovernmentIdPath,
  }) async {
    emit(OnboardingSubmitting());
    try {
      await _service.apply(
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        dateOfBirth: dateOfBirth,
        gender: gender,
        streetAddress: streetAddress,
        city: city,
        state: state,
        vehicleType: vehicleType,
        vehiclePlate: vehiclePlate,
        vehicleColor: vehicleColor,
        vehicleModel: vehicleModel,
        vehicleYear: vehicleYear,
        driverLicenseNumber: driverLicenseNumber,
        driverLicenseExpiry: driverLicenseExpiry,
        vehicleInsuranceExpiry: vehicleInsuranceExpiry,
        bvn: bvn,
        nin: nin,
        guarantor: guarantor,
        avatarPath: avatarPath,
        governmentIdPath: governmentIdPath,
        vehiclePaperPaths: vehiclePaperPaths,
        guarantorGovernmentIdPath: guarantorGovernmentIdPath,
      );
      emit(OnboardingSubmitted());
    } on DioException catch (e) {
      emit(OnboardingError(_parseError(e)));
    } catch (_) {
      emit(OnboardingError(
          'Could not submit your application. Please try again.'));
    }
  }

  void reset() => emit(OnboardingIdle());

  String _parseError(DioException e) {
    final message = e.response?.data?['error'];
    if (message is String && message.isNotEmpty) return message;
    return 'Could not submit your application. Please try again.';
  }
}
