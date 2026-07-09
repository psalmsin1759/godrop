import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/notification_models.dart';
import '../../models/common_models.dart';

part 'notifications_service.g.dart';

@RestApi()
abstract class NotificationsService {
  factory NotificationsService(Dio dio, {String? baseUrl}) =
      _NotificationsService;

  @GET('/vendor-admin/notifications')
  Future<NotificationListResponse> list({
    @Query('unreadOnly') bool unreadOnly = false,
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/vendor-admin/notifications/unread-count')
  Future<UnreadCountResponse> unreadCount();

  @PATCH('/vendor-admin/notifications/read-all')
  Future<MessageResponse> markAllRead();

  @PATCH('/vendor-admin/notifications/{id}/read')
  Future<MessageResponse> markRead(@Path('id') String id);
}
