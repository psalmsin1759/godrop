import 'package:flutter_bloc/flutter_bloc.dart';
import '../api/api.dart';
import '../models/favorites_models.dart';

class FavoritesState {
  final Set<String> vendorIds;
  final bool loading;

  const FavoritesState({this.vendorIds = const {}, this.loading = false});

  FavoritesState copyWith({Set<String>? vendorIds, bool? loading}) {
    return FavoritesState(
      vendorIds: vendorIds ?? this.vendorIds,
      loading: loading ?? this.loading,
    );
  }
}

/// Loads and manages the user's favorited vendors, with optimistic toggling.
class FavoritesCubit extends Cubit<FavoritesState> {
  FavoritesCubit() : super(const FavoritesState()) {
    load();
  }

  final _service = FavoritesService(DioClient.instance);

  Future<void> load() async {
    emit(state.copyWith(loading: true));
    try {
      final res = await _service.listFavorites();
      emit(state.copyWith(vendorIds: res.vendorIds.toSet(), loading: false));
    } catch (_) {
      emit(state.copyWith(loading: false));
    }
  }

  bool isFavorite(String vendorId) => state.vendorIds.contains(vendorId);

  Future<void> toggle(String vendorId) async {
    final isFav = state.vendorIds.contains(vendorId);
    final updated = Set<String>.from(state.vendorIds);
    isFav ? updated.remove(vendorId) : updated.add(vendorId);
    emit(state.copyWith(vendorIds: updated));
    try {
      if (isFav) {
        await _service.removeFavorite(vendorId);
      } else {
        await _service.addFavorite(ToggleFavoriteBody(vendorId: vendorId));
      }
    } catch (_) {
      final reverted = Set<String>.from(state.vendorIds);
      isFav ? reverted.add(vendorId) : reverted.remove(vendorId);
      emit(state.copyWith(vendorIds: reverted));
    }
  }
}
