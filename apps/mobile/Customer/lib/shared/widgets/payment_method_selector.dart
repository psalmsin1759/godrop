import 'dart:math';
import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../utils/currency.dart';

/// Wallet/card split for a given payment method + total, shared by every
/// checkout screen that offers "pay from wallet, card, or both".
class PaymentSplit {
  final int walletCoversKobo;
  final int cardCoversKobo;
  const PaymentSplit({
    required this.walletCoversKobo,
    required this.cardCoversKobo,
  });

  factory PaymentSplit.compute({
    required String method,
    required int totalKobo,
    required double walletBalanceNaira,
  }) {
    final walletBalanceKobo = (walletBalanceNaira * 100).round();
    final walletCovers = method == 'wallet_card'
        ? min(walletBalanceKobo, totalKobo)
        : (method == 'wallet' ? totalKobo : 0);
    final cardCovers = method == 'wallet_card'
        ? max(0, totalKobo - walletBalanceKobo)
        : (method == 'card' ? totalKobo : 0);
    return PaymentSplit(walletCoversKobo: walletCovers, cardCoversKobo: cardCovers);
  }
}

/// Renders "Pay online", "Pay from wallet" and, when the wallet balance is
/// non-zero but doesn't cover the whole total, "Wallet + Card" as selectable
/// cards. Mirrors the payment options on the food/pharmacy checkout screen so
/// every checkout flow (food, parcel, truck, ...) looks and behaves the same.
class PaymentMethodSelector extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onChanged;
  final int totalKobo;
  final double walletBalance;
  final bool codEnabled;

  const PaymentMethodSelector({
    super.key,
    required this.selected,
    required this.onChanged,
    required this.totalKobo,
    required this.walletBalance,
    this.codEnabled = false,
  });

  String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  @override
  Widget build(BuildContext context) {
    final walletBalanceKobo = (walletBalance * 100).round();
    final walletSuffix =
        walletBalance > 0 ? ' (${formatNaira(walletBalance)})' : ' (empty)';
    final walletCoversAll = walletBalanceKobo >= totalKobo;
    final cardRemainder = max(0, totalKobo - walletBalanceKobo);

    return Column(
      children: [
        PaymentMethodOption(
          icon: Icons.credit_card_rounded,
          label: 'Pay online',
          subtitle: 'Card, bank transfer via Paystack',
          value: 'card',
          current: selected,
          onTap: () => onChanged('card'),
        ),
        const SizedBox(height: 10),
        PaymentMethodOption(
          icon: Icons.account_balance_wallet_rounded,
          label: 'Pay from wallet$walletSuffix',
          subtitle: walletCoversAll
              ? 'Instantly deducted, no Paystack needed'
              : 'Insufficient balance (need ${_fmt(totalKobo)})',
          value: 'wallet',
          current: selected,
          disabled: walletBalance <= 0,
          onTap: walletBalance > 0 ? () => onChanged('wallet') : null,
        ),
        if (walletBalance > 0 && !walletCoversAll) ...[
          const SizedBox(height: 10),
          PaymentMethodOption(
            icon: Icons.credit_card_rounded,
            label: 'Wallet + Card',
            subtitle:
                'Use ${formatNaira(walletBalance)} from wallet, pay ${_fmt(cardRemainder)} via card',
            value: 'wallet_card',
            current: selected,
            onTap: () => onChanged('wallet_card'),
          ),
        ],
        if (codEnabled) ...[
          const SizedBox(height: 10),
          PaymentMethodOption(
            icon: Icons.money_rounded,
            label: 'Cash on delivery',
            subtitle: 'Pay the rider when your order arrives',
            value: 'cash',
            current: selected,
            onTap: () => onChanged('cash'),
          ),
        ],
      ],
    );
  }
}

class PaymentMethodOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final String value;
  final String current;
  final VoidCallback? onTap;
  final bool disabled;
  const PaymentMethodOption({
    super.key,
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.value,
    required this.current,
    this.onTap,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final selected = value == current;
    return Opacity(
      opacity: disabled ? 0.4 : 1,
      child: GestureDetector(
        onTap: disabled ? null : onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: selected
                ? GodropColors.blue.withValues(alpha: 0.04)
                : GodropColors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected ? GodropColors.blue : GodropColors.border,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: selected
                      ? GodropColors.blue.withValues(alpha: 0.1)
                      : GodropColors.background,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon,
                    color: selected ? GodropColors.blue : GodropColors.slate,
                    size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                        style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: selected
                                ? GodropColors.blue
                                : GodropColors.ink)),
                    const SizedBox(height: 2),
                    Text(subtitle,
                        style: const TextStyle(
                            fontSize: 12, color: GodropColors.mute)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                selected
                    ? Icons.check_circle_rounded
                    : Icons.radio_button_off_rounded,
                color: selected ? GodropColors.blue : GodropColors.mute,
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
