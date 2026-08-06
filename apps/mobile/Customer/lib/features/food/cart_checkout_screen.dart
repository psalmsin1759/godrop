import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../app/theme.dart';
import '../../shared/api/api.dart';
import '../../shared/bloc/delivery_address_cubit.dart';
import '../../shared/models/food_models.dart';
import '../../shared/models/store_models.dart';
import '../../shared/models/wallet_models.dart';
import '../../shared/utils/currency.dart';
import '../../shared/widgets/coupon_input.dart';
import '../../shared/widgets/godrop_button.dart';
import '../orders/bloc/order_cubit.dart';
import '../orders/models/active_order.dart';
import '../../features/parcel/models/parcel_location.dart';
import 'bloc/cart_cubit.dart';
import 'bloc/cart_state.dart';
import 'models/restaurant_data.dart';

// ─── Platform config loaded from GET /config ─────────────────────────────────

class _PlatformConfig {
  final int standardDeliveryFeeKobo;
  final int serviceChargeKobo;
  final int costPerKmKobo;

  const _PlatformConfig({
    this.standardDeliveryFeeKobo = 75000,
    this.serviceChargeKobo = 25000,
    this.costPerKmKobo = 10000,
  });

  factory _PlatformConfig.fromJson(Map<String, dynamic> json) {
    return _PlatformConfig(
      standardDeliveryFeeKobo: (json['standardDeliveryFeeKobo'] as num?)?.toInt() ?? 75000,
      serviceChargeKobo: (json['serviceChargeKobo'] as num?)?.toInt() ?? 25000,
      costPerKmKobo: (json['costPerKmKobo'] as num?)?.toInt() ?? 10000,
    );
  }
}

class CartCheckoutScreen extends StatefulWidget {
  final String partnerId;
  const CartCheckoutScreen({super.key, required this.partnerId});

  @override
  State<CartCheckoutScreen> createState() => _CartCheckoutScreenState();
}

class _CartCheckoutScreenState extends State<CartCheckoutScreen> {
  // 'card' | 'wallet' | 'wallet_card' | 'cash'
  String _paymentMethod = 'card';
  bool _placing = false;

  _PlatformConfig _config = const _PlatformConfig();
  bool _codEnabled = false;
  double _walletBalance = 0;
  AppliedCoupon? _coupon;

  String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  String _generateCode() {
    final rng = Random();
    return (1000 + rng.nextInt(9000)).toString();
  }

  @override
  void initState() {
    super.initState();
    _loadConfig();
    _loadVendorCod();
    _loadWalletBalance();
  }

  Future<void> _loadConfig() async {
    try {
      final res = await DioClient.instance.get('/config');
      final data = res.data as Map<String, dynamic>;
      final raw = data['data'] as Map<String, dynamic>? ?? data;
      if (mounted) setState(() => _config = _PlatformConfig.fromJson(raw));
    } catch (_) {}
  }

  Future<void> _loadVendorCod() async {
    try {
      final res = await DioClient.instance.get('/config/vendor/${widget.partnerId}/payment-options');
      final data = res.data as Map<String, dynamic>;
      final enabled = (data['cashOnDeliveryEnabled'] as bool?) ?? false;
      if (mounted) setState(() => _codEnabled = enabled);
    } catch (_) {}
  }

  Future<void> _loadWalletBalance() async {
    try {
      final res = await DioClient.instance.get('/me/wallet');
      final data = res.data as Map<String, dynamic>;
      final balance = (data['balance'] as num?)?.toDouble() ?? 0;
      if (mounted) setState(() => _walletBalance = balance);
    } catch (_) {}
  }

  Future<void> _placeOrder(VendorCart cart, String deliveryAddress) async {
    if (deliveryAddress.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please set a delivery address to continue.')),
      );
      context.go(cart.partnerType.listRoute);
      return;
    }
    final total = cart.subtotalKobo +
        _config.standardDeliveryFeeKobo +
        _config.serviceChargeKobo -
        (_coupon?.discountKobo ?? 0);
    // TEMP BRIDGE: total is still Kobo (Orders domain not yet converted).
    if (_paymentMethod == 'wallet' && _walletBalance < total / 100) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Insufficient wallet balance. You have ${formatNaira(_walletBalance)} but need ${_fmt(total)}.')),
      );
      return;
    }

    setState(() => _placing = true);

    try {
      // Step 1: Create order via checkout endpoint.
      // The checkout API only accepts 'card' or 'cash' — wallet/wallet_card are
      // resolved later by /payments/initialize, so we map them to 'card' here.
      final String checkoutPaymentMethod =
          _paymentMethod == 'cash' ? 'cash' : 'card';

      final String orderId;
      final int orderTotalKobo;
      final String? confirmationCode;

      if (cart.partnerType == PartnerType.restaurant) {
        final items = cart.items
            .map((i) => CheckoutItem(productId: i.id, quantity: i.quantity))
            .toList();
        final response = await FoodService(DioClient.instance).checkout(
          FoodCheckoutRequest(
            vendorId: cart.partnerId,
            items: items,
            deliveryAddress: deliveryAddress,
            paymentMethod: checkoutPaymentMethod,
            couponCode: _coupon?.code,
          ),
        );
        orderId = response.order.id;
        orderTotalKobo = response.order.totalKobo;
        confirmationCode = response.order.confirmationCode;
      } else {
        final items = cart.items
            .map((i) => StoreCheckoutItem(productId: i.id, quantity: i.quantity))
            .toList();
        final request = StoreCheckoutRequest(
          vendorId: cart.partnerId,
          items: items,
          deliveryAddress: deliveryAddress,
          paymentMethod: checkoutPaymentMethod,
          couponCode: _coupon?.code,
        );
        final StoreOrderResponse response;
        switch (cart.partnerType) {
          case PartnerType.grocery:
            response = await GroceryService(DioClient.instance).checkout(request);
          case PartnerType.retail:
            response = await RetailService(DioClient.instance).checkout(request);
          case PartnerType.pharmacy:
            response = await PharmacyService(DioClient.instance).checkout(request);
          default:
            throw StateError('Unsupported partner type: ${cart.partnerType}');
        }
        orderId = response.order.id;
        orderTotalKobo = response.order.totalKobo;
        confirmationCode = response.order.confirmationCode;
      }

      if (!mounted) return;

      // Step 2: Initialize payment
      final payRes = await PaymentService(DioClient.instance).initPayment(
        PaymentInitBody(orderId: orderId, method: _paymentMethod),
      );

      if (!mounted) return;

      // Step 3: Handle payment response
      final fallbackTotal = cart.subtotalKobo +
          _config.standardDeliveryFeeKobo +
          _config.serviceChargeKobo -
          (_coupon?.discountKobo ?? 0);
      final displayTotal = orderTotalKobo > 0 ? orderTotalKobo : fallbackTotal;
      final summaryItems = cart.items.take(2).map((i) => i.name.split(' ').take(2).join(' ')).join(', ');
      final extra = cart.items.length > 2 ? ' +${cart.items.length - 2} more' : '';
      final foodSummary = '${cart.totalItems} item${cart.totalItems == 1 ? '' : 's'}: $summaryItems$extra';

      final order = ActiveOrderData(
        riderName: 'Delivery Rider',
        riderRating: 4.8,
        riderTrips: 312,
        riderVehicleNo: 'LND-001AA',
        riderDistance: '2.4km',
        pickup: ParcelLocation(lat: 6.5244, lng: 3.3792, name: cart.partnerName),
        dropoff: ParcelLocation(lat: 6.5244, lng: 3.3792, name: deliveryAddress),
        vehicleIndex: 0,
        orderType: cart.partnerType.orderTypeKey,
        restaurantName: cart.partnerName,
        confirmationCode: confirmationCode ?? _generateCode(),
        foodSummary: foodSummary,
      );

      if (payRes.paystackAuthUrl != null && payRes.paystackAuthUrl!.isNotEmpty) {
        // Show Paystack WebView
        setState(() => _placing = false);
        if (!mounted) return;
        _showPaystackWebView(
          url: payRes.paystackAuthUrl!,
          reference: payRes.reference,
          orderId: orderId,
          cart: cart,
          order: order,
          displayTotal: displayTotal,
        );
        return;
      }

      // Paid immediately (wallet or cash)
      context.read<OrderCubit>().placeOrder(order);
      context.read<CartCubit>().clearVendor(cart.partnerId);
      setState(() => _placing = false);

      _showOrderConfirmation(order.confirmationCode ?? _generateCode(), displayTotal,
          isCash: _paymentMethod == 'cash');
    } catch (e) {
      if (!mounted) return;
      setState(() => _placing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString().contains('DioException')
                ? 'Could not place order. Please try again.'
                : 'Order failed: ${e.toString()}',
          ),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  void _showPaystackWebView({
    required String url,
    required String reference,
    required String orderId,
    required VendorCart cart,
    required ActiveOrderData order,
    required int displayTotal,
  }) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
      builder: (sheetCtx) => _PaystackWebViewSheet(
        url: url,
        onPaymentDone: () async {
          Navigator.pop(sheetCtx);
          setState(() => _placing = true);
          try {
            await PaymentService(DioClient.instance).verifyPayment(PaymentVerifyBody(reference: reference));
            if (!mounted) return;
            context.read<OrderCubit>().placeOrder(order);
            context.read<CartCubit>().clearVendor(cart.partnerId);
            _showOrderConfirmation(order.confirmationCode ?? _generateCode(), displayTotal);
          } catch (_) {
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Payment verification failed. Please contact support.'),
                backgroundColor: Colors.red,
              ),
            );
          } finally {
            if (mounted) setState(() => _placing = false);
          }
        },
        onCancel: () => Navigator.pop(sheetCtx),
      ),
    );
  }

  void _showOrderConfirmation(String code, int totalKobo, {bool isCash = false}) {
    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: Colors.transparent,
      builder: (_) => _OrderConfirmationSheet(
        code: code,
        total: _fmt(totalKobo),
        isCash: isCash,
        onDone: () {
          Navigator.pop(context);
          context.go('/home');
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (context, cartState) {
        final cart = cartState.cartFor(widget.partnerId);

        if (cart == null || cart.isEmpty) {
          return Scaffold(
            backgroundColor: GodropColors.background,
            appBar: AppBar(
              backgroundColor: GodropColors.white,
              leading: GestureDetector(
                  onTap: () => context.go('/home'),
                  child: const Icon(Icons.chevron_left_rounded, size: 28)),
              title: const Text('Your order'),
            ),
            body: const Center(
              child: Text('Your cart is empty',
                  style: TextStyle(fontSize: 15, color: GodropColors.mute)),
            ),
          );
        }

        final subtotal = cart.subtotalKobo;
        final deliveryFee = _config.standardDeliveryFeeKobo;
        final serviceFee = _config.serviceChargeKobo;
        final couponDiscount = _coupon?.discountKobo ?? 0;
        final total = subtotal + deliveryFee + serviceFee - couponDiscount;

        // TEMP BRIDGE: convert Naira wallet balance to Kobo to combine with
        // still-Kobo `total` (Orders domain not yet converted).
        final walletBalanceKobo = (_walletBalance * 100).round();

        // For wallet_card, show how much wallet covers
        final walletCovers = _paymentMethod == 'wallet_card'
            ? min(walletBalanceKobo, total)
            : (_paymentMethod == 'wallet' ? total : 0);
        final cardCovers = _paymentMethod == 'wallet_card'
            ? max(0, total - walletBalanceKobo)
            : (_paymentMethod == 'card' ? total : 0);

        return BlocBuilder<DeliveryAddressCubit, String>(
          builder: (context, deliveryAddress) {
            return Scaffold(
              backgroundColor: GodropColors.background,
              appBar: AppBar(
                backgroundColor: GodropColors.white,
                elevation: 0,
                leading: GestureDetector(
                  onTap: () => context.canPop()
                      ? context.pop()
                      : context.go(cart.partnerType.listRoute),
                  child: const Icon(Icons.chevron_left_rounded,
                      size: 28, color: GodropColors.ink),
                ),
                title: const Text('Your order',
                    style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink)),
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(18),
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 8, left: 16),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        cart.partnerName,
                        style: const TextStyle(
                            fontSize: 12, color: GodropColors.slate),
                      ),
                    ),
                  ),
                ),
              ),
              body: Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Cart items
                          Container(
                            decoration: BoxDecoration(
                                color: GodropColors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: GodropColors.softShadow),
                            child: Column(
                              children: [
                                ...cart.items.asMap().entries.map((e) {
                                  final idx = e.key;
                                  final item = e.value;
                                  return Column(
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 14, vertical: 12),
                                        child: Row(
                                          children: [
                                            Container(
                                              width: 44,
                                              height: 44,
                                              decoration: BoxDecoration(
                                                color: GodropColors.orange
                                                    .withValues(alpha: 0.08),
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                              child: Center(
                                                  child: item.emoji.isNotEmpty
                                                      ? Text(item.emoji,
                                                          style: const TextStyle(
                                                              fontSize: 22))
                                                      : const Icon(
                                                          Icons.fastfood_rounded,
                                                          color: GodropColors.orange,
                                                          size: 20)),
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(item.name,
                                                      style: const TextStyle(
                                                          fontWeight: FontWeight.w500,
                                                          color: GodropColors.ink,
                                                          fontSize: 14)),
                                                  Text(
                                                    _fmt(item.priceKobo),
                                                    style: const TextStyle(
                                                        fontSize: 13,
                                                        color: GodropColors.orange,
                                                        fontWeight: FontWeight.w600),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            Row(
                                              children: [
                                                _QtyBtn(
                                                  icon: item.quantity == 1
                                                      ? Icons.delete_outline_rounded
                                                      : Icons.remove_rounded,
                                                  onTap: () => context
                                                      .read<CartCubit>()
                                                      .decrement(cart.partnerId, item.id),
                                                  filled: false,
                                                  isDelete: item.quantity == 1,
                                                ),
                                                Padding(
                                                  padding: const EdgeInsets.symmetric(
                                                      horizontal: 10),
                                                  child: Text('${item.quantity}',
                                                      style: const TextStyle(
                                                          fontWeight: FontWeight.w600,
                                                          fontSize: 15)),
                                                ),
                                                _QtyBtn(
                                                  icon: Icons.add_rounded,
                                                  onTap: () => context
                                                      .read<CartCubit>()
                                                      .increment(cart.partnerId, item.id),
                                                  filled: true,
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (idx < cart.items.length - 1)
                                        const Divider(
                                            height: 1, indent: 14, endIndent: 14),
                                    ],
                                  );
                                }),
                                const Divider(height: 1),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 14, vertical: 10),
                                  child: GestureDetector(
                                    onTap: () =>
                                        context.go(cart.partnerType.listRoute),
                                    child: const Row(
                                      children: [
                                        Icon(Icons.add_circle_outline_rounded,
                                            size: 18, color: GodropColors.blue),
                                        SizedBox(width: 8),
                                        Text('Add more items',
                                            style: TextStyle(
                                                fontSize: 14,
                                                color: GodropColors.blue,
                                                fontWeight: FontWeight.w500)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Delivery address
                          _SectionCard(
                            title: 'Delivery',
                            child: Row(
                              children: [
                                const Icon(Icons.location_on_rounded,
                                    size: 16, color: GodropColors.orange),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    deliveryAddress.isEmpty
                                        ? 'No delivery address set'
                                        : deliveryAddress,
                                    style: TextStyle(
                                        fontSize: 14,
                                        color: deliveryAddress.isEmpty
                                            ? GodropColors.mute
                                            : GodropColors.ink),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Coupon code
                          const Padding(
                            padding: EdgeInsets.only(left: 2, bottom: 8),
                            child: Text('Coupon code',
                                style: TextStyle(
                                    fontSize: 13,
                                    color: GodropColors.slate,
                                    fontWeight: FontWeight.w500)),
                          ),
                          CouponInputCard(
                            orderType: cart.partnerType.orderTypeKey.toUpperCase(),
                            deliveryFeeKobo: deliveryFee,
                            orderValueKobo: subtotal,
                            applied: _coupon,
                            onChanged: (c) => setState(() => _coupon = c),
                          ),
                          const SizedBox(height: 16),

                          // Payment method — inline selectable cards
                          const Padding(
                            padding: EdgeInsets.only(left: 2, bottom: 8),
                            child: Text('Payment method',
                                style: TextStyle(
                                    fontSize: 13,
                                    color: GodropColors.slate,
                                    fontWeight: FontWeight.w500)),
                          ),
                          _buildPaymentOptions(total),
                          const SizedBox(height: 16),

                          // Price summary
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                                color: GodropColors.white,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: GodropColors.softShadow),
                            child: Column(
                              children: [
                                _SummaryRow('Subtotal', _fmt(subtotal)),
                                const SizedBox(height: 8),
                                _SummaryRow('Delivery fee', _fmt(deliveryFee)),
                                const SizedBox(height: 8),
                                _SummaryRow('Service fee', _fmt(serviceFee)),
                                if (couponDiscount > 0) ...[
                                  const SizedBox(height: 8),
                                  _SummaryRow('Coupon (${_coupon!.code})',
                                      _fmt(couponDiscount),
                                      isDiscount: true),
                                ],
                                if (_paymentMethod == 'wallet_card' || _paymentMethod == 'wallet') ...[
                                  const SizedBox(height: 8),
                                  _SummaryRow('Wallet', _fmt(walletCovers), isDiscount: true),
                                ],
                                const Padding(
                                    padding: EdgeInsets.symmetric(vertical: 10),
                                    child: Divider(height: 1)),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Total',
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700,
                                            color: GodropColors.ink)),
                                    Text(
                                      _paymentMethod == 'wallet_card' && cardCovers > 0
                                          ? '${_fmt(cardCovers)} via card'
                                          : _paymentMethod == 'wallet'
                                              ? 'From wallet'
                                              : _fmt(total),
                                      style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                          color: GodropColors.ink),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Place order button
                  Builder(builder: (ctx) {
                    // Wallet-only payment is disabled when balance is insufficient
                    final walletInsufficient = _paymentMethod == 'wallet' && walletBalanceKobo < total;
                    final deliveryMissing = deliveryAddress.isEmpty;
                    final blocked = walletInsufficient;

                    String buttonLabel;
                    if (_paymentMethod == 'cash') {
                      buttonLabel = 'Place order · ${_fmt(total)}';
                    } else if (_paymentMethod == 'wallet') {
                      buttonLabel = walletInsufficient
                          ? 'Insufficient wallet balance'
                          : 'Pay from wallet · ${_fmt(total)}';
                    } else if (_paymentMethod == 'wallet_card' && cardCovers > 0) {
                      buttonLabel = 'Pay ${_fmt(cardCovers)} via card';
                    } else {
                      buttonLabel = 'Pay online · ${_fmt(total)}';
                    }

                    return Container(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                      color: GodropColors.white,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (deliveryMissing && !_placing)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                children: [
                                  const Icon(Icons.info_outline_rounded, size: 14, color: GodropColors.orange),
                                  const SizedBox(width: 6),
                                  Text('Set a delivery address to continue', style: const TextStyle(fontSize: 12, color: GodropColors.orange)),
                                ],
                              ),
                            ),
                          _placing
                              ? const Center(
                                  child: Padding(
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5),
                                  ),
                                )
                              : GodropButton(
                                  label: buttonLabel,
                                  color: blocked ? GodropColors.border : null,
                                  textColor: blocked ? GodropColors.mute : null,
                                  onTap: blocked ? null : () => _placeOrder(cart, deliveryAddress),
                                ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPaymentOptions(int totalKobo) {
    // TEMP BRIDGE: convert Naira wallet balance to Kobo to compare with
    // still-Kobo `totalKobo` (Orders domain not yet converted).
    final walletBalanceKobo = (_walletBalance * 100).round();
    final walletSuffix =
        _walletBalance > 0 ? ' (${formatNaira(_walletBalance)})' : ' (empty)';
    final walletCoversAll = walletBalanceKobo >= totalKobo;
    final cardRemainder = max(0, totalKobo - walletBalanceKobo);

    return Column(
      children: [
        _PaymentOption(
          icon: Icons.credit_card_rounded,
          label: 'Pay online',
          subtitle: 'Card, bank transfer via Paystack',
          value: 'card',
          current: _paymentMethod,
          onTap: () => setState(() => _paymentMethod = 'card'),
        ),
        const SizedBox(height: 10),
        _PaymentOption(
          icon: Icons.account_balance_wallet_rounded,
          label: 'Pay from wallet$walletSuffix',
          subtitle: walletCoversAll
              ? 'Instantly deducted, no Paystack needed'
              : 'Insufficient balance (need ${_fmt(totalKobo)})',
          value: 'wallet',
          current: _paymentMethod,
          disabled: _walletBalance <= 0,
          onTap: _walletBalance > 0
              ? () => setState(() => _paymentMethod = 'wallet')
              : null,
        ),
        if (_walletBalance > 0 && !walletCoversAll) ...[
          const SizedBox(height: 10),
          _PaymentOption(
            icon: Icons.credit_card_rounded,
            label: 'Wallet + Card',
            subtitle:
                'Use ${formatNaira(_walletBalance)} from wallet, pay ${_fmt(cardRemainder)} via card',
            value: 'wallet_card',
            current: _paymentMethod,
            onTap: () => setState(() => _paymentMethod = 'wallet_card'),
          ),
        ],
        if (_codEnabled) ...[
          const SizedBox(height: 10),
          _PaymentOption(
            icon: Icons.money_rounded,
            label: 'Cash on delivery',
            subtitle: 'Pay the rider when your order arrives',
            value: 'cash',
            current: _paymentMethod,
            onTap: () => setState(() => _paymentMethod = 'cash'),
          ),
        ],
      ],
    );
  }
}

// ── Paystack WebView sheet ────────────────────────────────────────────────────

class _PaystackWebViewSheet extends StatefulWidget {
  final String url;
  final VoidCallback onPaymentDone;
  final VoidCallback onCancel;
  const _PaystackWebViewSheet({
    required this.url,
    required this.onPaymentDone,
    required this.onCancel,
  });

  @override
  State<_PaystackWebViewSheet> createState() => _PaystackWebViewSheetState();
}

class _PaystackWebViewSheetState extends State<_PaystackWebViewSheet> {
  late final WebViewController _ctrl;
  bool _loading = true;
  bool _done = false;

  @override
  void initState() {
    super.initState();
    _ctrl = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) { if (mounted) setState(() => _loading = false); },
        onNavigationRequest: (req) {
          final isPaystack = req.url.contains('paystack.co') ||
              req.url.contains('paystack.com') ||
              req.url.contains('checkout.paystack');
          final uri = Uri.tryParse(req.url);
          if (!isPaystack && uri != null &&
              (uri.queryParameters.containsKey('trxref') ||
                  uri.queryParameters.containsKey('reference'))) {
            if (!_done) { _done = true; widget.onPaymentDone(); }
            return NavigationDecision.prevent;
          }
          return NavigationDecision.navigate;
        },
      ))
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).padding.bottom;
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                GestureDetector(
                  onTap: widget.onCancel,
                  child: Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(color: GodropColors.background, borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.close_rounded, size: 18, color: GodropColors.slate),
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text('Complete Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: GodropColors.ink)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFFE8F5EE), borderRadius: BorderRadius.circular(6)),
                  child: const Text('Secured by Paystack', style: TextStyle(fontSize: 10, color: GodropColors.success, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: Stack(
              children: [
                WebViewWidget(controller: _ctrl),
                if (_loading) const Center(child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5)),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(16, 10, 16, bottomPad + 12),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _done ? null : () { if (!_done) { _done = true; widget.onPaymentDone(); } },
                style: ElevatedButton.styleFrom(
                  backgroundColor: GodropColors.blue,
                  disabledBackgroundColor: GodropColors.border,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text("I've paid — verify now", style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final String value;
  final String current;
  final VoidCallback? onTap;
  final bool disabled;
  const _PaymentOption({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.value,
    required this.current,
    this.onTap,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final selected = value == current;
    return Opacity(
      opacity: disabled ? 0.4 : 1,
      child: GestureDetector(
        onTap: disabled ? null : onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: selected
                ? GodropColors.blue.withValues(alpha: 0.04)
                : GodropColors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected ? GodropColors.blue : GodropColors.border,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: selected
                      ? GodropColors.blue.withValues(alpha: 0.1)
                      : GodropColors.background,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon,
                    color: selected ? GodropColors.blue : GodropColors.slate,
                    size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                        style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: selected
                                ? GodropColors.blue
                                : GodropColors.ink)),
                    const SizedBox(height: 2),
                    Text(subtitle,
                        style: const TextStyle(
                            fontSize: 12, color: GodropColors.mute)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                selected
                    ? Icons.check_circle_rounded
                    : Icons.radio_button_off_rounded,
                color: selected ? GodropColors.blue : GodropColors.mute,
                size: 22,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Order confirmation bottom sheet ──────────────────────────────────────────

class _OrderConfirmationSheet extends StatelessWidget {
  final String code;
  final String total;
  final bool isCash;
  final VoidCallback onDone;
  const _OrderConfirmationSheet({required this.code, required this.total, required this.onDone, this.isCash = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(color: const Color(0xFF22C55E).withValues(alpha: 0.1), shape: BoxShape.circle),
              child: const Icon(Icons.check_rounded, color: Color(0xFF22C55E), size: 32),
            ),
            const SizedBox(height: 16),
            const Text('Order placed!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: GodropColors.ink)),
            const SizedBox(height: 8),
            Text(
              isCash ? 'Pay $total to your rider on arrival.' : 'Your order is being prepared. Total: $total',
              style: const TextStyle(fontSize: 14, color: GodropColors.slate),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 20),
              decoration: BoxDecoration(
                color: GodropColors.blue.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: GodropColors.blue.withValues(alpha: 0.2), width: 1.5),
              ),
              child: Column(
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.lock_rounded, size: 14, color: GodropColors.slate),
                      SizedBox(width: 6),
                      Text('DELIVERY CONFIRMATION CODE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: GodropColors.slate, letterSpacing: 0.8)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(code, style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w800, color: GodropColors.blue, letterSpacing: 8)),
                  const SizedBox(height: 8),
                  const Text(
                    'Share this code ONLY with your rider\nwhen your order arrives.',
                    style: TextStyle(fontSize: 12, color: GodropColors.mute, height: 1.5),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(width: double.infinity, child: GodropButton(label: 'Track my order', onTap: onDone)),
          ],
        ),
      ),
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool filled;
  final bool isDelete;
  const _QtyBtn({required this.icon, required this.onTap, this.filled = false, this.isDelete = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28, height: 28,
        decoration: BoxDecoration(
          color: isDelete ? Colors.red.withValues(alpha: 0.08) : (filled ? GodropColors.blue : GodropColors.background),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 16, color: isDelete ? Colors.red : (filled ? Colors.white : GodropColors.ink)),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _SectionCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: GodropColors.softShadow),
      child: Row(
        children: [
          Text('$title  ', style: const TextStyle(fontSize: 13, color: GodropColors.slate, fontWeight: FontWeight.w500)),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isDiscount;
  const _SummaryRow(this.label, this.value, {this.isDiscount = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, color: GodropColors.slate)),
        Text(isDiscount ? '-$value' : value,
            style: TextStyle(fontSize: 14, color: isDiscount ? GodropColors.success : GodropColors.ink, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
