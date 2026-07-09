import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../app/theme.dart';
import '../../../shared/utils/currency.dart';
import '../../../shared/widgets/chips.dart';
import '../../../shared/widgets/invest_button.dart';
import '../../../shared/widgets/invest_field.dart';
import '../bloc/safe_cubit.dart';

/// Bottom sheet to lock money into a new Flow Safe vault.
Future<void> showCreateVaultSheet(BuildContext context) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: InvestColors.raise,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (ctx) => BlocProvider.value(
      value: context.read<SafeCubit>(),
      child: const _CreateVaultSheet(),
    ),
  );
}

class _CreateVaultSheet extends StatefulWidget {
  const _CreateVaultSheet();

  @override
  State<_CreateVaultSheet> createState() => _CreateVaultSheetState();
}

class _CreateVaultSheetState extends State<_CreateVaultSheet> {
  final _name = TextEditingController();
  final _amount = TextEditingController();
  int? _lockDays = 90;
  bool _submitting = false;

  static const _locks = [
    (label: 'Flexible · 10%', days: null),
    (label: '30 days · 12%', days: 30),
    (label: '90 days · 14%', days: 90),
    (label: '180 days · 16%', days: 180),
  ];

  @override
  void dispose() {
    _name.dispose();
    _amount.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final kobo = parseNairaToKobo(_amount.text);
    if (_name.text.trim().isEmpty || kobo < 100000) return;
    setState(() => _submitting = true);
    final ok = await context.read<SafeCubit>().createVault(
          name: _name.text.trim(),
          amountKobo: kobo,
          lockDays: _lockDays,
        );
    if (!mounted) return;
    setState(() => _submitting = false);
    if (ok) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 22,
        right: 22,
        top: 22,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'New Flow Safe vault',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.4,
              color: InvestColors.text,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Money moves from your Main Wallet. Longer locks earn more.',
            style: TextStyle(fontSize: 13, color: InvestColors.sub),
          ),
          const SizedBox(height: 20),
          InvestField(
            label: 'Vault name',
            controller: _name,
            hint: '90-day builder',
            icon: Icons.savings_outlined,
          ),
          InvestField(
            label: 'Amount (₦)',
            controller: _amount,
            hint: '100,000',
            icon: Icons.payments_outlined,
            keyboardType: TextInputType.number,
          ),
          const Text(
            'LOCK PERIOD',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: InvestColors.sub,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _locks.map((l) {
              return SelectChip(
                label: l.label,
                selected: _lockDays == l.days,
                onTap: () => setState(() => _lockDays = l.days),
              );
            }).toList(),
          ),
          const SizedBox(height: 22),
          InvestButton(
            label: 'Lock into Safe',
            kind: InvestButtonKind.orange,
            loading: _submitting,
            onPressed: _submitting ? null : _create,
          ),
        ],
      ),
    );
  }
}
