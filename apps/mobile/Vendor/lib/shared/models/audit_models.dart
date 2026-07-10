import 'package:json_annotation/json_annotation.dart';

part 'audit_models.g.dart';

@JsonSerializable()
class ExportAuditLogsBody {
  /// YYYY-MM-DD, Lagos-local, inclusive.
  final String startDate;
  final String endDate;

  const ExportAuditLogsBody({required this.startDate, required this.endDate});

  factory ExportAuditLogsBody.fromJson(Map<String, dynamic> json) =>
      _$ExportAuditLogsBodyFromJson(json);
  Map<String, dynamic> toJson() => _$ExportAuditLogsBodyToJson(this);
}
