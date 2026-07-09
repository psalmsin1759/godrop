import 'package:flutter/material.dart';
import '../../app/theme.dart';
import '../models/wallet_models.dart';
import '../utils/currency.dart';
import '../utils/dates.dart';

/// Transaction row — 40px icon square, title + meta, trailing amount.
class TxTile extends StatelessWidget {
  const TxTile({super.key, required this.tx});

  final InvestorTx tx;

  (IconData, Color, Color) get _style {
    switch (tx.type) {
      case 'PAYOUT':
        return (Icons.trending_up, InvestColors.green, InvestColors.greenSoft);
      case 'TOPUP':
        return (Icons.add, InvestColors.green, InvestColors.greenSoft);
      case 'INVESTMENT':
        return (Icons.two_wheeler, InvestColors.blueBright, InvestColors.blueSoft);
      case 'WITHDRAWAL':
        return (Icons.account_balance, InvestColors.text, InvestColors.raise3);
      case 'SAFE_LOCK':
      case 'SAFE_UNLOCK':
      case 'SAFE_INTEREST':
        return (Icons.savings_outlined, InvestColors.orange, InvestColors.orangeSoft);
      default:
        return (Icons.card_giftcard, InvestColors.gold, InvestColors.goldSoft);
    }
  }

  @override
  Widget build(BuildContext context) {
    final (icon, color, bg) = _style;
    final credit = tx.isCredit;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: InvestColors.raise,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: InvestColors.line),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(11),
            ),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.description ?? tx.type,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: InvestColors.text,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  formatDateTime(tx.createdAt),
                  style: const TextStyle(fontSize: 11.5, color: InvestColors.mute),
                ),
              ],
            ),
          ),
          Text(
            '${credit ? '+' : '-'}${formatKobo(tx.amountKobo)}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: credit ? InvestColors.green : InvestColors.text,
            ),
          ),
        ],
      ),
    );
  }
}
