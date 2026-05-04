// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'rider_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RiderProfile _$RiderProfileFromJson(Map<String, dynamic> json) => RiderProfile(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      phone: json['phone'] as String,
      email: json['email'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      gender: json['gender'] as String?,
      streetAddress: json['streetAddress'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      vehicleType: json['vehicleType'] as String?,
      vehiclePlate: json['vehiclePlate'] as String?,
      vehicleColor: json['vehicleColor'] as String?,
      vehicleModel: json['vehicleModel'] as String?,
      vehicleYear: (json['vehicleYear'] as num?)?.toInt(),
      driverLicenseNumber: json['driverLicenseNumber'] as String?,
      driverLicenseExpiry: json['driverLicenseExpiry'] as String?,
      vehicleInsuranceExpiry: json['vehicleInsuranceExpiry'] as String?,
      bankName: json['bankName'] as String?,
      accountNumber: json['accountNumber'] as String?,
      accountName: json['accountName'] as String?,
      kycStatus: json['kycStatus'] as String,
      kycNotes: json['kycNotes'] as String?,
      emergencyContactName: json['emergencyContactName'] as String?,
      emergencyContactPhone: json['emergencyContactPhone'] as String?,
      isAvailable: json['isAvailable'] as bool,
      isActive: json['isActive'] as bool,
      rating: (json['rating'] as num).toDouble(),
      ratingCount: (json['ratingCount'] as num).toInt(),
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );

Map<String, dynamic> _$RiderProfileToJson(RiderProfile instance) =>
    <String, dynamic>{
      'id': instance.id,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'phone': instance.phone,
      'email': instance.email,
      'avatarUrl': instance.avatarUrl,
      'dateOfBirth': instance.dateOfBirth,
      'gender': instance.gender,
      'streetAddress': instance.streetAddress,
      'city': instance.city,
      'state': instance.state,
      'vehicleType': instance.vehicleType,
      'vehiclePlate': instance.vehiclePlate,
      'vehicleColor': instance.vehicleColor,
      'vehicleModel': instance.vehicleModel,
      'vehicleYear': instance.vehicleYear,
      'driverLicenseNumber': instance.driverLicenseNumber,
      'driverLicenseExpiry': instance.driverLicenseExpiry,
      'vehicleInsuranceExpiry': instance.vehicleInsuranceExpiry,
      'bankName': instance.bankName,
      'accountNumber': instance.accountNumber,
      'accountName': instance.accountName,
      'kycStatus': instance.kycStatus,
      'kycNotes': instance.kycNotes,
      'emergencyContactName': instance.emergencyContactName,
      'emergencyContactPhone': instance.emergencyContactPhone,
      'isAvailable': instance.isAvailable,
      'isActive': instance.isActive,
      'rating': instance.rating,
      'ratingCount': instance.ratingCount,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
    };

RiderOrderVendor _$RiderOrderVendorFromJson(Map<String, dynamic> json) =>
    RiderOrderVendor(
      id: json['id'] as String,
      name: json['name'] as String,
      logoUrl: json['logoUrl'] as String?,
      address: json['address'] as String,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
    );

Map<String, dynamic> _$RiderOrderVendorToJson(RiderOrderVendor instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'logoUrl': instance.logoUrl,
      'address': instance.address,
      'lat': instance.lat,
      'lng': instance.lng,
    };

RiderOrder _$RiderOrderFromJson(Map<String, dynamic> json) => RiderOrder(
      id: json['id'] as String,
      trackingCode: json['trackingCode'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      pickupAddress: json['pickupAddress'] as String,
      pickupLat: (json['pickupLat'] as num).toDouble(),
      pickupLng: (json['pickupLng'] as num).toDouble(),
      dropoffAddress: json['dropoffAddress'] as String,
      dropoffLat: (json['dropoffLat'] as num).toDouble(),
      dropoffLng: (json['dropoffLng'] as num).toDouble(),
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num).toInt(),
      totalKobo: (json['totalKobo'] as num).toInt(),
      paymentMethod: json['paymentMethod'] as String,
      recipientName: json['recipientName'] as String?,
      recipientPhone: json['recipientPhone'] as String?,
      vendor: json['vendor'] == null
          ? null
          : RiderOrderVendor.fromJson(json['vendor'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$RiderOrderToJson(RiderOrder instance) =>
    <String, dynamic>{
      'id': instance.id,
      'trackingCode': instance.trackingCode,
      'type': instance.type,
      'status': instance.status,
      'pickupAddress': instance.pickupAddress,
      'pickupLat': instance.pickupLat,
      'pickupLng': instance.pickupLng,
      'dropoffAddress': instance.dropoffAddress,
      'dropoffLat': instance.dropoffLat,
      'dropoffLng': instance.dropoffLng,
      'deliveryFeeKobo': instance.deliveryFeeKobo,
      'totalKobo': instance.totalKobo,
      'paymentMethod': instance.paymentMethod,
      'recipientName': instance.recipientName,
      'recipientPhone': instance.recipientPhone,
      'vendor': instance.vendor,
      'createdAt': instance.createdAt,
    };

RiderOrderItem _$RiderOrderItemFromJson(Map<String, dynamic> json) =>
    RiderOrderItem(
      name: json['name'] as String,
      quantity: (json['quantity'] as num).toInt(),
      unitPriceKobo: (json['unitPriceKobo'] as num).toInt(),
      totalKobo: (json['totalKobo'] as num).toInt(),
      notes: json['notes'] as String?,
    );

Map<String, dynamic> _$RiderOrderItemToJson(RiderOrderItem instance) =>
    <String, dynamic>{
      'name': instance.name,
      'quantity': instance.quantity,
      'unitPriceKobo': instance.unitPriceKobo,
      'totalKobo': instance.totalKobo,
      'notes': instance.notes,
    };

RiderOrderEvent _$RiderOrderEventFromJson(Map<String, dynamic> json) =>
    RiderOrderEvent(
      status: json['status'] as String,
      description: json['description'] as String?,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$RiderOrderEventToJson(RiderOrderEvent instance) =>
    <String, dynamic>{
      'status': instance.status,
      'description': instance.description,
      'createdAt': instance.createdAt,
    };

RiderOrderDetail _$RiderOrderDetailFromJson(Map<String, dynamic> json) =>
    RiderOrderDetail(
      id: json['id'] as String,
      trackingCode: json['trackingCode'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      pickupAddress: json['pickupAddress'] as String,
      pickupLat: (json['pickupLat'] as num).toDouble(),
      pickupLng: (json['pickupLng'] as num).toDouble(),
      dropoffAddress: json['dropoffAddress'] as String,
      dropoffLat: (json['dropoffLat'] as num).toDouble(),
      dropoffLng: (json['dropoffLng'] as num).toDouble(),
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num).toInt(),
      totalKobo: (json['totalKobo'] as num).toInt(),
      paymentMethod: json['paymentMethod'] as String,
      recipientName: json['recipientName'] as String?,
      recipientPhone: json['recipientPhone'] as String?,
      vendor: json['vendor'] == null
          ? null
          : RiderOrderVendor.fromJson(json['vendor'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String,
      items: (json['items'] as List<dynamic>)
          .map((e) => RiderOrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      events: (json['events'] as List<dynamic>)
          .map((e) => RiderOrderEvent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$RiderOrderDetailToJson(RiderOrderDetail instance) =>
    <String, dynamic>{
      'id': instance.id,
      'trackingCode': instance.trackingCode,
      'type': instance.type,
      'status': instance.status,
      'pickupAddress': instance.pickupAddress,
      'pickupLat': instance.pickupLat,
      'pickupLng': instance.pickupLng,
      'dropoffAddress': instance.dropoffAddress,
      'dropoffLat': instance.dropoffLat,
      'dropoffLng': instance.dropoffLng,
      'deliveryFeeKobo': instance.deliveryFeeKobo,
      'totalKobo': instance.totalKobo,
      'paymentMethod': instance.paymentMethod,
      'recipientName': instance.recipientName,
      'recipientPhone': instance.recipientPhone,
      'vendor': instance.vendor,
      'createdAt': instance.createdAt,
      'items': instance.items,
      'events': instance.events,
    };

EarningOrder _$EarningOrderFromJson(Map<String, dynamic> json) => EarningOrder(
      id: json['id'] as String,
      trackingCode: json['trackingCode'] as String,
      type: json['type'] as String,
      pickupAddress: json['pickupAddress'] as String,
      dropoffAddress: json['dropoffAddress'] as String,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$EarningOrderToJson(EarningOrder instance) =>
    <String, dynamic>{
      'id': instance.id,
      'trackingCode': instance.trackingCode,
      'type': instance.type,
      'pickupAddress': instance.pickupAddress,
      'dropoffAddress': instance.dropoffAddress,
      'createdAt': instance.createdAt,
    };

RiderEarning _$RiderEarningFromJson(Map<String, dynamic> json) => RiderEarning(
      id: json['id'] as String,
      amountKobo: (json['amountKobo'] as num).toInt(),
      status: json['status'] as String,
      settledAt: json['settledAt'] as String?,
      createdAt: json['createdAt'] as String,
      order: json['order'] == null
          ? null
          : EarningOrder.fromJson(json['order'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$RiderEarningToJson(RiderEarning instance) =>
    <String, dynamic>{
      'id': instance.id,
      'amountKobo': instance.amountKobo,
      'status': instance.status,
      'settledAt': instance.settledAt,
      'createdAt': instance.createdAt,
      'order': instance.order,
    };

RiderEarningsSummary _$RiderEarningsSummaryFromJson(
        Map<String, dynamic> json) =>
    RiderEarningsSummary(
      totalKobo: (json['totalKobo'] as num).toInt(),
      todayKobo: (json['todayKobo'] as num).toInt(),
      thisWeekKobo: (json['thisWeekKobo'] as num).toInt(),
      thisMonthKobo: (json['thisMonthKobo'] as num).toInt(),
      pendingBalanceKobo: (json['pendingBalanceKobo'] as num).toInt(),
      deliveryCount: (json['deliveryCount'] as num).toInt(),
    );

Map<String, dynamic> _$RiderEarningsSummaryToJson(
        RiderEarningsSummary instance) =>
    <String, dynamic>{
      'totalKobo': instance.totalKobo,
      'todayKobo': instance.todayKobo,
      'thisWeekKobo': instance.thisWeekKobo,
      'thisMonthKobo': instance.thisMonthKobo,
      'pendingBalanceKobo': instance.pendingBalanceKobo,
      'deliveryCount': instance.deliveryCount,
    };

RiderWithdrawal _$RiderWithdrawalFromJson(Map<String, dynamic> json) =>
    RiderWithdrawal(
      id: json['id'] as String,
      amountKobo: (json['amountKobo'] as num).toInt(),
      bankName: json['bankName'] as String,
      accountNumber: json['accountNumber'] as String,
      accountName: json['accountName'] as String,
      status: json['status'] as String,
      notes: json['notes'] as String?,
      processedAt: json['processedAt'] as String?,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$RiderWithdrawalToJson(RiderWithdrawal instance) =>
    <String, dynamic>{
      'id': instance.id,
      'amountKobo': instance.amountKobo,
      'bankName': instance.bankName,
      'accountNumber': instance.accountNumber,
      'accountName': instance.accountName,
      'status': instance.status,
      'notes': instance.notes,
      'processedAt': instance.processedAt,
      'createdAt': instance.createdAt,
    };

RiderNotification _$RiderNotificationFromJson(Map<String, dynamic> json) =>
    RiderNotification(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      data: json['data'] as Map<String, dynamic>?,
      isRead: json['isRead'] as bool,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$RiderNotificationToJson(RiderNotification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'body': instance.body,
      'data': instance.data,
      'isRead': instance.isRead,
      'createdAt': instance.createdAt,
    };
