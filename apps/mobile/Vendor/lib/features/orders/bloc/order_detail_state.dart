import '../../../shared/models/order_models.dart';

abstract class OrderDetailState {}

class OrderDetailInitial extends OrderDetailState {}

class OrderDetailLoading extends OrderDetailState {}

class OrderDetailLoaded extends OrderDetailState {
  final VendorOrder order;
  final bool acting;
  OrderDetailLoaded(this.order, {this.acting = false});
}

class OrderDetailError extends OrderDetailState {
  final String message;
  OrderDetailError(this.message);
}
