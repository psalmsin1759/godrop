import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app/customer_app.dart';
import 'app/router.dart';
import 'features/auth/bloc/auth_cubit.dart';
import 'features/parcel/models/parcel_location.dart';
import 'features/orders/models/active_order.dart';
import 'features/orders/bloc/order_cubit.dart';
import 'features/orders/bloc/remote_orders_cubit.dart';
import 'features/food/bloc/cart_cubit.dart';
import 'shared/bloc/delivery_address_cubit.dart';
import 'shared/bloc/favorites_cubit.dart';
import 'features/profile/bloc/profile_cubit.dart';
import 'features/profile/bloc/wallet_cubit.dart';
import 'features/profile/bloc/notifications_cubit.dart';
import 'shared/services/app_update_service.dart';
import 'shared/services/push_notification_service.dart';
import 'shared/services/user_prefs.dart';

@pragma('vm:entry-point')
Future<void> _fcmBackgroundHandler(RemoteMessage message) async {
  final type = message.data['type'] ?? 'unknown';
  debugPrint('[PUSH/Customer] Background message | type=$type');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarDividerColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_fcmBackgroundHandler);
  await initLocalNotifications();
  setupForegroundMessageListener();
  setupOrderCompletionListener();
  await PushNotificationService.init();

  await Hive.initFlutter();
  await UserPrefs.init();
  Hive.registerAdapter(ParcelLocationAdapter());
  Hive.registerAdapter(ActiveOrderDataAdapter());
  final orderBox = await Hive.openBox('orders');


//sss
  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => AuthCubit()),
        BlocProvider(create: (_) => OrderCubit(orderBox)),
        BlocProvider(create: (_) => CartCubit()),
        BlocProvider(create: (_) => DeliveryAddressCubit()),
        BlocProvider(create: (_) => ProfileCubit()),
        BlocProvider(create: (_) => WalletCubit()),
        BlocProvider(create: (_) => NotificationsCubit()),
        BlocProvider(create: (_) => RemoteOrdersCubit()),
        BlocProvider(create: (_) => FavoritesCubit()),
      ],
      child: const GodropCustomerApp(),
    ),
  );

  WidgetsBinding.instance.addPostFrameCallback((_) {
    final ctx = rootNavigatorKey.currentContext;
    if (ctx != null) AppUpdateService.checkForUpdate(ctx);
  });
}
