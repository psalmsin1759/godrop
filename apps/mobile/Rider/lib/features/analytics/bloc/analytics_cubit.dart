import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import 'analytics_state.dart';

class AnalyticsCubit extends Cubit<AnalyticsState> {
  AnalyticsCubit() : super(const AnalyticsInitial());

  final _service = RiderAnalyticsService(DioClient.instance);

  Future<void> load({int days = 30}) async {
    emit(const AnalyticsLoading());
    try {
      final data = await _service.getAnalytics(days: days) as Map<String, dynamic>;
      final analytics =
          RiderAnalytics.fromJson(data['data'] as Map<String, dynamic>);
      emit(AnalyticsLoaded(analytics: analytics, days: days));
    } on DioException catch (_) {
      emit(const AnalyticsError('Could not load analytics. Please try again.'));
    }
  }
}
