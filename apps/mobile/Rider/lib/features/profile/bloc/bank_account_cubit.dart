import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import 'bank_account_state.dart';

class BankAccountCubit extends Cubit<BankAccountState> {
  BankAccountCubit() : super(const BankAccountInitial());

  final _service = RiderProfileService(DioClient.instance);

  Future<void> loadBanks() async {
    emit(const BankAccountLoading());
    try {
      final data = await _service.getBanks() as Map<String, dynamic>;
      final banks = (data['banks'] as List)
          .map((b) => Bank.fromJson(b as Map<String, dynamic>))
          .toList();
      emit(BankAccountLoaded(banks: banks));
    } on DioException catch (e) {
      emit(BankAccountError(_parseError(e)));
    }
  }

  Future<void> resolveAccount({
    required String accountNumber,
    required String bankCode,
  }) async {
    final current = state;
    if (current is! BankAccountLoaded) return;
    emit(current.copyWith(resolving: true, clearResolution: true));
    try {
      final data = await _service.resolveAccount({
        'accountNumber': accountNumber,
        'bankCode': bankCode,
      }) as Map<String, dynamic>;
      if (state is! BankAccountLoaded) return;
      emit((state as BankAccountLoaded).copyWith(
        resolving: false,
        resolvedAccountName: data['accountName'] as String?,
      ));
    } on DioException catch (e) {
      if (state is! BankAccountLoaded) return;
      emit((state as BankAccountLoaded)
          .copyWith(resolving: false, resolveError: _parseError(e)));
    }
  }

  void clearResolution() {
    final current = state;
    if (current is! BankAccountLoaded) return;
    emit(current.copyWith(clearResolution: true));
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['error'];
    if (message is String) return message;
    return 'Something went wrong. Please try again.';
  }
}
