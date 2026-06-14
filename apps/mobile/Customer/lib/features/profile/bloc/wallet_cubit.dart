import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/wallet_models.dart';
import '../../../shared/services/user_prefs.dart';
import 'wallet_state.dart';

class WalletCubit extends Cubit<WalletState> {
  WalletCubit() : super(WalletInitial());

  final _service = WalletService(DioClient.instance);
  double _pendingTopUpAmount = 0;
  double get pendingTopUpAmount => _pendingTopUpAmount;

  Future<void> load() async {
    if (state is WalletLoading) return;
    emit(WalletLoading());
    try {
      final balance = await _service.getBalance();
      final txList = await _service.getTransactions();
      await UserPrefs.saveWalletBalance(balance.balance);
      emit(WalletLoaded(
        balance: balance.balance,
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
      await UserPrefs.saveWalletBalance(balance.balance);
      emit(WalletLoaded(
        balance: balance.balance,
        transactions: txList.data,
      ));
    } catch (_) {}
  }

  Future<void> initTopUp(double amount) async {
    double bal = 0;
    List<WalletTx> txs = [];
    final current = state;
    if (current is WalletLoaded) {
      bal = current.balance;
      txs = current.transactions;
    }
    _pendingTopUpAmount = amount;
    emit(WalletToppingUp(balance: bal, transactions: txs));
    try {
      final res = await _service.initTopUp(TopUpInitBody(amount: amount));
      emit(WalletTopUpReady(
        paystackAuthUrl: res.paystackAuthUrl,
        reference: res.reference,
        balance: bal,
        transactions: txs,
      ));
    } on DioException catch (e) {
      emit(WalletError(_parseDioError(e), balance: bal, transactions: txs));
    } catch (_) {
      emit(WalletError(
        'Failed to initiate top-up. Please try again.',
        balance: bal,
        transactions: txs,
      ));
    }
  }

  Future<void> verifyTopUp(String reference, {double topUpAmount = 0}) async {
    emit(WalletLoading());
    try {
      final res = await _service.verifyTopUp(TopUpVerifyBody(reference: reference));
      final txList = await _service.getTransactions();
      await UserPrefs.saveWalletBalance(res.balance);
      emit(WalletTopUpSuccess(
        balance: res.balance,
        topUpAmount: topUpAmount > 0 ? topUpAmount : res.transaction.amount,
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
