import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/common_models.dart';
import '../../models/notification_models.dart';

part 'notifications_service.g.dart';

@RestApi()
abstract class NotificationsService {
  factory NotificationsService(Dio dio, {String? baseUrl}) =
      _NotificationsService;

  @POST('/me/push-token')
  Future<MessageResponse> registerPushToken(@Body() PushTokenBody body);

  @DELETE('/me/push-token')
  Future<MessageResponse> removePushToken(@Body() RemovePushTokenBody body);

  @GET('/me/notifications')
  Future<NotificationListResponse> listNotifications({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
    @Query('isRead') bool? isRead,
  });

  @PATCH('/me/notifications/read')
  Future<MessageResponse> markRead(
    @Body() MarkNotificationsReadBody body,
  );
}
