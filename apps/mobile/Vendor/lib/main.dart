import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app/vendor_app.dart';
import 'features/auth/bloc/auth_cubit.dart';
import 'features/catalog/bloc/categories_cubit.dart';
import 'features/catalog/bloc/products_cubit.dart';
import 'features/dashboard/bloc/dashboard_cubit.dart';
import 'features/orders/bloc/orders_cubit.dart';
import 'features/profile/bloc/session_cubit.dart';
import 'features/wallet/bloc/wallet_cubit.dart';
import 'shared/services/user_prefs.dart';

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

  await UserPrefs.init();

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => AuthCubit()),
        BlocProvider(create: (_) => SessionCubit()),
        BlocProvider(create: (_) => DashboardCubit()),
        BlocProvider(create: (_) => OrdersCubit()),
        BlocProvider(create: (_) => ProductsCubit()),
        BlocProvider(create: (_) => CategoriesCubit()),
        BlocProvider(create: (_) => WalletCubit()),
      ],
      child: const GodropVendorApp(),
    ),
  );
}
