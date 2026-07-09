import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/profile_models.dart';
import '../../../shared/models/wallet_models.dart';
import '../../../shared/utils/errors.dart';

class WalletState extends Equatable {
  const WalletState({
    this.wallets,
    this.recentTx = const [],
    this.bankAccounts = const [],
    this.loading = false,
    this.submitting = false,
    this.error,
    this.fundReference,
    this.fundUrl,
    this.withdrawDone = false,
  });

  final InvestorWallets? wallets;
  final List<InvestorTx> recentTx;
  final List<InvestorBankAccount> bankAccounts;
  final bool loading;
  final bool submitting;
  final String? error;
  final String? fundReference;
  final String? fundUrl;
  final bool withdrawDone;

  InvestorBankAccount? get primaryBank {
    if (bankAccounts.isEmpty) return null;
    return bankAccounts.firstWhere((b) => b.isPrimary,
        orElse: () => bankAccounts.first);
  }

  WalletState copyWith({
    InvestorWallets? wallets,
    List<InvestorTx>? recentTx,
    List<InvestorBankAccount>? bankAccounts,
    bool? loading,
    bool? submitting,
    String? error,
    String? fundReference,
    String? fundUrl,
    bool? withdrawDone,
    bool clearError = false,
    bool clearFunding = false,
  }) {
    return WalletState(
      wallets: wallets ?? this.wallets,
      recentTx: recentTx ?? this.recentTx,
      bankAccounts: bankAccounts ?? this.bankAccounts,
      loading: loading ?? this.loading,
      submitting: submitting ?? this.submitting,
      error: clearError ? null : (error ?? this.error),
      fundReference: clearFunding ? null : (fundReference ?? this.fundReference),
      fundUrl: clearFunding ? null : (fundUrl ?? this.fundUrl),
      withdrawDone: withdrawDone ?? this.withdrawDone,
    );
  }

  @override
  List<Object?> get props => [
        wallets, recentTx, bankAccounts, loading, submitting,
        error, fundReference, fundUrl, withdrawDone,
      ];
}

class WalletCubit extends Cubit<WalletState> {
  WalletCubit() : super(const WalletState());

  final _walletService = WalletService(DioClient.instance);
  final _profileService = ProfileService(DioClient.instance);

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true, withdrawDone: false));
    try {
      final wallet = await _walletService.getWallet();
      final tx = await _walletService.getTransactions(limit: 5);
      final banks = await _profileService.getBankAccounts();
      emit(state.copyWith(
        wallets: wallet.data,
        recentTx: tx.data,
        bankAccounts: banks.data,
        loading: false,
      ));
    } on DioException catch (e) {
      emit(state.copyWith(loading: false, error: parseDioError(e)));
    } catch (_) {
      emit(state.copyWith(
          loading: false, error: 'Something went wrong. Please try again.'));
    }
  }

  /// Starts a Paystack top-up; the screen launches [WalletState.fundUrl].
  Future<bool> startFunding(int amountKobo, String method) async {
    emit(state.copyWith(submitting: true, clearError: true, clearFunding: true));
    try {
      final res =
          await _walletService.fund(FundBody(amountKobo: amountKobo, method: method));
      emit(state.copyWith(
        submitting: false,
        fundReference: res.reference,
        fundUrl: res.authorizationUrl,
      ));
      return true;
    } on DioException catch (e) {
      emit(state.copyWith(submitting: false, error: parseDioError(e)));
      return false;
    }
  }

  /// Called after the user completes the Paystack checkout.
  Future<bool> verifyFunding() async {
    final reference = state.fundReference;
    if (reference == null) return false;
    emit(state.copyWith(submitting: true, clearError: true));
    try {
      final res = await _walletService.verifyFunding({'reference': reference});
      emit(state.copyWith(
        submitting: false,
        wallets: res.wallets ?? state.wallets,
        clearFunding: true,
      ));
      await load();
      return true;
    } on DioException catch (e) {
      emit(state.copyWith(submitting: false, error: parseDioError(e)));
      return false;
    }
  }

  Future<bool> withdraw({
    required int amountKobo,
    required String wallet,
    required String bankAccountId,
  }) async {
    emit(state.copyWith(submitting: true, clearError: true));
    try {
      final res = await _walletService.withdraw(WithdrawBody(
        amountKobo: amountKobo,
        wallet: wallet,
        bankAccountId: bankAccountId,
      ));
      emit(state.copyWith(
        submitting: false,
        wallets: res.wallets ?? state.wallets,
        withdrawDone: true,
      ));
      return true;
    } on DioException catch (e) {
      emit(state.copyWith(submitting: false, error: parseDioError(e)));
      return false;
    }
  }
}
