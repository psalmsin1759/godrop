import 'package:flutter/material.dart';
import 'package:intl_phone_number_input/intl_phone_number_input.dart';
import '../../../app/theme.dart';
import '../../../shared/widgets/godrop_button.dart';
import '../models/parcel_location.dart';

/// Bottom sheet that captures a single parcel's recipient + optional
/// description and weight (kg), returning a [ParcelItem].
class ParcelDetailsSheet extends StatefulWidget {
  final ParcelLocation dropoff;
  final int parcelIndex;
  final ParcelItem? existing;

  const ParcelDetailsSheet({
    super.key,
    required this.dropoff,
    required this.parcelIndex,
    this.existing,
  });

  @override
  State<ParcelDetailsSheet> createState() => _ParcelDetailsSheetState();
}

class _ParcelDetailsSheetState extends State<ParcelDetailsSheet> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _phoneCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _weightCtrl;
  PhoneNumber _phoneNumber = PhoneNumber(isoCode: 'NG');
  bool _phoneValid = false;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _nameCtrl = TextEditingController(text: e?.recipientName ?? '');
    _phoneCtrl = TextEditingController();
    _descCtrl = TextEditingController(text: e?.description ?? '');
    _weightCtrl =
        TextEditingController(text: e?.weightKg != null ? '${e!.weightKg}' : '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _descCtrl.dispose();
    _weightCtrl.dispose();
    super.dispose();
  }

  bool get _canSave => _nameCtrl.text.trim().isNotEmpty && _phoneValid;

  void _save() {
    final phone = _phoneNumber.phoneNumber?.trim() ?? '';
    final weight = double.tryParse(_weightCtrl.text.trim());
    Navigator.pop(
      context,
      ParcelItem(
        dropoff: widget.dropoff,
        recipientName: _nameCtrl.text.trim(),
        recipientPhone: phone,
        description:
            _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
        weightKg: weight,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        decoration: const BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: GodropColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  width: 30,
                  height: 30,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    color: Color(0xFFE7EEFF),
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '${widget.parcelIndex}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.blue,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Parcel ${widget.parcelIndex} details',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: GodropColors.ink,
                        ),
                      ),
                      Text(
                        widget.dropoff.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            fontSize: 12, color: GodropColors.slate),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _Field(
              controller: _nameCtrl,
              hint: "Recipient's full name",
              icon: Icons.person_outline_rounded,
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: GodropColors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: GodropColors.border),
              ),
              child: InternationalPhoneNumberInput(
                onInputChanged: (n) => _phoneNumber = n,
                onInputValidated: (v) => setState(() => _phoneValid = v),
                selectorConfig: const SelectorConfig(
                  selectorType: PhoneInputSelectorType.BOTTOM_SHEET,
                  setSelectorButtonAsPrefixIcon: true,
                  leadingPadding: 12,
                  showFlags: true,
                ),
                ignoreBlank: false,
                autoValidateMode: AutovalidateMode.disabled,
                selectorTextStyle:
                    const TextStyle(color: GodropColors.ink, fontSize: 14),
                initialValue: _phoneNumber,
                textFieldController: _phoneCtrl,
                formatInput: false,
                keyboardType: const TextInputType.numberWithOptions(
                    signed: true, decimal: true),
                inputDecoration: const InputDecoration(
                  hintText: "Recipient's phone",
                  hintStyle:
                      TextStyle(color: GodropColors.mute, fontSize: 14),
                  border: InputBorder.none,
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                ),
              ),
            ),
            const SizedBox(height: 10),
            _Field(
              controller: _descCtrl,
              hint: 'What are you sending? (optional)',
              icon: Icons.inventory_2_outlined,
            ),
            const SizedBox(height: 10),
            _Field(
              controller: _weightCtrl,
              hint: 'Weight in kg (optional)',
              icon: Icons.scale_outlined,
              keyboard:
                  const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 18),
            Opacity(
              opacity: _canSave ? 1 : 0.5,
              child: GodropButton(
                label: widget.existing != null ? 'Save parcel' : 'Add parcel',
                color: GodropColors.orange,
                onTap: _canSave ? _save : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final TextInputType keyboard;
  final ValueChanged<String>? onChanged;

  const _Field({
    required this.controller,
    required this.hint,
    required this.icon,
    this.keyboard = TextInputType.text,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      onChanged: onChanged,
      style: const TextStyle(fontSize: 14, color: GodropColors.ink),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: GodropColors.mute, fontSize: 14),
        prefixIcon: Icon(icon, size: 18, color: GodropColors.slate),
        filled: true,
        fillColor: GodropColors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: GodropColors.border)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: GodropColors.border)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: GodropColors.blue, width: 1.5)),
      ),
    );
  }
}
