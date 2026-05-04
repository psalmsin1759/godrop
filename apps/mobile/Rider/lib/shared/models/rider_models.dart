import 'package:json_annotation/json_annotation.dart';

part 'rider_models.g.dart';

@JsonSerializable()
class RiderProfile {
  final String id;
  final String firstName;
  final String lastName;
  final String phone;
  final String? email;
  final String? avatarUrl;
  final String? dateOfBirth;
  final String? gender;
  final String? streetAddress;
  final String? city;
  final String? state;
  final String? vehicleType;
  final String? vehiclePlate;
  final String? vehicleColor;
  final String? vehicleModel;
  final int? vehicleYear;
  final String? driverLicenseNumber;
  final String? driverLicenseExpiry;
  final String? vehicleInsuranceExpiry;
  final String? bankName;
  final String? accountNumber;
  final String? accountName;
  final String kycStatus;
  final String? kycNotes;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final bool isAvailable;
  final bool isActive;
  final double rating;
  final int ratingCount;
  final String createdAt;
  final String updatedAt;

  const RiderProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.phone,
    this.email,
    this.avatarUrl,
    this.dateOfBirth,
    this.gender,
    this.streetAddress,
    this.city,
    this.state,
    this.vehicleType,
    this.vehiclePlate,
    this.vehicleColor,
    this.vehicleModel,
    this.vehicleYear,
    this.driverLicenseNumber,
    this.driverLicenseExpiry,
    this.vehicleInsuranceExpiry,
    this.bankName,
    this.accountNumber,
    this.accountName,
    required this.kycStatus,
    this.kycNotes,
    this.emergencyContactName,
    this.emergencyContactPhone,
    required this.isAvailable,
    required this.isActive,
    required this.rating,
    required this.ratingCount,
    required this.createdAt,
    required this.updatedAt,
  });

  String get fullName => '$firstName $lastName';

  factory RiderProfile.fromJson(Map<String, dynamic> json) =>
      _$RiderProfileFromJson(json);
  Map<String, dynamic> toJson() => _$RiderProfileToJson(this);
}

@JsonSerializable()
class RiderOrderVendor {
  final String id;
  final String name;
  final String? logoUrl;
  final String address;
  final double lat;
  final double lng;

  const RiderOrderVendor({
    required this.id,
    required this.name,
    this.logoUrl,
    required this.address,
    required this.lat,
    required this.lng,
  });

  factory RiderOrderVendor.fromJson(Map<String, dynamic> json) =>
      _$RiderOrderVendorFromJson(json);
  Map<String, dynamic> toJson() => _$RiderOrderVendorToJson(this);
}

@JsonSerializable()
class RiderOrder {
  final String id;
  final String trackingCode;
  final String type;
  final String status;
  final String pickupAddress;
  final double pickupLat;
  final double pickupLng;
  final String dropoffAddress;
  final double dropoffLat;
  final double dropoffLng;
  final int deliveryFeeKobo;
  final int totalKobo;
  final String paymentMethod;
  final String? recipientName;
  final String? recipientPhone;
  final RiderOrderVendor? vendor;
  final String createdAt;

  const RiderOrder({
    required this.id,
    required this.trackingCode,
    required this.type,
    required this.status,
    required this.pickupAddress,
    required this.pickupLat,
    required this.pickupLng,
    required this.dropoffAddress,
    required this.dropoffLat,
    required this.dropoffLng,
    required this.deliveryFeeKobo,
    required this.totalKobo,
    required this.paymentMethod,
    this.recipientName,
    this.recipientPhone,
    this.vendor,
    required this.createdAt,
  });

  factory RiderOrder.fromJson(Map<String, dynamic> json) =>
      _$RiderOrderFromJson(json);
  Map<String, dynamic> toJson() => _$RiderOrderToJson(this);
}

@JsonSerializable()
class RiderOrderItem {
  final String name;
  final int quantity;
  final int unitPriceKobo;
  final int totalKobo;
  final String? notes;

  const RiderOrderItem({
    required this.name,
    required this.quantity,
    required this.unitPriceKobo,
    required this.totalKobo,
    this.notes,
  });

  factory RiderOrderItem.fromJson(Map<String, dynamic> json) =>
      _$RiderOrderItemFromJson(json);
  Map<String, dynamic> toJson() => _$RiderOrderItemToJson(this);
}

@JsonSerializable()
class RiderOrderEvent {
  final String status;
  final String? description;
  final String createdAt;

  const RiderOrderEvent({
    required this.status,
    this.description,
    required this.createdAt,
  });

  factory RiderOrderEvent.fromJson(Map<String, dynamic> json) =>
      _$RiderOrderEventFromJson(json);
  Map<String, dynamic> toJson() => _$RiderOrderEventToJson(this);
}

@JsonSerializable()
class RiderOrderDetail extends RiderOrder {
  final List<RiderOrderItem> items;
  final List<RiderOrderEvent> events;

  const RiderOrderDetail({
    required super.id,
    required super.trackingCode,
    required super.type,
    required super.status,
    required super.pickupAddress,
    required super.pickupLat,
    required super.pickupLng,
    required super.dropoffAddress,
    required super.dropoffLat,
    required super.dropoffLng,
    required super.deliveryFeeKobo,
    required super.totalKobo,
    required super.paymentMethod,
    super.recipientName,
    super.recipientPhone,
    super.vendor,
    required super.createdAt,
    required this.items,
    required this.events,
  });

  factory RiderOrderDetail.fromJson(Map<String, dynamic> json) =>
      _$RiderOrderDetailFromJson(json);
  @override
  Map<String, dynamic> toJson() => _$RiderOrderDetailToJson(this);
}

@JsonSerializable()
class EarningOrder {
  final String id;
  final String trackingCode;
  final String type;
  final String pickupAddress;
  final String dropoffAddress;
  final String createdAt;

  const EarningOrder({
    required this.id,
    required this.trackingCode,
    required this.type,
    required this.pickupAddress,
    required this.dropoffAddress,
    required this.createdAt,
  });

  factory EarningOrder.fromJson(Map<String, dynamic> json) =>
      _$EarningOrderFromJson(json);
  Map<String, dynamic> toJson() => _$EarningOrderToJson(this);
}

@JsonSerializable()
class RiderEarning {
  final String id;
  final int amountKobo;
  final String status;
  final String? settledAt;
  final String createdAt;
  final EarningOrder? order;

  const RiderEarning({
    required this.id,
    required this.amountKobo,
    required this.status,
    this.settledAt,
    required this.createdAt,
    this.order,
  });

  factory RiderEarning.fromJson(Map<String, dynamic> json) =>
      _$RiderEarningFromJson(json);
  Map<String, dynamic> toJson() => _$RiderEarningToJson(this);
}

@JsonSerializable()
class RiderEarningsSummary {
  final int totalKobo;
  final int todayKobo;
  final int thisWeekKobo;
  final int thisMonthKobo;
  final int pendingBalanceKobo;
  final int deliveryCount;

  const RiderEarningsSummary({
    required this.totalKobo,
    required this.todayKobo,
    required this.thisWeekKobo,
    required this.thisMonthKobo,
    required this.pendingBalanceKobo,
    required this.deliveryCount,
  });

  factory RiderEarningsSummary.fromJson(Map<String, dynamic> json) =>
      _$RiderEarningsSummaryFromJson(json);
  Map<String, dynamic> toJson() => _$RiderEarningsSummaryToJson(this);
}

@JsonSerializable()
class RiderWithdrawal {
  final String id;
  final int amountKobo;
  final String bankName;
  final String accountNumber;
  final String accountName;
  final String status;
  final String? notes;
  final String? processedAt;
  final String createdAt;

  const RiderWithdrawal({
    required this.id,
    required this.amountKobo,
    required this.bankName,
    required this.accountNumber,
    required this.accountName,
    required this.status,
    this.notes,
    this.processedAt,
    required this.createdAt,
  });

  factory RiderWithdrawal.fromJson(Map<String, dynamic> json) =>
      _$RiderWithdrawalFromJson(json);
  Map<String, dynamic> toJson() => _$RiderWithdrawalToJson(this);
}

@JsonSerializable()
class RiderNotification {
  final String id;
  final String title;
  final String body;
  final Map<String, dynamic>? data;
  final bool isRead;
  final String createdAt;

  const RiderNotification({
    required this.id,
    required this.title,
    required this.body,
    this.data,
    required this.isRead,
    required this.createdAt,
  });

  factory RiderNotification.fromJson(Map<String, dynamic> json) =>
      _$RiderNotificationFromJson(json);
  Map<String, dynamic> toJson() => _$RiderNotificationToJson(this);
}
