// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'team_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

TeamMember _$TeamMemberFromJson(Map<String, dynamic> json) => TeamMember(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$TeamMemberToJson(TeamMember instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'role': instance.role,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt,
    };

TeamListResponse _$TeamListResponseFromJson(Map<String, dynamic> json) =>
    TeamListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => TeamMember.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$TeamListResponseToJson(TeamListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

TeamMemberResponse _$TeamMemberResponseFromJson(Map<String, dynamic> json) =>
    TeamMemberResponse(
      data: TeamMember.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$TeamMemberResponseToJson(TeamMemberResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

InviteTeamMemberBody _$InviteTeamMemberBodyFromJson(
        Map<String, dynamic> json) =>
    InviteTeamMemberBody(
      email: json['email'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String,
    );

Map<String, dynamic> _$InviteTeamMemberBodyToJson(
        InviteTeamMemberBody instance) =>
    <String, dynamic>{
      'email': instance.email,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'role': instance.role,
    };

UpdateTeamMemberBody _$UpdateTeamMemberBodyFromJson(
        Map<String, dynamic> json) =>
    UpdateTeamMemberBody(
      role: json['role'] as String,
    );

Map<String, dynamic> _$UpdateTeamMemberBodyToJson(
        UpdateTeamMemberBody instance) =>
    <String, dynamic>{
      'role': instance.role,
    };
