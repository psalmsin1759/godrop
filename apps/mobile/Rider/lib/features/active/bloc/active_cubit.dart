import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import 'active_state.dart';

class ActiveCubit extends Cubit<ActiveState> {
  ActiveCubit() : super(const ActiveInitial());

  final _ordersService = RiderOrdersService(DioClient.instance);
  final _profileService = RiderProfileService(DioClient.instance);

  Timer? _locationTimer;
  String? _activeOrderId;

  Future<void> loadActiveOrder() async {
    emit(const ActiveLoading());
    try {
      final data =
          await _ordersService.getActiveOrder() as Map<String, dynamic>;
      final orderData = data['data'];
      if (orderData == null) {
        emit(const ActiveNone());
        _stopLocationUpdates();
        return;
      }
      final order =
          RiderOrderDetail.fromJson(orderData as Map<String, dynamic>);
      _activeOrderId = order.id;
      emit(ActiveLoaded(order));
      _startLocationUpdates();
    } on DioException catch (e) {
      emit(ActiveError(_parseError(e)));
    }
  }

  Future<void> markPickedUp() async {
    final current = state;
    if (current is! ActiveLoaded) return;
    emit(ActiveActionLoading(current.order));
    try {
      await _ordersService.markPickedUp(current.order.id);
      await loadActiveOrder();
    } on DioException catch (e) {
      emit(ActiveError(_parseError(e)));
    }
  }

  Future<void> markInTransit() async {
    final current = state;
    if (current is! ActiveLoaded) return;
    emit(ActiveActionLoading(current.order));
    try {
      await _ordersService.markInTransit(current.order.id);
      await loadActiveOrder();
    } on DioException catch (e) {
      emit(ActiveError(_parseError(e)));
    }
  }

  Future<void> markDelivered({String? proofNote}) async {
    final current = state;
    if (current is! ActiveLoaded) return;
    emit(ActiveActionLoading(current.order));
    try {
      await _ordersService
          .markDelivered(current.order.id, {'proofNote': proofNote ?? ''});
      _stopLocationUpdates();
      emit(const ActiveNone());
    } on DioException catch (e) {
      emit(ActiveError(_parseError(e)));
    }
  }

  Future<void> markFailed(String reason) async {
    final current = state;
    if (current is! ActiveLoaded) return;
    emit(ActiveActionLoading(current.order));
    try {
      await _ordersService.markFailed(current.order.id, {'reason': reason});
      _stopLocationUpdates();
      emit(const ActiveNone());
    } on DioException catch (e) {
      emit(ActiveError(_parseError(e)));
    }
  }

  void _startLocationUpdates() {
    _locationTimer?.cancel();
    _locationTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _pushLocation(),
    );
  }

  void _stopLocationUpdates() {
    _locationTimer?.cancel();
    _locationTimer = null;
    _activeOrderId = null;
  }

  Future<void> _pushLocation() async {
    final orderId = _activeOrderId;
    if (orderId == null) return;
    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings:
            const LocationSettings(accuracy: LocationAccuracy.high),
      );
      await _ordersService.pushLocation(
          orderId, {'lat': position.latitude, 'lng': position.longitude});
      await _profileService
          .updateLocation({'lat': position.latitude, 'lng': position.longitude});
    } catch (_) {}
  }

  @override
  Future<void> close() {
    _locationTimer?.cancel();
    return super.close();
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['message'];
    if (message is String) return message;
    return 'Something went wrong. Please try again.';
  }
}
