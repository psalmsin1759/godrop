import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/dispute_models.dart';
import '../../shared/services/disputes_unread_service.dart';
import '../../shared/widgets/empty_state.dart';
import 'dispute_ui.dart';

class MyDisputesScreen extends StatefulWidget {
  const MyDisputesScreen({super.key});

  @override
  State<MyDisputesScreen> createState() => _MyDisputesScreenState();
}

class _MyDisputesScreenState extends State<MyDisputesScreen> {
  final _service = DisputesService(DioClient.instance);
  List<Dispute> _disputes = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _service.listDisputes();
      setState(() {
        _disputes = res.data;
        _loading = false;
      });
    } on DioException catch (_) {
      setState(() {
        _error = 'Could not load your reports.';
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Could not load your reports.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(title: const Text('My Reports')),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: GodropColors.blue))
          : _error != null
              ? EmptyState(
                  icon: Icons.cloud_off_rounded,
                  title: 'Something went wrong',
                  subtitle: _error!,
                  actionLabel: 'Retry',
                  onAction: _load,
                )
              : _disputes.isEmpty
                  ? const EmptyState(
                      icon: Icons.support_agent_rounded,
                      title: 'No reports yet',
                      subtitle:
                          "If something goes wrong with an order, you can report it from the order's details.",
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      color: GodropColors.blue,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _disputes.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, i) {
                          final d = _disputes[i];
                          final (label, color) = disputeStatusDisplay(d.status);
                          return GestureDetector(
                            onTap: () => context
                                .push('/disputes/${d.id}')
                                .then((_) => DisputesUnreadService.refresh()),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: GodropColors.card,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: GodropColors.softShadow,
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text('#${d.order.trackingCode}',
                                            style: const TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                                color: GodropColors.ink)),
                                        const SizedBox(height: 3),
                                        Text(
                                            disputeCategories[d.category] ??
                                                d.category,
                                            style: const TextStyle(
                                                fontSize: 12.5,
                                                color: GodropColors.slate)),
                                        const SizedBox(height: 3),
                                        Text(fmtDisputeDate(d.createdAt),
                                            style: const TextStyle(
                                                fontSize: 11,
                                                color: GodropColors.mute)),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 9, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: color.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(label,
                                        style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: color)),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
