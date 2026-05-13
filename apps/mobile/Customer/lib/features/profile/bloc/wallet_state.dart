import '../../../shared/models/wallet_models.dart';

abstract class WalletState {}

class WalletInitial extends WalletState {}

class WalletLoading extends WalletState {}

class WalletLoaded extends WalletState {
  final int balanceKobo;
  final List<WalletTx> transactions;
  WalletLoaded({required this.balanceKobo, required this.transactions});
}

class WalletToppingUp extends WalletState {
  final int balanceKobo;
  final List<WalletTx> transactions;
  WalletToppingUp({required this.balanceKobo, required this.transactions});
}

class WalletTopUpReady extends WalletState {
  final String paystackAuthUrl;
  final String reference;
  final int balanceKobo;
  final List<WalletTx> transactions;
  WalletTopUpReady({
    required this.paystackAuthUrl,
    required this.reference,
    required this.balanceKobo,
    required this.transactions,
  });
}

class WalletError extends WalletState {
  final String message;
  final int? balanceKobo;
  final List<WalletTx>? transactions;
  WalletError(this.message, {this.balanceKobo, this.transactions});
}
