import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/wallet_models.dart';
import '../../../shared/services/user_prefs.dart';
import 'wallet_state.dart';

class WalletCubit extends Cubit<WalletState> {
  WalletCubit() : super(WalletInitial());

  final _service = WalletService(DioClient.instance);
  int _pendingTopUpAmountKobo = 0;
  int get pendingTopUpAmountKobo => _pendingTopUpAmountKobo;

  Future<void> load() async {
    if (state is WalletLoading) return;
    emit(WalletLoading());
    try {
      final balance = await _service.getBalance();
      final txList = await _service.getTransactions();
      await UserPrefs.saveWalletBalance(balance.balanceKobo);
      emit(WalletLoaded(
        balanceKobo: balance.balanceKobo,
        transactions: txList.data,
      ));
    } on DioException catch (e) {
      emit(WalletError(_parseDioError(e)));
    } catch (_) {
      emit(WalletError('Failed to load wallet. Please try again.'));
    }
  }

  /// Silent refresh — keeps current balance/transactions visible while reloading.
  Future<void> refresh() async {
    try {
      final balance = await _service.getBalance();
      final txList = await _service.getTransactions();
      await UserPrefs.saveWalletBalance(balance.balanceKobo);
      emit(WalletLoaded(
        balanceKobo: balance.balanceKobo,
        transactions: txList.data,
      ));
    } catch (_) {}
  }

  Future<void> initTopUp(int amountKobo) async {
    int bal = 0;
    List<WalletTx> txs = [];
    final current = state;
    if (current is WalletLoaded) {
      bal = current.balanceKobo;
      txs = current.transactions;
    }
    _pendingTopUpAmountKobo = amountKobo;
    emit(WalletToppingUp(balanceKobo: bal, transactions: txs));
    try {
      final res = await _service.initTopUp(TopUpInitBody(amountKobo: amountKobo));
      emit(WalletTopUpReady(
        paystackAuthUrl: res.paystackAuthUrl,
        reference: res.reference,
        balanceKobo: bal,
        transactions: txs,
      ));
    } on DioException catch (e) {
      emit(WalletError(_parseDioError(e), balanceKobo: bal, transactions: txs));
    } catch (_) {
      emit(WalletError(
        'Failed to initiate top-up. Please try again.',
        balanceKobo: bal,
        transactions: txs,
      ));
    }
  }

  Future<void> verifyTopUp(String reference, {int topUpAmountKobo = 0}) async {
    emit(WalletLoading());
    try {
      final res = await _service.verifyTopUp(TopUpVerifyBody(reference: reference));
      final txList = await _service.getTransactions();
      await UserPrefs.saveWalletBalance(res.balanceKobo);
      emit(WalletTopUpSuccess(
        balanceKobo: res.balanceKobo,
        topUpAmountKobo: topUpAmountKobo > 0 ? topUpAmountKobo : res.transaction.amountKobo,
        transactions: txList.data,
      ));
    } on DioException catch (e) {
      emit(WalletError(_parseDioError(e)));
    } catch (_) {
      emit(WalletError('Payment verification failed. Please try again.'));
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
