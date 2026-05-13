import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/common_models.dart';
import '../../../shared/models/delivery_models.dart';
import 'truck_state.dart';

class TruckCubit extends Cubit<TruckState> {
  TruckCubit() : super(TruckInitial());

  final _service = TruckService(DioClient.instance);

  Future<void> load() async {
    if (state is TruckLoading) return;
    emit(TruckLoading());
    try {
      final results = await Future.wait([
        _service.getPricing(),
        _service.listTruckTypes(),
      ]);
      final pricing = results[0] as TruckPricingResponse;
      final typesRes = results[1] as TruckTypesResponse;
      emit(TruckLoaded(
        apartmentTypes: pricing.apartmentTypes ?? [],
        truckTypes: typesRes.types,
        perKmKobo: pricing.perKmKobo ?? 15000,
        perLoaderKobo: pricing.perLoaderKobo ?? 500000,
      ));
    } on DioException catch (e) {
      emit(TruckError(_parseDioError(e)));
    } catch (_) {
      emit(TruckError('Failed to load truck options. Please try again.'));
    }
  }

  Future<void> fetchQuote({
    required String apartmentTypeId,
    required int numLoaders,
    required LocationPoint pickup,
    required LocationPoint dropoff,
  }) async {
    final current = state;
    if (current is! TruckLoaded) return;
    emit(current.copyWith(
      quoteLoading: true,
      clearQuote: true,
      clearQuoteError: true,
    ));
    try {
      final res = await _service.getQuote(TruckQuoteBody(
        apartmentTypeId: apartmentTypeId,
        numLoaders: numLoaders > 0 ? numLoaders : null,
        pickup: pickup,
        dropoff: dropoff,
      ));
      final loaded = state;
      if (loaded is TruckLoaded) {
        emit(loaded.copyWith(
          quoteLoading: false,
          quote: res.priceBreakdown,
          estimatedMinutes: res.estimatedMinutes,
        ));
      }
    } on DioException catch (e) {
      final loaded = state;
      if (loaded is TruckLoaded) {
        emit(loaded.copyWith(
          quoteLoading: false,
          clearQuote: true,
          quoteError: _parseDioError(e),
        ));
      }
    } catch (_) {
      final loaded = state;
      if (loaded is TruckLoaded) {
        emit(loaded.copyWith(
          quoteLoading: false,
          clearQuote: true,
          quoteError: 'Could not calculate price. Please check your connection.',
        ));
      }
    }
  }

  String _parseDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final msg = data['message'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return 'Something went wrong. Please try again.';
  }
}
