import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/audit_models.dart';

part 'audit_service.g.dart';

@RestApi()
abstract class AuditService {
  factory AuditService(Dio dio, {String? baseUrl}) = _AuditService;

  @GET('/vendor-admin/audit-logs')
  Future<AuditLogListResponse> list({
    @Query('action') String? action,
    @Query('entity') String? entity,
    @Query('page') int page = 1,
    @Query('limit') int limit = 15,
  });
}
