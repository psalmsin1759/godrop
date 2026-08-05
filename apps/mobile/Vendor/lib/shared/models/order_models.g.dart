// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OrderCustomer _$OrderCustomerFromJson(Map<String, dynamic> json) =>
    OrderCustomer(
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
    );

Map<String, dynamic> _$OrderCustomerToJson(OrderCustomer instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'lastName': instance.lastName,
    };

OrderItem _$OrderItemFromJson(Map<String, dynamic> json) => OrderItem(
      id: json['id'] as String,
      productId: json['productId'] as String?,
      name: json['name'] as String,
      unitPriceKobo: (json['unitPriceKobo'] as num).toInt(),
      quantity: (json['quantity'] as num).toInt(),
      totalKobo: (json['totalKobo'] as num).toInt(),
      notes: json['notes'] as String?,
    );

Map<String, dynamic> _$OrderItemToJson(OrderItem instance) => <String, dynamic>{
      'id': instance.id,
      'productId': instance.productId,
      'name': instance.name,
      'unitPriceKobo': instance.unitPriceKobo,
      'quantity': instance.quantity,
      'totalKobo': instance.totalKobo,
      'notes': instance.notes,
    };

OrderEvent _$OrderEventFromJson(Map<String, dynamic> json) => OrderEvent(
      id: json['id'] as String,
      status: json['status'] as String,
      description: json['description'] as String?,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$OrderEventToJson(OrderEvent instance) =>
    <String, dynamic>{
      'id': instance.id,
      'status': instance.status,
      'description': instance.description,
      'createdAt': instance.createdAt,
    };

VendorOrder _$VendorOrderFromJson(Map<String, dynamic> json) => VendorOrder(
      id: json['id'] as String,
      trackingCode: json['trackingCode'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      pickupAddress: json['pickupAddress'] as String,
      dropoffAddress: json['dropoffAddress'] as String,
      paymentMethod: json['paymentMethod'] as String,
      paymentStatus: json['paymentStatus'] as String,
      subtotalKobo: (json['subtotalKobo'] as num?)?.toInt() ?? 0,
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num?)?.toInt() ?? 0,
      serviceFeeKobo: (json['serviceFeeKobo'] as num?)?.toInt() ?? 0,
      discountKobo: (json['discountKobo'] as num?)?.toInt() ?? 0,
      totalKobo: (json['totalKobo'] as num).toInt(),
      notes: json['notes'] as String?,
      cancellationReason: json['cancellationReason'] as String?,
      recipientName: json['recipientName'] as String?,
      createdAt: json['createdAt'] as String,
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      customer: json['customer'] == null
          ? null
          : OrderCustomer.fromJson(json['customer'] as Map<String, dynamic>),
      events: (json['events'] as List<dynamic>?)
              ?.map((e) => OrderEvent.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );

Map<String, dynamic> _$VendorOrderToJson(VendorOrder instance) =>
    <String, dynamic>{
      'id': instance.id,
      'trackingCode': instance.trackingCode,
      'type': instance.type,
      'status': instance.status,
      'pickupAddress': instance.pickupAddress,
      'dropoffAddress': instance.dropoffAddress,
      'paymentMethod': instance.paymentMethod,
      'paymentStatus': instance.paymentStatus,
      'subtotalKobo': instance.subtotalKobo,
      'deliveryFeeKobo': instance.deliveryFeeKobo,
      'serviceFeeKobo': instance.serviceFeeKobo,
      'discountKobo': instance.discountKobo,
      'totalKobo': instance.totalKobo,
      'notes': instance.notes,
      'cancellationReason': instance.cancellationReason,
      'recipientName': instance.recipientName,
      'createdAt': instance.createdAt,
      'items': instance.items,
      'customer': instance.customer,
      'events': instance.events,
    };

OrderListResponse _$OrderListResponseFromJson(Map<String, dynamic> json) =>
    OrderListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => VendorOrder.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: (json['total'] as num?)?.toInt() ?? 0,
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 20,
    );

Map<String, dynamic> _$OrderListResponseToJson(OrderListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'total': instance.total,
      'page': instance.page,
      'limit': instance.limit,
    };

OrderResponse _$OrderResponseFromJson(Map<String, dynamic> json) =>
    OrderResponse(
      data: VendorOrder.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$OrderResponseToJson(OrderResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

OrderReasonBody _$OrderReasonBodyFromJson(Map<String, dynamic> json) =>
    OrderReasonBody(
      reason: json['reason'] as String?,
    );

Map<String, dynamic> _$OrderReasonBodyToJson(OrderReasonBody instance) =>
    <String, dynamic>{
      if (instance.reason case final value?) 'reason': value,
    };
