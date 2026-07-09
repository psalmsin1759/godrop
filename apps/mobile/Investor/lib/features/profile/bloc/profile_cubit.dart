import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/auth_models.dart';
import '../../../shared/models/profile_models.dart';
import '../../../shared/utils/errors.dart';

sealed class ProfileState extends Equatable {
  const ProfileState();
  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  const ProfileLoaded(this.investor, {this.saving = false, this.error, this.saved = false});
  final Investor investor;
  final bool saving;
  final String? error;
  final bool saved;
  @override
  List<Object?> get props => [investor, saving, error, saved];
}

class ProfileError extends ProfileState {
  const ProfileError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit() : super(ProfileInitial());

  final _profileService = ProfileService(DioClient.instance);

  Future<void> load() async {
    emit(ProfileLoading());
    try {
      final res = await _profileService.getMe();
      emit(ProfileLoaded(res.data));
    } on DioException catch (e) {
      emit(ProfileError(parseDioError(e)));
    } catch (_) {
      emit(const ProfileError('Something went wrong. Please try again.'));
    }
  }

  Future<bool> update(UpdateProfileBody body) async {
    final current = state;
    if (current is ProfileLoaded) {
      emit(ProfileLoaded(current.investor, saving: true));
    }
    try {
      final res = await _profileService.updateMe(body);
      emit(ProfileLoaded(res.data, saved: true));
      return true;
    } on DioException catch (e) {
      final base = state;
      if (base is ProfileLoaded) {
        emit(ProfileLoaded(base.investor, error: parseDioError(e)));
      }
      return false;
    }
  }
}
