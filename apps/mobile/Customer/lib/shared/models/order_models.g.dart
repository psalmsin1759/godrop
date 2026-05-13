// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Order _$OrderFromJson(Map<String, dynamic> json) => Order(
      id: json['id'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      totalKobo: (json['totalKobo'] as num).toInt(),
      createdAt: json['createdAt'] as String,
      trackingCode: json['trackingCode'] as String?,
      pickupAddress: json['pickupAddress'] as String?,
      dropoffAddress: json['dropoffAddress'] as String?,
      confirmationCode: json['confirmationCode'] as String?,
      paymentMethod: json['paymentMethod'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
    );

Map<String, dynamic> _$OrderToJson(Order instance) => <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'status': instance.status,
      'totalKobo': instance.totalKobo,
      'createdAt': instance.createdAt,
      'trackingCode': instance.trackingCode,
      'pickupAddress': instance.pickupAddress,
      'dropoffAddress': instance.dropoffAddress,
      'confirmationCode': instance.confirmationCode,
      'paymentMethod': instance.paymentMethod,
      'paymentStatus': instance.paymentStatus,
    };

OrderListResponse _$OrderListResponseFromJson(Map<String, dynamic> json) =>
    OrderListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$OrderListResponseToJson(OrderListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
    };

OrderEvent _$OrderEventFromJson(Map<String, dynamic> json) => OrderEvent(
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
      description: json['description'] as String?,
    );

Map<String, dynamic> _$OrderEventToJson(OrderEvent instance) =>
    <String, dynamic>{
      'status': instance.status,
      'createdAt': instance.createdAt,
      'description': instance.description,
    };

OrderDetailResponse _$OrderDetailResponseFromJson(Map<String, dynamic> json) =>
    OrderDetailResponse(
      order: Order.fromJson(json['order'] as Map<String, dynamic>),
      items: (json['items'] as List<dynamic>)
          .map((e) => e as Map<String, dynamic>)
          .toList(),
      timeline: (json['timeline'] as List<dynamic>)
          .map((e) => OrderEvent.fromJson(e as Map<String, dynamic>))
          .toList(),
      rider: json['rider'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$OrderDetailResponseToJson(
        OrderDetailResponse instance) =>
    <String, dynamic>{
      'order': instance.order,
      'items': instance.items,
      'timeline': instance.timeline,
      'rider': instance.rider,
    };

CancelOrderBody _$CancelOrderBodyFromJson(Map<String, dynamic> json) =>
    CancelOrderBody(
      reason: json['reason'] as String?,
    );

Map<String, dynamic> _$CancelOrderBodyToJson(CancelOrderBody instance) =>
    <String, dynamic>{
      if (instance.reason case final value?) 'reason': value,
    };

CancelOrderResponse _$CancelOrderResponseFromJson(Map<String, dynamic> json) =>
    CancelOrderResponse(
      order: Order.fromJson(json['order'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$CancelOrderResponseToJson(
        CancelOrderResponse instance) =>
    <String, dynamic>{
      'order': instance.order,
    };

RateOrderBody _$RateOrderBodyFromJson(Map<String, dynamic> json) =>
    RateOrderBody(
      rating: (json['rating'] as num).toInt(),
      comment: json['comment'] as String?,
    );

Map<String, dynamic> _$RateOrderBodyToJson(RateOrderBody instance) =>
    <String, dynamic>{
      'rating': instance.rating,
      if (instance.comment case final value?) 'comment': value,
    };

RateOrderResponse _$RateOrderResponseFromJson(Map<String, dynamic> json) =>
    RateOrderResponse(
      review: json['review'] as Map<String, dynamic>,
    );

Map<String, dynamic> _$RateOrderResponseToJson(RateOrderResponse instance) =>
    <String, dynamic>{
      'review': instance.review,
    };

ReorderResponse _$ReorderResponseFromJson(Map<String, dynamic> json) =>
    ReorderResponse(
      cart: json['cart'] as Map<String, dynamic>,
    );

Map<String, dynamic> _$ReorderResponseToJson(ReorderResponse instance) =>
    <String, dynamic>{
      'cart': instance.cart,
    };

TrackingResponse _$TrackingResponseFromJson(Map<String, dynamic> json) =>
    TrackingResponse(
      riderLat: (json['riderLat'] as num?)?.toDouble(),
      riderLng: (json['riderLng'] as num?)?.toDouble(),
      status: json['status'] as String,
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt(),
      confirmationCode: json['confirmationCode'] as String?,
    );

Map<String, dynamic> _$TrackingResponseToJson(TrackingResponse instance) =>
    <String, dynamic>{
      'riderLat': instance.riderLat,
      'riderLng': instance.riderLng,
      'status': instance.status,
      'estimatedMinutes': instance.estimatedMinutes,
      'confirmationCode': instance.confirmationCode,
    };
