import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/restaurant_data.dart';
import 'cart_state.dart';

class CartCubit extends Cubit<CartState> {
  CartCubit() : super(const CartState());

  void addItem({
    required String partnerId,
    required String partnerName,
    required PartnerType partnerType,
    required CartItemData item,
  }) {
    final existing = state.carts[partnerId];
    final currentItems = existing?.items ?? [];

    final idx = currentItems.indexWhere((i) => i.id == item.id);
    List<CartItemData> updated;
    if (idx >= 0) {
      updated = List.from(currentItems);
      updated[idx] = updated[idx].copyWith(quantity: updated[idx].quantity + 1);
    } else {
      updated = [...currentItems, item.copyWith(quantity: 1)];
    }

    final updatedCart = VendorCart(
      partnerId: partnerId,
      partnerName: partnerName,
      partnerType: partnerType,
      items: updated,
    );

    final newCarts = Map<String, VendorCart>.from(state.carts);
    newCarts[partnerId] = updatedCart;
    emit(state.copyWith(carts: newCarts));
  }

  void increment(String partnerId, String itemId) {
    final cart = state.carts[partnerId];
    if (cart == null) return;
    final idx = cart.items.indexWhere((i) => i.id == itemId);
    if (idx < 0) return;
    final updated = List<CartItemData>.from(cart.items);
    updated[idx] = updated[idx].copyWith(quantity: updated[idx].quantity + 1);
    _updateCart(partnerId, cart.copyWith(items: updated));
  }

  void decrement(String partnerId, String itemId) {
    final cart = state.carts[partnerId];
    if (cart == null) return;
    final idx = cart.items.indexWhere((i) => i.id == itemId);
    if (idx < 0) return;
    final updated = List<CartItemData>.from(cart.items);
    if (updated[idx].quantity <= 1) {
      updated.removeAt(idx);
    } else {
      updated[idx] = updated[idx].copyWith(quantity: updated[idx].quantity - 1);
    }
    _updateCart(partnerId, cart.copyWith(items: updated));
  }

  void remove(String partnerId, String itemId) {
    final cart = state.carts[partnerId];
    if (cart == null) return;
    final updated = cart.items.where((i) => i.id != itemId).toList();
    _updateCart(partnerId, cart.copyWith(items: updated));
  }

  void _updateCart(String partnerId, VendorCart updatedCart) {
    final newCarts = Map<String, VendorCart>.from(state.carts);
    newCarts[partnerId] = updatedCart;
    emit(state.copyWith(carts: newCarts));
  }

  void clearVendor(String partnerId) {
    final newCarts = Map<String, VendorCart>.from(state.carts);
    newCarts.remove(partnerId);
    emit(state.copyWith(carts: newCarts));
  }

  void clear() => emit(const CartState());
}
