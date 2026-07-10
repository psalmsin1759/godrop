import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../../app/router.dart';
import '../api/api.dart';
import '../models/notification_models.dart';
import 'user_prefs.dart';

const _kChannelId = 'godrop_vendor_orders';

const _androidChannel = AndroidNotificationChannel(
  _kChannelId,
  'GoDrop Vendor Orders',
  description: 'New order and store alerts',
  importance: Importance.max,
  playSound: true,
  enableVibration: true,
);

final _localNotifications = FlutterLocalNotificationsPlugin();

// ─── Called once from main(), before runApp ─────────────────────────────────

Future<void> initLocalNotifications() async {
  const androidSettings = AndroidInitializationSettings('@mipmap/launcher_icon');
  const iosSettings = DarwinInitializationSettings();
  await _localNotifications.initialize(
    const InitializationSettings(android: androidSettings, iOS: iosSettings),
  );

  await _localNotifications
      .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(_androidChannel);
}

// Top-level handler — called from main() so it applies for the whole session,
// regardless of auth state.
void setupForegroundMessageListener() {
  FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
    final type = message.data['type'] ?? 'unknown';
    debugPrint('[PUSH/Vendor] Foreground message | type=$type | title=${message.notification?.title}');

    // iOS foreground display is handled by setForegroundNotificationPresentationOptions
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
          'GoDrop Vendor Orders',
          channelDescription: 'New order and store alerts',
          importance: Importance.max,
          priority: Priority.high,
          playSound: true,
          enableVibration: true,
          icon: '@mipmap/launcher_icon',
        ),
      ),
    );
  });
}

// ─── New order tap → open the order detail ──────────────────────────────────

/// Opens the order detail screen when the vendor taps a new-order push
/// (from the background/terminated state).
void setupNewOrderTapListener() {
  void handle(RemoteMessage message) {
    if (message.data['type'] != 'NEW_ORDER') return;
    final orderId = message.data['orderId'] as String?;
    if (orderId == null || orderId.isEmpty) return;
    _openOrderDetail(orderId);
  }

  FirebaseMessaging.onMessageOpenedApp.listen(handle);
  FirebaseMessaging.instance.getInitialMessage().then((message) {
    if (message != null) handle(message);
  });
}

void _openOrderDetail(String orderId) {
  final target = '/orders/$orderId';
  final current = appRouter.routerDelegate.currentConfiguration.uri.path;
  if (current == target) return;
  appRouter.push(target);
}

// ─── Called after successful auth ────────────────────────────────────────────

class PushNotificationService {
  PushNotificationService._();

  static final _messaging = FirebaseMessaging.instance;
  static NotificationsService? _service;

  static NotificationsService get _api =>
      _service ??= NotificationsService(DioClient.instance);

  static Future<void> init() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    if (settings.authorizationStatus == AuthorizationStatus.denied) return;

    // iOS: present notifications while app is open
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
    if (UserPrefs.fcmToken == token) return;
    try {
      await _api.registerPushToken(
        PushTokenBody(
          token: token,
          platform: Platform.isIOS ? 'ios' : 'android',
        ),
      );
      await UserPrefs.saveFcmToken(token);
      debugPrint('[PUSH/Vendor] FCM token registered | platform=${Platform.isIOS ? 'ios' : 'android'}');
    } catch (e) {
      debugPrint('[PUSH/Vendor] Token registration failed: $e');
    }
  }

  static Future<void> removeToken() async {
    final token = UserPrefs.fcmToken;
    if (token == null) return;
    try {
      await _api.removePushToken(RemovePushTokenBody(token: token));
    } catch (_) {}
    await UserPrefs.clearFcmToken();
  }
}
