import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/invest_models.dart';
import '../../../shared/utils/errors.dart';

sealed class PortfolioState extends Equatable {
  const PortfolioState();
  @override
  List<Object?> get props => [];
}

class PortfolioInitial extends PortfolioState {}

class PortfolioLoading extends PortfolioState {}

class PortfolioLoaded extends PortfolioState {
  const PortfolioLoaded({required this.portfolio, required this.investments});
  final InvestorPortfolio? portfolio;
  final List<Investment> investments;

  List<Investment> get active => investments.where((i) => i.isActive).toList();
  List<Investment> get matured => investments.where((i) => i.isMatured).toList();

  @override
  List<Object?> get props => [portfolio, investments];
}

class PortfolioError extends PortfolioState {
  const PortfolioError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class PortfolioCubit extends Cubit<PortfolioState> {
  PortfolioCubit() : super(PortfolioInitial());

  final _investService = InvestService(DioClient.instance);

  Future<void> load() async {
    emit(PortfolioLoading());
    try {
      final res = await _investService.getInvestments();
      emit(PortfolioLoaded(portfolio: res.portfolio, investments: res.data));
    } on DioException catch (e) {
      emit(PortfolioError(parseDioError(e)));
    } catch (_) {
      emit(const PortfolioError('Something went wrong. Please try again.'));
    }
  }
}

// ── Single investment detail ──────────────────────────────────

sealed class InvestmentDetailState extends Equatable {
  const InvestmentDetailState();
  @override
  List<Object?> get props => [];
}

class InvestmentDetailLoading extends InvestmentDetailState {}

class InvestmentDetailLoaded extends InvestmentDetailState {
  const InvestmentDetailLoaded(this.investment);
  final Investment investment;
  @override
  List<Object?> get props => [investment];
}

class InvestmentDetailError extends InvestmentDetailState {
  const InvestmentDetailError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class InvestmentDetailCubit extends Cubit<InvestmentDetailState> {
  InvestmentDetailCubit() : super(InvestmentDetailLoading());

  final _investService = InvestService(DioClient.instance);

  Future<void> load(String id) async {
    emit(InvestmentDetailLoading());
    try {
      final res = await _investService.getInvestment(id);
      emit(InvestmentDetailLoaded(res.data));
    } on DioException catch (e) {
      emit(InvestmentDetailError(parseDioError(e)));
    } catch (_) {
      emit(const InvestmentDetailError('Something went wrong. Please try again.'));
    }
  }
}
