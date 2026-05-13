import 'package:equatable/equatable.dart';

enum MenuStatus { initial, loading, success, failure }

class MenuDisplayItem {
  final String id;
  final String name;
  final String? description;
  final int priceKobo;
  final String? imageUrl;
  final bool isAvailable;

  const MenuDisplayItem({
    required this.id,
    required this.name,
    this.description,
    required this.priceKobo,
    this.imageUrl,
    this.isAvailable = true,
  });
}

class MenuDisplayCategory {
  final String id;
  final String name;
  final List<MenuDisplayItem> items;

  const MenuDisplayCategory({
    required this.id,
    required this.name,
    required this.items,
  });
}

class MenuState extends Equatable {
  final MenuStatus status;
  final List<MenuDisplayCategory> categories;
  final Set<String> loadingCategoryIds;
  final double? rating;
  final int? deliveryFeeKobo;
  final int? estimatedMinutes;
  final String? error;

  const MenuState({
    this.status = MenuStatus.initial,
    this.categories = const [],
    this.loadingCategoryIds = const {},
    this.rating,
    this.deliveryFeeKobo,
    this.estimatedMinutes,
    this.error,
  });

  MenuState copyWith({
    MenuStatus? status,
    List<MenuDisplayCategory>? categories,
    Set<String>? loadingCategoryIds,
    double? rating,
    int? deliveryFeeKobo,
    int? estimatedMinutes,
    String? error,
  }) =>
      MenuState(
        status: status ?? this.status,
        categories: categories ?? this.categories,
        loadingCategoryIds: loadingCategoryIds ?? this.loadingCategoryIds,
        rating: rating ?? this.rating,
        deliveryFeeKobo: deliveryFeeKobo ?? this.deliveryFeeKobo,
        estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
        error: error ?? this.error,
      );

  @override
  List<Object?> get props =>
      [status, categories, loadingCategoryIds, rating, deliveryFeeKobo, estimatedMinutes, error];
}
