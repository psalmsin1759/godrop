import '../../../shared/models/analytics_models.dart';
import '../../../shared/models/order_models.dart';

abstract class DashboardState {}

class DashboardInitial extends DashboardState {}

class DashboardLoading extends DashboardState {}

class DashboardLoaded extends DashboardState {
  /// Null for STAFF accounts (analytics is MANAGER+ on the API).
  final VendorAnalytics? analytics;
  final GraphData? graph;
  final LifetimeStats? lifetime;
  final String graphGranularity;
  final bool graphLoading;
  final List<VendorOrder> pendingOrders;
  final int pendingTotal;
  final int unreadNotifications;
  final bool storeOpen;

  DashboardLoaded({
    this.analytics,
    this.graph,
    this.lifetime,
    this.graphGranularity = 'day',
    this.graphLoading = false,
    required this.pendingOrders,
    required this.pendingTotal,
    required this.unreadNotifications,
    required this.storeOpen,
  });

  DashboardLoaded copyWith({
    bool? storeOpen,
    GraphData? graph,
    String? graphGranularity,
    bool? graphLoading,
  }) =>
      DashboardLoaded(
        analytics: analytics,
        graph: graph ?? this.graph,
        lifetime: lifetime,
        graphGranularity: graphGranularity ?? this.graphGranularity,
        graphLoading: graphLoading ?? this.graphLoading,
        pendingOrders: pendingOrders,
        pendingTotal: pendingTotal,
        unreadNotifications: unreadNotifications,
        storeOpen: storeOpen ?? this.storeOpen,
      );
}

class DashboardError extends DashboardState {
  final String message;
  DashboardError(this.message);
}
