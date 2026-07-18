import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/opening_hours.dart';
import '../../shared/models/vendor_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import '../../shared/widgets/section_header.dart';
import '../../shared/widgets/skeleton.dart';
import '../profile/bloc/session_cubit.dart';
import 'bloc/store_settings_cubit.dart';
import 'bloc/store_settings_state.dart';

class StoreSettingsScreen extends StatelessWidget {
  const StoreSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => StoreSettingsCubit()..load(),
      child: const _StoreSettingsView(),
    );
  }
}

class _StoreSettingsView extends StatefulWidget {
  const _StoreSettingsView();

  @override
  State<_StoreSettingsView> createState() => _StoreSettingsViewState();
}

class _StoreSettingsViewState extends State<_StoreSettingsView> {
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _etaCtrl = TextEditingController();
  bool _isOpen = true;
  bool _cashOnDelivery = false;
  bool _hydrated = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _etaCtrl.dispose();
    super.dispose();
  }

  void _hydrate(VendorSettings s) {
    if (_hydrated) return;
    _hydrated = true;
    _nameCtrl.text = s.name;
    _descCtrl.text = s.description ?? '';
    _phoneCtrl.text = s.phone ?? '';
    _emailCtrl.text = s.email ?? '';
    _etaCtrl.text = s.estimatedMinutes.toString();
    _isOpen = s.isOpen;
    _cashOnDelivery = s.cashOnDeliveryEnabled;
  }

  Future<void> _save(BuildContext ctx) async {
    final phone = _phoneCtrl.text.trim();
    if (phone.isNotEmpty && !RegExp(r'^\+234\d{10}$').hasMatch(phone)) {
      ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
        content: Text('Phone must be in +234XXXXXXXXXX format'),
        behavior: SnackBarBehavior.floating,
      ));
      return;
    }
    final err = await ctx.read<StoreSettingsCubit>().save(
          UpdateVendorSettingsBody(
            name: _nameCtrl.text.trim().isEmpty
                ? null
                : _nameCtrl.text.trim(),
            description: _descCtrl.text.trim().isEmpty
                ? null
                : _descCtrl.text.trim(),
            phone: phone.isEmpty ? null : phone,
            email: _emailCtrl.text.trim().isEmpty
                ? null
                : _emailCtrl.text.trim(),
            estimatedMinutes: int.tryParse(_etaCtrl.text.trim()),
            isOpen: _isOpen,
            cashOnDeliveryEnabled: _cashOnDelivery,
          ),
        );
    if (!ctx.mounted) return;
    ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
      content: Text(err ?? 'Store settings saved'),
      backgroundColor:
          err == null ? GodropColors.success : Colors.red.shade700,
      behavior: SnackBarBehavior.floating,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final isOwner = context.watch<SessionCubit>().isOwner;
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Store settings'),
          backgroundColor: GodropColors.background),
      body: BlocBuilder<StoreSettingsCubit, StoreSettingsState>(
        builder: (ctx, state) {
          if (state is StoreSettingsLoading ||
              state is StoreSettingsInitial) {
            return const DetailSkeleton();
          }
          if (state is StoreSettingsError) {
            return EmptyState(
              icon: Icons.cloud_off_rounded,
              title: 'Could not load settings',
              subtitle: state.message,
              actionLabel: 'Retry',
              onAction: () => ctx.read<StoreSettingsCubit>().load(),
            );
          }
          final loaded = state as StoreSettingsLoaded;
          _hydrate(loaded.settings);
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!isOwner)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: GodropColors.orange.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.lock_outline_rounded,
                            size: 18, color: GodropColors.orange),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Only the owner can change store settings. You have view access.',
                            style: TextStyle(
                                fontSize: 12, color: GodropColors.slate),
                          ),
                        ),
                      ],
                    ),
                  ),
                const GodropSectionHeader(title: 'Store profile'),
                const SizedBox(height: 14),
                GodropField(
                    controller: _nameCtrl,
                    label: 'Store name',
                    hint: 'Store name',
                    enabled: isOwner),
                const SizedBox(height: 14),
                GodropField(
                    controller: _descCtrl,
                    label: 'Description',
                    hint: 'What do you sell?',
                    maxLines: 3,
                    enabled: isOwner),
                const SizedBox(height: 14),
                GodropField(
                    controller: _phoneCtrl,
                    label: 'Phone (🇳🇬 +234...)',
                    hint: '+2348012345678',
                    keyboardType: TextInputType.phone,
                    enabled: isOwner),
                const SizedBox(height: 14),
                GodropField(
                    controller: _emailCtrl,
                    label: 'Email',
                    hint: 'store@example.com',
                    keyboardType: TextInputType.emailAddress,
                    enabled: isOwner),
                const SizedBox(height: 14),
                GodropField(
                    controller: _etaCtrl,
                    label: 'Prep time estimate (minutes)',
                    hint: 'e.g. 30',
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    enabled: isOwner),
                const SizedBox(height: 24),
                const GodropSectionHeader(title: 'Ordering'),
                const SizedBox(height: 14),
                _ToggleTile(
                  title: 'Store open',
                  subtitle: 'Customers can place new orders',
                  value: _isOpen,
                  enabled: isOwner,
                  onChanged: (v) => setState(() => _isOpen = v),
                ),
                const SizedBox(height: 10),
                _ToggleTile(
                  title: 'Cash on delivery',
                  subtitle: 'Accept cash payment on delivery',
                  value: _cashOnDelivery,
                  enabled: isOwner,
                  onChanged: (v) => setState(() => _cashOnDelivery = v),
                ),
                const SizedBox(height: 10),
                _OpeningHoursTile(settings: loaded.settings),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: GodropColors.card,
                    borderRadius: BorderRadius.circular(16),
                    border:
                        Border.all(color: GodropColors.border, width: 1.5),
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text('Delivery fee (set by Godrop)',
                            style: TextStyle(
                                fontSize: 14, color: GodropColors.slate)),
                      ),
                      Text(
                        formatKobo(loaded.settings.deliveryFeeKobo),
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: GodropColors.ink),
                      ),
                    ],
                  ),
                ),
                if (isOwner) ...[
                  const SizedBox(height: 28),
                  GodropButton(
                    label: loaded.saving ? 'Saving...' : 'Save settings',
                    onTap: loaded.saving ? null : () => _save(ctx),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _OpeningHoursTile extends StatelessWidget {
  final VendorSettings settings;
  const _OpeningHoursTile({required this.settings});

  @override
  Widget build(BuildContext context) {
    final hours = OpeningHours.fromJson(settings.openingHours);
    return GestureDetector(
      onTap: () async {
        final changed = await context.push<bool>('/settings/hours',
            extra: settings.openingHours);
        if (changed == true && context.mounted) {
          context.read<StoreSettingsCubit>().load();
        }
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GodropColors.border, width: 1.5),
        ),
        child: Row(
          children: [
            const Icon(Icons.schedule_rounded,
                size: 20, color: GodropColors.slate),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Opening hours',
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: GodropColors.ink)),
                  Text(hours.summary,
                      style: const TextStyle(
                          fontSize: 12, color: GodropColors.mute)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                size: 20, color: GodropColors.mute),
          ],
        ),
      ),
    );
  }
}

class _ToggleTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final bool enabled;
  final ValueChanged<bool> onChanged;

  const _ToggleTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.enabled,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border, width: 1.5),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink)),
                Text(subtitle,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.mute)),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            activeTrackColor: GodropColors.success,
            onChanged: enabled ? onChanged : null,
          ),
        ],
      ),
    );
  }
}
