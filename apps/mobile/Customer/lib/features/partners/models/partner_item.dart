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
  final bool isOpenNow;
  final bool isFavorite;
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
    this.isOpenNow = true,
    this.isFavorite = false,
    this.cuisines = const [],
    required this.partnerType,
  });

  factory PartnerItem.fromRestaurant(Restaurant r, {bool isFavorite = false}) =>
      PartnerItem(
        id: r.id,
        name: r.name,
        logoUrl: r.logoUrl,
        rating: r.rating,
        deliveryFeeKobo: r.deliveryFeeKobo,
        estimatedMinutes: r.estimatedMinutes,
        isOpen: r.isOpen,
        isOpenNow: r.isOpenNow,
        isFavorite: isFavorite,
        cuisines: r.cuisines,
        partnerType: PartnerType.restaurant,
      );

  factory PartnerItem.fromStore(Store s, PartnerType type,
          {bool isFavorite = false}) =>
      PartnerItem(
        id: s.id,
        name: s.name,
        logoUrl: s.logoUrl,
        rating: s.rating,
        deliveryFeeKobo: s.deliveryFeeKobo,
        estimatedMinutes: s.estimatedMinutes,
        isOpen: s.isOpen,
        isOpenNow: s.isOpenNow,
        isFavorite: isFavorite,
        partnerType: type,
      );

  String get deliveryTimeLabel =>
      estimatedMinutes != null ? '$estimatedMinutes min' : '—';

  PartnerItem copyWith({bool? isFavorite}) => PartnerItem(
        id: id,
        name: name,
        logoUrl: logoUrl,
        rating: rating,
        deliveryFeeKobo: deliveryFeeKobo,
        estimatedMinutes: estimatedMinutes,
        isOpen: isOpen,
        isOpenNow: isOpenNow,
        isFavorite: isFavorite ?? this.isFavorite,
        cuisines: cuisines,
        partnerType: partnerType,
      );

  @override
  List<Object?> get props => [id, partnerType, isFavorite, isOpenNow];
}
