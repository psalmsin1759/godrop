import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/audit_models.dart';
import '../../shared/utils/dates.dart';
import '../../shared/widgets/empty_state.dart';
import '../auth/bloc/auth_cubit.dart' show parseDioError;

/// Vendor activity log (MANAGER+): who did what, when.
class AuditLogsScreen extends StatefulWidget {
  const AuditLogsScreen({super.key});

  @override
  State<AuditLogsScreen> createState() => _AuditLogsScreenState();
}

class _AuditLogsScreenState extends State<AuditLogsScreen> {
  final _service = AuditService(DioClient.instance);
  final _scrollCtrl = ScrollController();

  final List<AuditLogEntry> _entries = [];
  int _page = 1;
  int _total = 0;
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
    _scrollCtrl.addListener(() {
      if (_scrollCtrl.position.pixels >
          _scrollCtrl.position.maxScrollExtent - 300) {
        _loadMore();
      }
    });
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _service.list();
      if (!mounted) return;
      setState(() {
        _entries
          ..clear()
          ..addAll(res.data);
        _page = res.page;
        _total = res.total;
        _loading = false;
      });
    } on DioException catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = parseDioError(e);
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Failed to load the activity log.';
        });
      }
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore || _entries.length >= _total) return;
    setState(() => _loadingMore = true);
    try {
      final res = await _service.list(page: _page + 1);
      if (!mounted) return;
      setState(() {
        _entries.addAll(res.data);
        _page = res.page;
        _total = res.total;
        _loadingMore = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingMore = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
          title: const Text('Activity log'),
          backgroundColor: GodropColors.background),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? EmptyState(
                  icon: Icons.cloud_off_rounded,
                  title: 'Could not load activity',
                  subtitle: _error,
                  actionLabel: 'Retry',
                  onAction: _load,
                )
              : _entries.isEmpty
                  ? const EmptyState(
                      icon: Icons.history_rounded,
                      title: 'No activity yet',
                      subtitle:
                          'Team actions like menu edits and order updates appear here.',
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        controller: _scrollCtrl,
                        padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
                        itemCount: _entries.length + (_loadingMore ? 1 : 0),
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          if (i >= _entries.length) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(12),
                                child: SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2)),
                              ),
                            );
                          }
                          return _AuditCard(entry: _entries[i]);
                        },
                      ),
                    ),
    );
  }
}

class _AuditCard extends StatelessWidget {
  final AuditLogEntry entry;
  const _AuditCard({required this.entry});

  String get _actionLabel => entry.action
      .toLowerCase()
      .replaceAll('_', ' ')
      .replaceFirstMapped(RegExp(r'^\w'), (m) => m.group(0)!.toUpperCase());

  @override
  Widget build(BuildContext context) {
    final admin = entry.admin;
    final who = admin == null
        ? 'System'
        : '${admin.firstName ?? ''} ${admin.lastName ?? ''}'.trim();
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(18),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: GodropColors.blue.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.history_rounded,
                color: GodropColors.blue, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_actionLabel,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink)),
                Text(
                  '${who.isEmpty ? 'System' : who} · ${formatDateTime(entry.createdAt)}',
                  style: const TextStyle(
                      fontSize: 12, color: GodropColors.mute),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
