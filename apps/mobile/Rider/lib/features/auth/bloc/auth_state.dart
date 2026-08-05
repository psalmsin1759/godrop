import 'package:equatable/equatable.dart';
import '../../../shared/models/rider_models.dart';

abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthOtpSent extends AuthState {
  final String phone;
  const AuthOtpSent(this.phone);
  @override
  List<Object?> get props => [phone];
}

class AuthAuthenticated extends AuthState {
  final RiderProfile rider;
  const AuthAuthenticated(this.rider);
  @override
  List<Object?> get props => [rider];
}

class AuthPasswordSetupRequired extends AuthState {
  final String riderId;
  const AuthPasswordSetupRequired(this.riderId);
  @override
  List<Object?> get props => [riderId];
}

class AuthForgotPasswordSent extends AuthState {
  const AuthForgotPasswordSent();
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
  @override
  List<Object?> get props => [message];
}
