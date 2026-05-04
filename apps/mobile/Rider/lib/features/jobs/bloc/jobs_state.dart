import 'package:equatable/equatable.dart';
import '../../../shared/models/rider_models.dart';

abstract class JobsState extends Equatable {
  const JobsState();
  @override
  List<Object?> get props => [];
}

class JobsInitial extends JobsState {
  const JobsInitial();
}

class JobsLoading extends JobsState {
  const JobsLoading();
}

class JobsLoaded extends JobsState {
  final List<RiderOrder> pending;
  final List<RiderOrder> assigned;

  const JobsLoaded({required this.pending, required this.assigned});

  @override
  List<Object?> get props => [pending, assigned];
}

class JobsError extends JobsState {
  final String message;
  const JobsError(this.message);
  @override
  List<Object?> get props => [message];
}

abstract class JobDetailState extends Equatable {
  const JobDetailState();
  @override
  List<Object?> get props => [];
}

class JobDetailInitial extends JobDetailState {
  const JobDetailInitial();
}

class JobDetailLoading extends JobDetailState {
  const JobDetailLoading();
}

class JobDetailLoaded extends JobDetailState {
  final RiderOrderDetail order;
  const JobDetailLoaded(this.order);
  @override
  List<Object?> get props => [order];
}

class JobDetailError extends JobDetailState {
  final String message;
  const JobDetailError(this.message);
  @override
  List<Object?> get props => [message];
}

class JobActionSuccess extends JobDetailState {
  final RiderOrder order;
  final String action;
  const JobActionSuccess(this.order, this.action);
  @override
  List<Object?> get props => [order, action];
}
