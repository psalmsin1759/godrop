import '../../../shared/models/delivery_models.dart';

abstract class ParcelState {}

class ParcelInitial extends ParcelState {}

class ParcelVehicleTypesLoading extends ParcelState {}

class ParcelVehicleTypesError extends ParcelState {
  final String message;
  ParcelVehicleTypesError(this.message);
}

class ParcelLoaded extends ParcelState {
  final List<ParcelVehicleType> vehicleTypes;
  final String? selectedTypeId;
  final ParcelPriceBreakdown? quote;
  final bool quoteLoading;
  final int? estimatedMinutes;
  final String? quoteError;
  // Per-parcel price breakdown, in the same order as the request dropoffs.
  final List<ParcelLegQuote> parcelLegs;

  ParcelLoaded({
    required this.vehicleTypes,
    this.selectedTypeId,
    this.quote,
    this.quoteLoading = false,
    this.estimatedMinutes,
    this.quoteError,
    this.parcelLegs = const [],
  });

  ParcelVehicleType? get selectedType =>
      vehicleTypes.where((t) => t.id == selectedTypeId).firstOrNull;

  ParcelLoaded copyWith({
    List<ParcelVehicleType>? vehicleTypes,
    String? selectedTypeId,
    ParcelPriceBreakdown? quote,
    bool? quoteLoading,
    int? estimatedMinutes,
    String? quoteError,
    List<ParcelLegQuote>? parcelLegs,
    bool clearQuote = false,
    bool clearQuoteError = false,
  }) {
    return ParcelLoaded(
      vehicleTypes: vehicleTypes ?? this.vehicleTypes,
      selectedTypeId: selectedTypeId ?? this.selectedTypeId,
      quote: clearQuote ? null : (quote ?? this.quote),
      quoteLoading: quoteLoading ?? this.quoteLoading,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      quoteError: clearQuoteError ? null : (quoteError ?? this.quoteError),
      parcelLegs: clearQuote ? const [] : (parcelLegs ?? this.parcelLegs),
    );
  }
}
