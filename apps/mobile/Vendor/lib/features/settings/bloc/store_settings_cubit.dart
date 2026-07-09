import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/vendor_models.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'store_settings_state.dart';

class StoreSettingsCubit extends Cubit<StoreSettingsState> {
  StoreSettingsCubit() : super(StoreSettingsInitial());

  final _service = SettingsService(DioClient.instance);

  Future<void> load() async {
    emit(StoreSettingsLoading());
    try {
      final res = await _service.getSettings();
      emit(StoreSettingsLoaded(res.data));
    } on DioException catch (e) {
      emit(StoreSettingsError(parseDioError(e)));
    } catch (_) {
      emit(StoreSettingsError('Failed to load store settings.'));
    }
  }

  /// Returns an error message, or null on success.
  Future<String?> save(UpdateVendorSettingsBody body) async {
    final current = state;
    if (current is StoreSettingsLoaded) {
      emit(StoreSettingsLoaded(current.settings, saving: true));
    }
    try {
      final res = await _service.updateSettings(body);
      emit(StoreSettingsLoaded(res.data));
      return null;
    } on DioException catch (e) {
      if (current is StoreSettingsLoaded) {
        emit(StoreSettingsLoaded(current.settings));
      }
      return parseDioError(e);
    } catch (_) {
      if (current is StoreSettingsLoaded) {
        emit(StoreSettingsLoaded(current.settings));
      }
      return 'Could not save settings.';
    }
  }
}
