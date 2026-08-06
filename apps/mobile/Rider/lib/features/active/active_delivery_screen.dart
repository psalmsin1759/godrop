import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../../shared/widgets/rider_header.dart';
import '../history/bloc/history_cubit.dart';
import '../history/history_list_view.dart';
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
    with AutomaticKeepAliveClientMixin, SingleTickerProviderStateMixin {
  StreamSubscription<RemoteMessage>? _fcmSub;
  late final TabController _tabController;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<ActiveCubit>().loadActiveOrder();
    context.read<HistoryCubit>().loadHistory();
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
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            const RiderHeader(
              icon: Icons.local_shipping_rounded,
              title: 'Orders',
              subtitle: 'Active and completed deliveries',
            ),
            _buildTabBar(),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildActiveTab(),
                  const HistoryListView(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          gradient: GodropColors.blueGradient,
          borderRadius: BorderRadius.circular(10),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: GodropColors.white,
        unselectedLabelColor: GodropColors.slate,
        labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        tabs: const [
          Tab(text: 'Active'),
          Tab(text: 'Completed'),
        ],
      ),
    );
  }

  Widget _buildActiveTab() {
    return BlocConsumer<ActiveCubit, ActiveState>(
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
      builder: (ctx, state) => _buildBody(ctx, state),
    );
  }

  Widget _buildBody(BuildContext ctx, ActiveState state) {
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
                      color: GodropColors.success.withValues(alpha: 0.1),
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
    final multi = order.isMultiParcel;
    // Once the parcels are collected, multi-parcel orders switch to a per-stop
    // checklist instead of a single recipient + deliver button.
    final showChecklist =
        multi && (order.status == 'PICKED_UP' || order.status == 'IN_TRANSIT');

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        AnimatedEntrance(
          child: _orderStatusRow(order),
        ),
        const SizedBox(height: 12),
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
          delay: const Duration(milliseconds: 125),
          child: _mapButton(ctx),
        ),
        if (showChecklist) ...[
          const SizedBox(height: 12),
          AnimatedEntrance(
            delay: const Duration(milliseconds: 150),
            child: _parcelsChecklist(ctx, order, loading),
          ),
          const SizedBox(height: 16),
        ] else ...[
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
          if (order.status == 'ACCEPTED') ...[
            const SizedBox(height: 10),
            AnimatedEntrance(
              delay: const Duration(milliseconds: 280),
              child: _rejectButton(ctx, order, loading),
            ),
          ],
          const SizedBox(height: 16),
        ],
      ],
    );
  }

  Widget _orderStatusRow(RiderOrderDetail order) {
    return Row(
      children: [
        Expanded(
          child: Text(
            '#${order.trackingCode}',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: GodropColors.ink,
            ),
          ),
        ),
        _statusPill(order.status),
      ],
    );
  }

  Widget _statusPill(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: GodropColors.blue.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: GodropColors.blue,
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
                    color: GodropColors.white.withValues(alpha: 0.75),
                    fontSize: 14,
                    fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: GodropColors.white.withValues(alpha: 0.2),
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
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
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
            label: order.isMultiParcel ? 'Drop-offs' : 'Dropoff',
            address: order.isMultiParcel
                ? '${order.parcelCount} destinations'
                : order.dropoffAddress,
            sub: null,
          ),
        ],
      ),
    );
  }

  Widget _parcelsChecklist(
      BuildContext ctx, RiderOrderDetail order, bool loading) {
    final dropoffs = order.dropoffs ?? const [];
    final delivered = dropoffs.where((d) => d.status == 'DELIVERED').length;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text('Parcels to deliver',
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink)),
              ),
              Text('$delivered/${dropoffs.length} done',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: GodropColors.slate)),
            ],
          ),
          const SizedBox(height: 12),
          for (var i = 0; i < dropoffs.length; i++) ...[
            _parcelStopTile(ctx, dropoffs[i], loading),
            if (i != dropoffs.length - 1) const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }

  Widget _parcelStopTile(
      BuildContext ctx, RiderParcelDropoff p, bool loading) {
    final resolved = p.isResolved;
    final delivered = p.status == 'DELIVERED';
    final accent = delivered
        ? GodropColors.success
        : p.status == 'FAILED'
            ? GodropColors.error
            : GodropColors.blue;
    final meta = <String>[
      if (p.weightKg != null) '${p.weightKg} kg',
      if (p.packageDescription?.isNotEmpty == true) p.packageDescription!,
    ].join(' · ');

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: GodropColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: resolved ? accent.withValues(alpha: 0.4) : GodropColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: resolved
                    ? Icon(
                        delivered ? Icons.check_rounded : Icons.close_rounded,
                        size: 15,
                        color: accent)
                    : Text('${p.sequence}',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: accent)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(p.recipientName,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.ink)),
              ),
              Text(_fmt(p.earningKobo ?? p.deliveryFeeKobo),
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.orange)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_rounded,
                  size: 14, color: GodropColors.error),
              const SizedBox(width: 4),
              Expanded(
                child: Text(p.address,
                    style: const TextStyle(
                        fontSize: 12, color: GodropColors.slate)),
              ),
              GestureDetector(
                onTap: () => ctx.push('/active/map', extra: p.id),
                child: const Padding(
                  padding: EdgeInsets.only(left: 8),
                  child: Icon(Icons.map_rounded,
                      size: 18, color: GodropColors.blue),
                ),
              ),
              if (p.recipientPhone.isNotEmpty)
                GestureDetector(
                  onTap: () => _callCustomer(p.recipientPhone),
                  child: const Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: Icon(Icons.phone_rounded,
                        size: 18, color: GodropColors.success),
                  ),
                ),
            ],
          ),
          if (meta.isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(meta,
                style:
                    const TextStyle(fontSize: 12, color: GodropColors.mute)),
          ],
          if (p.status == 'FAILED' && p.failureReason != null) ...[
            const SizedBox(height: 4),
            Text('Failed: ${p.failureReason}',
                style: const TextStyle(
                    fontSize: 12, color: GodropColors.error)),
          ],
          if (!resolved) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: GodropButton(
                    label: 'Deliver',
                    gradientColors: const [
                      GodropColors.success,
                      Color(0xFF16A34A)
                    ],
                    onTap: loading
                        ? null
                        : () => _showDropoffDeliveredDialog(ctx, p),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: GodropOutlineButton(
                    label: 'Failed',
                    color: GodropColors.error,
                    onTap: loading
                        ? null
                        : () => _showDropoffFailedDialog(ctx, p),
                  ),
                ),
              ],
            ),
          ],
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

  Widget _mapButton(BuildContext ctx) {
    return GestureDetector(
      onTap: () => ctx.push('/active/map'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: GodropColors.border),
          boxShadow: GodropColors.softShadow,
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: GodropColors.blue.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.map_rounded,
                  color: GodropColors.blue, size: 18),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text('View Live Map',
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: GodropColors.ink)),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: GodropColors.mute, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _recipientCard(RiderOrderDetail order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: GodropColors.border),
        boxShadow: GodropColors.softShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: GodropColors.blue.withValues(alpha: 0.08),
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
              onTap: () => _callCustomer(order.recipientPhone!),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: GodropColors.success.withValues(alpha: 0.1),
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

  Future<void> _callCustomer(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Could not open phone dialer'),
        backgroundColor: GodropColors.error,
        behavior: SnackBarBehavior.floating,
      ));
    }
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

  Widget _rejectButton(
      BuildContext ctx, RiderOrderDetail order, bool loading) {
    return GodropOutlineButton(
      label: 'Reject Order',
      color: GodropColors.error,
      onTap: loading ? null : () => _showRejectDialog(ctx),
    );
  }

  void _showRejectDialog(BuildContext ctx) {
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
            const Text('Reject this order?',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink)),
            const SizedBox(height: 8),
            const Text(
              "The customer will be notified we're finding another rider. "
              'Please provide a reason (optional)',
              style: TextStyle(color: GodropColors.slate, fontSize: 14),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: InputDecoration(
                hintText: 'e.g. Too far away',
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
              label: 'Confirm Rejection',
              gradientColors: [GodropColors.error, GodropColors.error],
              onTap: () {
                Navigator.pop(bctx);
                ctx.read<ActiveCubit>().rejectOrder(
                    reason: controller.text.trim().isNotEmpty
                        ? controller.text.trim()
                        : null);
              },
            ),
          ],
        ),
      ),
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

  void _showDropoffDeliveredDialog(BuildContext ctx, RiderParcelDropoff p) {
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
              Text('Deliver to ${p.recipientName}',
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink)),
              const SizedBox(height: 4),
              Text(
                'Ask ${p.recipientName} for their 4-digit confirmation code.',
                style: const TextStyle(color: GodropColors.slate, fontSize: 13),
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
                  hintStyle: const TextStyle(
                      letterSpacing: 10, fontSize: 28, color: GodropColors.border),
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
                  ctx.read<ActiveCubit>().markDropoffDelivered(
                        p.id,
                        confirmationCode: codeController.text,
                        proofNote: noteController.text.isNotEmpty
                            ? noteController.text
                            : null,
                      );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showDropoffFailedDialog(BuildContext ctx, RiderParcelDropoff p) {
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
            Text('Parcel ${p.sequence} undeliverable',
                style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink)),
            const SizedBox(height: 8),
            Text('Why couldn\'t you deliver to ${p.recipientName}?',
                style: const TextStyle(color: GodropColors.slate, fontSize: 14)),
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
              gradientColors: const [GodropColors.error, GodropColors.error],
              onTap: () {
                if (controller.text.trim().isEmpty) return;
                Navigator.pop(bctx);
                ctx.read<ActiveCubit>().markDropoffFailed(p.id, controller.text);
              },
            ),
          ],
        ),
      ),
    );
  }
}
