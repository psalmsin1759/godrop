import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../../app/router.dart';
import '../api/api.dart';
import '../models/notification_models.dart';
import 'disputes_unread_service.dart';
import 'user_prefs.dart';

const _kChannelId = 'godrop_orders';

const _androidChannel = AndroidNotificationChannel(
  _kChannelId,
  'GoDrop Order Updates',
  description: 'Delivery status and order alerts',
  importance: Importance.max,
  playSound: true,
  enableVibration: true,
);

final _localNotifications = FlutterLocalNotificationsPlugin();

// ─── Called once from main(), before runApp ─────────────────────────────────

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

// Top-level handler — called from main() so it applies for the whole session,
// regardless of auth state.
void setupForegroundMessageListener() {
  FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
    final type = message.data['type'] ?? 'unknown';
    debugPrint('[PUSH/Customer] Foreground message | type=$type | title=${message.notification?.title}');

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
          'GoDrop Order Updates',
          channelDescription: 'Delivery status and order alerts',
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

// ─── Order completion → global "rate your rider" prompt ─────────────────────

/// Surfaces the order-complete / rate-rider screen on top of whatever screen
/// the customer is currently on, in real time, whenever the backend reports
/// an order as delivered.
void setupOrderCompletionListener() {
  void handle(RemoteMessage message) {
    if (message.data['type'] != 'ORDER_DELIVERED') return;
    final orderId = message.data['orderId'] as String?;
    if (orderId == null || orderId.isEmpty) return;
    _showOrderCompletion(orderId);
  }

  FirebaseMessaging.onMessage.listen(handle);
  FirebaseMessaging.onMessageOpenedApp.listen(handle);
  FirebaseMessaging.instance.getInitialMessage().then((message) {
    if (message != null) handle(message);
  });
}

void _showOrderCompletion(String orderId) {
  final target = '/orders/delivered/$orderId';
  final current = appRouter.routerDelegate.currentConfiguration.uri.path;
  if (current == target) return;
  appRouter.push(target);
}

// ─── Dispute replies/resolutions → refresh badge, tap to open thread ────────

void setupDisputeNotificationListener() {
  void handleForeground(RemoteMessage message) {
    if (message.data['type'] != 'DISPUTE_REPLY' &&
        message.data['type'] != 'DISPUTE_RESOLVED') {
      return;
    }
    DisputesUnreadService.refresh();
  }

  void handleTap(RemoteMessage message) {
    if (message.data['type'] != 'DISPUTE_REPLY' &&
        message.data['type'] != 'DISPUTE_RESOLVED') {
      return;
    }
    final disputeId = message.data['disputeId'] as String?;
    if (disputeId == null || disputeId.isEmpty) return;
    appRouter.push('/disputes/$disputeId');
  }

  FirebaseMessaging.onMessage.listen(handleForeground);
  FirebaseMessaging.onMessageOpenedApp.listen(handleTap);
  FirebaseMessaging.instance.getInitialMessage().then((message) {
    if (message != null) handleTap(message);
  });
}

// ─── Called after successful auth ────────────────────────────────────────────

class PushNotificationService {
  PushNotificationService._();

  static final _messaging = FirebaseMessaging.instance;
  static NotificationsService? _service;

  static NotificationsService get _api =>
      _service ??= NotificationsService(DioClient.instance);

  static Stream<RemoteMessage> get onMessageOpenedApp =>
      FirebaseMessaging.onMessageOpenedApp;

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

    try {
      final token = await _messaging.getToken();
      if (token != null) await _registerIfChanged(token);
    } catch (e) {
      debugPrint('[PUSH/Customer] getToken failed: $e');
    }

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
      debugPrint('[PUSH/Customer] FCM token registered | platform=${Platform.isIOS ? 'ios' : 'android'}');
    } catch (e) {
      debugPrint('[PUSH/Customer] Token registration failed: $e');
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
