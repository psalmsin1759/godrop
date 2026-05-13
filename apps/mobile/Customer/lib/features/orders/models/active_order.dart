import 'dart:math';
import 'package:hive/hive.dart';
import '../../parcel/models/parcel_location.dart';

class ActiveOrderData {
  final String riderName;
  final double riderRating;
  final int riderTrips;
  final String riderVehicleNo;
  final String riderDistance;
  final ParcelLocation pickup;
  final ParcelLocation dropoff;
  final int vehicleIndex;
  // truck-specific (parcel orders leave these null/0)
  final String orderType; // 'parcel' | 'truck' | 'food'
  final String? scheduledDate;
  final String? scheduledTime;
  final String? apartmentType;
  final int loaderCount;

  // food-specific fields (null for parcel/truck orders)
  final String? restaurantName;
  final String? confirmationCode;
  final String? foodSummary;

  const ActiveOrderData({
    required this.riderName,
    required this.riderRating,
    required this.riderTrips,
    required this.riderVehicleNo,
    required this.riderDistance,
    required this.pickup,
    required this.dropoff,
    required this.vehicleIndex,
    this.orderType = 'parcel',
    this.scheduledDate,
    this.scheduledTime,
    this.apartmentType,
    this.loaderCount = 0,
    this.restaurantName,
    this.confirmationCode,
    this.foodSummary,
  });

  // ── Parcel vehicle metadata ──────────────────────────────────────────────
  static const _parcelVehicleLabels = [
    'Bike delivery',
    'Mini Van delivery',
    'Pickup Truck delivery',
  ];
  static const _parcelVehicleTypes = ['Bike', 'Mini Van', 'Pickup Truck'];
  static const _parcelVehiclePrices = ['₦1,450', '₦4,800', '₦8,200'];

  // ── Truck vehicle metadata ───────────────────────────────────────────────
  static const _truckVehicleLabels = [
    'Mini Van',
    'Pickup Truck',
    '3-Ton Truck',
    '10-Ton Truck',
  ];
  static const _truckVehiclePrices = [
    '₦15,000',
    '₦28,500',
    '₦62,000',
    '₦145,000',
  ];

  bool get isTruck => orderType == 'truck';
  bool get isFood => orderType == 'food';
  bool get isGrocery => orderType == 'grocery';
  bool get isRetail => orderType == 'retail';
  bool get isPharmacy => orderType == 'pharmacy';
  // True for any partner order (food, grocery, retail, pharmacy)
  bool get isPartnerOrder => ['food', 'grocery', 'retail', 'pharmacy'].contains(orderType);

  String? get partnerName => restaurantName;

  String get vehicleLabel => isTruck
      ? _truckVehicleLabels[vehicleIndex]
      : _parcelVehicleLabels[vehicleIndex];

  String get vehicleType => isTruck
      ? _truckVehicleLabels[vehicleIndex]
      : _parcelVehicleTypes[vehicleIndex];

  String get vehiclePrice => isTruck
      ? _truckVehiclePrices[vehicleIndex]
      : _parcelVehiclePrices[vehicleIndex];

  double get distanceKm {
    const r = 6371.0;
    final dLat = (dropoff.lat - pickup.lat) * pi / 180;
    final dLng = (dropoff.lng - pickup.lng) * pi / 180;
    final sinDLat = sin(dLat / 2);
    final sinDLng = sin(dLng / 2);
    final a = sinDLat * sinDLat +
        cos(pickup.lat * pi / 180) *
            cos(dropoff.lat * pi / 180) *
            sinDLng *
            sinDLng;
    return r * 2 * atan2(sqrt(a), sqrt(1 - a));
  }

  int get etaMinutes => (distanceKm * 4).round().clamp(5, 120);

  String get riderInitials {
    final parts = riderName.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}';
    return parts[0][0];
  }
}

class ActiveOrderDataAdapter extends TypeAdapter<ActiveOrderData> {
  @override
  final int typeId = 1;

  @override
  ActiveOrderData read(BinaryReader reader) {
    final riderName = reader.readString();
    final riderRating = reader.readDouble();
    final riderTrips = reader.readInt();
    final riderVehicleNo = reader.readString();
    final riderDistance = reader.readString();
    final pickup = reader.read() as ParcelLocation;
    final dropoff = reader.read() as ParcelLocation;
    final vehicleIndex = reader.readInt();
    // New fields — may not exist in old stored data; default gracefully
    String orderType = 'parcel';
    String? scheduledDate;
    String? scheduledTime;
    String? apartmentType;
    int loaderCount = 0;
    try {
      orderType = reader.readString();
      final hasScheduledDate = reader.readBool();
      scheduledDate = hasScheduledDate ? reader.readString() : null;
      final hasScheduledTime = reader.readBool();
      scheduledTime = hasScheduledTime ? reader.readString() : null;
      final hasApartmentType = reader.readBool();
      apartmentType = hasApartmentType ? reader.readString() : null;
      loaderCount = reader.readInt();
      // food-specific fields
      final hasRestaurantName = reader.readBool();
      final restaurantName = hasRestaurantName ? reader.readString() : null;
      final hasConfirmationCode = reader.readBool();
      final confirmationCode = hasConfirmationCode ? reader.readString() : null;
      final hasFoodSummary = reader.readBool();
      final foodSummary = hasFoodSummary ? reader.readString() : null;
      return ActiveOrderData(
        riderName: riderName,
        riderRating: riderRating,
        riderTrips: riderTrips,
        riderVehicleNo: riderVehicleNo,
        riderDistance: riderDistance,
        pickup: pickup,
        dropoff: dropoff,
        vehicleIndex: vehicleIndex,
        orderType: orderType,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTime,
        apartmentType: apartmentType,
        loaderCount: loaderCount,
        restaurantName: restaurantName,
        confirmationCode: confirmationCode,
        foodSummary: foodSummary,
      );
    } catch (_) {
      // old format — use defaults already set above
    }
    return ActiveOrderData(
      riderName: riderName,
      riderRating: riderRating,
      riderTrips: riderTrips,
      riderVehicleNo: riderVehicleNo,
      riderDistance: riderDistance,
      pickup: pickup,
      dropoff: dropoff,
      vehicleIndex: vehicleIndex,
      orderType: orderType,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      apartmentType: apartmentType,
      loaderCount: loaderCount,
    );
  }

  @override
  void write(BinaryWriter writer, ActiveOrderData obj) {
    writer.writeString(obj.riderName);
    writer.writeDouble(obj.riderRating);
    writer.writeInt(obj.riderTrips);
    writer.writeString(obj.riderVehicleNo);
    writer.writeString(obj.riderDistance);
    writer.write(obj.pickup);
    writer.write(obj.dropoff);
    writer.writeInt(obj.vehicleIndex);
    // New fields
    writer.writeString(obj.orderType);
    writer.writeBool(obj.scheduledDate != null);
    if (obj.scheduledDate != null) writer.writeString(obj.scheduledDate!);
    writer.writeBool(obj.scheduledTime != null);
    if (obj.scheduledTime != null) writer.writeString(obj.scheduledTime!);
    writer.writeBool(obj.apartmentType != null);
    if (obj.apartmentType != null) writer.writeString(obj.apartmentType!);
    writer.writeInt(obj.loaderCount);
    // food-specific fields
    writer.writeBool(obj.restaurantName != null);
    if (obj.restaurantName != null) writer.writeString(obj.restaurantName!);
    writer.writeBool(obj.confirmationCode != null);
    if (obj.confirmationCode != null) writer.writeString(obj.confirmationCode!);
    writer.writeBool(obj.foodSummary != null);
    if (obj.foodSummary != null) writer.writeString(obj.foodSummary!);
  }
}
