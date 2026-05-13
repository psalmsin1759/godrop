// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AppNotification _$AppNotificationFromJson(Map<String, dynamic> json) =>
    AppNotification(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      isRead: json['isRead'] as bool,
      createdAt: json['createdAt'] as String,
      data: json['data'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$AppNotificationToJson(AppNotification instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'body': instance.body,
      'isRead': instance.isRead,
      'createdAt': instance.createdAt,
      if (instance.data case final value?) 'data': value,
    };

NotificationListResponse _$NotificationListResponseFromJson(
        Map<String, dynamic> json) =>
    NotificationListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList(),
      meta: Pagination.fromJson(json['meta'] as Map<String, dynamic>),
      unreadCount: (json['unreadCount'] as num).toInt(),
    );

Map<String, dynamic> _$NotificationListResponseToJson(
        NotificationListResponse instance) =>
    <String, dynamic>{
      'data': instance.data,
      'meta': instance.meta,
      'unreadCount': instance.unreadCount,
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

MarkNotificationsReadBody _$MarkNotificationsReadBodyFromJson(
        Map<String, dynamic> json) =>
    MarkNotificationsReadBody(
      ids: (json['ids'] as List<dynamic>?)?.map((e) => e as String).toList(),
    );

Map<String, dynamic> _$MarkNotificationsReadBodyToJson(
        MarkNotificationsReadBody instance) =>
    <String, dynamic>{
      if (instance.ids case final value?) 'ids': value,
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
