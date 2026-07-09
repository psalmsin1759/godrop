import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/profile_models.dart';
import '../../../shared/utils/errors.dart';

class BankAccountsState extends Equatable {
  const BankAccountsState({
    this.accounts = const [],
    this.banks = const [],
    this.loading = false,
    this.submitting = false,
    this.error,
  });

  final List<InvestorBankAccount> accounts;
  final List<Bank> banks;
  final bool loading;
  final bool submitting;
  final String? error;

  BankAccountsState copyWith({
    List<InvestorBankAccount>? accounts,
    List<Bank>? banks,
    bool? loading,
    bool? submitting,
    String? error,
    bool clearError = false,
  }) {
    return BankAccountsState(
      accounts: accounts ?? this.accounts,
      banks: banks ?? this.banks,
      loading: loading ?? this.loading,
      submitting: submitting ?? this.submitting,
      error: clearError ? null : (error ?? this.error),
    );
  }

  @override
  List<Object?> get props => [accounts, banks, loading, submitting, error];
}

class BankAccountsCubit extends Cubit<BankAccountsState> {
  BankAccountsCubit() : super(const BankAccountsState());

  final _profileService = ProfileService(DioClient.instance);

  Future<void> load() async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final res = await _profileService.getBankAccounts();
      emit(state.copyWith(accounts: res.data, loading: false));
    } on DioException catch (e) {
      emit(state.copyWith(loading: false, error: parseDioError(e)));
    }
  }

  Future<void> loadBanks() async {
    if (state.banks.isNotEmpty) return;
    try {
      final res = await _profileService.getBanks();
      emit(state.copyWith(banks: res.banks));
    } on DioException {
      // Bank list is a convenience; the form surfaces its own error on submit.
    }
  }

  Future<bool> addAccount({
    required String bankCode,
    required String bankName,
    required String accountNumber,
  }) async {
    emit(state.copyWith(submitting: true, clearError: true));
    try {
      await _profileService.addBankAccount(AddBankAccountBody(
        bankCode: bankCode,
        bankName: bankName,
        accountNumber: accountNumber,
      ));
      await load();
      emit(state.copyWith(submitting: false));
      return true;
    } on DioException catch (e) {
      emit(state.copyWith(submitting: false, error: parseDioError(e)));
      return false;
    }
  }

  Future<void> setPrimary(String id) async {
    try {
      await _profileService.setPrimaryBankAccount(id);
      await load();
    } on DioException catch (e) {
      emit(state.copyWith(error: parseDioError(e)));
    }
  }

  Future<void> remove(String id) async {
    try {
      await _profileService.deleteBankAccount(id);
      await load();
    } on DioException catch (e) {
      emit(state.copyWith(error: parseDioError(e)));
    }
  }
}
