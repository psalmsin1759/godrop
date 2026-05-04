import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/profile_cubit.dart';
import 'bloc/profile_state.dart';

class BankScreen extends StatefulWidget {
  const BankScreen({super.key});

  @override
  State<BankScreen> createState() => _BankScreenState();
}

class _BankScreenState extends State<BankScreen> {
  final _formKey = GlobalKey<FormState>();
  final _bankName = TextEditingController();
  final _bankCode = TextEditingController();
  final _accountNumber = TextEditingController();
  final _accountName = TextEditingController();

  @override
  void initState() {
    super.initState();
    final state = context.read<ProfileCubit>().state;
    if (state is ProfileLoaded) {
      _bankName.text = state.profile.bankName ?? '';
      _accountNumber.text = state.profile.accountNumber ?? '';
      _accountName.text = state.profile.accountName ?? '';
    }
  }

  @override
  void dispose() {
    _bankName.dispose();
    _bankCode.dispose();
    _accountNumber.dispose();
    _accountName.dispose();
    super.dispose();
  }

  void _save() {
    if (!_formKey.currentState!.validate()) return;
    context.read<ProfileCubit>().updateBankAccount(
          bankName: _bankName.text,
          bankCode: _bankCode.text,
          accountNumber: _accountNumber.text,
          accountName: _accountName.text,
        );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ProfileCubit, ProfileState>(
      listener: (ctx, state) {
        if (state is ProfileLoaded) {
          ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
            content: Text('Bank account updated!'),
            backgroundColor: GodropColors.success,
            behavior: SnackBarBehavior.floating,
          ));
          ctx.pop();
        } else if (state is ProfileError) {
          ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
            content: Text(state.message),
            backgroundColor: GodropColors.error,
            behavior: SnackBarBehavior.floating,
          ));
        }
      },
      builder: (ctx, state) {
        final saving = state is ProfileSaving;
        return Scaffold(
          appBar: AppBar(
            title: const Text('Bank Account'),
            leading: GestureDetector(
              onTap: () => ctx.pop(),
              child: const Icon(Icons.chevron_left_rounded, size: 26),
            ),
          ),
          body: Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: GodropColors.blue.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.info_outline_rounded,
                          color: GodropColors.blue, size: 18),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'This account will be used for earnings withdrawals.',
                          style: TextStyle(
                              fontSize: 13, color: GodropColors.slate),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _field(_bankName, 'Bank Name', hint: 'Guaranty Trust Bank'),
                const SizedBox(height: 14),
                _field(_bankCode, 'Bank Code', hint: '058'),
                const SizedBox(height: 14),
                _field(_accountNumber, 'Account Number',
                    hint: '0123456789', maxLength: 10),
                const SizedBox(height: 14),
                _field(_accountName, 'Account Name',
                    hint: 'John Doe'),
                const SizedBox(height: 32),
                GodropButton(
                  label: 'Save Bank Account',
                  onTap: saving ? null : _save,
                  isLoading: saving,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    String? hint,
    int? maxLength,
  }) {
    return TextFormField(
      controller: controller,
      maxLength: maxLength,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        counterText: '',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GodropColors.border),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      validator: (v) =>
          (v == null || v.isEmpty) ? '$label is required' : null,
    );
  }
}
