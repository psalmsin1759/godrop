// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delivery_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ParcelVehicleType _$ParcelVehicleTypeFromJson(Map<String, dynamic> json) =>
    ParcelVehicleType(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
      baseFeeKobo: (json['baseFeeKobo'] as num).toInt(),
      perKmKobo: (json['perKmKobo'] as num).toInt(),
      isActive: json['isActive'] as bool?,
    );

Map<String, dynamic> _$ParcelVehicleTypeToJson(ParcelVehicleType instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'baseFeeKobo': instance.baseFeeKobo,
      'perKmKobo': instance.perKmKobo,
      'isActive': instance.isActive,
    };

ParcelVehicleTypesResponse _$ParcelVehicleTypesResponseFromJson(
        Map<String, dynamic> json) =>
    ParcelVehicleTypesResponse(
      types: (json['types'] as List<dynamic>)
          .map((e) => ParcelVehicleType.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$ParcelVehicleTypesResponseToJson(
        ParcelVehicleTypesResponse instance) =>
    <String, dynamic>{
      'types': instance.types,
    };

ParcelPriceBreakdown _$ParcelPriceBreakdownFromJson(
        Map<String, dynamic> json) =>
    ParcelPriceBreakdown(
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num).toInt(),
      serviceFeeKobo: (json['serviceFeeKobo'] as num).toInt(),
      totalKobo: (json['totalKobo'] as num).toInt(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
    );

Map<String, dynamic> _$ParcelPriceBreakdownToJson(
        ParcelPriceBreakdown instance) =>
    <String, dynamic>{
      'deliveryFeeKobo': instance.deliveryFeeKobo,
      'serviceFeeKobo': instance.serviceFeeKobo,
      'totalKobo': instance.totalKobo,
      'distanceKm': instance.distanceKm,
    };

ParcelQuoteBody _$ParcelQuoteBodyFromJson(Map<String, dynamic> json) =>
    ParcelQuoteBody(
      pickup: LocationPoint.fromJson(json['pickup'] as Map<String, dynamic>),
      dropoffs: (json['dropoffs'] as List<dynamic>)
          .map((e) => LocationPoint.fromJson(e as Map<String, dynamic>))
          .toList(),
      vehicleTypeId: json['vehicleTypeId'] as String?,
    );

Map<String, dynamic> _$ParcelQuoteBodyToJson(ParcelQuoteBody instance) =>
    <String, dynamic>{
      'pickup': instance.pickup,
      'dropoffs': instance.dropoffs,
      if (instance.vehicleTypeId case final value?) 'vehicleTypeId': value,
    };

ParcelLegQuote _$ParcelLegQuoteFromJson(Map<String, dynamic> json) =>
    ParcelLegQuote(
      deliveryFeeKobo: (json['deliveryFeeKobo'] as num).toInt(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      estimatedMinutes: (json['estimatedMinutes'] as num?)?.toInt(),
    );

Map<String, dynamic> _$ParcelLegQuoteToJson(ParcelLegQuote instance) =>
    <String, dynamic>{
      'deliveryFeeKobo': instance.deliveryFeeKobo,
      'distanceKm': instance.distanceKm,
      'estimatedMinutes': instance.estimatedMinutes,
    };

ParcelQuoteResponse _$ParcelQuoteResponseFromJson(Map<String, dynamic> json) =>
    ParcelQuoteResponse(
      priceBreakdown: ParcelPriceBreakdown.fromJson(
          json['priceBreakdown'] as Map<String, dynamic>),
      estimatedMinutes: (json['estimatedMinutes'] as num).toInt(),
      parcels: (json['parcels'] as List<dynamic>?)
              ?.map((e) => ParcelLegQuote.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$ParcelQuoteResponseToJson(
        ParcelQuoteResponse instance) =>
    <String, dynamic>{
      'priceBreakdown': instance.priceBreakdown,
      'estimatedMinutes': instance.estimatedMinutes,
      'parcels': instance.parcels,
    };

ParcelItemBody _$ParcelItemBodyFromJson(Map<String, dynamic> json) =>
    ParcelItemBody(
      dropoff: LocationPoint.fromJson(json['dropoff'] as Map<String, dynamic>),
      recipientName: json['recipientName'] as String,
      recipientPhone: json['recipientPhone'] as String,
      packageDescription: json['packageDescription'] as String?,
      weightKg: (json['weightKg'] as num?)?.toDouble(),
      sizeCategory: json['sizeCategory'] as String?,
    );

Map<String, dynamic> _$ParcelItemBodyToJson(ParcelItemBody instance) =>
    <String, dynamic>{
      'dropoff': instance.dropoff,
      'recipientName': instance.recipientName,
      'recipientPhone': instance.recipientPhone,
      if (instance.packageDescription case final value?)
        'packageDescription': value,
      if (instance.weightKg case final value?) 'weightKg': value,
      if (instance.sizeCategory case final value?) 'sizeCategory': value,
    };

ParcelOrderBody _$ParcelOrderBodyFromJson(Map<String, dynamic> json) =>
    ParcelOrderBody(
      pickup: LocationPoint.fromJson(json['pickup'] as Map<String, dynamic>),
      vehicleTypeId: json['vehicleTypeId'] as String?,
      paymentMethod: json['paymentMethod'] as String,
      scheduleAt: json['scheduleAt'] as String?,
      parcels: (json['parcels'] as List<dynamic>)
          .map((e) => ParcelItemBody.fromJson(e as Map<String, dynamic>))
          .toList(),
      couponCode: json['couponCode'] as String?,
    );

Map<String, dynamic> _$ParcelOrderBodyToJson(ParcelOrderBody instance) =>
    <String, dynamic>{
      'pickup': instance.pickup,
      if (instance.vehicleTypeId case final value?) 'vehicleTypeId': value,
      'paymentMethod': instance.paymentMethod,
      if (instance.scheduleAt case final value?) 'scheduleAt': value,
      'parcels': instance.parcels,
      if (instance.couponCode case final value?) 'couponCode': value,
    };

ParcelOrderResponse _$ParcelOrderResponseFromJson(Map<String, dynamic> json) =>
    ParcelOrderResponse(
      order: json['order'] as Map<String, dynamic>,
    );

Map<String, dynamic> _$ParcelOrderResponseToJson(
        ParcelOrderResponse instance) =>
    <String, dynamic>{
      'order': instance.order,
    };

ApartmentType _$ApartmentTypeFromJson(Map<String, dynamic> json) =>
    ApartmentType(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      priceKobo: (json['priceKobo'] as num).toInt(),
      isActive: json['isActive'] as bool?,
    );

Map<String, dynamic> _$ApartmentTypeToJson(ApartmentType instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'priceKobo': instance.priceKobo,
      'isActive': instance.isActive,
    };

TruckPricingResponse _$TruckPricingResponseFromJson(
        Map<String, dynamic> json) =>
    TruckPricingResponse(
      success: json['success'] as bool?,
      apartmentTypes: (json['apartmentTypes'] as List<dynamic>?)
          ?.map((e) => ApartmentType.fromJson(e as Map<String, dynamic>))
          .toList(),
      perKmKobo: (json['perKmKobo'] as num?)?.toInt(),
      perLoaderKobo: (json['perLoaderKobo'] as num?)?.toInt(),
    );

Map<String, dynamic> _$TruckPricingResponseToJson(
        TruckPricingResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'apartmentTypes': instance.apartmentTypes,
      'perKmKobo': instance.perKmKobo,
      'perLoaderKobo': instance.perLoaderKobo,
    };

TruckType _$TruckTypeFromJson(Map<String, dynamic> json) => TruckType(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      capacity: json['capacity'] as String?,
      imageUrl: json['imageUrl'] as String?,
      baseFeeKobo: (json['baseFeeKobo'] as num).toInt(),
      perKmKobo: (json['perKmKobo'] as num?)?.toInt(),
      isActive: json['isActive'] as bool?,
    );

Map<String, dynamic> _$TruckTypeToJson(TruckType instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'capacity': instance.capacity,
      'imageUrl': instance.imageUrl,
      'baseFeeKobo': instance.baseFeeKobo,
      'perKmKobo': instance.perKmKobo,
      'isActive': instance.isActive,
    };

TruckTypesResponse _$TruckTypesResponseFromJson(Map<String, dynamic> json) =>
    TruckTypesResponse(
      types: (json['types'] as List<dynamic>)
          .map((e) => TruckType.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$TruckTypesResponseToJson(TruckTypesResponse instance) =>
    <String, dynamic>{
      'types': instance.types,
    };

TruckPriceBreakdown _$TruckPriceBreakdownFromJson(Map<String, dynamic> json) =>
    TruckPriceBreakdown(
      apartmentCostKobo: (json['apartmentCostKobo'] as num?)?.toInt(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      kmCostKobo: (json['kmCostKobo'] as num?)?.toInt(),
      loadersCostKobo: (json['loadersCostKobo'] as num?)?.toInt(),
      truckCostKobo: (json['truckCostKobo'] as num?)?.toInt(),
      totalKobo: (json['totalKobo'] as num).toInt(),
    );

Map<String, dynamic> _$TruckPriceBreakdownToJson(
        TruckPriceBreakdown instance) =>
    <String, dynamic>{
      'apartmentCostKobo': instance.apartmentCostKobo,
      'distanceKm': instance.distanceKm,
      'kmCostKobo': instance.kmCostKobo,
      'loadersCostKobo': instance.loadersCostKobo,
      'truckCostKobo': instance.truckCostKobo,
      'totalKobo': instance.totalKobo,
    };

TruckQuoteBody _$TruckQuoteBodyFromJson(Map<String, dynamic> json) =>
    TruckQuoteBody(
      apartmentTypeId: json['apartmentTypeId'] as String,
      truckTypeId: json['truckTypeId'] as String?,
      numLoaders: (json['numLoaders'] as num?)?.toInt(),
      pickup: LocationPoint.fromJson(json['pickup'] as Map<String, dynamic>),
      dropoff: LocationPoint.fromJson(json['dropoff'] as Map<String, dynamic>),
      stops: (json['stops'] as List<dynamic>?)
          ?.map((e) => LocationPoint.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$TruckQuoteBodyToJson(TruckQuoteBody instance) =>
    <String, dynamic>{
      'apartmentTypeId': instance.apartmentTypeId,
      if (instance.truckTypeId case final value?) 'truckTypeId': value,
      if (instance.numLoaders case final value?) 'numLoaders': value,
      'pickup': instance.pickup,
      'dropoff': instance.dropoff,
      if (instance.stops case final value?) 'stops': value,
    };

TruckQuoteResponse _$TruckQuoteResponseFromJson(Map<String, dynamic> json) =>
    TruckQuoteResponse(
      priceBreakdown: TruckPriceBreakdown.fromJson(
          json['priceBreakdown'] as Map<String, dynamic>),
      estimatedMinutes: (json['estimatedMinutes'] as num).toInt(),
    );

Map<String, dynamic> _$TruckQuoteResponseToJson(TruckQuoteResponse instance) =>
    <String, dynamic>{
      'priceBreakdown': instance.priceBreakdown,
      'estimatedMinutes': instance.estimatedMinutes,
    };

TruckOrderBody _$TruckOrderBodyFromJson(Map<String, dynamic> json) =>
    TruckOrderBody(
      apartmentTypeId: json['apartmentTypeId'] as String,
      truckTypeId: json['truckTypeId'] as String?,
      numLoaders: (json['numLoaders'] as num?)?.toInt(),
      pickup: LocationPoint.fromJson(json['pickup'] as Map<String, dynamic>),
      dropoff: LocationPoint.fromJson(json['dropoff'] as Map<String, dynamic>),
      stops: (json['stops'] as List<dynamic>?)
          ?.map((e) => LocationPoint.fromJson(e as Map<String, dynamic>))
          .toList(),
      scheduledAt: json['scheduledAt'] as String?,
      paymentMethod: json['paymentMethod'] as String,
      notes: json['notes'] as String?,
      couponCode: json['couponCode'] as String?,
    );

Map<String, dynamic> _$TruckOrderBodyToJson(TruckOrderBody instance) =>
    <String, dynamic>{
      'apartmentTypeId': instance.apartmentTypeId,
      if (instance.truckTypeId case final value?) 'truckTypeId': value,
      if (instance.numLoaders case final value?) 'numLoaders': value,
      'pickup': instance.pickup,
      'dropoff': instance.dropoff,
      if (instance.stops case final value?) 'stops': value,
      if (instance.scheduledAt case final value?) 'scheduledAt': value,
      'paymentMethod': instance.paymentMethod,
      if (instance.notes case final value?) 'notes': value,
      if (instance.couponCode case final value?) 'couponCode': value,
    };

TruckOrderResponse _$TruckOrderResponseFromJson(Map<String, dynamic> json) =>
    TruckOrderResponse(
      order: json['order'] as Map<String, dynamic>,
    );

Map<String, dynamic> _$TruckOrderResponseToJson(TruckOrderResponse instance) =>
    <String, dynamic>{
      'order': instance.order,
    };
