import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'rider_notifications_service.g.dart';

@RestApi()
abstract class RiderNotificationsService {
  factory RiderNotificationsService(Dio dio) = _RiderNotificationsService;

  @GET('/rider/notifications')
  Future<dynamic> listNotifications({
    @Query('page') int page = 1,
    @Query('limit') int limit = 20,
  });

  @GET('/rider/notifications/unread-count')
  Future<dynamic> getUnreadCount();

  @PATCH('/rider/notifications/read-all')
  Future<dynamic> markAllRead();

  @PATCH('/rider/notifications/{id}/read')
  Future<dynamic> markRead(@Path('id') String id);
}
