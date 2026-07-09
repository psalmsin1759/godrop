import 'package:json_annotation/json_annotation.dart';

part 'audit_models.g.dart';

@JsonSerializable()
class AuditAdminRef {
  final String? firstName;
  final String? lastName;
  final String? email;

  const AuditAdminRef({this.firstName, this.lastName, this.email});

  factory AuditAdminRef.fromJson(Map<String, dynamic> json) =>
      _$AuditAdminRefFromJson(json);
  Map<String, dynamic> toJson() => _$AuditAdminRefToJson(this);
}

@JsonSerializable()
class AuditLogEntry {
  final String id;
  final String action;
  final String entity;
  final String? entityId;
  final AuditAdminRef? admin;
  final String createdAt;

  const AuditLogEntry({
    required this.id,
    required this.action,
    required this.entity,
    this.entityId,
    this.admin,
    required this.createdAt,
  });

  factory AuditLogEntry.fromJson(Map<String, dynamic> json) =>
      _$AuditLogEntryFromJson(json);
  Map<String, dynamic> toJson() => _$AuditLogEntryToJson(this);
}

@JsonSerializable()
class AuditLogListResponse {
  @JsonKey(defaultValue: [])
  final List<AuditLogEntry> data;
  @JsonKey(defaultValue: 0)
  final int total;
  @JsonKey(defaultValue: 1)
  final int page;
  @JsonKey(defaultValue: 15)
  final int limit;

  const AuditLogListResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory AuditLogListResponse.fromJson(Map<String, dynamic> json) =>
      _$AuditLogListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuditLogListResponseToJson(this);
}
