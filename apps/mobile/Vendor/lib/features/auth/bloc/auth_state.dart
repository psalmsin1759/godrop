import '../../../shared/models/admin_models.dart';

abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final VendorAdmin admin;
  AuthAuthenticated(this.admin);
}

class AuthLoggedOut extends AuthState {}

class AuthForgotPasswordSent extends AuthState {}

class AuthPasswordReset extends AuthState {}

class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}
