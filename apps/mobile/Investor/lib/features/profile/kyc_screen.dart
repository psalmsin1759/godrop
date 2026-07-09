import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';
import '../../shared/models/auth_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/invest_field.dart';
import '../../shared/widgets/progress_bar.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/kyc_cubit.dart';

/// Screen 27 — KYC: tier card with progress, verification steps.
class KycScreen extends StatefulWidget {
  const KycScreen({super.key});

  @override
  State<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends State<KycScreen> {
  @override
  void initState() {
    super.initState();
    context.read<KycCubit>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<KycCubit, KycState>(
          listener: (context, state) {
            if (state is KycLoaded && state.error != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text(state.error!),
                    backgroundColor: InvestColors.red),
              );
            }
          },
          builder: (context, state) {
            return Column(
              children: [
                const InvestTopBar(title: 'KYC Verification'),
                Expanded(
                  child: switch (state) {
                    KycLoading() => const LoadingView(),
                    KycError(message: final m) => ErrorView(
                        message: m,
                        onRetry: () => context.read<KycCubit>().load(),
                      ),
                    KycLoaded(kyc: final kyc, submitting: final submitting) =>
                      _buildLoaded(context, kyc, submitting),
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildLoaded(BuildContext context, InvestorKyc kyc, bool submitting) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: InvestColors.raise,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: InvestColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'VERIFICATION LEVEL',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: InvestColors.sub,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        kyc.tierName,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: InvestColors.text,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: InvestColors.greenSoft,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.shield_outlined,
                        size: 28, color: InvestColors.green),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              InvestProgressBar(value: kyc.progressPct / 100, height: 7),
              const SizedBox(height: 8),
              Text.rich(
                TextSpan(
                  text: kyc.tier >= 3
                      ? 'Fully verified — your investment limit is '
                      : 'Complete Tier ${kyc.tier + 1} to raise your investment limit to ',
                  style: const TextStyle(fontSize: 12, color: InvestColors.sub),
                  children: [
                    TextSpan(
                      text: formatKoboCompact(kyc.tier >= 3
                          ? kyc.investmentLimitKobo
                          : 5000000000),
                      style: const TextStyle(
                        color: InvestColors.text,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const TextSpan(text: '.'),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        for (final step in kyc.steps) ...[
          _stepTile(context, step),
          const SizedBox(height: 10),
        ],
        const SizedBox(height: 8),
        InvestButton(
          label: 'Continue verification',
          loading: submitting,
          onPressed: submitting
              ? null
              : () {
                  final next = kyc.steps
                      .where((s) => !s.isVerified && !s.isPending)
                      .toList();
                  if (next.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text(
                              'All steps submitted — verification in progress.')),
                    );
                  } else {
                    _handleStep(context, next.first);
                  }
                },
        ),
      ],
    );
  }

  Widget _stepTile(BuildContext context, KycStep step) {
    final done = step.isVerified;
    final pending = step.isPending;
    return GestureDetector(
      onTap: done || pending ? null : () => _handleStep(context, step),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: InvestColors.raise,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: InvestColors.line),
        ),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done
                    ? InvestColors.greenSoft
                    : (pending ? InvestColors.orangeSoft : InvestColors.raise3),
              ),
              child: Icon(
                done
                    ? Icons.check
                    : (pending ? Icons.schedule : Icons.add),
                size: 20,
                color: done
                    ? InvestColors.green
                    : (pending ? InvestColors.orange : InvestColors.sub),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    step.label,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: InvestColors.text,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    done
                        ? 'Verified'
                        : (pending ? 'In review · 1–2 days' : 'Not started'),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: done
                          ? InvestColors.green
                          : (pending ? InvestColors.orange : InvestColors.sub),
                    ),
                  ),
                ],
              ),
            ),
            if (!done && !pending)
              const Icon(Icons.chevron_right, size: 16, color: InvestColors.sub),
          ],
        ),
      ),
    );
  }

  void _handleStep(BuildContext context, KycStep step) {
    switch (step.key) {
      case 'bvn':
        _showBvnSheet(context);
      case 'governmentId':
        _pickAndUpload(context, isId: true);
      case 'proofOfAddress':
        _pickAndUpload(context, isId: false);
      case 'phone':
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Verify your phone from the sign-up OTP step.')),
        );
      case 'email':
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Check your inbox for the verification email.')),
        );
    }
  }

  Future<void> _pickAndUpload(BuildContext context, {required bool isId}) async {
    final cubit = context.read<KycCubit>();
    final picked =
        await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;
    final file = File(picked.path);
    final ok = isId
        ? await cubit.uploadId(file)
        : await cubit.uploadAddressProof(file);
    if (ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Document submitted — review takes 1–2 days.'),
          backgroundColor: InvestColors.green,
        ),
      );
    }
  }

  void _showBvnSheet(BuildContext context) {
    final controller = TextEditingController();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: InvestColors.raise,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 22,
          right: 22,
          top: 22,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'BVN verification',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: InvestColors.text,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Your BVN is only used to confirm your identity. We never see your bank transactions.',
              style: TextStyle(fontSize: 13, height: 1.5, color: InvestColors.sub),
            ),
            const SizedBox(height: 20),
            InvestField(
              label: 'Bank Verification Number',
              controller: controller,
              hint: '22345678901',
              icon: Icons.badge_outlined,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 8),
            InvestButton(
              label: 'Submit BVN',
              onPressed: () async {
                if (controller.text.length != 11) return;
                Navigator.pop(ctx);
                await context.read<KycCubit>().submitBvn(controller.text);
              },
            ),
          ],
        ),
      ),
    );
  }
}
