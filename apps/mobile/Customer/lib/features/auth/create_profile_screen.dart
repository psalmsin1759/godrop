import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class CreateProfileScreen extends StatefulWidget {
  const CreateProfileScreen({super.key});

  @override
  State<CreateProfileScreen> createState() => _CreateProfileScreenState();
}

class _CreateProfileScreenState extends State<CreateProfileScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _referralCtrl = TextEditingController();
  File? _pickedImage;
  String? _nameError;
  String? _emailError;
  String? _passwordError;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _referralCtrl.dispose();
    super.dispose();
  }

  bool _validate() {
    final name = _nameCtrl.text.trim();
    final email = _emailCtrl.text.trim();
    final pw = _passwordCtrl.text;
    String? nameErr;
    String? emailErr;
    String? pwErr;

    if (name.isEmpty) {
      nameErr = 'Please enter your full name';
    } else if (name.split(' ').length < 2) {
      nameErr = 'Please enter your first and last name';
    }

    if (email.isNotEmpty && !RegExp(r'^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$').hasMatch(email)) {
      emailErr = 'Please enter a valid email address';
    }

    if (pw.isNotEmpty && pw.length < 6) {
      pwErr = 'Password must be at least 6 characters';
    }

    setState(() {
      _nameError = nameErr;
      _emailError = emailErr;
      _passwordError = pwErr;
    });
    return nameErr == null && emailErr == null && pwErr == null;
  }

  void _continue(BuildContext ctx) {
    if (!_validate()) return;

    final parts = _nameCtrl.text.trim().split(' ');
    final firstName = parts.first;
    final lastName = parts.skip(1).join(' ');
    final phone = ctx.read<AuthCubit>().pendingPhone ?? '';

    ctx.read<AuthCubit>().register(
      phone: phone,
      firstName: firstName,
      lastName: lastName,
      email: _emailCtrl.text.trim(),
      referralCode: _referralCtrl.text.trim(),
      password: _passwordCtrl.text.isNotEmpty ? _passwordCtrl.text : null,
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 80);
    if (picked != null && mounted) {
      setState(() => _pickedImage = File(picked.path));
    }
  }

  void _showImagePickerSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: GodropColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: GodropColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Profile photo',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: GodropColors.ink),
            ),
            const SizedBox(height: 8),
            const Text(
              'This helps riders and drivers recognize you.',
              style: TextStyle(fontSize: 14, color: GodropColors.slate),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: GodropColors.blue.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.camera_alt_rounded, color: GodropColors.blue, size: 20),
              ),
              title: const Text(
                'Take a photo',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: GodropColors.ink),
              ),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: GodropColors.blue.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.photo_library_rounded, color: GodropColors.blue, size: 20),
              ),
              title: const Text(
                'Upload from gallery',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: GodropColors.ink),
              ),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (ctx, state) {
        if (state is AuthAuthenticated) {
          ctx.go('/auth/location');
        } else if (state is AuthError) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red.shade700,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              margin: const EdgeInsets.all(16),
            ),
          );
          ctx.read<AuthCubit>().reset();
        }
      },
      builder: (ctx, state) {
        final loading = state is AuthLoading;
        return Scaffold(
          backgroundColor: GodropColors.white,
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  Row(children: List.generate(3, (i) => Expanded(
                    child: Container(
                      height: 3,
                      margin: EdgeInsets.only(right: i < 2 ? 6 : 0),
                      decoration: BoxDecoration(
                        color: i < 2 ? GodropColors.blue : GodropColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ))),
                  const SizedBox(height: 12),
                  const Text(
                    'STEP 2 OF 3',
                    style: TextStyle(
                      fontSize: 11,
                      color: GodropColors.mute,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Tell us about you',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'This helps riders and drivers recognize you.',
                    style: TextStyle(fontSize: 15, color: GodropColors.slate),
                  ),
                  const SizedBox(height: 28),
                  Center(
                    child: GestureDetector(
                      onTap: _showImagePickerSheet,
                      child: Stack(
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: const BoxDecoration(shape: BoxShape.circle),
                            clipBehavior: Clip.antiAlias,
                            child: _pickedImage != null
                                ? Image.file(_pickedImage!, fit: BoxFit.cover)
                                : Image.asset('assets/images/user.png', fit: BoxFit.cover),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              width: 26,
                              height: 26,
                              decoration: BoxDecoration(
                                gradient: GodropColors.blueGradient,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                              child: const Icon(Icons.add_rounded, color: Colors.white, size: 15),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),
                  _FieldLabel('FULL NAME'),
                  const SizedBox(height: 6),
                  _InputField(
                    controller: _nameCtrl,
                    placeholder: 'Your Full Name',
                    error: _nameError,
                    onChanged: (_) { if (_nameError != null) setState(() => _nameError = null); },
                  ),
                  const SizedBox(height: 16),
                  _FieldLabel('EMAIL (OPTIONAL)'),
                  const SizedBox(height: 6),
                  _InputField(
                    controller: _emailCtrl,
                    placeholder: 'Your Email',
                    keyboard: TextInputType.emailAddress,
                    error: _emailError,
                    onChanged: (_) { if (_emailError != null) setState(() => _emailError = null); },
                  ),
                  const SizedBox(height: 16),
                  _FieldLabel('PASSWORD (OPTIONAL)'),
                  const SizedBox(height: 6),
                  _PasswordInputField(
                    controller: _passwordCtrl,
                    error: _passwordError,
                    obscure: _obscurePassword,
                    onToggle: () => setState(() => _obscurePassword = !_obscurePassword),
                    onChanged: (_) { if (_passwordError != null) setState(() => _passwordError = null); },
                  ),
                  const SizedBox(height: 4),
                  const Text('Set a password to log in later without OTP.', style: TextStyle(fontSize: 12, color: GodropColors.mute)),
                  const SizedBox(height: 16),
                  _FieldLabel('REFERRAL CODE (OPTIONAL)'),
                  const SizedBox(height: 6),
                  _InputField(controller: _referralCtrl, placeholder: 'XXXX', isHighlighted: true),
                  const SizedBox(height: 32),
                  GodropButton(
                    label: loading ? 'Creating account...' : 'Continue →',
                    onTap: loading ? null : () => _continue(ctx),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: GodropColors.slate,
        letterSpacing: 0.6,
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String placeholder;
  final TextInputType keyboard;
  final bool isHighlighted;
  final String? error;
  final ValueChanged<String>? onChanged;
  const _InputField({
    required this.controller,
    required this.placeholder,
    this.keyboard = TextInputType.text,
    this.isHighlighted = false,
    this.error,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final hasError = error != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          keyboardType: keyboard,
          onChanged: onChanged,
          style: const TextStyle(fontSize: 15, color: GodropColors.ink, fontWeight: FontWeight.w400),
          decoration: InputDecoration(
            hintText: placeholder,
            hintStyle: const TextStyle(color: GodropColors.mute, fontWeight: FontWeight.w400),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: hasError ? Colors.red : (isHighlighted ? GodropColors.blue : GodropColors.border), width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: hasError ? Colors.red : (isHighlighted ? GodropColors.blue : GodropColors.border), width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: hasError ? Colors.red : GodropColors.blue, width: 1.5),
            ),
            filled: true,
            fillColor: hasError ? Colors.red.withOpacity(0.04) : (isHighlighted ? GodropColors.blue.withOpacity(0.04) : GodropColors.white),
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: 4),
          Text(error!, style: const TextStyle(fontSize: 12, color: Colors.red)),
        ],
      ],
    );
  }
}

class _PasswordInputField extends StatelessWidget {
  final TextEditingController controller;
  final String? error;
  final bool obscure;
  final VoidCallback onToggle;
  final ValueChanged<String>? onChanged;
  const _PasswordInputField({required this.controller, this.error, required this.obscure, required this.onToggle, this.onChanged});

  @override
  Widget build(BuildContext context) {
    final hasError = error != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          obscureText: obscure,
          onChanged: onChanged,
          style: const TextStyle(fontSize: 15, color: GodropColors.ink),
          decoration: InputDecoration(
            hintText: 'Create a password',
            hintStyle: const TextStyle(color: GodropColors.mute),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            suffixIcon: GestureDetector(onTap: onToggle, child: Icon(obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: GodropColors.mute)),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: hasError ? Colors.red : GodropColors.border, width: 1.5)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: hasError ? Colors.red : GodropColors.border, width: 1.5)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: hasError ? Colors.red : GodropColors.blue, width: 1.5)),
            filled: true,
            fillColor: GodropColors.white,
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: 4),
          Text(error!, style: const TextStyle(fontSize: 12, color: Colors.red)),
        ],
      ],
    );
  }
}
