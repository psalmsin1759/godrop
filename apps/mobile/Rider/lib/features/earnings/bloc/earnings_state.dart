import 'package:equatable/equatable.dart';
import '../../../shared/models/rider_models.dart';

abstract class EarningsState extends Equatable {
  const EarningsState();
  @override
  List<Object?> get props => [];
}

class EarningsInitial extends EarningsState {
  const EarningsInitial();
}

class EarningsLoading extends EarningsState {
  const EarningsLoading();
}

class EarningsLoaded extends EarningsState {
  final RiderEarningsSummary summary;
  final List<RiderEarning> earnings;
  final List<RiderWithdrawal> withdrawals;
  final bool hasMore;

  const EarningsLoaded({
    required this.summary,
    required this.earnings,
    required this.withdrawals,
    required this.hasMore,
  });

  @override
  List<Object?> get props => [summary, earnings, withdrawals, hasMore];
}

class EarningsError extends EarningsState {
  final String message;
  const EarningsError(this.message);
  @override
  List<Object?> get props => [message];
}

class WithdrawalSubmitting extends EarningsState {
  final EarningsLoaded loaded;
  const WithdrawalSubmitting(this.loaded);
  @override
  List<Object?> get props => [loaded];
}

class WithdrawalSuccess extends EarningsState {
  final EarningsLoaded loaded;
  const WithdrawalSuccess(this.loaded);
  @override
  List<Object?> get props => [loaded];
}
