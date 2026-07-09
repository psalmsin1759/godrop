import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/profile_models.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/settings_cubit.dart';

/// Screen 28 — settings: SECURITY / NOTIFICATIONS / PREFERENCES groups.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<SettingsCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<SettingsCubit, SettingsState>(
          listener: (context, state) {
            if (state is SettingsLoaded && state.error != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text(state.error!),
                    backgroundColor: InvestColors.red),
              );
            }
          },
          builder: (context, state) {
            return Column(
              children: [
                const InvestTopBar(title: 'Settings'),
                Expanded(
                  child: switch (state) {
                    SettingsLoading() => const LoadingView(),
                    SettingsError(message: final m) => ErrorView(
                        message: m,
                        onRetry: () => context.read<SettingsCubit>().load(),
                      ),
                    SettingsLoaded(settings: final s) =>
                      _buildLoaded(context, s),
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildLoaded(BuildContext context, InvestorSettings s) {
    final cubit = context.read<SettingsCubit>();
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
      children: [
        _section('SECURITY', [
          _toggleRow('Biometric login', Icons.fingerprint, s.biometricLogin,
              (v) => cubit.toggle('biometricLogin', v)),
          _valueRow('Transaction PIN', Icons.lock_outline, 'Change'),
          _toggleRow('Two-factor auth', Icons.shield_outlined, s.twoFactorAuth,
              (v) => cubit.toggle('twoFactorAuth', v),
              last: true),
        ]),
        _section('NOTIFICATIONS', [
          _toggleRow('Payout alerts', Icons.trending_up, s.payoutAlerts,
              (v) => cubit.toggle('payoutAlerts', v)),
          _toggleRow('Investment updates', Icons.local_mall_outlined,
              s.investmentUpdates, (v) => cubit.toggle('investmentUpdates', v)),
          _toggleRow('Promotions', Icons.notifications_none, s.promotions,
              (v) => cubit.toggle('promotions', v)),
          _toggleRow('Email statements', Icons.description_outlined,
              s.emailStatements, (v) => cubit.toggle('emailStatements', v),
              last: true),
        ]),
        _section('PREFERENCES', [
          _valueRow('Currency', Icons.monetization_on_outlined, '${s.currency} ₦'),
          _valueRow('Language', Icons.language, s.language),
          _valueRow('App lock timeout', Icons.schedule,
              '${s.appLockTimeoutMin} min',
              last: true),
        ]),
      ],
    );
  }

  Widget _section(String title, List<Widget> items) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 0, 4, 10),
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.4,
                color: InvestColors.mute,
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: InvestColors.raise,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: InvestColors.line),
            ),
            child: Column(children: items),
          ),
        ],
      ),
    );
  }

  Widget _rowShell({
    required String label,
    required IconData icon,
    required Widget trailing,
    bool last = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: InvestColors.line)),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: InvestColors.raise3,
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, size: 20, color: InvestColors.text),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.w600,
                color: InvestColors.text,
              ),
            ),
          ),
          trailing,
        ],
      ),
    );
  }

  Widget _toggleRow(String label, IconData icon, bool value,
      ValueChanged<bool> onChanged,
      {bool last = false}) {
    return _rowShell(
      label: label,
      icon: icon,
      last: last,
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeTrackColor: InvestColors.blue,
        activeThumbColor: Colors.white,
        inactiveTrackColor: InvestColors.raise3,
        inactiveThumbColor: Colors.white,
      ),
    );
  }

  Widget _valueRow(String label, IconData icon, String value,
      {bool last = false}) {
    return _rowShell(
      label: label,
      icon: icon,
      last: last,
      trailing: Row(
        children: [
          Text(value,
              style: const TextStyle(fontSize: 12.5, color: InvestColors.sub)),
          const SizedBox(width: 4),
          const Icon(Icons.chevron_right, size: 14, color: InvestColors.sub),
        ],
      ),
    );
  }
}
