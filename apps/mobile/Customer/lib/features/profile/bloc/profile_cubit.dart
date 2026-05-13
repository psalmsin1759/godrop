import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/services/user_prefs.dart';
import 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit() : super(ProfileInitial());

  final _service = ProfileService(DioClient.instance);

  Future<void> load() async {
    if (state is ProfileLoading) return;
    emit(ProfileLoading());
    try {
      final profile = await _service.getProfile();
      final addrRes = await _service.listAddresses();
      await UserPrefs.saveProfile(
        name: '${profile.firstName} ${profile.lastName}',
        email: profile.email ?? '',
      );
      emit(ProfileLoaded(profile: profile, addresses: addrRes.addresses));
    } on DioException catch (e) {
      emit(ProfileError(_parseDioError(e)));
    } catch (_) {
      emit(ProfileError('Failed to load profile. Please try again.'));
    }
  }

  String _parseDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final msg = data['message'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return 'Something went wrong. Please try again.';
  }
}
