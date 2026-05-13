import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../food/models/restaurant_data.dart';
import '../models/partner_item.dart';
import 'partners_state.dart';

// Default Victoria Island, Lagos coords used when user location is unavailable
const double _kDefaultLat = 6.4281;
const double _kDefaultLng = 3.4219;

class PartnersCubit extends Cubit<PartnersState> {
  final PartnerType partnerType;

  PartnersCubit(this.partnerType) : super(const PartnersState());

  Future<void> load({String? search}) async {
    emit(state.copyWith(status: PartnersStatus.loading));
    try {
      final items = await _fetch(search: search);
      emit(state.copyWith(status: PartnersStatus.success, items: items));
    } catch (e) {
      emit(state.copyWith(
          status: PartnersStatus.failure,
          error: e.toString()));
    }
  }

  Future<List<PartnerItem>> _fetch({String? search}) async {
    final dio = DioClient.instance;
    switch (partnerType) {
      case PartnerType.restaurant:
        final svc = FoodService(dio);
        final resp = await svc.listRestaurants(
          lat: _kDefaultLat,
          lng: _kDefaultLng,
          search: search,
        );
        return resp.data.map(PartnerItem.fromRestaurant).toList();
      case PartnerType.grocery:
        final svc = GroceryService(dio);
        final resp = await svc.listStores(
          lat: _kDefaultLat,
          lng: _kDefaultLng,
          search: search,
        );
        return resp.data
            .map((s) => PartnerItem.fromStore(s, PartnerType.grocery))
            .toList();
      case PartnerType.retail:
        final svc = RetailService(dio);
        final resp = await svc.listStores(
          lat: _kDefaultLat,
          lng: _kDefaultLng,
          search: search,
        );
        return resp.data
            .map((s) => PartnerItem.fromStore(s, PartnerType.retail))
            .toList();
      case PartnerType.pharmacy:
        final svc = PharmacyService(dio);
        final resp = await svc.listPharmacies(
          lat: _kDefaultLat,
          lng: _kDefaultLng,
          search: search,
        );
        return resp.data
            .map((s) => PartnerItem.fromStore(s, PartnerType.pharmacy))
            .toList();
    }
  }
}
