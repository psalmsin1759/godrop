import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/profile_models.dart';
import '../../../shared/utils/errors.dart';

sealed class SettingsState extends Equatable {
  const SettingsState();
  @override
  List<Object?> get props => [];
}

class SettingsLoading extends SettingsState {}

class SettingsLoaded extends SettingsState {
  const SettingsLoaded(this.settings, {this.error});
  final InvestorSettings settings;
  final String? error;
  @override
  List<Object?> get props => [settings, error];
}

class SettingsError extends SettingsState {
  const SettingsError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class SettingsCubit extends Cubit<SettingsState> {
  SettingsCubit() : super(SettingsLoading());

  final _profileService = ProfileService(DioClient.instance);

  Future<void> load() async {
    emit(SettingsLoading());
    try {
      final res = await _profileService.getSettings();
      emit(SettingsLoaded(res.data));
    } on DioException catch (e) {
      emit(SettingsError(parseDioError(e)));
    } catch (_) {
      emit(const SettingsError('Something went wrong. Please try again.'));
    }
  }

  /// Optimistic toggle — reverts if the PATCH fails.
  Future<void> toggle(String key, bool value) async {
    final current = state;
    if (current is! SettingsLoaded) return;
    final optimistic = switch (key) {
      'biometricLogin' => current.settings.copyWith(biometricLogin: value),
      'twoFactorAuth' => current.settings.copyWith(twoFactorAuth: value),
      'payoutAlerts' => current.settings.copyWith(payoutAlerts: value),
      'investmentUpdates' => current.settings.copyWith(investmentUpdates: value),
      'promotions' => current.settings.copyWith(promotions: value),
      'emailStatements' => current.settings.copyWith(emailStatements: value),
      _ => current.settings,
    };
    emit(SettingsLoaded(optimistic));
    try {
      final res = await _profileService.updateSettings({key: value});
      emit(SettingsLoaded(res.data));
    } on DioException catch (e) {
      emit(SettingsLoaded(current.settings, error: parseDioError(e)));
    }
  }
}
