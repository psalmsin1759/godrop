import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'notification_models.g.dart';

@JsonSerializable(includeIfNull: false)
class AppNotification {
  final String id;
  final String title;
  final String body;
  final bool isRead;
  final String createdAt;
  final Map<String, dynamic>? data;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.isRead,
    required this.createdAt,
    this.data,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      _$AppNotificationFromJson(json);
  Map<String, dynamic> toJson() => _$AppNotificationToJson(this);
}

@JsonSerializable()
class NotificationListResponse {
  final List<AppNotification> data;
  final Pagination meta;
  final int unreadCount;

  const NotificationListResponse({
    required this.data,
    required this.meta,
    required this.unreadCount,
  });

  factory NotificationListResponse.fromJson(Map<String, dynamic> json) =>
      _$NotificationListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationListResponseToJson(this);
}

@JsonSerializable()
class PushTokenBody {
  final String token;
  final String platform;

  const PushTokenBody({required this.token, required this.platform});

  factory PushTokenBody.fromJson(Map<String, dynamic> json) =>
      _$PushTokenBodyFromJson(json);
  Map<String, dynamic> toJson() => _$PushTokenBodyToJson(this);
}

@JsonSerializable(includeIfNull: false)
class MarkNotificationsReadBody {
  final List<String>? ids;

  const MarkNotificationsReadBody({this.ids});

  factory MarkNotificationsReadBody.fromJson(Map<String, dynamic> json) =>
      _$MarkNotificationsReadBodyFromJson(json);
  Map<String, dynamic> toJson() => _$MarkNotificationsReadBodyToJson(this);
}

@JsonSerializable()
class RemovePushTokenBody {
  final String token;

  const RemovePushTokenBody({required this.token});

  factory RemovePushTokenBody.fromJson(Map<String, dynamic> json) =>
      _$RemovePushTokenBodyFromJson(json);
  Map<String, dynamic> toJson() => _$RemovePushTokenBodyToJson(this);
}
