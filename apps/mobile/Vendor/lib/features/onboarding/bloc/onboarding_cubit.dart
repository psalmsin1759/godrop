import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;

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

  final _service = OnboardingService(DioClient.instance);

  Future<void> submit({
    required String name,
    required String type,
    String? description,
    required String address,
    required double lat,
    required double lng,
    required String phone,
    required String email,
    List<String> cuisines = const [],
    required String ownerFirstName,
    required String ownerLastName,
    required String ownerPassword,
    required String businessRegistrationPath,
    required String governmentIdPath,
    String? utilityBillPath,
  }) async {
    emit(OnboardingSubmitting());
    try {
      await _service.apply(
        name: name,
        type: type,
        description: description,
        address: address,
        lat: lat,
        lng: lng,
        phone: phone,
        email: email,
        cuisines: cuisines,
        ownerFirstName: ownerFirstName,
        ownerLastName: ownerLastName,
        ownerPassword: ownerPassword,
        businessRegistrationPath: businessRegistrationPath,
        governmentIdPath: governmentIdPath,
        utilityBillPath: utilityBillPath,
      );
      emit(OnboardingSubmitted());
    } on DioException catch (e) {
      emit(OnboardingError(parseDioError(e)));
    } catch (_) {
      emit(OnboardingError(
          'Could not submit your application. Please try again.'));
    }
  }

  void reset() => emit(OnboardingIdle());
}
