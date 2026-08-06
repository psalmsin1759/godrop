import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/dispute_models.dart';
import 'dispute_ui.dart';

class DisputeDetailScreen extends StatefulWidget {
  final String disputeId;
  const DisputeDetailScreen({super.key, required this.disputeId});

  @override
  State<DisputeDetailScreen> createState() => _DisputeDetailScreenState();
}

class _DisputeDetailScreenState extends State<DisputeDetailScreen> {
  final _service = RiderDisputesService(DioClient.instance);
  final _replyCtrl = TextEditingController();
  DisputeDetail? _dispute;
  bool _loading = true;
  bool _sending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _replyCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await _service.getDispute(widget.disputeId);
      setState(() {
        _dispute = DisputeDetail.fromJson(res['data'] as Map<String, dynamic>);
        _loading = false;
      });
    } on DioException catch (_) {
      setState(() {
        _error = 'Could not load this report.';
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Could not load this report.';
        _loading = false;
      });
    }
  }

  Future<void> _send() async {
    final text = _replyCtrl.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await _service.addMessage(widget.disputeId, {'message': text});
      _replyCtrl.clear();
      await _load();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Could not send your message. Try again.'),
          backgroundColor: GodropColors.error,
        ));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = _dispute;
    final closed = d != null && (d.status == 'RESOLVED' || d.status == 'REJECTED');

    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: Text(d == null ? 'Report' : '#${d.order.trackingCode}'),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: GodropColors.blue))
          : _error != null || d == null
              ? Center(
                  child: Text(_error ?? 'Report not found',
                      style: const TextStyle(color: GodropColors.mute)),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          _buildSummary(d),
                          const SizedBox(height: 16),
                          if (closed) ...[
                            _buildResolution(d),
                            const SizedBox(height: 16),
                          ],
                          const Text('Conversation',
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: GodropColors.ink)),
                          const SizedBox(height: 10),
                          ...d.messages.map(_buildMessage),
                        ],
                      ),
                    ),
                    if (!closed) _buildReplyBox(),
                  ],
                ),
    );
  }

  Widget _buildSummary(DisputeDetail d) {
    final (label, color) = disputeStatusDisplay(d.status);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(16),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(disputeCategories[d.category] ?? d.category,
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink)),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
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
          const SizedBox(height: 8),
          Text(d.description,
              style: const TextStyle(fontSize: 13, color: GodropColors.slate)),
          const SizedBox(height: 8),
          Text('Reported ${fmtDisputeDate(d.createdAt)}',
              style: const TextStyle(fontSize: 11, color: GodropColors.mute)),
        ],
      ),
    );
  }

  Widget _buildResolution(DisputeDetail d) {
    String text;
    switch (d.resolutionType) {
      case 'REFUND_CUSTOMER':
        text = 'The customer was refunded for this order.';
        break;
      case 'COMPENSATE_RIDER':
        text =
            'You were compensated ${fmtKobo(d.resolutionAmountKobo ?? 0)}.';
        break;
      case 'NO_ACTION':
        text = 'We looked into this — no action was needed.';
        break;
      case 'REJECTED':
        text = 'We reviewed this report and could not take action.';
        break;
      default:
        text = 'This report has been closed.';
    }
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.success.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.success.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(children: [
            Icon(Icons.check_circle_rounded,
                color: GodropColors.success, size: 16),
            SizedBox(width: 6),
            Text('Resolution',
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.success)),
          ]),
          const SizedBox(height: 6),
          Text(text, style: const TextStyle(fontSize: 13, color: GodropColors.ink)),
          if (d.resolutionNotes != null && d.resolutionNotes!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(d.resolutionNotes!,
                style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
          ],
        ],
      ),
    );
  }

  Widget _buildMessage(DisputeMessage m) {
    final isMine = m.senderType == 'RIDER';
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment:
            isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
              decoration: BoxDecoration(
                color: isMine ? GodropColors.blue : GodropColors.card,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!isMine)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 2),
                      child: Text('Support',
                          style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: GodropColors.blue)),
                    ),
                  Text(m.message,
                      style: TextStyle(
                          fontSize: 13,
                          color: isMine ? Colors.white : GodropColors.ink)),
                  const SizedBox(height: 3),
                  Text(fmtDisputeDate(m.createdAt),
                      style: TextStyle(
                          fontSize: 10,
                          color: isMine
                              ? Colors.white.withValues(alpha: 0.7)
                              : GodropColors.mute)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReplyBox() {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        decoration: const BoxDecoration(
          color: GodropColors.card,
          border: Border(top: BorderSide(color: GodropColors.border)),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _replyCtrl,
                minLines: 1,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Reply…',
                  filled: true,
                  fillColor: GodropColors.background,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _sending ? null : _send,
              child: Container(
                width: 42,
                height: 42,
                decoration: const BoxDecoration(
                    color: GodropColors.blue, shape: BoxShape.circle),
                child: _sending
                    ? const Padding(
                        padding: EdgeInsets.all(11),
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.send_rounded,
                        color: Colors.white, size: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
