import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../api/api.dart';
import 'rider_prefs.dart';

const _kChannelId = 'godrop_rider_orders';

const _androidChannel = AndroidNotificationChannel(
  _kChannelId,
  'GoDrop Rider Alerts',
  description: 'New orders and delivery status alerts',
  importance: Importance.max,
  playSound: true,
  enableVibration: true,
);

final _localNotifications = FlutterLocalNotificationsPlugin();

Future<void> initLocalNotifications() async {
  const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
  const iosSettings = DarwinInitializationSettings();
  await _localNotifications.initialize(
    const InitializationSettings(android: androidSettings, iOS: iosSettings),
  );
  await _localNotifications
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(_androidChannel);
}

void setupForegroundMessageListener() {
  FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
    final type = message.data['type'] ?? 'unknown';
    debugPrint('[PUSH/Rider] Foreground message | type=$type | title=${message.notification?.title}');
    if (!Platform.isAndroid) return;
    final notification = message.notification;
    if (notification == null) return;
    await _localNotifications.show(
      message.hashCode.abs(),
      notification.title,
      notification.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          _kChannelId,
          'GoDrop Rider Alerts',
          channelDescription: 'New orders and delivery status alerts',
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          enableVibration: true,
          icon: '@mipmap/ic_launcher',
        ),
      ),
    );
  });
}

class RiderPushNotificationService {
  RiderPushNotificationService._();

  static final _messaging = FirebaseMessaging.instance;
  static RiderProfileService? _service;

  static RiderProfileService get _api =>
      _service ??= RiderProfileService(DioClient.instance);

  static Stream<RemoteMessage> get onMessage => FirebaseMessaging.onMessage;

  static Future<void> init() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    if (settings.authorizationStatus == AuthorizationStatus.denied) return;

    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    final token = await _messaging.getToken();
    if (token != null) await _registerIfChanged(token);
    _messaging.onTokenRefresh.listen(_registerIfChanged);
  }

  static Future<void> _registerIfChanged(String token) async {
    if (RiderPrefs.fcmToken == token) return;
    try {
      await _api.registerPushToken({
        'token': token,
        'platform': Platform.isIOS ? 'ios' : 'android',
      });
      await RiderPrefs.saveFcmToken(token);
      debugPrint('[PUSH/Rider] FCM token registered | platform=${Platform.isIOS ? 'ios' : 'android'}');
    } catch (e) {
      debugPrint('[PUSH/Rider] Token registration failed: $e');
    }
  }

  static Future<void> removeToken() async {
    final token = RiderPrefs.fcmToken;
    if (token == null) return;
    try {
      await _api.removePushToken({'token': token});
    } catch (_) {}
    await RiderPrefs.clearFcmToken();
  }
}
