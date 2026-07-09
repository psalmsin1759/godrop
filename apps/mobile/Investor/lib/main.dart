import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app/investor_app.dart';
import 'features/assets/bloc/assets_cubit.dart';
import 'features/auth/bloc/auth_cubit.dart';
import 'features/home/bloc/home_cubit.dart';
import 'features/invest/bloc/invest_flow_cubit.dart';
import 'features/portfolio/bloc/portfolio_cubit.dart';
import 'features/profile/bloc/bank_accounts_cubit.dart';
import 'features/profile/bloc/kyc_cubit.dart';
import 'features/profile/bloc/notifications_cubit.dart';
import 'features/profile/bloc/profile_cubit.dart';
import 'features/profile/bloc/settings_cubit.dart';
import 'features/profile/bloc/support_cubit.dart';
import 'features/safe/bloc/safe_cubit.dart';
import 'features/transactions/bloc/transactions_cubit.dart';
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
        BlocProvider(create: (_) => HomeCubit()),
        BlocProvider(create: (_) => AssetsCubit()),
        BlocProvider(create: (_) => InvestFlowCubit()),
        BlocProvider(create: (_) => PortfolioCubit()),
        BlocProvider(create: (_) => InvestmentDetailCubit()),
        BlocProvider(create: (_) => WalletCubit()),
        BlocProvider(create: (_) => SafeCubit()),
        BlocProvider(create: (_) => TransactionsCubit()),
        BlocProvider(create: (_) => ProfileCubit()),
        BlocProvider(create: (_) => BankAccountsCubit()),
        BlocProvider(create: (_) => KycCubit()),
        BlocProvider(create: (_) => SettingsCubit()),
        BlocProvider(create: (_) => NotificationsCubit()),
        BlocProvider(create: (_) => SupportCubit()),
      ],
      child: const GodropInvestorApp(),
    ),
  );
}
