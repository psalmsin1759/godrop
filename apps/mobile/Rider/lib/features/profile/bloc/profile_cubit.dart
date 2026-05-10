import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import '../../../shared/services/rider_prefs.dart';
import 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit() : super(const ProfileInitial());

  final _service = RiderProfileService(DioClient.instance);

  Future<void> loadProfile() async {
    emit(const ProfileLoading());
    try {
      final data = await _service.getProfile() as Map<String, dynamic>;
      final profile = RiderProfile.fromJson(data['data'] as Map<String, dynamic>);
      emit(ProfileLoaded(profile));
    } on DioException catch (e) {
      emit(ProfileError(_parseError(e)));
    }
  }

  Future<void> toggleAvailability() async {
    final current = state;
    if (current is! ProfileLoaded) return;
    emit(ProfileSaving(current.profile));
    try {
      final data = await _service
          .setAvailability({'isAvailable': !current.profile.isAvailable})
          as Map<String, dynamic>;
      final profile = RiderProfile.fromJson(data['data'] as Map<String, dynamic>);
      await RiderPrefs.saveProfile(
        id: profile.id,
        name: profile.fullName,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      );
      emit(ProfileLoaded(profile));
    } on DioException catch (e) {
      emit(ProfileError(_parseError(e)));
    }
  }

  Future<void> updateBankAccount({
    required String bankName,
    required String bankCode,
    required String accountNumber,
    required String accountName,
  }) async {
    final current = state;
    if (current is! ProfileLoaded) return;
    emit(ProfileSaving(current.profile));
    try {
      final data = await _service.updateBank({
        'bankName': bankName,
        'bankCode': bankCode,
        'accountNumber': accountNumber,
        'accountName': accountName,
      }) as Map<String, dynamic>;
      final profile = RiderProfile.fromJson(data['data'] as Map<String, dynamic>);
      emit(ProfileLoaded(profile));
    } on DioException catch (e) {
      emit(ProfileError(_parseError(e)));
    }
  }

  Future<void> submitKyc(Map<String, dynamic> kycData) async {
    final current = state;
    if (current is! ProfileLoaded) return;
    emit(ProfileSaving(current.profile));
    try {
      final data =
          await _service.submitKyc(kycData) as Map<String, dynamic>;
      final profile = RiderProfile.fromJson(data['data'] as Map<String, dynamic>);
      emit(ProfileLoaded(profile));
    } on DioException catch (e) {
      emit(ProfileError(_parseError(e)));
    }
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['error'];
    if (message is String) return message;
    return 'Something went wrong. Please try again.';
  }
}
