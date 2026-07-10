// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AdminNotification _$AdminNotificationFromJson(Map<String, dynamic> json) =>
    AdminNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      data: json['data'] as Map<String, dynamic>?,
      isRead: json['isRead'] as bool? ?? false,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$AdminNotificationToJson(AdminNotification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'title': instance.title,
      'body': instance.body,
      'data': instance.data,
      'isRead': instance.isRead,
      'createdAt': instance.createdAt,
    };

NotificationListResponse _$NotificationListResponseFromJson(
        Map<String, dynamic> json) =>
    NotificationListResponse(
      data: (json['data'] as List<dynamic>?)
              ?.map(
                  (e) => AdminNotification.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      meta: json['meta'] == null
          ? null
          : Pagination.fromJson(json['meta'] as Map<String, dynamic>),
      unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$NotificationListResponseToJson(
        NotificationListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
      'unreadCount': instance.unreadCount,
    };

UnreadCount _$UnreadCountFromJson(Map<String, dynamic> json) => UnreadCount(
      count: (json['count'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$UnreadCountToJson(UnreadCount instance) =>
    <String, dynamic>{
      'count': instance.count,
    };

UnreadCountResponse _$UnreadCountResponseFromJson(Map<String, dynamic> json) =>
    UnreadCountResponse(
      data: UnreadCount.fromJson(json['data'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$UnreadCountResponseToJson(
        UnreadCountResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
    };

PushTokenBody _$PushTokenBodyFromJson(Map<String, dynamic> json) =>
    PushTokenBody(
      token: json['token'] as String,
      platform: json['platform'] as String,
    );

Map<String, dynamic> _$PushTokenBodyToJson(PushTokenBody instance) =>
    <String, dynamic>{
      'token': instance.token,
      'platform': instance.platform,
    };

RemovePushTokenBody _$RemovePushTokenBodyFromJson(Map<String, dynamic> json) =>
    RemovePushTokenBody(
      token: json['token'] as String,
    );

Map<String, dynamic> _$RemovePushTokenBodyToJson(
        RemovePushTokenBody instance) =>
    <String, dynamic>{
      'token': instance.token,
    };
