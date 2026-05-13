import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/food_models.dart';
import '../../../shared/models/store_models.dart';
import '../../food/models/restaurant_data.dart';
import 'menu_state.dart';
import '../models/partner_item.dart';


class MenuCubit extends Cubit<MenuState> {
  final PartnerItem partner;

  MenuCubit(this.partner) : super(const MenuState());

  Future<void> load() async {
    emit(state.copyWith(status: MenuStatus.loading));
    try {
      final (cats, rating, deliveryFee, estMin) = await _loadDetail();

      if (cats.isEmpty) {
        emit(state.copyWith(
          status: MenuStatus.success,
          categories: const [],
          loadingCategoryIds: const {},
          rating: rating,
          deliveryFeeKobo: deliveryFee,
          estimatedMinutes: estMin,
        ));
        return;
      }

      // Show all tabs immediately while items are loading.
      emit(state.copyWith(
        status: MenuStatus.success,
        categories: cats,
        loadingCategoryIds: {for (final c in cats) c.id},
        rating: rating,
        deliveryFeeKobo: deliveryFee,
        estimatedMinutes: estMin,
      ));

      // Fetch every category's items in parallel, one request per category.
      final results = await Future.wait(
        cats.map((c) => _fetchCategoryItems(c.id).catchError((_) => <MenuDisplayItem>[])),
      );

      final populated = cats.asMap().entries
          .map((e) => MenuDisplayCategory(
                id: e.value.id,
                name: e.value.name,
                items: results[e.key],
              ))
          .toList();

      emit(state.copyWith(
        categories: populated,
        loadingCategoryIds: const {},
      ));
    } catch (e) {
      emit(state.copyWith(status: MenuStatus.failure, error: e.toString()));
    }
  }

  // ── Detail: fetch vendor info + category list (no items) ───────────────────

  Future<(List<MenuDisplayCategory>, double?, int?, int?)> _loadDetail() async {
    final dio = DioClient.instance;
    final id = partner.id;

    switch (partner.partnerType) {
      case PartnerType.restaurant:
        final detail = await FoodService(dio).getRestaurant(id);
        return (
          detail.categories
              .map((c) => MenuDisplayCategory(id: c.id, name: c.name, items: const []))
              .toList(),
          detail.restaurant.rating,
          detail.restaurant.deliveryFeeKobo,
          detail.restaurant.estimatedMinutes,
        );

      case PartnerType.grocery:
        final detail = await GroceryService(dio).getStore(id);
        return (
          detail.categories
              .map((c) => MenuDisplayCategory(id: c.id, name: c.name, items: const []))
              .toList(),
          detail.store.rating,
          detail.store.deliveryFeeKobo,
          detail.store.estimatedMinutes,
        );

      case PartnerType.retail:
        final detail = await RetailService(dio).getStore(id);
        return (
          detail.categories
              .map((c) => MenuDisplayCategory(id: c.id, name: c.name, items: const []))
              .toList(),
          detail.store.rating,
          detail.store.deliveryFeeKobo,
          detail.store.estimatedMinutes,
        );

      case PartnerType.pharmacy:
        final detail = await PharmacyService(dio).getPharmacy(id);
        return (
          detail.categories
              .map((c) => MenuDisplayCategory(id: c.id, name: c.name, items: const []))
              .toList(),
          detail.pharmacy.rating,
          detail.pharmacy.deliveryFeeKobo,
          detail.pharmacy.estimatedMinutes,
        );

      default:
        throw StateError('Unhandled partner type: ${partner.partnerType}');
    }
  }

  // ── Items: fetch products for a single category ────────────────────────────

  Future<List<MenuDisplayItem>> _fetchCategoryItems(String categoryId) async {
    final dio = DioClient.instance;
    final id = partner.id;

    switch (partner.partnerType) {
      case PartnerType.restaurant:
        final resp = await FoodService(dio).getMenuItems(id, categoryId: categoryId);
        return resp.items
            .map((item) => MenuDisplayItem(
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  priceKobo: item.priceKobo,
                  imageUrl: item.imageUrl,
                  isAvailable: item.isAvailable,
                ))
            .toList();

      case PartnerType.grocery:
        final resp = await GroceryService(dio).getProducts(id, categoryId: categoryId);
        return resp.data
            .map((p) => MenuDisplayItem(
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  priceKobo: p.priceKobo,
                  imageUrl: p.imageUrl,
                ))
            .toList();

      case PartnerType.retail:
        final resp = await RetailService(dio).getProducts(id, categoryId: categoryId);
        return resp.data
            .map((p) => MenuDisplayItem(
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  priceKobo: p.priceKobo,
                  imageUrl: p.imageUrl,
                ))
            .toList();

      case PartnerType.pharmacy:
        final resp = await PharmacyService(dio).getProducts(id, categoryId: categoryId);
        return resp.data
            .map((p) => MenuDisplayItem(
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  priceKobo: p.priceKobo,
                  imageUrl: p.imageUrl,
                ))
            .toList();

      default:
        throw StateError('Unhandled partner type: ${partner.partnerType}');
    }
  }
}
