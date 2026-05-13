import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/api/client/dio_client.dart';
import '../partners/models/partner_item.dart';
import '../food/models/restaurant_data.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _ctrl = TextEditingController();
  List<Map<String, dynamic>> _vendors = [];
  List<Map<String, dynamic>> _products = [];
  bool _loading = false;
  bool _searched = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _search(String q) async {
    if (q.trim().length < 2) {
      setState(() { _vendors = []; _products = []; _searched = false; });
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await DioClient.instance.get('/search', queryParameters: {'q': q.trim()});
      final data = res.data as Map<String, dynamic>;
      setState(() {
        _vendors = (data['vendors'] as List).map((e) => e as Map<String, dynamic>).toList();
        _products = (data['products'] as List).map((e) => e as Map<String, dynamic>).toList();
        _searched = true;
      });
    } catch (_) {
      setState(() { _vendors = []; _products = []; });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _fmtKobo(int kobo) {
    final n = (kobo / 100).toStringAsFixed(0);
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  PartnerType _vendorTypeToPartnerType(String type) {
    switch (type.toUpperCase()) {
      case 'GROCERY': return PartnerType.grocery;
      case 'RETAIL': return PartnerType.retail;
      case 'PHARMACY': return PartnerType.pharmacy;
      default: return PartnerType.restaurant;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        backgroundColor: GodropColors.white,
        leading: GestureDetector(onTap: () => context.pop(), child: const Icon(Icons.arrow_back_rounded, size: 22)),
        title: TextField(
          controller: _ctrl,
          autofocus: true,
          style: const TextStyle(fontSize: 15, color: GodropColors.ink),
          decoration: const InputDecoration(
            hintText: 'Search restaurants, groceries, products...',
            hintStyle: TextStyle(color: GodropColors.mute, fontSize: 14),
            border: InputBorder.none,
          ),
          onChanged: (v) {
            if (v.length >= 2) _search(v);
            else setState(() { _vendors = []; _products = []; _searched = false; });
          },
          onSubmitted: _search,
        ),
        actions: [
          if (_ctrl.text.isNotEmpty)
            GestureDetector(
              onTap: () {
                _ctrl.clear();
                setState(() { _vendors = []; _products = []; _searched = false; });
              },
              child: const Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Icon(Icons.close_rounded, color: GodropColors.mute)),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5))
          : !_searched
              ? const Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.search_rounded, size: 48, color: GodropColors.mute),
                    SizedBox(height: 12),
                    Text('Search for restaurants, shops, or products', style: TextStyle(color: GodropColors.slate, fontSize: 14), textAlign: TextAlign.center),
                  ]),
                )
              : (_vendors.isEmpty && _products.isEmpty)
                  ? const Center(
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.search_off_rounded, size: 48, color: GodropColors.mute),
                        SizedBox(height: 12),
                        Text('No results found', style: TextStyle(color: GodropColors.slate, fontSize: 15, fontWeight: FontWeight.w600)),
                        Text('Try a different search term', style: TextStyle(color: GodropColors.mute, fontSize: 13)),
                      ]),
                    )
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        if (_vendors.isNotEmpty) ...[
                          const Text('Vendors', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: GodropColors.ink, letterSpacing: 0.3)),
                          const SizedBox(height: 8),
                          ..._vendors.map((v) {
                            final id = v['id'] as String;
                            final name = v['name'] as String? ?? '';
                            final type = v['type'] as String? ?? 'RESTAURANT';
                            final rating = (v['rating'] as num?)?.toDouble() ?? 0.0;
                            final logoUrl = v['logoUrl'] as String?;
                            final isOpen = v['isOpen'] as bool? ?? true;
                            final mins = v['estimatedMinutes'] as int? ?? 30;
                            return GestureDetector(
                              onTap: () => context.go('/partner/menu', extra: {
                                'partner': PartnerItem(
                                  id: id,
                                  name: name,
                                  partnerType: _vendorTypeToPartnerType(type),
                                  logoUrl: logoUrl,
                                  rating: rating,
                                  deliveryFeeKobo: (v['deliveryFeeKobo'] as int?) ?? 0,
                                  estimatedMinutes: mins,
                                  isOpen: isOpen,
                                ),
                              }),
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(12)),
                                child: Row(children: [
                                  Container(
                                    width: 48, height: 48,
                                    decoration: BoxDecoration(color: GodropColors.background, borderRadius: BorderRadius.circular(10)),
                                    clipBehavior: Clip.antiAlias,
                                    child: logoUrl != null
                                        ? Image.network(logoUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.storefront_rounded, color: GodropColors.mute))
                                        : const Icon(Icons.storefront_rounded, color: GodropColors.mute),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                    Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                                    Text('${rating.toStringAsFixed(1)} ⭐ · $mins min · $type', style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                                  ])),
                                  if (!isOpen) Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(4)),
                                    child: const Text('Closed', style: TextStyle(fontSize: 10, color: Colors.orange, fontWeight: FontWeight.w600)),
                                  ),
                                ]),
                              ),
                            );
                          }),
                          const SizedBox(height: 12),
                        ],
                        if (_products.isNotEmpty) ...[
                          const Text('Products', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: GodropColors.ink, letterSpacing: 0.3)),
                          const SizedBox(height: 8),
                          ..._products.map((p) {
                            final name = p['name'] as String? ?? '';
                            final price = (p['priceKobo'] as int?) ?? 0;
                            final imageUrl = p['imageUrl'] as String?;
                            final cat = p['category'] as Map<String, dynamic>?;
                            final vendorName = (cat?['vendor'] as Map<String, dynamic>?)?['name'] as String? ?? '';
                            return Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(12)),
                              child: Row(children: [
                                Container(
                                  width: 48, height: 48,
                                  decoration: BoxDecoration(color: GodropColors.background, borderRadius: BorderRadius.circular(10)),
                                  clipBehavior: Clip.antiAlias,
                                  child: imageUrl != null
                                      ? Image.network(imageUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.fastfood_rounded, color: GodropColors.mute))
                                      : const Icon(Icons.fastfood_rounded, color: GodropColors.mute),
                                ),
                                const SizedBox(width: 12),
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                                  Text(vendorName, style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
                                ])),
                                Text(_fmtKobo(price), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: GodropColors.orange)),
                              ]),
                            );
                          }),
                        ],
                      ],
                    ),
    );
  }
}
