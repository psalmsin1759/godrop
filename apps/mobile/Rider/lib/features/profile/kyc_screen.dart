import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/godrop_button.dart';
import 'bloc/profile_cubit.dart';
import 'bloc/profile_state.dart';

class KycScreen extends StatefulWidget {
  const KycScreen({super.key});

  @override
  State<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends State<KycScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _vehicleType;
  final _plate = TextEditingController();
  final _color = TextEditingController();
  final _model = TextEditingController();
  final _year = TextEditingController();
  final _licenseNumber = TextEditingController();
  final _licenseExpiry = TextEditingController();
  final _insuranceExpiry = TextEditingController();
  final _bvn = TextEditingController();
  final _nin = TextEditingController();

  @override
  void dispose() {
    _plate.dispose();
    _color.dispose();
    _model.dispose();
    _year.dispose();
    _licenseNumber.dispose();
    _licenseExpiry.dispose();
    _insuranceExpiry.dispose();
    _bvn.dispose();
    _nin.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<ProfileCubit>().submitKyc({
      'vehicleType': _vehicleType,
      'vehiclePlate': _plate.text,
      'vehicleColor': _color.text,
      'vehicleModel': _model.text,
      'vehicleYear': int.tryParse(_year.text),
      'driverLicenseNumber': _licenseNumber.text,
      'driverLicenseExpiry': _licenseExpiry.text,
      'vehicleInsuranceExpiry': _insuranceExpiry.text,
      'bvn': _bvn.text.isNotEmpty ? _bvn.text : null,
      'nin': _nin.text.isNotEmpty ? _nin.text : null,
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ProfileCubit, ProfileState>(
      listener: (ctx, state) {
        if (state is ProfileLoaded) {
          ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
            content: Text('KYC submitted for review!'),
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
            title: const Text('KYC Verification'),
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
                _sectionTitle('Vehicle Information'),
                const SizedBox(height: 12),
                _dropdown(
                  label: 'Vehicle Type',
                  value: _vehicleType,
                  items: ['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN'],
                  onChanged: (v) => setState(() => _vehicleType = v),
                ),
                const SizedBox(height: 12),
                _field(_plate, 'Plate Number', hint: 'LAG-123-AB'),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(child: _field(_model, 'Vehicle Model', hint: 'Honda CB300')),
                  const SizedBox(width: 12),
                  Expanded(child: _field(_year, 'Year', hint: '2020', isNumber: true)),
                ]),
                const SizedBox(height: 12),
                _field(_color, 'Vehicle Color', hint: 'Black'),
                const SizedBox(height: 20),
                _sectionTitle('Driver\'s License'),
                const SizedBox(height: 12),
                _field(_licenseNumber, 'License Number'),
                const SizedBox(height: 12),
                _dateField(_licenseExpiry, 'License Expiry Date'),
                const SizedBox(height: 20),
                _sectionTitle('Insurance'),
                const SizedBox(height: 12),
                _dateField(_insuranceExpiry, 'Insurance Expiry Date'),
                const SizedBox(height: 20),
                _sectionTitle('Identity (Optional)'),
                const SizedBox(height: 12),
                _field(_bvn, 'BVN', hint: '12345678901', required: false),
                const SizedBox(height: 12),
                _field(_nin, 'NIN', hint: '12345678901', required: false),
                const SizedBox(height: 32),
                GodropButton(
                  label: 'Submit KYC',
                  onTap: saving ? null : _submit,
                  isLoading: saving,
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _sectionTitle(String title) => Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: GodropColors.ink,
        ),
      );

  Widget _field(
    TextEditingController controller,
    String label, {
    String? hint,
    bool isNumber = false,
    bool required = true,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GodropColors.border),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      validator: required
          ? (v) => (v == null || v.isEmpty) ? '$label is required' : null
          : null,
    );
  }

  Widget _dateField(TextEditingController controller, String label) {
    return TextFormField(
      controller: controller,
      readOnly: true,
      decoration: InputDecoration(
        labelText: label,
        hintText: 'YYYY-MM-DD',
        suffixIcon: const Icon(Icons.calendar_today_rounded,
            color: GodropColors.mute, size: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GodropColors.border),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: DateTime.now().add(const Duration(days: 365)),
          firstDate: DateTime.now(),
          lastDate: DateTime(2035),
        );
        if (date != null) {
          controller.text = date.toIso8601String().split('T')[0];
        }
      },
      validator: (v) => (v == null || v.isEmpty) ? '$label is required' : null,
    );
  }

  Widget _dropdown({
    required String label,
    required String? value,
    required List<String> items,
    required void Function(String?) onChanged,
  }) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: GodropColors.border),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      items: items
          .map((item) => DropdownMenuItem(value: item, child: Text(item)))
          .toList(),
      onChanged: onChanged,
      validator: (v) => v == null ? '$label is required' : null,
    );
  }
}
