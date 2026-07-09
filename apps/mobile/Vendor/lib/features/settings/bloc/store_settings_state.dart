import '../../../shared/models/vendor_models.dart';

abstract class StoreSettingsState {}

class StoreSettingsInitial extends StoreSettingsState {}

class StoreSettingsLoading extends StoreSettingsState {}

class StoreSettingsLoaded extends StoreSettingsState {
  final VendorSettings settings;
  final bool saving;
  StoreSettingsLoaded(this.settings, {this.saving = false});
}

class StoreSettingsError extends StoreSettingsState {
  final String message;
  StoreSettingsError(this.message);
}
