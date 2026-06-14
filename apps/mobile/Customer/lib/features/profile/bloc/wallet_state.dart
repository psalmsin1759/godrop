import '../../../shared/models/wallet_models.dart';

abstract class WalletState {}

class WalletInitial extends WalletState {}

class WalletLoading extends WalletState {}

class WalletLoaded extends WalletState {
  final double balance;
  final List<WalletTx> transactions;
  WalletLoaded({required this.balance, required this.transactions});
}

class WalletToppingUp extends WalletState {
  final double balance;
  final List<WalletTx> transactions;
  WalletToppingUp({required this.balance, required this.transactions});
}

class WalletTopUpReady extends WalletState {
  final String paystackAuthUrl;
  final String reference;
  final double balance;
  final List<WalletTx> transactions;
  WalletTopUpReady({
    required this.paystackAuthUrl,
    required this.reference,
    required this.balance,
    required this.transactions,
  });
}

class WalletTopUpSuccess extends WalletState {
  final double balance;
  final double topUpAmount;
  final List<WalletTx> transactions;
  WalletTopUpSuccess({
    required this.balance,
    required this.topUpAmount,
    required this.transactions,
  });
}

class WalletError extends WalletState {
  final String message;
  final double? balance;
  final List<WalletTx>? transactions;
  WalletError(this.message, {this.balance, this.transactions});
}
