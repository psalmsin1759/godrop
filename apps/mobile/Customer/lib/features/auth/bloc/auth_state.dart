abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthOtpSent extends AuthState {
  final String phone;
  AuthOtpSent(this.phone);
}

class AuthOtpVerified extends AuthState {
  final String phone;
  final bool isNewUser;
  AuthOtpVerified({required this.phone, required this.isNewUser});
}

class AuthAuthenticated extends AuthState {}

class AuthForgotPasswordSent extends AuthState {}

class AuthPasswordChanged extends AuthState {}

class AuthAccountDeleted extends AuthState {}

class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}
