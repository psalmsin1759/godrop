import '../../../shared/models/team_models.dart';

abstract class TeamState {}

class TeamInitial extends TeamState {}

class TeamLoading extends TeamState {}

class TeamLoaded extends TeamState {
  final List<TeamMember> members;
  TeamLoaded(this.members);
}

class TeamError extends TeamState {
  final String message;
  TeamError(this.message);
}
