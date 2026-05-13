import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/common_models.dart';
import '../../../shared/models/delivery_models.dart';
import 'parcel_state.dart';

class ParcelCubit extends Cubit<ParcelState> {
  ParcelCubit() : super(ParcelInitial());

  final _service = ParcelService(DioClient.instance);

  Future<void> loadVehicleTypes({LocationPoint? pickup, LocationPoint? dropoff}) async {
    if (state is ParcelVehicleTypesLoading) return;
    emit(ParcelVehicleTypesLoading());
    try {
      final res = await _service.getVehicleTypes();
      if (res.types.isEmpty) {
        emit(ParcelLoaded(vehicleTypes: []));
        return;
      }
      final first = res.types.first;
      emit(ParcelLoaded(vehicleTypes: res.types, selectedTypeId: first.id));
      if (pickup != null && dropoff != null) {
        await selectVehicleType(typeId: first.id, pickup: pickup, dropoff: dropoff);
      }
    } on DioException catch (e) {
      emit(ParcelVehicleTypesError(_parseDioError(e)));
    } catch (_) {
      emit(ParcelVehicleTypesError('Failed to load vehicle types. Please try again.'));
    }
  }

  Future<void> selectVehicleType({
    required String typeId,
    required LocationPoint pickup,
    required LocationPoint dropoff,
  }) async {
    final current = state;
    if (current is! ParcelLoaded) return;
    emit(current.copyWith(
      selectedTypeId: typeId,
      quoteLoading: true,
      clearQuote: true,
      clearQuoteError: true,
    ));
    try {
      final res = await _service.getQuote(ParcelQuoteBody(
        pickup: pickup,
        dropoff: dropoff,
        vehicleTypeId: typeId,
      ));
      final loaded = state;
      if (loaded is ParcelLoaded) {
        emit(loaded.copyWith(
          quoteLoading: false,
          quote: res.priceBreakdown,
          estimatedMinutes: res.estimatedMinutes,
        ));
      }
    } on DioException catch (e) {
      final loaded = state;
      if (loaded is ParcelLoaded) {
        emit(loaded.copyWith(
          quoteLoading: false,
          clearQuote: true,
          quoteError: _parseDioError(e),
        ));
      }
    } catch (_) {
      final loaded = state;
      if (loaded is ParcelLoaded) {
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
