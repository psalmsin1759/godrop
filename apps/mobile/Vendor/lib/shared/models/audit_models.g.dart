// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AuditAdminRef _$AuditAdminRefFromJson(Map<String, dynamic> json) =>
    AuditAdminRef(
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      email: json['email'] as String?,
    );

Map<String, dynamic> _$AuditAdminRefToJson(AuditAdminRef instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'email': instance.email,
    };

AuditLogEntry _$AuditLogEntryFromJson(Map<String, dynamic> json) =>
    AuditLogEntry(
      id: json['id'] as String,
      action: json['action'] as String,
      entity: json['entity'] as String,
      entityId: json['entityId'] as String?,
      admin: json['admin'] == null
          ? null
          : AuditAdminRef.fromJson(json['admin'] as Map<String, dynamic>),
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$AuditLogEntryToJson(AuditLogEntry instance) =>
    <String, dynamic>{
      'id': instance.id,
      'action': instance.action,
      'entity': instance.entity,
      'entityId': instance.entityId,
      'admin': instance.admin,
      'createdAt': instance.createdAt,
    };

AuditLogListResponse _$AuditLogListResponseFromJson(
        Map<String, dynamic> json) =>
    AuditLogListResponse(
      data: (json['data'] as List<dynamic>?)
              ?.map((e) => AuditLogEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      total: (json['total'] as num?)?.toInt() ?? 0,
      page: (json['page'] as num?)?.toInt() ?? 1,
      limit: (json['limit'] as num?)?.toInt() ?? 15,
    );

Map<String, dynamic> _$AuditLogListResponseToJson(
        AuditLogListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'total': instance.total,
      'page': instance.page,
      'limit': instance.limit,
    };
