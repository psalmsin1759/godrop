import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/wallet_models.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;

class BankSetupState {
  final List<Bank> banks;
  final bool loadingBanks;
  final Bank? selectedBank;
  final String? resolvedName;
  final bool resolving;
  final bool saving;
  final String? error;

  const BankSetupState({
    this.banks = const [],
    this.loadingBanks = false,
    this.selectedBank,
    this.resolvedName,
    this.resolving = false,
    this.saving = false,
    this.error,
  });

  BankSetupState copyWith({
    List<Bank>? banks,
    bool? loadingBanks,
    Bank? selectedBank,
    String? resolvedName,
    bool clearResolved = false,
    bool? resolving,
    bool? saving,
    String? error,
    bool clearError = false,
  }) =>
      BankSetupState(
        banks: banks ?? this.banks,
        loadingBanks: loadingBanks ?? this.loadingBanks,
        selectedBank: selectedBank ?? this.selectedBank,
        resolvedName:
            clearResolved ? null : (resolvedName ?? this.resolvedName),
        resolving: resolving ?? this.resolving,
        saving: saving ?? this.saving,
        error: clearError ? null : (error ?? this.error),
      );
}

class BankSetupCubit extends Cubit<BankSetupState> {
  BankSetupCubit() : super(const BankSetupState());

  final _service = WalletService(DioClient.instance);

  Future<void> loadBanks() async {
    emit(state.copyWith(loadingBanks: true, clearError: true));
    try {
      final res = await _service.getBanks();
      emit(state.copyWith(banks: res.banks, loadingBanks: false));
    } on DioException catch (e) {
      emit(state.copyWith(loadingBanks: false, error: parseDioError(e)));
    } catch (_) {
      emit(state.copyWith(
          loadingBanks: false, error: 'Could not load banks.'));
    }
  }

  void selectBank(Bank bank) {
    emit(state.copyWith(
        selectedBank: bank, clearResolved: true, clearError: true));
  }

  void accountNumberChanged() {
    if (state.resolvedName != null) emit(state.copyWith(clearResolved: true));
  }

  Future<void> resolve(String accountNumber) async {
    final bank = state.selectedBank;
    if (bank == null || accountNumber.length != 10) return;
    emit(state.copyWith(resolving: true, clearError: true));
    try {
      final res = await _service.resolveAccount(ResolveAccountBody(
          accountNumber: accountNumber, bankCode: bank.code));
      emit(state.copyWith(resolving: false, resolvedName: res.accountName));
    } on DioException catch (e) {
      emit(state.copyWith(resolving: false, error: parseDioError(e)));
    } catch (_) {
      emit(state.copyWith(
          resolving: false, error: 'Could not verify the account.'));
    }
  }

  /// Returns an error message, or null on success.
  Future<String?> save(String accountNumber) async {
    final bank = state.selectedBank;
    final name = state.resolvedName;
    if (bank == null || name == null) return 'Verify the account first.';
    emit(state.copyWith(saving: true, clearError: true));
    try {
      await _service.saveBankAccount(SaveBankAccountBody(
        bankName: bank.name,
        bankCode: bank.code,
        accountNumber: accountNumber,
        accountName: name,
      ));
      emit(state.copyWith(saving: false));
      return null;
    } on DioException catch (e) {
      emit(state.copyWith(saving: false));
      return parseDioError(e);
    } catch (_) {
      emit(state.copyWith(saving: false));
      return 'Could not save the bank account.';
    }
  }
}
