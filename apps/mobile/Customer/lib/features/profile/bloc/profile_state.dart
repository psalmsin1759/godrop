import '../../../shared/models/common_models.dart';
import '../../../shared/models/profile_models.dart';

abstract class ProfileState {}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final UserProfile profile;
  final List<SavedAddress> addresses;
  final int orderCount;
  ProfileLoaded({required this.profile, required this.addresses, this.orderCount = 0});
}

class ProfileError extends ProfileState {
  final String message;
  ProfileError(this.message);
}
