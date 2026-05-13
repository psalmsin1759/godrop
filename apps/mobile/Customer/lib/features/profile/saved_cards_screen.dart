import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/client/dio_client.dart';

class SavedCardsScreen extends StatefulWidget {
  const SavedCardsScreen({super.key});

  @override
  State<SavedCardsScreen> createState() => _SavedCardsScreenState();
}

class _SavedCardsScreenState extends State<SavedCardsScreen> {
  List<Map<String, dynamic>> _cards = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await DioClient.instance.get('/me/cards');
      final data = res.data as Map<String, dynamic>;
      setState(() {
        _cards = (data['cards'] as List).map((c) => c as Map<String, dynamic>).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() { _error = 'Failed to load cards'; _loading = false; });
    }
  }

  Future<void> _delete(String id) async {
    try {
      await DioClient.instance.delete('/me/cards/$id');
      await _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to remove card'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _confirmDelete(BuildContext ctx, String id, String label) {
    showDialog(
      context: ctx,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Remove card?', style: TextStyle(fontWeight: FontWeight.w700, color: GodropColors.ink)),
        content: Text('Remove $label from your saved cards?', style: const TextStyle(color: GodropColors.slate)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: GodropColors.slate))),
          TextButton(
            onPressed: () { Navigator.pop(ctx); _delete(id); },
            child: const Text('Remove', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        backgroundColor: GodropColors.white,
        leading: GestureDetector(onTap: () => context.pop(), child: const Icon(Icons.chevron_left_rounded, size: 28)),
        title: const Text('Saved cards'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5))
          : _error != null
              ? Center(child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline_rounded, color: GodropColors.mute, size: 40),
                    const SizedBox(height: 12),
                    Text(_error!, style: const TextStyle(color: GodropColors.slate)),
                    TextButton(onPressed: _load, child: const Text('Retry', style: TextStyle(color: GodropColors.blue))),
                  ],
                ))
              : _cards.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.credit_card_off_rounded, size: 48, color: GodropColors.mute),
                          SizedBox(height: 12),
                          Text('No saved cards', style: TextStyle(color: GodropColors.slate, fontSize: 15)),
                          SizedBox(height: 8),
                          Text('Cards are saved automatically\nafter your first payment.', textAlign: TextAlign.center, style: TextStyle(color: GodropColors.mute, fontSize: 13)),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _cards.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (ctx, i) {
                        final card = _cards[i];
                        final id = card['id'] as String;
                        final type = (card['cardType'] as String? ?? 'card').toUpperCase();
                        final last4 = card['last4'] as String? ?? '••••';
                        final expMonth = card['expMonth'] as String? ?? '??';
                        final expYear = card['expYear'] as String? ?? '??';
                        final bank = card['bank'] as String? ?? '';
                        final isDefault = card['isDefault'] as bool? ?? false;
                        final label = '$type ••••$last4';

                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: GodropColors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: isDefault ? Border.all(color: GodropColors.blue, width: 1.5) : null,
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 44, height: 44,
                                decoration: BoxDecoration(color: const Color(0xFFE8EFFF), borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.credit_card_rounded, color: GodropColors.blue, size: 22),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                                        if (isDefault) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(color: GodropColors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                                            child: const Text('Default', style: TextStyle(fontSize: 10, color: GodropColors.blue, fontWeight: FontWeight.w600)),
                                          ),
                                        ],
                                      ],
                                    ),
                                    Text('$bank · Expires $expMonth/$expYear', style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                                  ],
                                ),
                              ),
                              GestureDetector(
                                onTap: () => _confirmDelete(ctx, id, label),
                                child: Container(
                                  width: 36, height: 36,
                                  decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(8)),
                                  child: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 18),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
    );
  }
}
