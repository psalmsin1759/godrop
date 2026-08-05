import 'package:json_annotation/json_annotation.dart';

part 'order_models.g.dart';

// The vendor must never see a customer's phone number (rider-only); this
// model intentionally has no phone field even if the backend response does.
@JsonSerializable()
class OrderCustomer {
  final String firstName;
  final String lastName;

  const OrderCustomer({
    required this.firstName,
    required this.lastName,
  });

  String get fullName => '$firstName $lastName';

  factory OrderCustomer.fromJson(Map<String, dynamic> json) =>
      _$OrderCustomerFromJson(json);
  Map<String, dynamic> toJson() => _$OrderCustomerToJson(this);
}

@JsonSerializable()
class OrderItem {
  final String id;
  final String? productId;
  final String name;
  final int unitPriceKobo;
  final int quantity;
  final int totalKobo;
  final String? notes;

  const OrderItem({
    required this.id,
    this.productId,
    required this.name,
    required this.unitPriceKobo,
    required this.quantity,
    required this.totalKobo,
    this.notes,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) =>
      _$OrderItemFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemToJson(this);
}

@JsonSerializable()
class OrderEvent {
  final String id;
  final String status;
  final String? description;
  final String createdAt;

  const OrderEvent({
    required this.id,
    required this.status,
    this.description,
    required this.createdAt,
  });

  factory OrderEvent.fromJson(Map<String, dynamic> json) =>
      _$OrderEventFromJson(json);
  Map<String, dynamic> toJson() => _$OrderEventToJson(this);
}

@JsonSerializable()
class VendorOrder {
  final String id;
  final String trackingCode;
  final String type; // FOOD | GROCERY | RETAIL | PHARMACY ...
  final String status;
  final String pickupAddress;
  final String dropoffAddress;
  final String paymentMethod; // CARD | WALLET | CASH | WALLET_CARD
  final String paymentStatus; // PENDING | PAID | REFUNDED | FAILED
  @JsonKey(defaultValue: 0)
  final int subtotalKobo;
  @JsonKey(defaultValue: 0)
  final int deliveryFeeKobo;
  @JsonKey(defaultValue: 0)
  final int serviceFeeKobo;
  @JsonKey(defaultValue: 0)
  final int discountKobo;
  final int totalKobo;
  final String? notes;
  final String? cancellationReason;
  final String? recipientName;
  final String createdAt;
  @JsonKey(defaultValue: [])
  final List<OrderItem> items;
  final OrderCustomer? customer;
  @JsonKey(defaultValue: [])
  final List<OrderEvent> events;

  const VendorOrder({
    required this.id,
    required this.trackingCode,
    required this.type,
    required this.status,
    required this.pickupAddress,
    required this.dropoffAddress,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.subtotalKobo,
    required this.deliveryFeeKobo,
    required this.serviceFeeKobo,
    required this.discountKobo,
    required this.totalKobo,
    this.notes,
    this.cancellationReason,
    this.recipientName,
    required this.createdAt,
    required this.items,
    this.customer,
    required this.events,
  });

  int get itemCount => items.fold(0, (s, i) => s + i.quantity);

  factory VendorOrder.fromJson(Map<String, dynamic> json) =>
      _$VendorOrderFromJson(json);
  Map<String, dynamic> toJson() => _$VendorOrderToJson(this);
}

@JsonSerializable()
class OrderListResponse {
  final List<VendorOrder> data;
  @JsonKey(defaultValue: 0)
  final int total;
  @JsonKey(defaultValue: 1)
  final int page;
  @JsonKey(defaultValue: 20)
  final int limit;

  const OrderListResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory OrderListResponse.fromJson(Map<String, dynamic> json) =>
      _$OrderListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OrderListResponseToJson(this);
}

@JsonSerializable()
class OrderResponse {
  final VendorOrder data;

  const OrderResponse({required this.data});

  factory OrderResponse.fromJson(Map<String, dynamic> json) =>
      _$OrderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OrderResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class OrderReasonBody {
  final String? reason;

  const OrderReasonBody({this.reason});

  factory OrderReasonBody.fromJson(Map<String, dynamic> json) =>
      _$OrderReasonBodyFromJson(json);
  Map<String, dynamic> toJson() => _$OrderReasonBodyToJson(this);
}
