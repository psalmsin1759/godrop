import 'package:equatable/equatable.dart';
import '../../food/models/restaurant_data.dart';
import '../../../shared/models/food_models.dart';
import '../../../shared/models/store_models.dart';

class PartnerItem extends Equatable {
  final String id;
  final String name;
  final String? logoUrl;
  final double? rating;
  final int? deliveryFeeKobo;
  final int? estimatedMinutes;
  final bool isOpen;
  final List<String> cuisines;
  final PartnerType partnerType;

  const PartnerItem({
    required this.id,
    required this.name,
    this.logoUrl,
    this.rating,
    this.deliveryFeeKobo,
    this.estimatedMinutes,
    required this.isOpen,
    this.cuisines = const [],
    required this.partnerType,
  });

  factory PartnerItem.fromRestaurant(Restaurant r) => PartnerItem(
        id: r.id,
        name: r.name,
        logoUrl: r.logoUrl,
        rating: r.rating,
        deliveryFeeKobo: r.deliveryFeeKobo,
        estimatedMinutes: r.estimatedMinutes,
        isOpen: r.isOpen,
        cuisines: r.cuisines,
        partnerType: PartnerType.restaurant,
      );

  factory PartnerItem.fromStore(Store s, PartnerType type) => PartnerItem(
        id: s.id,
        name: s.name,
        logoUrl: s.logoUrl,
        rating: s.rating,
        deliveryFeeKobo: s.deliveryFeeKobo,
        estimatedMinutes: s.estimatedMinutes,
        isOpen: s.isOpen,
        partnerType: type,
      );

  String get deliveryTimeLabel =>
      estimatedMinutes != null ? '$estimatedMinutes min' : '—';

  @override
  List<Object?> get props => [id, partnerType];
}
