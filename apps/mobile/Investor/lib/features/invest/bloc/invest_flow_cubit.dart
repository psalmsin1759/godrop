import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/invest_models.dart';
import '../../../shared/models/wallet_models.dart';
import '../../../shared/utils/errors.dart';

/// Single state object carried through the 5-step invest flow:
/// plans → amount → review → payment → success.
class InvestFlowState extends Equatable {
  const InvestFlowState({
    this.asset,
    this.plans = const [],
    this.plan,
    this.amountKobo = 0,
    this.preview,
    this.wallets,
    this.paymentMethod = 'WALLET',
    this.result,
    this.loading = false,
    this.submitting = false,
    this.error,
  });

  final InvestmentAsset? asset;
  final List<InvestmentPlan> plans;
  final InvestmentPlan? plan;
  final int amountKobo;
  final InvestmentPreview? preview;
  final InvestorWallets? wallets;
  final String paymentMethod; // WALLET | CARD | TRANSFER | USSD
  final CreateInvestmentResponse? result;
  final bool loading;
  final bool submitting;
  final String? error;

  InvestFlowState copyWith({
    InvestmentAsset? asset,
    List<InvestmentPlan>? plans,
    InvestmentPlan? plan,
    int? amountKobo,
    InvestmentPreview? preview,
    InvestorWallets? wallets,
    String? paymentMethod,
    CreateInvestmentResponse? result,
    bool? loading,
    bool? submitting,
    String? error,
    bool clearError = false,
  }) {
    return InvestFlowState(
      asset: asset ?? this.asset,
      plans: plans ?? this.plans,
      plan: plan ?? this.plan,
      amountKobo: amountKobo ?? this.amountKobo,
      preview: preview ?? this.preview,
      wallets: wallets ?? this.wallets,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      result: result ?? this.result,
      loading: loading ?? this.loading,
      submitting: submitting ?? this.submitting,
      error: clearError ? null : (error ?? this.error),
    );
  }

  int get minKobo {
    final assetMin = asset?.minInvestKobo ?? 0;
    final planMin = plan?.minAmountKobo ?? 0;
    return assetMin > planMin ? assetMin : planMin;
  }

  /// Client-side projection shown live on the amount screen.
  int get estMonthlyKobo =>
      plan == null ? 0 : (amountKobo * plan!.monthlyRateBps) ~/ 10000;

  int get estTotalReturnKobo =>
      plan == null ? 0 : amountKobo + estMonthlyKobo * plan!.tenureMonths;

  @override
  List<Object?> get props => [
        asset, plans, plan, amountKobo, preview, wallets,
        paymentMethod, result, loading, submitting, error,
      ];
}

class InvestFlowCubit extends Cubit<InvestFlowState> {
  InvestFlowCubit() : super(const InvestFlowState());

  final _investService = InvestService(DioClient.instance);
  final _walletService = WalletService(DioClient.instance);

  /// Entering the flow from an asset — resets everything downstream.
  Future<void> start(InvestmentAsset asset) async {
    emit(InvestFlowState(asset: asset, loading: true));
    try {
      final res = await _investService.getPlans();
      final popular = res.data.where((p) => p.isPopular).toList();
      emit(state.copyWith(
        plans: res.data,
        plan: popular.isNotEmpty ? popular.first : (res.data.isNotEmpty ? res.data.first : null),
        loading: false,
      ));
    } on DioException catch (e) {
      emit(state.copyWith(loading: false, error: parseDioError(e)));
    }
  }

  void selectPlan(InvestmentPlan plan) =>
      emit(state.copyWith(plan: plan, clearError: true));

  void setAmount(int amountKobo) =>
      emit(state.copyWith(amountKobo: amountKobo, clearError: true));

  void selectPaymentMethod(String method) =>
      emit(state.copyWith(paymentMethod: method, clearError: true));

  /// Amount screen → review: fetch the server-verified projection + balances.
  Future<bool> preview() async {
    final asset = state.asset;
    final plan = state.plan;
    if (asset == null || plan == null || state.amountKobo <= 0) return false;
    emit(state.copyWith(submitting: true, clearError: true));
    try {
      final res = await _investService.previewInvestment(PreviewBody(
        assetId: asset.id,
        planId: plan.id,
        amountKobo: state.amountKobo,
      ));
      final wallet = await _walletService.getWallet();
      emit(state.copyWith(
        preview: res.data,
        wallets: wallet.data,
        submitting: false,
      ));
      return true;
    } on DioException catch (e) {
      emit(state.copyWith(submitting: false, error: parseDioError(e)));
      return false;
    }
  }

  /// Payment screen → success (or Paystack checkout when card/transfer).
  Future<bool> confirm() async {
    final asset = state.asset;
    final plan = state.plan;
    if (asset == null || plan == null) return false;
    emit(state.copyWith(submitting: true, clearError: true));
    try {
      final res = await _investService.createInvestment(CreateInvestmentBody(
        assetId: asset.id,
        planId: plan.id,
        amountKobo: state.amountKobo,
        paymentMethod: state.paymentMethod,
      ));
      emit(state.copyWith(result: res, submitting: false));
      return true;
    } on DioException catch (e) {
      emit(state.copyWith(submitting: false, error: parseDioError(e)));
      return false;
    }
  }

  /// After returning from a Paystack checkout.
  Future<bool> verifyPayment() async {
    final reference = state.result?.reference;
    if (reference == null) return false;
    emit(state.copyWith(submitting: true, clearError: true));
    try {
      final res = await _investService
          .verifyInvestment(VerifyReferenceBody(reference: reference));
      emit(state.copyWith(
        result: CreateInvestmentResponse(
          paymentRequired: false,
          investment: res.data,
        ),
        submitting: false,
      ));
      return true;
    } on DioException catch (e) {
      emit(state.copyWith(submitting: false, error: parseDioError(e)));
      return false;
    }
  }

  void resetFlow() => emit(const InvestFlowState());
}
