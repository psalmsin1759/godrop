import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import 'jobs_state.dart';

class JobsCubit extends Cubit<JobsState> {
  JobsCubit() : super(const JobsInitial());

  final _service = RiderOrdersService(DioClient.instance);

  Future<void> loadJobs() async {
    emit(const JobsLoading());
    try {
      final pendingData =
          await _service.listOrders(status: 'PENDING') as Map<String, dynamic>;
      final assignedData =
          await _service.listOrders(status: 'ACCEPTED') as Map<String, dynamic>;

      final pending = (pendingData['data'] as List)
          .map((j) => RiderOrder.fromJson(j as Map<String, dynamic>))
          .toList();
      final assigned = (assignedData['data'] as List)
          .map((j) => RiderOrder.fromJson(j as Map<String, dynamic>))
          .toList();

      emit(JobsLoaded(pending: pending, assigned: assigned));
    } on DioException catch (e) {
      emit(JobsError(_parseError(e)));
    }
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['message'];
    if (message is String) return message;
    return 'Failed to load jobs. Pull down to retry.';
  }
}

class JobDetailCubit extends Cubit<JobDetailState> {
  JobDetailCubit() : super(const JobDetailInitial());

  final _service = RiderOrdersService(DioClient.instance);

  Future<void> loadOrder(String orderId) async {
    emit(const JobDetailLoading());
    try {
      final data =
          await _service.getOrder(orderId) as Map<String, dynamic>;
      final order =
          RiderOrderDetail.fromJson(data['data'] as Map<String, dynamic>);
      emit(JobDetailLoaded(order));
    } on DioException catch (e) {
      emit(JobDetailError(_parseError(e)));
    }
  }

  Future<void> acceptOrder(String orderId) async {
    emit(const JobDetailLoading());
    try {
      final data =
          await _service.acceptOrder(orderId) as Map<String, dynamic>;
      final order =
          RiderOrder.fromJson(data['data'] as Map<String, dynamic>);
      emit(JobActionSuccess(order, 'accepted'));
    } on DioException catch (e) {
      emit(JobDetailError(_parseError(e)));
    }
  }

  Future<void> rejectOrder(String orderId, {String? reason}) async {
    emit(const JobDetailLoading());
    try {
      final data = await _service.rejectOrder(
          orderId, {'reason': reason ?? 'Rider declined'}) as Map<String, dynamic>;
      final order =
          RiderOrder.fromJson(data['data'] as Map<String, dynamic>);
      emit(JobActionSuccess(order, 'rejected'));
    } on DioException catch (e) {
      emit(JobDetailError(_parseError(e)));
    }
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['message'];
    if (message is String) return message;
    return 'Something went wrong. Please try again.';
  }
}
