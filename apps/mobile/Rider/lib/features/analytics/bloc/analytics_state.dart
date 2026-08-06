import 'package:equatable/equatable.dart';
import '../../../shared/models/rider_models.dart';

abstract class AnalyticsState extends Equatable {
  const AnalyticsState();
  @override
  List<Object?> get props => [];
}

class AnalyticsInitial extends AnalyticsState {
  const AnalyticsInitial();
}

class AnalyticsLoading extends AnalyticsState {
  const AnalyticsLoading();
}

class AnalyticsLoaded extends AnalyticsState {
  final RiderAnalytics analytics;
  final int days;

  const AnalyticsLoaded({required this.analytics, required this.days});

  @override
  List<Object?> get props => [analytics, days];
}

class AnalyticsError extends AnalyticsState {
  final String message;
  const AnalyticsError(this.message);
  @override
  List<Object?> get props => [message];
}
