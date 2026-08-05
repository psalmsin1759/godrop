import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../app/theme.dart';
import '../../shared/models/rider_models.dart';
import '../../shared/widgets/availability_toggle.dart';
import '../../shared/widgets/rider_header.dart';
import '../profile/bloc/profile_cubit.dart';
import '../profile/bloc/profile_state.dart';
import 'bloc/jobs_cubit.dart';
import 'bloc/jobs_state.dart';

String _formatKobo(int kobo) {
  final naira = kobo / 100;
  return '₦${naira.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},')}';
}

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  late final AppLifecycleListener _lifecycleListener;
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    context.read<JobsCubit>()
      ..loadJobs()
      ..connectJobStream();
    if (context.read<ProfileCubit>().state is ProfileInitial) {
      context.read<ProfileCubit>().loadProfile();
    }
    _lifecycleListener = AppLifecycleListener(
      onResume: () => context.read<JobsCubit>().loadJobs(),
    );
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >
          _scrollController.position.maxScrollExtent - 300) {
        context.read<JobsCubit>().loadMorePending();
      }
    });
  }

  @override
  void dispose() {
    _lifecycleListener.dispose();
    _scrollController.dispose();
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            BlocBuilder<ProfileCubit, ProfileState>(
              builder: (ctx, state) {
                final profile = switch (state) {
                  ProfileLoaded(profile: final p) => p,
                  ProfileSaving(profile: final p) => p,
                  _ => null,
                };
                if (profile == null) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: AvailabilityToggle(
                    isAvailable: profile.isAvailable,
                    loading: state is ProfileSaving,
                    onToggle: () => ctx.read<ProfileCubit>().toggleAvailability(),
                  ),
                );
              },
            ),
            Expanded(
              child: BlocBuilder<JobsCubit, JobsState>(
                builder: (ctx, state) {
                  if (state is JobsLoading) return _buildShimmer();
                  if (state is JobsError) return _buildError(ctx, state.message);
                  if (state is JobsLoaded) {
                    return BlocBuilder<ProfileCubit, ProfileState>(
                      builder: (pctx, pstate) {
                        final isAvailable = switch (pstate) {
                          ProfileLoaded(profile: final p) => p.isAvailable,
                          ProfileSaving(profile: final p) => p.isAvailable,
                          _ => true,
                        };
                        return _buildContent(ctx, state, isAvailable);
                      },
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return RiderHeader(
      icon: Icons.work_rounded,
      title: 'Available Jobs',
      subtitle: 'Accept orders to start earning',
      trailing: RiderHeaderAction(
        icon: Icons.refresh_rounded,
        onTap: () => context.read<JobsCubit>().loadJobs(),
      ),
    );
  }

  Widget _buildContent(BuildContext ctx, JobsLoaded state, bool isAvailable) {
    if (!isAvailable && state.assigned.isEmpty) {
      return _buildOffline();
    }
    if (state.pending.isEmpty && state.assigned.isEmpty) {
      return _buildEmpty();
    }
    return RefreshIndicator(
      onRefresh: () => ctx.read<JobsCubit>().loadJobs(),
      color: GodropColors.blue,
      child: ListView(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        children: [
          if (state.assigned.isNotEmpty) ...[
            _sectionLabel('My Active Assignments', GodropColors.orange),
            const SizedBox(height: 10),
            ...state.assigned.map((o) => _JobCard(order: o, isAssigned: true)),
            const SizedBox(height: 20),
          ],
          if (!isAvailable)
            _offlineBanner()
          else if (state.pending.isNotEmpty) ...[
            _sectionLabel('New Orders', GodropColors.blue),
            const SizedBox(height: 10),
            ...state.pending.map((o) => _JobCard(order: o, isAssigned: false)),
            if (state.loadingMore)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Center(
                  child: SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: GodropColors.blue),
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }

  Widget _offlineBanner() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: GodropColors.mute.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: GodropColors.border),
      ),
      child: const Row(
        children: [
          Icon(Icons.power_settings_new_rounded,
              color: GodropColors.mute, size: 18),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              "You're offline. Go online to see new job requests.",
              style: TextStyle(fontSize: 13, color: GodropColors.mute),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOffline() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: GodropColors.mute.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.power_settings_new_rounded,
                color: GodropColors.mute, size: 32),
          ),
          const SizedBox(height: 16),
          const Text(
            "You're offline",
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: GodropColors.ink,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Go online to start receiving job requests.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: GodropColors.mute, height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _sectionLabel(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 3,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: GodropColors.slate,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: GodropColors.blue.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.work_outline_rounded,
                color: GodropColors.blue, size: 32),
          ),
          const SizedBox(height: 16),
          const Text(
            'No jobs right now',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w600,
              color: GodropColors.ink,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'New orders will appear here.\nMake sure you\'re online to receive them.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: GodropColors.mute, height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _buildError(BuildContext ctx, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded, color: GodropColors.mute, size: 40),
            const SizedBox(height: 12),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: GodropColors.slate, fontSize: 14)),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => ctx.read<JobsCubit>().loadJobs(),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: GodropColors.border,
      highlightColor: GodropColors.white,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, __) => Container(
          height: 120,
          decoration: BoxDecoration(
            color: GodropColors.white,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  final RiderOrder order;
  final bool isAssigned;

  const _JobCard({required this.order, required this.isAssigned});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/jobs/${order.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: GodropColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isAssigned
                ? GodropColors.orange.withValues(alpha: 0.3)
                : GodropColors.border,
          ),
          boxShadow: GodropColors.softShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _typeIcon(order.type),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.vendor?.name ?? _typeLabel(order.type),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: GodropColors.ink,
                        ),
                      ),
                      Row(
                        children: [
                          Text(
                            order.trackingCode,
                            style: const TextStyle(
                                fontSize: 12, color: GodropColors.mute),
                          ),
                          if (order.isMultiParcel) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: GodropColors.blue.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '${order.parcelCount} parcels',
                                style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: GodropColors.blue),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      _formatKobo(order.deliveryFeeKobo),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: GodropColors.orange,
                      ),
                    ),
                    Text(
                      'delivery fee',
                      style: const TextStyle(
                          fontSize: 11, color: GodropColors.mute),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 14),
            _locationRow(Icons.radio_button_on_rounded, GodropColors.blue,
                order.pickupAddress),
            const SizedBox(height: 6),
            _locationRow(
                Icons.location_on_rounded,
                GodropColors.error,
                order.isMultiParcel
                    ? '${order.parcelCount} drop-offs'
                    : order.dropoffAddress),
            const SizedBox(height: 12),
            Row(
              children: [
                _chip(order.paymentMethod, Icons.payment_rounded),
                const SizedBox(width: 8),
                _statusChip(order.status, isAssigned),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    gradient: isAssigned
                        ? GodropColors.orangeGradient
                        : GodropColors.blueGradient,
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Text(
                    isAssigned ? 'View' : 'See Details',
                    style: const TextStyle(
                      color: GodropColors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _typeIcon(String type) {
    final iconData = switch (type) {
      'FOOD' => Icons.restaurant_rounded,
      'GROCERY' => Icons.local_grocery_store_rounded,
      'PARCEL' => Icons.inventory_2_rounded,
      'TRUCK' => Icons.local_shipping_rounded,
      _ => Icons.store_rounded,
    };
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: GodropColors.blue.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(iconData, color: GodropColors.blue, size: 20),
    );
  }

  String _typeLabel(String type) => switch (type) {
        'FOOD' => 'Food Order',
        'GROCERY' => 'Grocery Order',
        'PARCEL' => 'Parcel Delivery',
        'TRUCK' => 'Truck Booking',
        'RETAIL' => 'Retail Order',
        'PHARMACY' => 'Pharmacy Order',
        _ => 'Order',
      };

  Widget _locationRow(IconData icon, Color color, String address) {
    return Row(
      children: [
        Icon(icon, color: color, size: 14),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            address,
            style: const TextStyle(fontSize: 13, color: GodropColors.slate),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _chip(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: GodropColors.background,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: GodropColors.mute),
          const SizedBox(width: 4),
          Text(label,
              style: const TextStyle(fontSize: 11, color: GodropColors.slate)),
        ],
      ),
    );
  }

  Widget _statusChip(String status, bool isAssigned) {
    final color = isAssigned ? GodropColors.orange : GodropColors.blue;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 11,
          color: color,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
