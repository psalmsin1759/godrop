// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ExportAuditLogsBody _$ExportAuditLogsBodyFromJson(Map<String, dynamic> json) =>
    ExportAuditLogsBody(
      startDate: json['startDate'] as String,
      endDate: json['endDate'] as String,
    );

Map<String, dynamic> _$ExportAuditLogsBodyToJson(
        ExportAuditLogsBody instance) =>
    <String, dynamic>{
      'startDate': instance.startDate,
      'endDate': instance.endDate,
    };
