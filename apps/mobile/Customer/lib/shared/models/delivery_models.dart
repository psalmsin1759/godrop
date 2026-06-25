// Models for parcel and truck delivery flows
import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'delivery_models.g.dart';

// ── Parcel ────────────────────────────────────────────────────────────────────

@JsonSerializable()
class ParcelVehicleType {
  final String id;
  final String name;
  final String? description;
  final String? imageUrl;
  final int baseFeeKobo;
  final int perKmKobo;
  final bool? isActive;

  const ParcelVehicleType({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
    required this.baseFeeKobo,
    required this.perKmKobo,
    this.isActive,
  });

  factory ParcelVehicleType.fromJson(Map<String, dynamic> json) =>
      _$ParcelVehicleTypeFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelVehicleTypeToJson(this);
}

@JsonSerializable()
class ParcelVehicleTypesResponse {
  final List<ParcelVehicleType> types;

  const ParcelVehicleTypesResponse({required this.types});

  factory ParcelVehicleTypesResponse.fromJson(Map<String, dynamic> json) =>
      _$ParcelVehicleTypesResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelVehicleTypesResponseToJson(this);
}

@JsonSerializable()
class ParcelPriceBreakdown {
  final int deliveryFeeKobo;
  final int serviceFeeKobo;
  final int totalKobo;
  final double? distanceKm;

  const ParcelPriceBreakdown({
    required this.deliveryFeeKobo,
    required this.serviceFeeKobo,
    required this.totalKobo,
    this.distanceKm,
  });

  factory ParcelPriceBreakdown.fromJson(Map<String, dynamic> json) =>
      _$ParcelPriceBreakdownFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelPriceBreakdownToJson(this);
}

@JsonSerializable(includeIfNull: false)
class ParcelQuoteBody {
  final LocationPoint pickup;
  // One entry per parcel destination. A single-parcel order has one entry.
  final List<LocationPoint> dropoffs;
  final String? vehicleTypeId;

  const ParcelQuoteBody({
    required this.pickup,
    required this.dropoffs,
    this.vehicleTypeId,
  });

  factory ParcelQuoteBody.fromJson(Map<String, dynamic> json) =>
      _$ParcelQuoteBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelQuoteBodyToJson(this);
}

@JsonSerializable()
class ParcelLegQuote {
  final int deliveryFeeKobo;
  final double? distanceKm;
  final int? estimatedMinutes;

  const ParcelLegQuote({
    required this.deliveryFeeKobo,
    this.distanceKm,
    this.estimatedMinutes,
  });

  factory ParcelLegQuote.fromJson(Map<String, dynamic> json) =>
      _$ParcelLegQuoteFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelLegQuoteToJson(this);
}

@JsonSerializable()
class ParcelQuoteResponse {
  final ParcelPriceBreakdown priceBreakdown;
  final int estimatedMinutes;
  // Per-parcel breakdown, same order as the request dropoffs.
  final List<ParcelLegQuote> parcels;

  const ParcelQuoteResponse({
    required this.priceBreakdown,
    required this.estimatedMinutes,
    this.parcels = const [],
  });

  factory ParcelQuoteResponse.fromJson(Map<String, dynamic> json) =>
      _$ParcelQuoteResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelQuoteResponseToJson(this);
}

/// A single parcel within an order: its own destination, recipient and
/// optional description / weight.
@JsonSerializable(includeIfNull: false)
class ParcelItemBody {
  final LocationPoint dropoff;
  final String recipientName;
  final String recipientPhone;
  final String? packageDescription;
  final double? weightKg;
  final String? sizeCategory;

  const ParcelItemBody({
    required this.dropoff,
    required this.recipientName,
    required this.recipientPhone,
    this.packageDescription,
    this.weightKg,
    this.sizeCategory,
  });

  factory ParcelItemBody.fromJson(Map<String, dynamic> json) =>
      _$ParcelItemBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelItemBodyToJson(this);
}

@JsonSerializable(includeIfNull: false)
class ParcelOrderBody {
  final LocationPoint pickup;
  final String? vehicleTypeId;
  final String paymentMethod;
  final String? scheduleAt;
  final List<ParcelItemBody> parcels;

  const ParcelOrderBody({
    required this.pickup,
    this.vehicleTypeId,
    required this.paymentMethod,
    this.scheduleAt,
    required this.parcels,
  });

  factory ParcelOrderBody.fromJson(Map<String, dynamic> json) =>
      _$ParcelOrderBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelOrderBodyToJson(this);
}

@JsonSerializable()
class ParcelOrderResponse {
  final Map<String, dynamic> order;

  const ParcelOrderResponse({required this.order});

  factory ParcelOrderResponse.fromJson(Map<String, dynamic> json) =>
      _$ParcelOrderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ParcelOrderResponseToJson(this);
}

// ── Truck ─────────────────────────────────────────────────────────────────────

@JsonSerializable()
class ApartmentType {
  final String id;
  final String name;
  final String? description;
  final int priceKobo;
  final bool? isActive;

  const ApartmentType({
    required this.id,
    required this.name,
    this.description,
    required this.priceKobo,
    this.isActive,
  });

  factory ApartmentType.fromJson(Map<String, dynamic> json) =>
      _$ApartmentTypeFromJson(json);
  Map<String, dynamic> toJson() => _$ApartmentTypeToJson(this);
}

@JsonSerializable()
class TruckPricingResponse {
  final bool? success;
  final List<ApartmentType>? apartmentTypes;
  final int? perKmKobo;
  final int? perLoaderKobo;

  const TruckPricingResponse({
    this.success,
    this.apartmentTypes,
    this.perKmKobo,
    this.perLoaderKobo,
  });

  factory TruckPricingResponse.fromJson(Map<String, dynamic> json) =>
      _$TruckPricingResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TruckPricingResponseToJson(this);
}

@JsonSerializable()
class TruckType {
  final String id;
  final String name;
  final String? description;
  final String? capacity;
  final String? imageUrl;
  final int baseFeeKobo;
  final int? perKmKobo;
  final bool? isActive;

  const TruckType({
    required this.id,
    required this.name,
    this.description,
    this.capacity,
    this.imageUrl,
    required this.baseFeeKobo,
    this.perKmKobo,
    this.isActive,
  });

  factory TruckType.fromJson(Map<String, dynamic> json) =>
      _$TruckTypeFromJson(json);
  Map<String, dynamic> toJson() => _$TruckTypeToJson(this);
}

@JsonSerializable()
class TruckTypesResponse {
  final List<TruckType> types;

  const TruckTypesResponse({required this.types});

  factory TruckTypesResponse.fromJson(Map<String, dynamic> json) =>
      _$TruckTypesResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TruckTypesResponseToJson(this);
}

// Matches PriceBreakdownTruck in the OpenAPI spec
@JsonSerializable()
class TruckPriceBreakdown {
  final int? apartmentCostKobo;
  final double? distanceKm;
  final int? kmCostKobo;
  final int? loadersCostKobo;
  final int? truckCostKobo;
  final int totalKobo;

  const TruckPriceBreakdown({
    this.apartmentCostKobo,
    this.distanceKm,
    this.kmCostKobo,
    this.loadersCostKobo,
    this.truckCostKobo,
    required this.totalKobo,
  });

  factory TruckPriceBreakdown.fromJson(Map<String, dynamic> json) =>
      _$TruckPriceBreakdownFromJson(json);
  Map<String, dynamic> toJson() => _$TruckPriceBreakdownToJson(this);
}

@JsonSerializable(includeIfNull: false)
class TruckQuoteBody {
  final String apartmentTypeId;
  final String? truckTypeId;
  final int? numLoaders;
  final LocationPoint pickup;
  final LocationPoint dropoff;
  final List<LocationPoint>? stops;

  const TruckQuoteBody({
    required this.apartmentTypeId,
    this.truckTypeId,
    this.numLoaders,
    required this.pickup,
    required this.dropoff,
    this.stops,
  });

  factory TruckQuoteBody.fromJson(Map<String, dynamic> json) =>
      _$TruckQuoteBodyFromJson(json);
  Map<String, dynamic> toJson() => _$TruckQuoteBodyToJson(this);
}

@JsonSerializable()
class TruckQuoteResponse {
  final TruckPriceBreakdown priceBreakdown;
  final int estimatedMinutes;

  const TruckQuoteResponse({
    required this.priceBreakdown,
    required this.estimatedMinutes,
  });

  factory TruckQuoteResponse.fromJson(Map<String, dynamic> json) =>
      _$TruckQuoteResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TruckQuoteResponseToJson(this);
}

@JsonSerializable(includeIfNull: false)
class TruckOrderBody {
  final String apartmentTypeId;
  final String? truckTypeId;
  final int? numLoaders;
  final LocationPoint pickup;
  final LocationPoint dropoff;
  final List<LocationPoint>? stops;
  final String? scheduledAt;
  final String paymentMethod;
  final String? notes;

  const TruckOrderBody({
    required this.apartmentTypeId,
    this.truckTypeId,
    this.numLoaders,
    required this.pickup,
    required this.dropoff,
    this.stops,
    this.scheduledAt,
    required this.paymentMethod,
    this.notes,
  });

  factory TruckOrderBody.fromJson(Map<String, dynamic> json) =>
      _$TruckOrderBodyFromJson(json);
  Map<String, dynamic> toJson() => _$TruckOrderBodyToJson(this);
}

@JsonSerializable()
class TruckOrderResponse {
  final Map<String, dynamic> order;

  const TruckOrderResponse({required this.order});

  factory TruckOrderResponse.fromJson(Map<String, dynamic> json) =>
      _$TruckOrderResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TruckOrderResponseToJson(this);
}
