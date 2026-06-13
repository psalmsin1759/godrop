import 'package:flutter_bloc/flutter_bloc.dart';
import '../api/api.dart';
import '../models/common_models.dart';
import '../models/profile_models.dart';

class SavedAddressesState {
  final List<SavedAddress> addresses;
  final bool loading;
  final String? error;

  const SavedAddressesState({
    this.addresses = const [],
    this.loading = false,
    this.error,
  });

  SavedAddress? byLabel(String label) {
    for (final a in addresses) {
      if (a.label.toLowerCase() == label.toLowerCase()) return a;
    }
    return null;
  }

  SavedAddress? get home => byLabel('Home');
  SavedAddress? get work => byLabel('Work');

  SavedAddressesState copyWith({
    List<SavedAddress>? addresses,
    bool? loading,
    String? error,
    bool clearError = false,
  }) {
    return SavedAddressesState(
      addresses: addresses ?? this.addresses,
      loading: loading ?? this.loading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Loads and manages the user's saved addresses (Home, Work, and others)
/// so they can be reused as quick picks when choosing pickup/drop-off points.
class SavedAddressesCubit extends Cubit<SavedAddressesState> {
  SavedAddressesCubit() : super(const SavedAddressesState()) {
    load();
  }

  final _service = ProfileService(DioClient.instance);

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final res = await _service.listAddresses();
      emit(state.copyWith(addresses: res.addresses, loading: false));
    } catch (_) {
      emit(state.copyWith(
          loading: false, error: 'Failed to load saved addresses'));
    }
  }

  /// Saves (or updates) the address with the given [label] — e.g. "Home" or "Work".
  Future<SavedAddress?> saveAddress({
    required String label,
    required String address,
    required double lat,
    required double lng,
  }) async {
    try {
      final existing = state.byLabel(label);
      if (existing != null) {
        final res = await _service.updateAddress(
          existing.id,
          UpdateAddressBody(address: address, lat: lat, lng: lng),
        );
        final saved = SavedAddress.fromJson(res.address);
        emit(state.copyWith(addresses: [
          for (final a in state.addresses)
            if (a.id == saved.id) saved else a
        ]));
        return saved;
      } else {
        final res = await _service.addAddress(AddAddressBody(
          label: label,
          address: address,
          lat: lat,
          lng: lng,
        ));
        final saved = SavedAddress.fromJson(res.address);
        emit(state.copyWith(addresses: [...state.addresses, saved]));
        return saved;
      }
    } catch (_) {
      return null;
    }
  }
}
