import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';
import '../../shared/widgets/background_blobs.dart';
import '../../shared/widgets/godrop_back_button.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import '../../shared/widgets/step_indicator.dart';
import 'bloc/onboarding_cubit.dart';

const _kVehicleTypes = <(String, String, IconData)>[
  ('BICYCLE', 'Bicycle', Icons.pedal_bike_rounded),
  ('MOTORCYCLE', 'Motorcycle', Icons.moped_rounded),
  ('CAR', 'Car', Icons.directions_car_rounded),
  ('VAN', 'Van', Icons.airport_shuttle_rounded),
];

const _kGenders = <(String, String)>[
  ('MALE', 'Male'),
  ('FEMALE', 'Female'),
  ('OTHER', 'Other'),
];

class RiderOnboardingScreen extends StatelessWidget {
  const RiderOnboardingScreen({super.key});

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

  // Step 1 — about you
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _streetCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  DateTime? _dob;
  String? _gender;

  // Step 2 — vehicle
  String _vehicleType = 'MOTORCYCLE';
  final _plateCtrl = TextEditingController();
  final _colorCtrl = TextEditingController();
  final _modelCtrl = TextEditingController();
  final _yearCtrl = TextEditingController();
  final _licenseCtrl = TextEditingController();
  DateTime? _licenseExpiry;
  DateTime? _insuranceExpiry;

  // Step 3 — identity & documents
  final _bvnCtrl = TextEditingController();
  final _ninCtrl = TextEditingController();
  File? _avatar;
  File? _govId;
  final List<File> _vehiclePapers = [];

  // Step 4 — guarantor (optional)
  final _guarantorNameCtrl = TextEditingController();
  final _guarantorPhoneCtrl = TextEditingController();
  final _guarantorAddressCtrl = TextEditingController();
  File? _guarantorGovId;

  @override
  void dispose() {
    for (final c in [
      _firstCtrl, _lastCtrl, _phoneCtrl, _emailCtrl, _streetCtrl, _cityCtrl,
      _stateCtrl, _plateCtrl, _colorCtrl, _modelCtrl, _yearCtrl, _licenseCtrl,
      _bvnCtrl, _ninCtrl, _guarantorNameCtrl, _guarantorPhoneCtrl,
      _guarantorAddressCtrl,
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

  /// Accepts local `0803...` (11 digits) or full `+234...` input.
  String get _normalizedPhone {
    var p = _phoneCtrl.text.replaceAll(RegExp(r'[\s-]'), '');
    if (p.startsWith('0') && p.length == 11) p = '+234${p.substring(1)}';
    return p;
  }

  String? _validateStep(int step) {
    switch (step) {
      case 0:
        if (_firstCtrl.text.trim().isEmpty || _lastCtrl.text.trim().isEmpty) {
          return 'Enter your first and last name';
        }
        if (!RegExp(r'^\+234\d{10}$').hasMatch(_normalizedPhone)) {
          return 'Phone must be a Nigerian number, e.g. 0803 414 2290';
        }
        final email = _emailCtrl.text.trim();
        if (email.isNotEmpty &&
            !RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
          return 'Enter a valid email address';
        }
        return null;
      case 1:
        return null; // vehicle type always has a selection
      case 2:
        if (_avatar == null) return 'Add a profile photo';
        final bvn = _bvnCtrl.text.trim();
        if (bvn.isNotEmpty && bvn.length != 11) return 'BVN must be 11 digits';
        final nin = _ninCtrl.text.trim();
        if (nin.isNotEmpty && nin.length != 11) return 'NIN must be 11 digits';
        return null;
      case 3:
        final anyGuarantorField = _guarantorNameCtrl.text.trim().isNotEmpty ||
            _guarantorPhoneCtrl.text.trim().isNotEmpty ||
            _guarantorAddressCtrl.text.trim().isNotEmpty;
        final allGuarantorFields = _guarantorNameCtrl.text.trim().isNotEmpty &&
            _guarantorPhoneCtrl.text.trim().isNotEmpty &&
            _guarantorAddressCtrl.text.trim().isNotEmpty;
        if (anyGuarantorField && !allGuarantorFields) {
          return "Fill in the guarantor's name, phone and address, or leave all three blank";
        }
        return null;
    }
    return null;
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

  Future<DateTime?> _pickDate({DateTime? initial, bool future = false}) {
    final now = DateTime.now();
    return showDatePicker(
      context: context,
      initialDate: initial ?? now,
      firstDate: future ? now : DateTime(now.year - 80),
      lastDate: future ? DateTime(now.year + 10) : now,
    );
  }

  String _fmtDate(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  Future<void> _pickImage(void Function(File) assign) async {
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
    context.read<OnboardingCubit>().submit(
          firstName: _firstCtrl.text.trim(),
          lastName: _lastCtrl.text.trim(),
          phone: _normalizedPhone,
          email: _emailCtrl.text.trim().isEmpty ? null : _emailCtrl.text.trim(),
          dateOfBirth: _dob != null ? _fmtDate(_dob!) : null,
          gender: _gender,
          streetAddress: _streetCtrl.text.trim().isEmpty
              ? null
              : _streetCtrl.text.trim(),
          city: _cityCtrl.text.trim().isEmpty ? null : _cityCtrl.text.trim(),
          state: _stateCtrl.text.trim().isEmpty ? null : _stateCtrl.text.trim(),
          vehicleType: _vehicleType,
          vehiclePlate:
              _plateCtrl.text.trim().isEmpty ? null : _plateCtrl.text.trim(),
          vehicleColor:
              _colorCtrl.text.trim().isEmpty ? null : _colorCtrl.text.trim(),
          vehicleModel:
              _modelCtrl.text.trim().isEmpty ? null : _modelCtrl.text.trim(),
          vehicleYear: int.tryParse(_yearCtrl.text.trim()),
          driverLicenseNumber: _licenseCtrl.text.trim().isEmpty
              ? null
              : _licenseCtrl.text.trim(),
          driverLicenseExpiry:
              _licenseExpiry != null ? _fmtDate(_licenseExpiry!) : null,
          vehicleInsuranceExpiry:
              _insuranceExpiry != null ? _fmtDate(_insuranceExpiry!) : null,
          bvn: _bvnCtrl.text.trim().isEmpty ? null : _bvnCtrl.text.trim(),
          nin: _ninCtrl.text.trim().isEmpty ? null : _ninCtrl.text.trim(),
          guarantor: _guarantorNameCtrl.text.trim().isEmpty
              ? null
              : {
                  'name': _guarantorNameCtrl.text.trim(),
                  'phone': _guarantorPhoneCtrl.text.trim(),
                  'address': _guarantorAddressCtrl.text.trim(),
                },
          avatarPath: _avatar!.path,
          governmentIdPath: _govId?.path,
          vehiclePaperPaths: _vehiclePapers.map((f) => f.path).toList(),
          guarantorGovernmentIdPath: _guarantorGovId?.path,
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
                              'About you',
                              'Your vehicle',
                              'Identity & documents',
                              'Guarantor (optional)',
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
                              'Tell us who you are and how to reach you.',
                              'What you’ll be delivering with.',
                              'We verify every rider to keep the platform safe.',
                              'Optional — someone we can contact about you.',
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
                          _buildAboutStep(),
                          _buildVehicleStep(),
                          _buildDocumentsStep(),
                          _buildGuarantorStep(),
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
                        onTap: submitting ? null : _next,
                        isLoading: submitting,
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

  // ── Step 1: about you ──────────────────────────────────────────────────────

  Widget _buildAboutStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
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
            controller: _phoneCtrl,
            label: 'Phone (🇳🇬)',
            hint: '0803 414 2290',
            keyboardType: TextInputType.phone,
            icon: Icons.phone_outlined),
        const SizedBox(height: 14),
        GodropField(
            controller: _emailCtrl,
            label: 'Email (optional)',
            hint: 'you@example.com',
            keyboardType: TextInputType.emailAddress,
            icon: Icons.mail_outline_rounded),
        const SizedBox(height: 14),
        GestureDetector(
          onTap: () async {
            final picked = await _pickDate(initial: _dob);
            if (picked != null) setState(() => _dob = picked);
          },
          child: AbsorbPointer(
            child: GodropField(
              controller: TextEditingController(
                  text: _dob != null ? _fmtDate(_dob!) : ''),
              label: 'Date of birth (optional)',
              hint: 'YYYY-MM-DD',
              icon: Icons.cake_outlined,
            ),
          ),
        ),
        const SizedBox(height: 14),
        const Text('Gender (optional)',
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: GodropColors.slate)),
        const SizedBox(height: 8),
        Row(
          children: [
            for (final (value, label) in _kGenders) ...[
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(
                      () => _gender = _gender == value ? null : value),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    margin:
                        EdgeInsets.only(right: value != 'OTHER' ? 8 : 0),
                    decoration: BoxDecoration(
                      color: _gender == value
                          ? GodropColors.blue
                          : GodropColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                          color: _gender == value
                              ? GodropColors.blue
                              : GodropColors.border,
                          width: 1.5),
                    ),
                    child: Center(
                      child: Text(label,
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: _gender == value
                                  ? GodropColors.white
                                  : GodropColors.slate)),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 14),
        GodropField(
            controller: _streetCtrl,
            label: 'Street address (optional)',
            hint: 'e.g. 12 Adeola Odeku St'),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
                child: GodropField(
                    controller: _cityCtrl, label: 'City', hint: 'City')),
            const SizedBox(width: 10),
            Expanded(
                child: GodropField(
                    controller: _stateCtrl, label: 'State', hint: 'State')),
          ],
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  // ── Step 2: vehicle ─────────────────────────────────────────────────────────

  Widget _buildVehicleStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Vehicle type',
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: GodropColors.slate)),
        const SizedBox(height: 8),
        Row(
          children: [
            for (final (value, label, icon) in _kVehicleTypes) ...[
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _vehicleType = value),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    margin: EdgeInsets.only(right: value != 'VAN' ? 8 : 0),
                    decoration: BoxDecoration(
                      color: _vehicleType == value
                          ? GodropColors.blue
                          : GodropColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                          color: _vehicleType == value
                              ? GodropColors.blue
                              : GodropColors.border,
                          width: 1.5),
                    ),
                    child: Column(
                      children: [
                        Icon(icon,
                            size: 20,
                            color: _vehicleType == value
                                ? GodropColors.white
                                : GodropColors.mute),
                        const SizedBox(height: 4),
                        Text(label,
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: _vehicleType == value
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
            controller: _plateCtrl,
            label: 'Plate number (optional)',
            hint: 'e.g. ABC-123XY'),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
                child: GodropField(
                    controller: _colorCtrl,
                    label: 'Color (optional)',
                    hint: 'e.g. Black')),
            const SizedBox(width: 10),
            Expanded(
                child: GodropField(
                    controller: _modelCtrl,
                    label: 'Model (optional)',
                    hint: 'e.g. Boxer 150')),
          ],
        ),
        const SizedBox(height: 14),
        GodropField(
            controller: _yearCtrl,
            label: 'Year (optional)',
            hint: 'e.g. 2020',
            keyboardType: TextInputType.number),
        const SizedBox(height: 14),
        GodropField(
            controller: _licenseCtrl,
            label: "Driver's license number (optional)",
            hint: 'License number'),
        const SizedBox(height: 14),
        GestureDetector(
          onTap: () async {
            final picked = await _pickDate(initial: _licenseExpiry, future: true);
            if (picked != null) setState(() => _licenseExpiry = picked);
          },
          child: AbsorbPointer(
            child: GodropField(
              controller: TextEditingController(
                  text: _licenseExpiry != null
                      ? _fmtDate(_licenseExpiry!)
                      : ''),
              label: "License expiry (optional)",
              hint: 'YYYY-MM-DD',
              icon: Icons.event_outlined,
            ),
          ),
        ),
        const SizedBox(height: 14),
        GestureDetector(
          onTap: () async {
            final picked =
                await _pickDate(initial: _insuranceExpiry, future: true);
            if (picked != null) setState(() => _insuranceExpiry = picked);
          },
          child: AbsorbPointer(
            child: GodropField(
              controller: TextEditingController(
                  text: _insuranceExpiry != null
                      ? _fmtDate(_insuranceExpiry!)
                      : ''),
              label: 'Insurance expiry (optional)',
              hint: 'YYYY-MM-DD',
              icon: Icons.event_outlined,
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  // ── Step 3: identity & documents ───────────────────────────────────────────

  Widget _buildDocumentsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GodropField(
            controller: _bvnCtrl,
            label: 'BVN (optional)',
            hint: '11-digit BVN',
            keyboardType: TextInputType.number),
        const SizedBox(height: 14),
        GodropField(
            controller: _ninCtrl,
            label: 'NIN (optional)',
            hint: '11-digit NIN',
            keyboardType: TextInputType.number),
        const SizedBox(height: 16),
        _DocumentTile(
          title: 'Profile photo',
          subtitle: 'Required — riders and customers will see this',
          file: _avatar,
          onTap: () => _pickImage((f) => _avatar = f),
        ),
        const SizedBox(height: 12),
        _DocumentTile(
          title: 'Government ID',
          subtitle: 'Recommended — NIN slip, driver’s licence, or passport',
          file: _govId,
          onTap: () => _pickImage((f) => _govId = f),
        ),
        const SizedBox(height: 12),
        _MultiDocumentTile(
          title: 'Vehicle papers',
          subtitle: 'Optional — registration, roadworthiness, etc. (up to 5)',
          files: _vehiclePapers,
          onAdd: () => _pickImage((f) {
            if (_vehiclePapers.length < 5) _vehiclePapers.add(f);
          }),
          onRemove: (f) => setState(() => _vehiclePapers.remove(f)),
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

  // ── Step 4: guarantor (optional) ───────────────────────────────────────────

  Widget _buildGuarantorStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GodropField(
            controller: _guarantorNameCtrl,
            label: "Guarantor's name",
            hint: 'Full name'),
        const SizedBox(height: 14),
        GodropField(
            controller: _guarantorPhoneCtrl,
            label: "Guarantor's phone",
            hint: '0803 414 2290',
            keyboardType: TextInputType.phone),
        const SizedBox(height: 14),
        GodropField(
            controller: _guarantorAddressCtrl,
            label: "Guarantor's address",
            hint: 'Address'),
        const SizedBox(height: 12),
        _DocumentTile(
          title: "Guarantor's government ID",
          subtitle: 'Optional',
          file: _guarantorGovId,
          onTap: () => _pickImage((f) => _guarantorGovId = f),
        ),
        const SizedBox(height: 14),
        const Text(
          'A guarantor helps speed up your review. You can skip this and add one later.',
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

class _MultiDocumentTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<File> files;
  final VoidCallback onAdd;
  final ValueChanged<File> onRemove;

  const _MultiDocumentTile({
    required this.title,
    required this.subtitle,
    required this.files,
    required this.onAdd,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
            color: files.isNotEmpty
                ? GodropColors.success.withValues(alpha: 0.4)
                : GodropColors.border,
            width: 1.5),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: GodropColors.ink)),
                    Text(subtitle,
                        style: const TextStyle(
                            fontSize: 12, color: GodropColors.mute)),
                  ],
                ),
              ),
              GestureDetector(
                onTap: files.length < 5 ? onAdd : null,
                child: Icon(Icons.add_circle_outline,
                    color: files.length < 5
                        ? GodropColors.blue
                        : GodropColors.mute,
                    size: 24),
              ),
            ],
          ),
          if (files.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final f in files)
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.file(f,
                            width: 56, height: 56, fit: BoxFit.cover),
                      ),
                      Positioned(
                        top: -6,
                        right: -6,
                        child: GestureDetector(
                          onTap: () => onRemove(f),
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: const BoxDecoration(
                                color: GodropColors.error,
                                shape: BoxShape.circle),
                            child: const Icon(Icons.close_rounded,
                                color: Colors.white, size: 14),
                          ),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ],
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
                    'Our team reviews applications within 1–2 business days. Once approved, activate your account with your phone number right here.',
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
