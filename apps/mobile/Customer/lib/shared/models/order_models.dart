import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'order_models.g.dart';

/// A single parcel within a (possibly multi-parcel) order, as returned by the
/// API. Confirmation codes are included for the customer (to share with each
/// recipient).
@JsonSerializable()
class ParcelDropoffModel {
  final String id;
  final int sequence;
  final String address;
  final double lat;
  final double lng;
  final String recipientName;
  final String recipientPhone;
  final String? packageDescription;
  final double? weightKg;
  final String status;
  final String? confirmationCode;
  final int deliveryFeeKobo;
  final int? earningKobo;
  final String? deliveredAt;

  const ParcelDropoffModel({
    required this.id,
    required this.sequence,
    required this.address,
    required this.lat,
    required this.lng,
    required this.recipientName,
    required this.recipientPhone,
    this.packageDescription,
    this.weightKg,
    required this.status,
    this.confirmationCode,
    this.deliveryFeeKobo = 0,
    this.earningKobo,
    this.deliveredAt,
  });

  factory ParcelDropoffModel.fromJson(Map<String, dynamic> json) =>
      _$ParcelDropoffModelFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelDropoffModelToJson(this);
}

@JsonSerializable()
class Order {
  final String id;
  final String type;
  final String status;
  final int totalKobo;
  final String createdAt;
  final String? trackingCode;
  final String? pickupAddress;
  final String? dropoffAddress;
  final String? confirmationCode;
  final String? paymentMethod;
  final String? paymentStatus;
  final List<ParcelDropoffModel>? dropoffs;

  const Order({
    required this.id,
    required this.type,
    required this.status,
    required this.totalKobo,
    required this.createdAt,
    this.trackingCode,
    this.pickupAddress,
    this.dropoffAddress,
    this.confirmationCode,
    this.paymentMethod,
    this.paymentStatus,
    this.dropoffs,
  });

  bool get isMultiParcel => (dropoffs?.length ?? 0) > 1;

  factory Order.fromJson(Map<String, dynamic> json) =>
      _$OrderFromJson(json);
  Map<String, dynamic> toJson() => _$OrderToJson(this);
}

@JsonSerializable()
class OrderListResponse {
  final List<Order> data;
  final Pagination meta;

  const OrderListResponse({required this.data, required this.meta});

  factory OrderListResponse.fromJson(Map<String, dynamic> json) =>
      _$OrderListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OrderListResponseToJson(this);
}

@JsonSerializable()
class OrderEvent {
  final String status;
  final String createdAt;
  final String? description;

  const OrderEvent({
    required this.status,
    required this.createdAt,
    this.description,
  });

  factory OrderEvent.fromJson(Map<String, dynamic> json) =>
      _$OrderEventFromJson(json);
  Map<String, dynamic> toJson() => _$OrderEventToJson(this);
}

@JsonSerializable()
class OrderDetailResponse {
  final Order order;
  final List<Map<String, dynamic>> items;
  final List<OrderEvent> timeline;
  final Map<String, dynamic>? rider;

  const OrderDetailResponse({
    required this.order,
    required this.items,
    required this.timeline,
    this.rider,
  });

  factory OrderDetailResponse.fromJson(Map<String, dynamic> json) =>
      _$OrderDetailResponseFromJson(json);
  Map<String, dynamic> toJson() => _$OrderDetailResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class CancelOrderBody {
  final String? reason;

  const CancelOrderBody({this.reason});

  factory CancelOrderBody.fromJson(Map<String, dynamic> json) =>
      _$CancelOrderBodyFromJson(json);
  Map<String, dynamic> toJson() => _$CancelOrderBodyToJson(this);
}

@JsonSerializable()
class CancelOrderResponse {
  final Order order;

  const CancelOrderResponse({required this.order});

  factory CancelOrderResponse.fromJson(Map<String, dynamic> json) =>
      _$CancelOrderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$CancelOrderResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class RateOrderBody {
  final int rating;
  final String? comment;

  const RateOrderBody({required this.rating, this.comment});

  factory RateOrderBody.fromJson(Map<String, dynamic> json) =>
      _$RateOrderBodyFromJson(json);
  Map<String, dynamic> toJson() => _$RateOrderBodyToJson(this);
}

@JsonSerializable()
class RateOrderResponse {
  final Map<String, dynamic> review;

  const RateOrderResponse({required this.review});

  factory RateOrderResponse.fromJson(Map<String, dynamic> json) =>
      _$RateOrderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RateOrderResponseToJson(this);
}

@JsonSerializable()
class ReorderResponse {
  final Map<String, dynamic> cart;

  const ReorderResponse({required this.cart});

  factory ReorderResponse.fromJson(Map<String, dynamic> json) =>
      _$ReorderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ReorderResponseToJson(this);
}

@JsonSerializable()
class TrackingResponse {
  final double? riderLat;
  final double? riderLng;
  final String status;
  final int? estimatedMinutes;
  final String? confirmationCode;
  final double? pickupLat;
  final double? pickupLng;
  final List<ParcelDropoffModel>? dropoffs;

  const TrackingResponse({
    this.riderLat,
    this.riderLng,
    required this.status,
    this.estimatedMinutes,
    this.confirmationCode,
    this.pickupLat,
    this.pickupLng,
    this.dropoffs,
  });

  factory TrackingResponse.fromJson(Map<String, dynamic> json) =>
      _$TrackingResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TrackingResponseToJson(this);
}
