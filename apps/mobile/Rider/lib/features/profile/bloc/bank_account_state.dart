import 'package:equatable/equatable.dart';
import '../../../shared/models/rider_models.dart';

abstract class BankAccountState extends Equatable {
  const BankAccountState();
  @override
  List<Object?> get props => [];
}

class BankAccountInitial extends BankAccountState {
  const BankAccountInitial();
}

class BankAccountLoading extends BankAccountState {
  const BankAccountLoading();
}

class BankAccountLoaded extends BankAccountState {
  final List<Bank> banks;
  final bool resolving;
  final String? resolvedAccountName;
  final String? resolveError;

  const BankAccountLoaded({
    required this.banks,
    this.resolving = false,
    this.resolvedAccountName,
    this.resolveError,
  });

  BankAccountLoaded copyWith({
    bool? resolving,
    String? resolvedAccountName,
    String? resolveError,
    bool clearResolution = false,
  }) {
    return BankAccountLoaded(
      banks: banks,
      resolving: resolving ?? this.resolving,
      resolvedAccountName:
          clearResolution ? null : (resolvedAccountName ?? this.resolvedAccountName),
      resolveError: clearResolution ? null : (resolveError ?? this.resolveError),
    );
  }

  @override
  List<Object?> get props => [banks, resolving, resolvedAccountName, resolveError];
}

class BankAccountError extends BankAccountState {
  final String message;
  const BankAccountError(this.message);
  @override
  List<Object?> get props => [message];
}
