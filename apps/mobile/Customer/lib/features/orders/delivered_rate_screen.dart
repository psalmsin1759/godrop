import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/godrop_button.dart';

class DeliveredRateScreen extends StatefulWidget {
  const DeliveredRateScreen({super.key});

  @override
  State<DeliveredRateScreen> createState() => _DeliveredRateScreenState();
}

class _DeliveredRateScreenState extends State<DeliveredRateScreen> {
  int _rating = 4;
  final _tags = {'On time': false, 'Friendly': true, 'Careful with parcel': false, 'Great comms': false, 'Clean vehicle': false};
  int _tip = 500;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Success header
            Container(
              width: double.infinity,
              padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 32, 20, 32),
              decoration: const BoxDecoration(gradient: GodropColors.blueGradient),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.4), width: 3),
                      color: Colors.white.withOpacity(0.15),
                    ),
                    child: const Icon(Icons.check_rounded, color: Colors.white, size: 36),
                  ),
                  const SizedBox(height: 16),
                  const Text('Delivered!', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text('Your parcel arrived at Victoria Island · 4:31 PM', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Rider card
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: GodropColors.white, borderRadius: BorderRadius.circular(14)),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [Color(0xFF7B4FA3), Color(0xFFC4478A)])),
                          child: const Center(child: Text('TB', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700))),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Tunde Balogun', style: TextStyle(fontWeight: FontWeight.w600, color: GodropColors.ink, fontSize: 15)),
                              Text('Bajaj Boxer · LAG 342 KJA', style: TextStyle(fontSize: 12, color: GodropColors.slate)),
                            ],
                          ),
                        ),
                        const Text('₦1,450', style: TextStyle(fontWeight: FontWeight.w700, color: GodropColors.ink, fontSize: 15)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Center(child: Text('How was your delivery?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: GodropColors.ink))),
                  const SizedBox(height: 4),
                  const Center(child: Text('Your feedback helps Tunde get more trips.', style: TextStyle(fontSize: 13, color: GodropColors.slate))),
                  const SizedBox(height: 16),
                  // Stars
                  Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List.generate(5, (i) => GestureDetector(
                        onTap: () => setState(() => _rating = i + 1),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: Icon(
                            i < _rating ? Icons.star_rounded : Icons.star_border_rounded,
                            size: 40,
                            color: GodropColors.orange,
                          ),
                        ),
                      )),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text('What went well?', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: GodropColors.ink)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _tags.entries.map((e) => GestureDetector(
                      onTap: () => setState(() => _tags[e.key] = !e.value),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: e.value ? GodropColors.blue.withOpacity(0.08) : GodropColors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: e.value ? GodropColors.blue : GodropColors.border, width: e.value ? 1.5 : 1),
                        ),
                        child: Text(e.key, style: TextStyle(fontSize: 13, color: e.value ? GodropColors.blue : GodropColors.ink, fontWeight: e.value ? FontWeight.w600 : FontWeight.w400)),
                      ),
                    )).toList(),
                  ),
                  const SizedBox(height: 20),
                  // Tip section
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: GodropColors.orange.withOpacity(0.06), borderRadius: BorderRadius.circular(14), border: Border.all(color: GodropColors.orange.withOpacity(0.2))),
                    child: Row(
                      children: [
                        const Icon(Icons.card_giftcard_rounded, color: GodropColors.orange, size: 20),
                        const SizedBox(width: 10),
                        const Expanded(child: Text('Tip Tunde to say\nthanks', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: GodropColors.ink))),
                        ...[200, 500, 1000].map((amt) => GestureDetector(
                          onTap: () => setState(() => _tip = amt),
                          child: Container(
                            margin: const EdgeInsets.only(left: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: _tip == amt ? GodropColors.orange : GodropColors.white,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: _tip == amt ? GodropColors.orange : GodropColors.border),
                            ),
                            child: Text(amt == 1000 ? '₦1K' : '₦$amt', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _tip == amt ? Colors.white : GodropColors.ink)),
                          ),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  GodropButton(label: 'Submit', onTap: () => context.go('/orders')),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
