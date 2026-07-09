import '../../../shared/models/analytics_models.dart';
import '../../../shared/models/order_models.dart';

abstract class DashboardState {}

class DashboardInitial extends DashboardState {}

class DashboardLoading extends DashboardState {}

class DashboardLoaded extends DashboardState {
  /// Null for STAFF accounts (analytics is MANAGER+ on the API).
  final VendorAnalytics? analytics;
  final GraphData? graph;
  final List<VendorOrder> pendingOrders;
  final int pendingTotal;
  final int unreadNotifications;
  final bool storeOpen;

  DashboardLoaded({
    this.analytics,
    this.graph,
    required this.pendingOrders,
    required this.pendingTotal,
    required this.unreadNotifications,
    required this.storeOpen,
  });

  DashboardLoaded copyWith({bool? storeOpen}) => DashboardLoaded(
        analytics: analytics,
        graph: graph,
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
