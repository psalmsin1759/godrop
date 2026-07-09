import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/wallet_models.dart';
import '../../../shared/utils/errors.dart';

class TransactionsState extends Equatable {
  const TransactionsState({
    this.transactions = const [],
    this.filter,
    this.page = 1,
    this.hasMore = false,
    this.loading = false,
    this.loadingMore = false,
    this.error,
  });

  final List<InvestorTx> transactions;
  final String? filter; // null=All, or InvestorTxType value
  final int page;
  final bool hasMore;
  final bool loading;
  final bool loadingMore;
  final String? error;

  TransactionsState copyWith({
    List<InvestorTx>? transactions,
    String? filter,
    int? page,
    bool? hasMore,
    bool? loading,
    bool? loadingMore,
    String? error,
    bool clearFilter = false,
    bool clearError = false,
  }) {
    return TransactionsState(
      transactions: transactions ?? this.transactions,
      filter: clearFilter ? null : (filter ?? this.filter),
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      loading: loading ?? this.loading,
      loadingMore: loadingMore ?? this.loadingMore,
      error: clearError ? null : (error ?? this.error),
    );
  }

  @override
  List<Object?> get props =>
      [transactions, filter, page, hasMore, loading, loadingMore, error];
}

class TransactionsCubit extends Cubit<TransactionsState> {
  TransactionsCubit() : super(const TransactionsState());

  final _walletService = WalletService(DioClient.instance);

  Future<void> load({String? filter, bool clearFilter = false}) async {
    final effective = clearFilter ? null : (filter ?? state.filter);
    emit(state.copyWith(
      loading: true,
      filter: effective,
      clearFilter: clearFilter,
      clearError: true,
    ));
    try {
      final res = await _walletService.getTransactions(type: effective, page: 1);
      emit(state.copyWith(
        transactions: res.data,
        page: 1,
        hasMore: (res.meta?.totalPages ?? 1) > 1,
        loading: false,
      ));
    } on DioException catch (e) {
      emit(state.copyWith(loading: false, error: parseDioError(e)));
    } catch (_) {
      emit(state.copyWith(
          loading: false, error: 'Something went wrong. Please try again.'));
    }
  }

  Future<void> loadMore() async {
    if (state.loadingMore || !state.hasMore) return;
    emit(state.copyWith(loadingMore: true));
    try {
      final next = state.page + 1;
      final res =
          await _walletService.getTransactions(type: state.filter, page: next);
      emit(state.copyWith(
        transactions: [...state.transactions, ...res.data],
        page: next,
        hasMore: next < (res.meta?.totalPages ?? next),
        loadingMore: false,
      ));
    } on DioException {
      emit(state.copyWith(loadingMore: false));
    }
  }
}
