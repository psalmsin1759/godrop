import 'package:flutter/material.dart';
import '../../parcel/models/parcel_location.dart';
import '../../../shared/models/delivery_models.dart';

class TruckBookingData {
  final ParcelLocation pickup;
  final ParcelLocation dropoff;
  final double distanceKm;

  final String truckTypeName;

  final String? apartmentTypeId;
  final String? apartmentTypeName;

  final int loaderCount;
  final int perLoaderKobo;

  final DateTime scheduledDate;
  final TimeOfDay scheduledTime;

  final TruckPriceBreakdown? priceBreakdown;
  final int? estimatedMinutes;

  const TruckBookingData({
    required this.pickup,
    required this.dropoff,
    required this.distanceKm,
    required this.truckTypeName,
    this.apartmentTypeId,
    this.apartmentTypeName,
    required this.loaderCount,
    required this.perLoaderKobo,
    required this.scheduledDate,
    required this.scheduledTime,
    this.priceBreakdown,
    this.estimatedMinutes,
  });

  String _fmt(int kobo) {
    final n = (kobo ~/ 100).toString();
    return '₦${n.replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';
  }

  String get totalLabel {
    if (priceBreakdown != null) return _fmt(priceBreakdown!.totalKobo);
    return '₦—';
  }

  String get scheduledDateLabel {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${scheduledDate.day} ${months[scheduledDate.month - 1]} ${scheduledDate.year}';
  }

  String get scheduledTimeLabel {
    final h = scheduledTime.hourOfPeriod == 0 ? 12 : scheduledTime.hourOfPeriod;
    final m = scheduledTime.minute.toString().padLeft(2, '0');
    final period = scheduledTime.period == DayPeriod.am ? 'AM' : 'PM';
    return '$h:$m $period';
  }
}
