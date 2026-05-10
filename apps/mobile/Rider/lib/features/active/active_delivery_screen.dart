import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/animated_entrance.dart';
import 'bloc/active_cubit.dart';
import 'bloc/active_state.dart';

String _fmt(int kobo) {
  final naira = kobo / 100;
  return '₦${naira.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')}';
}

class ActiveDeliveryScreen extends StatefulWidget {
  const ActiveDeliveryScreen({super.key});

  @override
  State<ActiveDeliveryScreen> createState() => _ActiveDeliveryScreenState();
}

class _ActiveDeliveryScreenState extends State<ActiveDeliveryScreen>
    with AutomaticKeepAliveClientMixin {
  StreamSubscription<RemoteMessage>? _fcmSub;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    context.read<ActiveCubit>().loadActiveOrder();
    _fcmSub = FirebaseMessaging.onMessage.listen((message) {
      if (message.data['type'] == 'ORDER_CANCELLED' && mounted) {
        context.read<ActiveCubit>().loadActiveOrder();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('The customer cancelled this order.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _fcmSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: SafeArea(
        child: BlocConsumer<ActiveCubit, ActiveState>(
          listener: (ctx, state) {
            if (state is ActiveError) {
              ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
                content: Text(state.message),
                backgroundColor: GodropColors.error,
                behavior: SnackBarBehavior.floating,
              ));
            }
            if (state is ActiveLoaded && state.errorMessage != null) {
              ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
                content: Text(state.errorMessage!),
                backgroundColor: GodropColors.error,
                behavior: SnackBarBehavior.floating,
              ));
            }
          },
          builder: (ctx, state) {
            if (state is ActiveLoading || state is ActiveInitial) {
              return const Center(
                  child: CircularProgressIndicator(color: GodropColors.blue));
            }
            if (state is ActiveNone) return _buildNoActive(ctx);
            if (state is ActiveLoaded || state is ActiveActionLoading) {
              final order = state is ActiveLoaded
                  ? state.order
                  : (state as ActiveActionLoading).order;
              final loading = state is ActiveActionLoading;
              return _buildActive(ctx, order, loading);
            }
            if (state is ActiveError) return _buildNoActive(ctx);
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildNoActive(BuildContext ctx) {
    return RefreshIndicator(
      onRefresh: () => ctx.read<ActiveCubit>().loadActiveOrder(),
      color: GodropColors.blue,
      child: ListView(
        children: [
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.7,
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: GodropColors.success.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_outline_rounded,
                        color: GodropColors.success, size: 40),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'No Active Delivery',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Accept a job from the Jobs tab\nto start a delivery.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 14, color: GodropColors.mute, height: 1.5),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActive(
      BuildContext ctx, RiderOrderDetail order, bool loading) {
    return Column(
      children: [
        // Header
        Container(
          color: GodropColors.white,
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Active Delivery',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink,
                      ),
                    ),
                    Text(
                      '#${order.trackingCode}',
                      style: const TextStyle(
                          fontSize: 13, color: GodropColors.mute),
                    ),
                  ],
                ),
              ),
              _statusPill(order.status),
            ],
          ),
        ),

        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              AnimatedEntrance(
                delay: const Duration(milliseconds: 50),
                child: _earningsCard(order),
              ),
              const SizedBox(height: 12),
              AnimatedEntrance(
                delay: const Duration(milliseconds: 100),
                child: _routeCard(order),
              ),
              const SizedBox(height: 12),
              AnimatedEntrance(
                delay: const Duration(milliseconds: 150),
                child: _recipientCard(order),
              ),
              const SizedBox(height: 12),
              AnimatedEntrance(
                delay: const Duration(milliseconds: 200),
                child: _actionCard(ctx, order, loading),
              ),
              const SizedBox(height: 20),
              AnimatedEntrance(
                delay: const Duration(milliseconds: 250),
                child: _failedButton(ctx, order, loading),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }

  Widget _statusPill(String status) {
    final (color, bg) = switch (status) {
      'ACCEPTED' => (GodropColors.blue, GodropColors.blue.withOpacity(0.1)),
      'READY_FOR_PICKUP' => (GodropColors.orange, GodropColors.orange.withOpacity(0.1)),
      'PICKED_UP' => (GodropColors.success, GodropColors.success.withOpacity(0.1)),
      'IN_TRANSIT' => (GodropColors.success, GodropColors.success.withOpacity(0.1)),
      _ => (GodropColors.slate, GodropColors.background),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _earningsCard(RiderOrderDetail order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: GodropColors.blueGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Your Earnings',
                    style: TextStyle(color: GodropColors.white, fontSize: 12)),
                const SizedBox(height: 4),
                Text(
                  _fmt(order.deliveryFeeKobo),
                  style: const TextStyle(
                    color: GodropColors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text('Order Total',
                  style: TextStyle(color: GodropColors.white, fontSize: 11, height: 1.2),
                  textAlign: TextAlign.end),
              Text(
                _fmt(order.totalKobo),
                style: TextStyle(
                    color: GodropColors.white.withOpacity(0.75),
                    fontSize: 14,
                    fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: GodropColors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  order.paymentMethod,
                  style: const TextStyle(
                      color: GodropColors.white, fontSize: 11),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _routeCard(RiderOrderDetail order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Route',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: GodropColors.ink)),
          const SizedBox(height: 14),
          _routeRow(
            icon: Icons.radio_button_on_rounded,
            color: GodropColors.blue,
            label: 'Pickup',
            address: order.pickupAddress,
            sub: order.vendor?.name,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 7),
            child: Container(
                width: 1, height: 20, color: GodropColors.border),
          ),
          _routeRow(
            icon: Icons.location_on_rounded,
            color: GodropColors.error,
            label: 'Dropoff',
            address: order.dropoffAddress,
            sub: null,
          ),
        ],
      ),
    );
  }

  Widget _routeRow({
    required IconData icon,
    required Color color,
    required String label,
    required String address,
    String? sub,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: const TextStyle(
                      fontSize: 11, color: GodropColors.mute)),
              Text(address,
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: GodropColors.ink)),
              if (sub != null)
                Text(sub,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.slate)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _recipientCard(RiderOrderDetail order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: GodropColors.blue.withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person_outline_rounded,
                color: GodropColors.blue, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.recipientName ?? 'Customer',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: GodropColors.ink,
                  ),
                ),
                if (order.recipientPhone != null)
                  Text(
                    order.recipientPhone!,
                    style: const TextStyle(
                        fontSize: 13, color: GodropColors.slate),
                  ),
              ],
            ),
          ),
          if (order.recipientPhone != null)
            GestureDetector(
              onTap: () {/* launch phone dialer */},
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: GodropColors.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.phone_rounded,
                    color: GodropColors.success, size: 20),
              ),
            ),
        ],
      ),
    );
  }

  Widget _actionCard(
      BuildContext ctx, RiderOrderDetail order, bool loading) {
    final (label, action) = switch (order.status) {
      'ACCEPTED' || 'READY_FOR_PICKUP' => (
          'Mark as Picked Up',
          () => ctx.read<ActiveCubit>().markPickedUp()
        ),
      'PICKED_UP' => (
          'Start Transit',
          () => ctx.read<ActiveCubit>().markInTransit()
        ),
      'IN_TRANSIT' => (
          'Mark as Delivered',
          () => _showDeliveredDialog(ctx)
        ),
      _ => (null, null),
    };

    if (label == null) return const SizedBox.shrink();

    return GodropButton(
      label: label,
      onTap: loading ? null : action,
      isLoading: loading,
      gradientColors: order.status == 'IN_TRANSIT'
          ? [GodropColors.success, const Color(0xFF16A34A)]
          : null,
    );
  }

  Widget _failedButton(
      BuildContext ctx, RiderOrderDetail order, bool loading) {
    if (order.status == 'DELIVERED' || order.status == 'FAILED') {
      return const SizedBox.shrink();
    }
    return GodropOutlineButton(
      label: 'Report Failed Delivery',
      color: GodropColors.error,
      onTap: loading ? null : () => _showFailedDialog(ctx),
    );
  }

  void _showDeliveredDialog(BuildContext ctx) {
    final codeController = TextEditingController();
    final noteController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: GodropColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bctx) => Padding(
        padding: EdgeInsets.fromLTRB(
            24, 24, 24, MediaQuery.of(bctx).viewInsets.bottom + 24),
        child: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Confirm Delivery',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink)),
              const SizedBox(height: 4),
              const Text(
                'Ask the customer for their 4-digit confirmation code.',
                style: TextStyle(color: GodropColors.slate, fontSize: 13),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: codeController,
                keyboardType: TextInputType.number,
                maxLength: 4,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 10,
                  color: GodropColors.ink,
                ),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: '••••',
                  hintStyle: const TextStyle(letterSpacing: 10, fontSize: 28, color: GodropColors.border),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: GodropColors.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: GodropColors.blue, width: 2),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 16),
                ),
                validator: (v) {
                  if (v == null || v.length != 4) return 'Enter the 4-digit code';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: noteController,
                decoration: InputDecoration(
                  hintText: 'Delivery note (optional)',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: GodropColors.border),
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
              const SizedBox(height: 20),
              GodropButton(
                label: 'Confirm Delivered',
                gradientColors: const [GodropColors.success, Color(0xFF16A34A)],
                onTap: () {
                  if (!formKey.currentState!.validate()) return;
                  Navigator.pop(bctx);
                  ctx.read<ActiveCubit>().markDelivered(
                    confirmationCode: codeController.text,
                    proofNote: noteController.text.isNotEmpty ? noteController.text : null,
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showFailedDialog(BuildContext ctx) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: GodropColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bctx) => Padding(
        padding: EdgeInsets.fromLTRB(
            24, 24, 24, MediaQuery.of(bctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Report Failed Delivery',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink)),
            const SizedBox(height: 8),
            const Text('Please provide a reason',
                style: TextStyle(color: GodropColors.slate, fontSize: 14)),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: InputDecoration(
                hintText: 'e.g. Recipient unreachable after 3 attempts',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: GodropColors.border),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
            const SizedBox(height: 20),
            GodropButton(
              label: 'Submit Report',
              gradientColors: [GodropColors.error, GodropColors.error],
              onTap: () {
                if (controller.text.trim().isEmpty) return;
                Navigator.pop(bctx);
                ctx.read<ActiveCubit>().markFailed(controller.text);
              },
            ),
          ],
        ),
      ),
    );
  }
}
