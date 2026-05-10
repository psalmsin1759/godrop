import 'package:equatable/equatable.dart';
import '../../../shared/models/rider_models.dart';

abstract class ActiveState extends Equatable {
  const ActiveState();
  @override
  List<Object?> get props => [];
}

class ActiveInitial extends ActiveState {
  const ActiveInitial();
}

class ActiveLoading extends ActiveState {
  const ActiveLoading();
}

class ActiveNone extends ActiveState {
  const ActiveNone();
}

class ActiveLoaded extends ActiveState {
  final RiderOrderDetail order;
  final String? errorMessage;
  const ActiveLoaded(this.order, {this.errorMessage});
  @override
  List<Object?> get props => [order, errorMessage];
}

class ActiveError extends ActiveState {
  final String message;
  const ActiveError(this.message);
  @override
  List<Object?> get props => [message];
}

class ActiveActionLoading extends ActiveState {
  final RiderOrderDetail order;
  const ActiveActionLoading(this.order);
  @override
  List<Object?> get props => [order];
}
