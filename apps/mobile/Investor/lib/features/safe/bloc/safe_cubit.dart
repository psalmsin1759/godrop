import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/wallet_models.dart';
import '../../../shared/utils/errors.dart';

sealed class SafeState extends Equatable {
  const SafeState();
  @override
  List<Object?> get props => [];
}

class SafeInitial extends SafeState {}

class SafeLoading extends SafeState {}

class SafeLoaded extends SafeState {
  const SafeLoaded(this.summary, {this.submitting = false, this.error});
  final SafeSummary summary;
  final bool submitting;
  final String? error;
  @override
  List<Object?> get props => [summary, submitting, error];
}

class SafeError extends SafeState {
  const SafeError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class SafeCubit extends Cubit<SafeState> {
  SafeCubit() : super(SafeInitial());

  final _walletService = WalletService(DioClient.instance);

  Future<void> load() async {
    emit(SafeLoading());
    try {
      final res = await _walletService.getSafe();
      emit(SafeLoaded(res.data));
    } on DioException catch (e) {
      emit(SafeError(parseDioError(e)));
    } catch (_) {
      emit(const SafeError('Something went wrong. Please try again.'));
    }
  }

  Future<bool> createVault({
    required String name,
    required int amountKobo,
    int? lockDays,
  }) async {
    final current = state;
    if (current is SafeLoaded) {
      emit(SafeLoaded(current.summary, submitting: true));
    }
    try {
      await _walletService.createVault(CreateVaultBody(
        name: name,
        amountKobo: amountKobo,
        lockDays: lockDays,
      ));
      await load();
      return true;
    } on DioException catch (e) {
      final base = state;
      if (base is SafeLoaded) {
        emit(SafeLoaded(base.summary, error: parseDioError(e)));
      } else {
        emit(SafeError(parseDioError(e)));
      }
      return false;
    }
  }

  Future<bool> withdrawFromVault(String vaultId, int amountKobo) async {
    try {
      await _walletService.withdrawFromVault(
          vaultId, VaultWithdrawBody(amountKobo: amountKobo));
      await load();
      return true;
    } on DioException catch (e) {
      final base = state;
      if (base is SafeLoaded) {
        emit(SafeLoaded(base.summary, error: parseDioError(e)));
      }
      return false;
    }
  }
}
