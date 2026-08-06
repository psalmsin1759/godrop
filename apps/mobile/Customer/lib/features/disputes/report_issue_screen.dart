import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/models/dispute_models.dart';
import '../../shared/widgets/godrop_button.dart';

class ReportIssueScreen extends StatefulWidget {
  final String orderId;
  final String trackingCode;
  const ReportIssueScreen(
      {super.key, required this.orderId, required this.trackingCode});

  @override
  State<ReportIssueScreen> createState() => _ReportIssueScreenState();
}

class _ReportIssueScreenState extends State<ReportIssueScreen> {
  final _service = DisputesService(DioClient.instance);
  final _descriptionCtrl = TextEditingController();
  String? _category;
  final List<String> _photoPaths = [];
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _descriptionCtrl.dispose();
    super.dispose();
  }

  Future<void> _addPhoto() async {
    if (_photoPaths.length >= 3) return;
    final file = await ImagePicker()
        .pickImage(source: ImageSource.gallery, imageQuality: 80, maxWidth: 1200);
    if (file == null) return;
    setState(() => _photoPaths.add(file.path));
  }

  Future<void> _submit() async {
    if (_category == null) {
      setState(() => _error = 'Please choose a category');
      return;
    }
    if (_descriptionCtrl.text.trim().length < 5) {
      setState(() => _error = 'Please describe the issue in a bit more detail');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final evidenceUrls = <String>[];
      for (final path in _photoPaths) {
        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(path, filename: 'evidence.jpg'),
        });
        final res = await _service.uploadEvidence(formData);
        evidenceUrls.add(res.data.url);
      }

      final res = await _service.createDispute(CreateDisputeBody(
        orderId: widget.orderId,
        category: _category!,
        description: _descriptionCtrl.text.trim(),
        evidenceUrls: evidenceUrls.isEmpty ? null : evidenceUrls,
      ));

      if (!mounted) return;
      context.pushReplacement('/disputes/${res.data.id}');
    } on DioException catch (e) {
      final msg = (e.response?.data as Map<String, dynamic>?)?['error'];
      setState(() {
        _error = msg is String ? msg : 'Could not submit your report. Try again.';
        _submitting = false;
      });
    } catch (_) {
      setState(() {
        _error = 'Could not submit your report. Try again.';
        _submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: Text('Report an issue · #${widget.trackingCode}'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('What went wrong?',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: customerDisputeCategories.map((c) {
              final selected = c == _category;
              return ChoiceChip(
                label: Text(disputeCategories[c] ?? c),
                selected: selected,
                onSelected: (_) => setState(() => _category = c),
                selectedColor: GodropColors.blue.withValues(alpha: 0.12),
                labelStyle: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: selected ? GodropColors.blue : GodropColors.slate,
                ),
                backgroundColor: GodropColors.card,
                side: BorderSide(
                    color: selected ? GodropColors.blue : GodropColors.border),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          const Text('Tell us more',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink)),
          const SizedBox(height: 10),
          TextField(
            controller: _descriptionCtrl,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Describe what happened…',
              filled: true,
              fillColor: GodropColors.card,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: GodropColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: GodropColors.border),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Photos (optional)',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: GodropColors.ink)),
          const SizedBox(height: 10),
          Row(
            children: [
              for (final path in _photoPaths)
                Padding(
                  padding: const EdgeInsets.only(right: 10),
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(File(path),
                            width: 72, height: 72, fit: BoxFit.cover),
                      ),
                      Positioned(
                        top: -6,
                        right: -6,
                        child: GestureDetector(
                          onTap: () =>
                              setState(() => _photoPaths.remove(path)),
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(
                                color: GodropColors.error,
                                shape: BoxShape.circle),
                            child: const Icon(Icons.close_rounded,
                                size: 12, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              if (_photoPaths.length < 3)
                GestureDetector(
                  onTap: _addPhoto,
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: GodropColors.card,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: GodropColors.border),
                    ),
                    child: const Icon(Icons.add_a_photo_outlined,
                        color: GodropColors.mute, size: 22),
                  ),
                ),
            ],
          ),
          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(_error!,
                style: const TextStyle(fontSize: 12.5, color: GodropColors.error)),
          ],
          const SizedBox(height: 28),
          GodropButton(
            label: _submitting ? 'Submitting…' : 'Submit report',
            onTap: _submitting ? null : _submit,
          ),
        ],
      ),
    );
  }
}
