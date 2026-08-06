import 'package:flutter/material.dart';
import '../../app/theme.dart';

(String, Color) disputeStatusDisplay(String status) {
  switch (status) {
    case 'OPEN':
      return ('Open', GodropColors.error);
    case 'UNDER_REVIEW':
      return ('Under review', GodropColors.blue);
    case 'AWAITING_RESPONSE':
      return ('Awaiting your response', GodropColors.orange);
    case 'ESCALATED':
      return ('Escalated', GodropColors.error);
    case 'RESOLVED':
      return ('Resolved', GodropColors.success);
    case 'REJECTED':
      return ('Reviewed — no action', GodropColors.slate);
    default:
      return (status, GodropColors.slate);
  }
}

String fmtKobo(int kobo) {
  final n = (kobo / 100).toStringAsFixed(0);
  return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
}

String fmtDisputeDate(String iso) {
  try {
    final dt = DateTime.parse(iso).toLocal();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
    final m = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    return '${months[dt.month - 1]} ${dt.day} · $h:$m $period';
  } catch (_) {
    return '';
  }
}
