import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/support_cubit.dart';

/// Screen 29 — Help & Support: live chat / call cards, FAQ accordion.
class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  int? _open = 0;

  @override
  void initState() {
    super.initState();
    context.read<SupportCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const InvestTopBar(title: 'Help & Support'),
            Expanded(
              child: BlocBuilder<SupportCubit, SupportState>(
                builder: (context, state) {
                  return switch (state) {
                    SupportLoading() => const LoadingView(),
                    SupportError(message: final m) => ErrorView(
                        message: m,
                        onRetry: () => context.read<SupportCubit>().load(),
                      ),
                    SupportLoaded(faqs: final faqs) => ListView(
                        padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
                        children: [
                          Row(
                            children: [
                              _contactCard(
                                'Live chat',
                                'Online now',
                                Icons.chat_bubble_outline,
                                online: true,
                              ),
                              const SizedBox(width: 10),
                              _contactCard(
                                'Call us',
                                '9am–6pm',
                                Icons.phone_outlined,
                                onTap: () =>
                                    launchUrl(Uri.parse('tel:+2342013303333')),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            'Frequently asked',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: InvestColors.text,
                            ),
                          ),
                          const SizedBox(height: 12),
                          for (var i = 0; i < faqs.length; i++) ...[
                            _faqTile(i, faqs[i].question, faqs[i].answer),
                            const SizedBox(height: 10),
                          ],
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: InvestColors.raise2,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Column(
                              children: [
                                const Text(
                                  'Still need help?',
                                  style: TextStyle(
                                      fontSize: 13.5, color: InvestColors.sub),
                                ),
                                const SizedBox(height: 4),
                                GestureDetector(
                                  onTap: () => launchUrl(
                                      Uri.parse('mailto:support@godrop.ng')),
                                  child: const Text(
                                    'support@godrop.ng',
                                    style: TextStyle(
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700,
                                      color: InvestColors.blueBright,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                  };
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _contactCard(String title, String subtitle, IconData icon,
      {bool online = false, VoidCallback? onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: InvestColors.raise,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: InvestColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: InvestColors.blueSoft,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 22, color: InvestColors.blueBright),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w700,
                  color: InvestColors.text,
                ),
              ),
              const SizedBox(height: 3),
              Row(
                children: [
                  if (online)
                    Container(
                      width: 6,
                      height: 6,
                      margin: const EdgeInsets.only(right: 5),
                      decoration: const BoxDecoration(
                        color: InvestColors.green,
                        shape: BoxShape.circle,
                      ),
                    ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11.5,
                      color: online ? InvestColors.green : InvestColors.sub,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _faqTile(int index, String question, String answer) {
    final open = _open == index;
    return GestureDetector(
      onTap: () => setState(() => _open = open ? null : index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: InvestColors.raise,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: open ? InvestColors.line2 : InvestColors.line),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    question,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: InvestColors.text,
                    ),
                  ),
                ),
                Icon(
                  open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  size: 18,
                  color: InvestColors.sub,
                ),
              ],
            ),
            if (open)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(
                  answer,
                  style: const TextStyle(
                    fontSize: 12.5,
                    height: 1.55,
                    color: InvestColors.sub,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
