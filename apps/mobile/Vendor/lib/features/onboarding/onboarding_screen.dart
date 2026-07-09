import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';
import '../../shared/api/places_service.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_back_button.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import '../../shared/widgets/location_picker_sheet.dart';
import '../../shared/widgets/step_indicator.dart';
import 'bloc/onboarding_cubit.dart';

const _kVendorTypes = <(String, String, IconData)>[
  ('RESTAURANT', 'Restaurant', Icons.restaurant_rounded),
  ('GROCERY', 'Grocery', Icons.local_grocery_store_rounded),
  ('RETAIL', 'Retail', Icons.storefront_rounded),
  ('PHARMACY', 'Pharmacy', Icons.local_pharmacy_rounded),
];

class VendorOnboardingScreen extends StatelessWidget {
  const VendorOnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => OnboardingCubit(),
      child: const _OnboardingView(),
    );
  }
}

class _OnboardingView extends StatefulWidget {
  const _OnboardingView();

  @override
  State<_OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<_OnboardingView> {
  static const _totalSteps = 4;
  int _step = 0;

  // Step 1 — business
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _cuisinesCtrl = TextEditingController();
  String _type = 'RESTAURANT';

  // Step 2 — location (address + lat/lng come from the Places picker)
  PickedPlace? _place;

  // Step 3 — owner account
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure = true;

  // Step 4 — documents
  File? _businessReg;
  File? _govId;
  File? _utilityBill;

  @override
  void dispose() {
    for (final c in [
      _nameCtrl, _descCtrl, _phoneCtrl, _emailCtrl, _cuisinesCtrl,
      _firstCtrl, _lastCtrl, _passwordCtrl, _confirmCtrl,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  void _toast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: Colors.red.shade700,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
    ));
  }

  String? _validateStep(int step) {
    switch (step) {
      case 0:
        if (_nameCtrl.text.trim().length < 2) return 'Enter your business name';
        final phone = _normalizedPhone;
        if (!RegExp(r'^\+234\d{10}$').hasMatch(phone)) {
          return 'Phone must be a Nigerian number, e.g. 0803 414 2290';
        }
        if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
            .hasMatch(_emailCtrl.text.trim())) {
          return 'Enter a valid email address';
        }
        return null;
      case 1:
        if (_place == null) return 'Search for your store address';
        return null;
      case 2:
        if (_firstCtrl.text.trim().isEmpty || _lastCtrl.text.trim().isEmpty) {
          return "Enter the owner's first and last name";
        }
        if (_passwordCtrl.text.length < 8) {
          return 'Password must be at least 8 characters';
        }
        if (_passwordCtrl.text != _confirmCtrl.text) {
          return 'Passwords do not match';
        }
        return null;
      case 3:
        if (_businessReg == null) return 'Add your CAC business registration';
        if (_govId == null) return "Add the owner's government ID";
        return null;
    }
    return null;
  }

  /// Accepts local `0803...` (11 digits) or full `+234...` input.
  String get _normalizedPhone {
    var p = _phoneCtrl.text.replaceAll(RegExp(r'[\s-]'), '');
    if (p.startsWith('0') && p.length == 11) p = '+234${p.substring(1)}';
    return p;
  }

  void _next() {
    final err = _validateStep(_step);
    if (err != null) return _toast(err);
    if (_step < _totalSteps - 1) {
      setState(() => _step++);
    } else {
      _submit();
    }
  }

  void _back() {
    if (_step == 0) {
      context.go('/auth/login');
    } else {
      setState(() => _step--);
    }
  }

  Future<void> _pickAddress() async {
    final result = await showModalBottomSheet<PickedPlace>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const LocationPickerSheet(title: 'Store address'),
    );
    if (result != null && mounted) setState(() => _place = result);
  }

  Future<void> _pickDocument(void Function(File) assign) async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: GodropColors.card,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            ListTile(
              leading:
                  const Icon(Icons.camera_alt_outlined, color: GodropColors.blue),
              title: const Text('Take a photo'),
              onTap: () => Navigator.of(sheetCtx).pop(ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined,
                  color: GodropColors.blue),
              title: const Text('Choose from gallery'),
              onTap: () => Navigator.of(sheetCtx).pop(ImageSource.gallery),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
    if (source == null) return;
    final picked = await ImagePicker()
        .pickImage(source: source, maxWidth: 2000, imageQuality: 90);
    if (picked != null) setState(() => assign(File(picked.path)));
  }

  void _submit() {
    final cuisines = _cuisinesCtrl.text
        .split(',')
        .map((c) => c.trim())
        .where((c) => c.isNotEmpty)
        .toList();
    context.read<OnboardingCubit>().submit(
          name: _nameCtrl.text.trim(),
          type: _type,
          description: _descCtrl.text.trim().isEmpty
              ? null
              : _descCtrl.text.trim(),
          address: _place!.name,
          lat: _place!.lat,
          lng: _place!.lng,
          phone: _normalizedPhone,
          email: _emailCtrl.text.trim(),
          cuisines: cuisines,
          ownerFirstName: _firstCtrl.text.trim(),
          ownerLastName: _lastCtrl.text.trim(),
          ownerPassword: _passwordCtrl.text,
          businessRegistrationPath: _businessReg!.path,
          governmentIdPath: _govId!.path,
          utilityBillPath: _utilityBill?.path,
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<OnboardingCubit, OnboardingState>(
      listener: (ctx, state) {
        if (state is OnboardingError) {
          _toast(state.message);
          ctx.read<OnboardingCubit>().reset();
        }
      },
      builder: (ctx, state) {
        if (state is OnboardingSubmitted) return const _SuccessView();
        final submitting = state is OnboardingSubmitting;
        return Scaffold(
          backgroundColor: GodropColors.background,
          body: Stack(
            children: [
              const BackgroundBlobs(
                  topColor: GodropColors.blue,
                  bottomColor: GodropColors.orange),
              SafeArea(
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          GodropBackButton(onTap: submitting ? () {} : _back),
                          const SizedBox(height: 20),
                          StepIndicator(
                              totalSteps: _totalSteps,
                              currentStep: _step + 1),
                          const SizedBox(height: 20),
                          Text(
                            const [
                              'Your business',
                              'Store location',
                              'Owner account',
                              'Documents',
                            ][_step],
                            style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w700,
                                color: GodropColors.ink,
                                letterSpacing: -0.4),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            const [
                              'Tell us about your store on Godrop.',
                              'So riders and customers can find you.',
                              'You will sign in with these details once approved.',
                              'We verify every vendor to keep the platform safe.',
                            ][_step],
                            style: const TextStyle(
                                fontSize: 14,
                                color: GodropColors.slate,
                                height: 1.4),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: [
                          _buildBusinessStep(),
                          _buildLocationStep(),
                          _buildAccountStep(),
                          _buildDocumentsStep(),
                        ][_step],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
                      child: GodropButton(
                        label: submitting
                            ? 'Submitting application...'
                            : _step == _totalSteps - 1
                                ? 'Submit application'
                                : 'Continue',
                        trailingIcon: submitting
                            ? null
                            : _step == _totalSteps - 1
                                ? Icons.check_rounded
                                : Icons.arrow_forward_rounded,
                        onTap: submitting ? null : _next,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ── Step 1: business ───────────────────────────────────────────────────────

  Widget _buildBusinessStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Business type',
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: GodropColors.slate)),
        const SizedBox(height: 8),
        Row(
          children: [
            for (final (value, label, icon) in _kVendorTypes) ...[
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _type = value),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    margin: EdgeInsets.only(
                        right: value != 'PHARMACY' ? 8 : 0),
                    decoration: BoxDecoration(
                      color: _type == value
                          ? GodropColors.blue
                          : GodropColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                          color: _type == value
                              ? GodropColors.blue
                              : GodropColors.border,
                          width: 1.5),
                    ),
                    child: Column(
                      children: [
                        Icon(icon,
                            size: 20,
                            color: _type == value
                                ? GodropColors.white
                                : GodropColors.mute),
                        const SizedBox(height: 4),
                        Text(label,
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: _type == value
                                    ? GodropColors.white
                                    : GodropColors.slate)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 16),
        GodropField(
            controller: _nameCtrl,
            label: 'Business name',
            hint: "e.g. Mama's Kitchen"),
        const SizedBox(height: 14),
        GodropField(
            controller: _descCtrl,
            label: 'Description (optional)',
            hint: 'What do you sell?',
            maxLines: 2),
        if (_type == 'RESTAURANT') ...[
          const SizedBox(height: 14),
          GodropField(
              controller: _cuisinesCtrl,
              label: 'Cuisines (comma-separated, optional)',
              hint: 'e.g. Nigerian, Soups, Grills'),
        ],
        const SizedBox(height: 14),
        GodropField(
            controller: _phoneCtrl,
            label: 'Business phone (🇳🇬)',
            hint: '0803 414 2290',
            keyboardType: TextInputType.phone,
            icon: Icons.phone_outlined),
        const SizedBox(height: 14),
        GodropField(
            controller: _emailCtrl,
            label: 'Business email — this becomes your sign-in email',
            hint: 'owner@mamaskitchen.ng',
            keyboardType: TextInputType.emailAddress,
            icon: Icons.mail_outline_rounded),
        const SizedBox(height: 16),
      ],
    );
  }

  // ── Step 2: location ───────────────────────────────────────────────────────

  Widget _buildLocationStep() {
    final picked = _place != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Store address',
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: GodropColors.slate)),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _pickAddress,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: GodropColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                  color: picked
                      ? GodropColors.success.withValues(alpha: 0.4)
                      : GodropColors.border,
                  width: 1.5),
              boxShadow: GodropColors.softShadow,
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: picked
                        ? GodropColors.success.withValues(alpha: 0.10)
                        : GodropColors.blue.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    picked
                        ? Icons.check_circle_rounded
                        : Icons.search_rounded,
                    color:
                        picked ? GodropColors.success : GodropColors.blue,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    picked
                        ? _place!.name
                        : 'Search for your store address...',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: picked ? GodropColors.ink : GodropColors.mute,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(picked ? 'Change' : '',
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.blue)),
                if (!picked)
                  const Icon(Icons.chevron_right_rounded,
                      color: GodropColors.mute, size: 20),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          picked
              ? 'Location pinned — riders and customers will navigate to this exact spot.'
              : 'Start typing and pick your address from the suggestions, or use your GPS position if you are at the store.',
          style: const TextStyle(
              fontSize: 12, color: GodropColors.mute, height: 1.4),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  // ── Step 3: owner account ──────────────────────────────────────────────────

  Widget _buildAccountStep() {
    final eye = GestureDetector(
      onTap: () => setState(() => _obscure = !_obscure),
      child: Icon(
          _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
          size: 20,
          color: GodropColors.mute),
    );
    return Column(
      children: [
        Row(
          children: [
            Expanded(
                child: GodropField(
                    controller: _firstCtrl,
                    label: 'First name',
                    hint: 'First name')),
            const SizedBox(width: 10),
            Expanded(
                child: GodropField(
                    controller: _lastCtrl,
                    label: 'Last name',
                    hint: 'Last name')),
          ],
        ),
        const SizedBox(height: 14),
        GodropField(
            controller: _passwordCtrl,
            label: 'Password (min. 8 characters)',
            hint: 'Create a password',
            obscure: _obscure,
            icon: Icons.lock_outline_rounded,
            suffix: eye),
        const SizedBox(height: 14),
        GodropField(
            controller: _confirmCtrl,
            label: 'Confirm password',
            hint: 'Repeat password',
            obscure: _obscure,
            icon: Icons.lock_outline_rounded),
        const SizedBox(height: 16),
      ],
    );
  }

  // ── Step 4: documents ──────────────────────────────────────────────────────

  Widget _buildDocumentsStep() {
    return Column(
      children: [
        _DocumentTile(
          title: 'CAC business registration',
          subtitle: 'Required — your CAC certificate',
          file: _businessReg,
          onTap: () => _pickDocument((f) => _businessReg = f),
        ),
        const SizedBox(height: 12),
        _DocumentTile(
          title: 'Government ID',
          subtitle: "Required — owner's NIN slip, driver's licence, or passport",
          file: _govId,
          onTap: () => _pickDocument((f) => _govId = f),
        ),
        const SizedBox(height: 12),
        _DocumentTile(
          title: 'Utility bill',
          subtitle: 'Optional — recent bill showing your business address',
          file: _utilityBill,
          onTap: () => _pickDocument((f) => _utilityBill = f),
        ),
        const SizedBox(height: 14),
        const Text(
          'Clear photos work best. Max 10 MB per document. Our team reviews applications within 1–2 business days.',
          style: TextStyle(fontSize: 12, color: GodropColors.mute, height: 1.4),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _DocumentTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final File? file;
  final VoidCallback onTap;

  const _DocumentTile({
    required this.title,
    required this.subtitle,
    required this.file,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final added = file != null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
              color: added
                  ? GodropColors.success.withValues(alpha: 0.4)
                  : GodropColors.border,
              width: 1.5),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            if (added)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(file!,
                    width: 48, height: 48, fit: BoxFit.cover),
              )
            else
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: GodropColors.blue.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.upload_file_rounded,
                    color: GodropColors.blue, size: 22),
              ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: GodropColors.ink)),
                  Text(added ? 'Added — tap to replace' : subtitle,
                      style: TextStyle(
                          fontSize: 12,
                          color: added
                              ? GodropColors.success
                              : GodropColors.mute)),
                ],
              ),
            ),
            Icon(
              added ? Icons.check_circle_rounded : Icons.add_circle_outline,
              color: added ? GodropColors.success : GodropColors.mute,
              size: 22,
            ),
          ],
        ),
      ),
    );
  }
}

class _SuccessView extends StatelessWidget {
  const _SuccessView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Stack(
        children: [
          const BackgroundBlobs(
              topColor: GodropColors.success, bottomColor: GodropColors.blue),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Spacer(),
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      color: GodropColors.success.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: const Icon(Icons.check_rounded,
                        color: GodropColors.success, size: 44),
                  ),
                  const SizedBox(height: 24),
                  const Text('Application received!',
                      style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink,
                          letterSpacing: -0.4)),
                  const SizedBox(height: 10),
                  const Text(
                    "We've emailed you a confirmation. Our team reviews applications within 1–2 business days — you'll get another email once your store is approved, then sign in right here.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 14, color: GodropColors.slate, height: 1.5),
                  ),
                  const Spacer(),
                  GodropButton(
                    label: 'Back to sign in',
                    onTap: () => context.go('/auth/login'),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
