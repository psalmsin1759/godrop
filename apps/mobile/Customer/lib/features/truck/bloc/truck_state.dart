import '../../../shared/models/delivery_models.dart';

abstract class TruckState {}

class TruckInitial extends TruckState {}

class TruckLoading extends TruckState {}

class TruckError extends TruckState {
  final String message;
  TruckError(this.message);
}

class TruckLoaded extends TruckState {
  final List<ApartmentType> apartmentTypes;
  final List<TruckType> truckTypes;
  final int perKmKobo;
  final int perLoaderKobo;

  final TruckPriceBreakdown? quote;
  final bool quoteLoading;
  final int? estimatedMinutes;
  final String? quoteError;

  TruckLoaded({
    required this.apartmentTypes,
    required this.truckTypes,
    required this.perKmKobo,
    required this.perLoaderKobo,
    this.quote,
    this.quoteLoading = false,
    this.estimatedMinutes,
    this.quoteError,
  });

  TruckLoaded copyWith({
    List<ApartmentType>? apartmentTypes,
    List<TruckType>? truckTypes,
    int? perKmKobo,
    int? perLoaderKobo,
    TruckPriceBreakdown? quote,
    bool? quoteLoading,
    int? estimatedMinutes,
    String? quoteError,
    bool clearQuote = false,
    bool clearQuoteError = false,
  }) {
    return TruckLoaded(
      apartmentTypes: apartmentTypes ?? this.apartmentTypes,
      truckTypes: truckTypes ?? this.truckTypes,
      perKmKobo: perKmKobo ?? this.perKmKobo,
      perLoaderKobo: perLoaderKobo ?? this.perLoaderKobo,
      quote: clearQuote ? null : (quote ?? this.quote),
      quoteLoading: quoteLoading ?? this.quoteLoading,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      quoteError: clearQuoteError ? null : (quoteError ?? this.quoteError),
    );
  }
}
