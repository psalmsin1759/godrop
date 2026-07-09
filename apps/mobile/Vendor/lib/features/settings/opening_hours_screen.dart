import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/opening_hours.dart';
import '../../shared/models/vendor_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../auth/bloc/auth_cubit.dart' show parseDioError;
import '../profile/bloc/session_cubit.dart';

/// Weekly opening-hours editor. Times are Africa/Lagos wall-clock; a day
/// switched off is sent as null (closed). Overnight windows (close before
/// open, e.g. 18:00–02:00) are supported by the platform.
class OpeningHoursScreen extends StatefulWidget {
  /// The vendor's current hours map, passed from the store settings screen.
  final Map<String, dynamic>? initialHours;
  const OpeningHoursScreen({super.key, this.initialHours});

  @override
  State<OpeningHoursScreen> createState() => _OpeningHoursScreenState();
}

class _OpeningHoursScreenState extends State<OpeningHoursScreen> {
  static const _defaultDay = DayHours(open: '08:00', close: '22:00');

  late final Map<String, DayHours?> _days;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final parsed = OpeningHours.fromJson(widget.initialHours);
    _days = {
      for (final key in OpeningHours.displayOrder)
        // Unconfigured vendors start from a sensible everyday default
        // instead of a fully-closed week.
        key: parsed.isConfigured ? parsed.days[key] : _defaultDay,
    };
  }

  void _toast(String msg, {bool error = true}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? Colors.red.shade700 : GodropColors.success,
      behavior: SnackBarBehavior.floating,
    ));
  }

  Future<void> _pickTime(String dayKey, {required bool isOpenTime}) async {
    final current = _days[dayKey] ?? _defaultDay;
    final initial = _parseTime(isOpenTime ? current.open : current.close);
    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
      helpText:
          '${isOpenTime ? 'Opens' : 'Closes'} — ${OpeningHours.dayLabels[dayKey]}',
      builder: (ctx, child) => MediaQuery(
        data: MediaQuery.of(ctx).copyWith(alwaysUse24HourFormat: true),
        child: child!,
      ),
    );
    if (picked == null) return;
    final hhmm =
        '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
    setState(() {
      _days[dayKey] = isOpenTime
          ? DayHours(open: hhmm, close: current.close)
          : DayHours(open: current.open, close: hhmm);
    });
  }

  TimeOfDay _parseTime(String hhmm) {
    final parts = hhmm.split(':');
    return TimeOfDay(
      hour: int.tryParse(parts[0]) ?? 8,
      minute: parts.length > 1 ? int.tryParse(parts[1]) ?? 0 : 0,
    );
  }

  void _applyToAllOpenDays(String sourceKey) {
    final source = _days[sourceKey];
    if (source == null) return;
    setState(() {
      for (final key in OpeningHours.displayOrder) {
        if (_days[key] != null) {
          _days[key] = DayHours(open: source.open, close: source.close);
        }
      }
    });
    _toast('Applied ${source.open}–${source.close} to all open days',
        error: false);
  }

  Future<void> _save() async {
    final openCount = _days.values.whereType<DayHours>().length;
    if (openCount == 0) {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (dCtx) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Close every day?'),
          content: const Text(
              'With no open days, customers will never be able to order. Save anyway?'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(dCtx, false),
                child: const Text('Go back')),
            TextButton(
              onPressed: () => Navigator.pop(dCtx, true),
              child: const Text('Save',
                  style: TextStyle(color: GodropColors.error)),
            ),
          ],
        ),
      );
      if (confirmed != true) return;
    }
    if (!mounted) return;

    setState(() => _saving = true);
    try {
      await SettingsService(DioClient.instance).updateSettings(
        UpdateVendorSettingsBody(
          openingHours: OpeningHours(days: _days).toJson(),
        ),
      );
      if (!mounted) return;
      _toast('Opening hours saved', error: false);
      context.pop(true); // signals the settings screen to reload
      return;
    } on DioException catch (e) {
      if (mounted) _toast(parseDioError(e));
    } catch (_) {
      if (mounted) _toast('Could not save opening hours.');
    }
    if (mounted) setState(() => _saving = false);
  }

  @override
  Widget build(BuildContext context) {
    final isOwner = context.watch<SessionCubit>().isOwner;
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Opening hours'),
          backgroundColor: GodropColors.background),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Times are Nigerian local time (WAT). Your store only accepts orders within these hours — the open/closed switch can close the store early, but cannot open it outside these hours.',
              style: TextStyle(
                  fontSize: 13, color: GodropColors.slate, height: 1.5),
            ),
            const SizedBox(height: 8),
            const Text(
              'Tip: for late-night service set closing past midnight, e.g. 18:00–02:00.',
              style: TextStyle(fontSize: 12, color: GodropColors.mute),
            ),
            const SizedBox(height: 20),
            for (final key in OpeningHours.displayOrder) ...[
              _DayRow(
                dayKey: key,
                hours: _days[key],
                enabled: isOwner && !_saving,
                onToggle: (open) => setState(() =>
                    _days[key] = open ? _defaultDay : null),
                onPickOpen: () => _pickTime(key, isOpenTime: true),
                onPickClose: () => _pickTime(key, isOpenTime: false),
                onApplyToAll: () => _applyToAllOpenDays(key),
              ),
              const SizedBox(height: 10),
            ],
            const SizedBox(height: 12),
            if (isOwner)
              GodropButton(
                label: _saving ? 'Saving...' : 'Save opening hours',
                onTap: _saving ? null : _save,
              )
            else
              Container(
                padding: const EdgeInsets.all(12),
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
                        'Only the owner can change opening hours.',
                        style: TextStyle(
                            fontSize: 12, color: GodropColors.slate),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _DayRow extends StatelessWidget {
  final String dayKey;
  final DayHours? hours;
  final bool enabled;
  final ValueChanged<bool> onToggle;
  final VoidCallback onPickOpen;
  final VoidCallback onPickClose;
  final VoidCallback onApplyToAll;

  const _DayRow({
    required this.dayKey,
    required this.hours,
    required this.enabled,
    required this.onToggle,
    required this.onPickOpen,
    required this.onPickClose,
    required this.onApplyToAll,
  });

  @override
  Widget build(BuildContext context) {
    final open = hours != null;
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 8, 10),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
            color: open
                ? GodropColors.blue.withValues(alpha: 0.25)
                : GodropColors.border,
            width: 1.5),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  OpeningHours.dayLabels[dayKey]!,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: open ? GodropColors.ink : GodropColors.mute,
                  ),
                ),
              ),
              if (!open)
                const Text('Closed',
                    style:
                        TextStyle(fontSize: 13, color: GodropColors.mute)),
              Switch.adaptive(
                value: open,
                activeTrackColor: GodropColors.success,
                onChanged: enabled ? onToggle : null,
              ),
            ],
          ),
          if (open)
            Padding(
              padding: const EdgeInsets.only(top: 2, bottom: 4, right: 8),
              child: Row(
                children: [
                  _TimeButton(
                    label: 'Opens',
                    time: hours!.open,
                    enabled: enabled,
                    onTap: onPickOpen,
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Icon(Icons.arrow_forward_rounded,
                        size: 14, color: GodropColors.mute),
                  ),
                  _TimeButton(
                    label: hours!.isOvernight ? 'Closes (next day)' : 'Closes',
                    time: hours!.close,
                    enabled: enabled,
                    onTap: onPickClose,
                  ),
                  const Spacer(),
                  if (enabled)
                    Tooltip(
                      message: 'Apply these hours to all open days',
                      child: IconButton(
                        onPressed: onApplyToAll,
                        icon: const Icon(Icons.copy_all_rounded,
                            size: 18, color: GodropColors.blue),
                        visualDensity: VisualDensity.compact,
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _TimeButton extends StatelessWidget {
  final String label;
  final String time;
  final bool enabled;
  final VoidCallback onTap;

  const _TimeButton({
    required this.label,
    required this.time,
    required this.enabled,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.mute)),
          const SizedBox(height: 2),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: GodropColors.blue.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              time,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: enabled ? GodropColors.blue : GodropColors.mute,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
