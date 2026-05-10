import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app/rider_app.dart';
import 'features/auth/bloc/auth_cubit.dart';
import 'features/jobs/bloc/jobs_cubit.dart';
import 'features/active/bloc/active_cubit.dart';
import 'features/history/bloc/history_cubit.dart';
import 'features/earnings/bloc/earnings_cubit.dart';
import 'features/profile/bloc/profile_cubit.dart';
import 'features/notifications/bloc/notifications_cubit.dart';
import 'shared/services/rider_prefs.dart';
import 'shared/services/push_notification_service.dart';

@pragma('vm:entry-point')
Future<void> _fcmBackgroundHandler(RemoteMessage message) async {
  final type = message.data['type'] ?? 'unknown';
  debugPrint('[PUSH/Rider] Background message | type=$type');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await RiderPrefs.init();
  await initLocalNotifications();
  FirebaseMessaging.onBackgroundMessage(_fcmBackgroundHandler);
  setupForegroundMessageListener();
  await RiderPushNotificationService.init();

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => AuthCubit()),
        BlocProvider(create: (_) => JobsCubit()),
        BlocProvider(create: (_) => JobDetailCubit()),
        BlocProvider(create: (_) => ActiveCubit()),
        BlocProvider(create: (_) => HistoryCubit()),
        BlocProvider(create: (_) => EarningsCubit()),
        BlocProvider(create: (_) => ProfileCubit()),
        BlocProvider(create: (_) => NotificationsCubit()),
      ],
      child: const RiderApp(),
    ),
  );
}
