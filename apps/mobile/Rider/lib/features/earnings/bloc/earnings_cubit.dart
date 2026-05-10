import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import 'earnings_state.dart';

class EarningsCubit extends Cubit<EarningsState> {
  EarningsCubit() : super(const EarningsInitial());

  final _service = RiderEarningsService(DioClient.instance);

  Future<void> load() async {
    emit(const EarningsLoading());
    try {
      final summaryData =
          await _service.getSummary() as Map<String, dynamic>;
      final earningsData =
          await _service.listEarnings() as Map<String, dynamic>;
      final withdrawalsData =
          await _service.listWithdrawals() as Map<String, dynamic>;

      final summary = RiderEarningsSummary.fromJson(
          summaryData['data'] as Map<String, dynamic>);

      final earnings = (earningsData['data'] as List)
          .map((e) => RiderEarning.fromJson(e as Map<String, dynamic>))
          .toList();

      final withdrawals = (withdrawalsData['data'] as List)
          .map((w) => RiderWithdrawal.fromJson(w as Map<String, dynamic>))
          .toList();

      final meta = earningsData['meta'] as Map<String, dynamic>?;
      final pages = meta?['pages'] as int? ?? 1;

      emit(EarningsLoaded(
        summary: summary,
        earnings: earnings,
        withdrawals: withdrawals,
        hasMore: pages > 1,
      ));
    } on DioException catch (e) {
      emit(EarningsError(_parseError(e)));
    }
  }

  Future<void> requestWithdrawal(int amountKobo) async {
    final current = state;
    if (current is! EarningsLoaded) return;
    emit(WithdrawalSubmitting(current));
    try {
      await _service.requestWithdrawal({'amountKobo': amountKobo});
      await load();
      final loaded = state;
      if (loaded is EarningsLoaded) emit(WithdrawalSuccess(loaded));
    } on DioException catch (e) {
      emit(EarningsError(_parseError(e)));
    }
  }

  String _parseError(DioException e) {
    final statusCode = e.response?.statusCode;
    if (statusCode == 400) {
      final msg = e.response?.data?['error'];
      if (msg is String) return msg;
      return 'Insufficient balance or below minimum withdrawal (₦100).';
    }
    return 'Something went wrong. Please try again.';
  }
}
