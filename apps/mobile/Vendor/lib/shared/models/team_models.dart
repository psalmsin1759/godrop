import 'package:json_annotation/json_annotation.dart';

part 'team_models.g.dart';

@JsonSerializable()
class TeamMember {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String role; // OWNER | MANAGER | STAFF
  @JsonKey(defaultValue: true)
  final bool isActive;
  final String? createdAt;

  const TeamMember({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.isActive,
    this.createdAt,
  });

  String get fullName => '$firstName $lastName';

  factory TeamMember.fromJson(Map<String, dynamic> json) =>
      _$TeamMemberFromJson(json);
  Map<String, dynamic> toJson() => _$TeamMemberToJson(this);
}

@JsonSerializable()
class TeamListResponse {
  final List<TeamMember> data;

  const TeamListResponse({required this.data});

  factory TeamListResponse.fromJson(Map<String, dynamic> json) =>
      _$TeamListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TeamListResponseToJson(this);
}

@JsonSerializable()
class TeamMemberResponse {
  final TeamMember data;

  const TeamMemberResponse({required this.data});

  factory TeamMemberResponse.fromJson(Map<String, dynamic> json) =>
      _$TeamMemberResponseFromJson(json);
  Map<String, dynamic> toJson() => _$TeamMemberResponseToJson(this);
}

@JsonSerializable()
class InviteTeamMemberBody {
  final String email;
  final String firstName;
  final String lastName;
  final String role; // MANAGER | STAFF

  const InviteTeamMemberBody({
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
  });

  factory InviteTeamMemberBody.fromJson(Map<String, dynamic> json) =>
      _$InviteTeamMemberBodyFromJson(json);
  Map<String, dynamic> toJson() => _$InviteTeamMemberBodyToJson(this);
}

@JsonSerializable()
class UpdateTeamMemberBody {
  final String role; // MANAGER | STAFF

  const UpdateTeamMemberBody({required this.role});

  factory UpdateTeamMemberBody.fromJson(Map<String, dynamic> json) =>
      _$UpdateTeamMemberBodyFromJson(json);
  Map<String, dynamic> toJson() => _$UpdateTeamMemberBodyToJson(this);
}
