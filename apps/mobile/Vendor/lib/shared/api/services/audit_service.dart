import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/audit_models.dart';
import '../../models/common_models.dart';

part 'audit_service.g.dart';

@RestApi()
abstract class AuditService {
  factory AuditService(Dio dio, {String? baseUrl}) = _AuditService;

  /// Emails the requesting admin a PDF of the activity log for the range.
  @POST('/vendor-admin/audit-logs/export')
  Future<MessageResponse> export(@Body() ExportAuditLogsBody body);
}
