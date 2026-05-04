import 'package:equatable/equatable.dart';
import '../../../shared/models/rider_models.dart';

abstract class HistoryState extends Equatable {
  const HistoryState();
  @override
  List<Object?> get props => [];
}

class HistoryInitial extends HistoryState {
  const HistoryInitial();
}

class HistoryLoading extends HistoryState {
  const HistoryLoading();
}

class HistoryLoaded extends HistoryState {
  final List<RiderOrder> orders;
  final bool hasMore;
  const HistoryLoaded({required this.orders, required this.hasMore});
  @override
  List<Object?> get props => [orders, hasMore];
}

class HistoryError extends HistoryState {
  final String message;
  const HistoryError(this.message);
  @override
  List<Object?> get props => [message];
}
