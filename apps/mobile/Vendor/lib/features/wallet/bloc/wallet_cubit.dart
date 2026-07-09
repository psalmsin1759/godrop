import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/wallet_models.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'wallet_state.dart';

class WalletCubit extends Cubit<WalletState> {
  WalletCubit() : super(WalletInitial());

  final _service = WalletService(DioClient.instance);

  Future<void> load({bool silent = false}) async {
    if (!silent && state is WalletLoading) return;
    if (!silent) emit(WalletLoading());
    try {
      final results = await Future.wait([
        _service.getBalance(),
        _service.getTransactions(),
        _service.getBankAccount(),
      ]);
      emit(WalletLoaded(
        balance: (results[0] as VendorWalletBalance).balance,
        transactions: (results[1] as WalletTxListResponse).data,
        bankAccount: (results[2] as BankAccountResponse).account,
      ));
    } on DioException catch (e) {
      emit(WalletError(parseDioError(e)));
    } catch (_) {
      emit(WalletError('Failed to load wallet. Please try again.'));
    }
  }

  /// Withdraws [amountNaira] to the saved bank account (OWNER only).
  /// Returns an error message, or null on success.
  Future<String?> withdraw(double amountNaira) async {
    final current = state;
    if (current is! WalletLoaded) return null;
    emit(current.copyWith(withdrawing: true));
    try {
      await _service.withdraw(WithdrawBody(amount: amountNaira));
      await load(silent: true);
      return null;
    } on DioException catch (e) {
      emit(current.copyWith(withdrawing: false));
      return parseDioError(e);
    } catch (_) {
      emit(current.copyWith(withdrawing: false));
      return 'Withdrawal failed. Please try again.';
    }
  }
}
