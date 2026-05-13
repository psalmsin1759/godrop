import 'package:equatable/equatable.dart';
import '../models/restaurant_data.dart';

class CartItemData extends Equatable {
  final String id;
  final String name;
  final String desc;
  final int priceKobo;
  final String emoji;
  final int quantity;

  const CartItemData({
    required this.id,
    required this.name,
    required this.desc,
    required this.priceKobo,
    this.emoji = '',
    this.quantity = 1,
  });

  CartItemData copyWith({int? quantity}) => CartItemData(
        id: id,
        name: name,
        desc: desc,
        priceKobo: priceKobo,
        emoji: emoji,
        quantity: quantity ?? this.quantity,
      );

  @override
  List<Object?> get props => [id, name, priceKobo, quantity];
}

// ── Per-vendor cart ───────────────────────────────────────────────────────────

class VendorCart extends Equatable {
  final String partnerId;
  final String partnerName;
  final PartnerType partnerType;
  final List<CartItemData> items;

  const VendorCart({
    required this.partnerId,
    required this.partnerName,
    required this.partnerType,
    this.items = const [],
  });

  int get totalItems => items.fold(0, (s, i) => s + i.quantity);
  int get subtotalKobo => items.fold(0, (s, i) => s + i.priceKobo * i.quantity);
  bool get isEmpty => items.isEmpty;

  VendorCart copyWith({List<CartItemData>? items}) => VendorCart(
        partnerId: partnerId,
        partnerName: partnerName,
        partnerType: partnerType,
        items: items ?? this.items,
      );

  @override
  List<Object?> get props => [partnerId, partnerType, items];
}

// ── Multi-vendor cart state ───────────────────────────────────────────────────

class CartState extends Equatable {
  final Map<String, VendorCart> carts; // vendorId → VendorCart

  const CartState({this.carts = const {}});

  int get totalVendors => carts.values.where((c) => !c.isEmpty).length;
  List<VendorCart> get activeCarts =>
      carts.values.where((c) => !c.isEmpty).toList();
  VendorCart? cartFor(String partnerId) => carts[partnerId];

  CartState copyWith({Map<String, VendorCart>? carts}) =>
      CartState(carts: carts ?? this.carts);

  @override
  List<Object?> get props => [carts];
}
