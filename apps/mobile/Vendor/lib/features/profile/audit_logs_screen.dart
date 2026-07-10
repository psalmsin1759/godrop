import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/audit_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../auth/bloc/auth_cubit.dart' show parseDioError;

/// Vendor activity log export (MANAGER+): pick a date range and receive
/// the log as a PDF by email.
class AuditLogsScreen extends StatefulWidget {
  const AuditLogsScreen({super.key});

  @override
  State<AuditLogsScreen> createState() => _AuditLogsScreenState();
}

class _AuditLogsScreenState extends State<AuditLogsScreen> {
  final _service = AuditService(DioClient.instance);

  late DateTime _startDate;
  late DateTime _endDate;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    final today = DateTime.now();
    _endDate = DateTime(today.year, today.month, today.day);
    _startDate = _endDate.subtract(const Duration(days: 6));
  }

  static const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _label(DateTime d) => '${d.day} ${_months[d.month - 1]} ${d.year}';

  String _api(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  Future<void> _pickDate({required bool isStart}) async {
    final today = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _startDate : _endDate,
      firstDate: DateTime(2024),
      lastDate: today,
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: Theme.of(ctx)
              .colorScheme
              .copyWith(primary: GodropColors.blue),
        ),
        child: child!,
      ),
    );
    if (picked == null) return;
    setState(() {
      if (isStart) {
        _startDate = picked;
        if (_endDate.isBefore(_startDate)) _endDate = _startDate;
      } else {
        _endDate = picked;
        if (_endDate.isBefore(_startDate)) _startDate = _endDate;
      }
    });
  }

  Future<void> _submit() async {
    setState(() => _sending = true);
    try {
      final res = await _service.export(ExportAuditLogsBody(
        startDate: _api(_startDate),
        endDate: _api(_endDate),
      ));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(res.message ?? 'Activity log PDF sent to your email.'),
        backgroundColor: GodropColors.success,
        behavior: SnackBarBehavior.floating,
      ));
    } on DioException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(parseDioError(e)),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text('Could not send the export. Please try again.'),
        backgroundColor: Colors.red.shade700,
        behavior: SnackBarBehavior.floating,
      ));
    }
    if (mounted) setState(() => _sending = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Activity log'),
          backgroundColor: GodropColors.background),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: GodropColors.blue.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                children: [
                  Icon(Icons.picture_as_pdf_outlined,
                      color: GodropColors.blue, size: 22),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Pick a date range and we\'ll email you a PDF of your '
                      'team\'s activity — menu edits, order updates, and more.',
                      style: TextStyle(
                          fontSize: 13,
                          height: 1.4,
                          color: GodropColors.slate),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            _DateField(
              label: 'Start date',
              value: _label(_startDate),
              onTap: _sending ? null : () => _pickDate(isStart: true),
            ),
            const SizedBox(height: 16),
            _DateField(
              label: 'End date',
              value: _label(_endDate),
              onTap: _sending ? null : () => _pickDate(isStart: false),
            ),
            const SizedBox(height: 28),
            GodropButton(
              label: _sending ? 'Sending...' : 'Email me the PDF',
              onTap: _sending ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}

class _DateField extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback? onTap;
  const _DateField(
      {required this.label, required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: GodropColors.slate)),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: double.infinity,
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
            decoration: BoxDecoration(
              color: GodropColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: GodropColors.border, width: 1.5),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today_outlined,
                    size: 18, color: GodropColors.mute),
                const SizedBox(width: 12),
                Text(value,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
