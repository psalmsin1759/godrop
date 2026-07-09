import '../../../shared/models/wallet_models.dart';

abstract class WalletState {}

class WalletInitial extends WalletState {}

class WalletLoading extends WalletState {}

class WalletLoaded extends WalletState {
  final double balance;
  final List<VendorWalletTx> transactions;
  final BankAccount? bankAccount;
  final bool withdrawing;

  WalletLoaded({
    required this.balance,
    required this.transactions,
    this.bankAccount,
    this.withdrawing = false,
  });

  WalletLoaded copyWith({bool? withdrawing}) => WalletLoaded(
        balance: balance,
        transactions: transactions,
        bankAccount: bankAccount,
        withdrawing: withdrawing ?? this.withdrawing,
      );
}

class WalletError extends WalletState {
  final String message;
  WalletError(this.message);
}
