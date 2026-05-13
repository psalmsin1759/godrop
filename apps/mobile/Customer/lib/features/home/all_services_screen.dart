import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';

class AllServicesScreen extends StatelessWidget {
  const AllServicesScreen({super.key});

  static const _services = [
    _Service(icon: Icons.inventory_2_rounded, iconBg: Color(0xFFE8EFFF), iconColor: GodropColors.blue, label: 'Send a Parcel', sub: 'Door-to-door in 30 min', tag: 'From ₦1,050', route: '/parcel/addresses'),
    _Service(icon: Icons.local_shipping_rounded, iconBg: Color(0xFFE8EFFF), iconColor: GodropColors.blue, label: 'Book a Truck', sub: 'Relocate or move goods', tag: 'From ₦15,000', route: '/truck'),
    _Service(icon: Icons.restaurant_rounded, iconBg: Color(0xFFFFF0E8), iconColor: GodropColors.orange, label: 'Order Food', sub: '480+ restaurants near you', tag: 'Free delivery*', route: '/food/restaurants'),
    _Service(icon: Icons.shopping_basket_rounded, iconBg: Color(0xFFE8F5FF), iconColor: Color(0xFF0EA5E9), label: 'Grocery Run', sub: 'Shoprite, Ebeano, markets', tag: '2-hr delivery', route: '/grocery'),
    _Service(icon: Icons.storefront_rounded, iconBg: Color(0xFFE8F5FF), iconColor: Color(0xFF8B5CF6), label: 'Retail Shopping', sub: 'Fashion, gadgets, home', tag: 'Same-day', route: '/services'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        backgroundColor: GodropColors.white,
        title: const Text('All Services'),
        leading: GestureDetector(
          onTap: () => context.go('/home'),
          child: const Icon(Icons.chevron_left_rounded, size: 28),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
              decoration: const BoxDecoration(gradient: GodropColors.blueGradient),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Everything you need,', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                  RichText(
                    text: const TextSpan(
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),
                      children: [
                        TextSpan(text: 'delivered by '),
                        TextSpan(text: 'GoDrop.', style: TextStyle(color: GodropColors.orange)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Services list
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: _services.map((s) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _ServiceTile(service: s),
                )).toList(),
              ),
            ),
            const SizedBox(height: 16),
            // Offers section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Offers for you', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                  Text('See all', style: TextStyle(fontSize: 14, color: GodropColors.blue)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(child: _OfferCard(label: '50% OFF', sub: 'First grocery order', color: GodropColors.orange)),
                  const SizedBox(width: 10),
                  Expanded(child: _OfferCard(label: '₦8K OFF', sub: 'First truck booking', color: GodropColors.blue)),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _Service {
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String label;
  final String sub;
  final String tag;
  final String route;
  const _Service({required this.icon, required this.iconBg, required this.iconColor, required this.label, required this.sub, required this.tag, required this.route});
}

class _ServiceTile extends StatelessWidget {
  final _Service service;
  const _ServiceTile({required this.service});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go(service.route),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
        child: Row(
          children: [
            Container(width: 44, height: 44, decoration: BoxDecoration(color: service.iconBg, borderRadius: BorderRadius.circular(12)), child: Icon(service.icon, color: service.iconColor, size: 22)),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(service.label, style: const TextStyle(fontWeight: FontWeight.w600, color: GodropColors.ink, fontSize: 15)),
                  const SizedBox(height: 2),
                  Text(service.sub, style: const TextStyle(fontSize: 13, color: GodropColors.slate)),
                ],
              ),
            ),
            Text(service.tag, style: const TextStyle(fontSize: 12, color: GodropColors.mute)),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right_rounded, color: GodropColors.mute, size: 18),
          ],
        ),
      ),
    );
  }
}

class _OfferCard extends StatelessWidget {
  final String label;
  final String sub;
  final Color color;
  const _OfferCard({required this.label, required this.sub, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(14), border: Border.all(color: color.withOpacity(0.2))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(fontSize: 12, color: GodropColors.slate)),
        ],
      ),
    );
  }
}
