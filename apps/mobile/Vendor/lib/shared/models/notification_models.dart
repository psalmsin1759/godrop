import 'package:json_annotation/json_annotation.dart';
import 'common_models.dart';

part 'notification_models.g.dart';

@JsonSerializable()
class AdminNotification {
  final String id;
  final String type;
  final String title;
  final String body;
  final Map<String, dynamic>? data;
  @JsonKey(defaultValue: false)
  final bool isRead;
  final String createdAt;

  const AdminNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.data,
    required this.isRead,
    required this.createdAt,
  });

  factory AdminNotification.fromJson(Map<String, dynamic> json) =>
      _$AdminNotificationFromJson(json);
  Map<String, dynamic> toJson() => _$AdminNotificationToJson(this);
}

@JsonSerializable()
class NotificationListResponse {
  @JsonKey(defaultValue: [])
  final List<AdminNotification> data;
  final Pagination? meta;
  @JsonKey(defaultValue: 0)
  final int unreadCount;

  const NotificationListResponse({
    required this.data,
    this.meta,
    required this.unreadCount,
  });

  factory NotificationListResponse.fromJson(Map<String, dynamic> json) =>
      _$NotificationListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$NotificationListResponseToJson(this);
}

@JsonSerializable()
class UnreadCount {
  @JsonKey(defaultValue: 0)
  final int count;

  const UnreadCount({required this.count});

  factory UnreadCount.fromJson(Map<String, dynamic> json) =>
      _$UnreadCountFromJson(json);
  Map<String, dynamic> toJson() => _$UnreadCountToJson(this);
}

@JsonSerializable()
class UnreadCountResponse {
  final UnreadCount data;

  const UnreadCountResponse({required this.data});

  factory UnreadCountResponse.fromJson(Map<String, dynamic> json) =>
      _$UnreadCountResponseFromJson(json);
  Map<String, dynamic> toJson() => _$UnreadCountResponseToJson(this);
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

@JsonSerializable()
class RemovePushTokenBody {
  final String token;

  const RemovePushTokenBody({required this.token});

  factory RemovePushTokenBody.fromJson(Map<String, dynamic> json) =>
      _$RemovePushTokenBodyFromJson(json);
  Map<String, dynamic> toJson() => _$RemovePushTokenBodyToJson(this);
}
