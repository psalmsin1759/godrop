import 'package:equatable/equatable.dart';
import '../models/partner_item.dart';

enum PartnersStatus { initial, loading, success, failure }

class PartnersState extends Equatable {
  final PartnersStatus status;
  final List<PartnerItem> items;
  final String? error;

  const PartnersState({
    this.status = PartnersStatus.initial,
    this.items = const [],
    this.error,
  });

  PartnersState copyWith({
    PartnersStatus? status,
    List<PartnerItem>? items,
    String? error,
  }) =>
      PartnersState(
        status: status ?? this.status,
        items: items ?? this.items,
        error: error ?? this.error,
      );

  @override
  List<Object?> get props => [status, items, error];
}
