import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/widgets/animated_entrance.dart';
import '../food/bloc/cart_cubit.dart';
import '../food/bloc/cart_state.dart';
import '../food/models/restaurant_data.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    return Scaffold(
      backgroundColor: GodropColors.background,
      body: Column(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: GodropColors.blueGradient,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
            ),
            padding: EdgeInsets.fromLTRB(20, topPad + 16, 20, 24),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.shopping_cart_rounded,
                      color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text('My Cart',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
          const Expanded(child: _CartContent()),
        ],
      ),
    );
  }
}

// ── Cart content ────────────────────────────────────────────────────────────

class _CartContent extends StatelessWidget {
  const _CartContent();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CartCubit, CartState>(
      builder: (ctx, state) {
        final carts = state.activeCarts;

        if (carts.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: GodropColors.background,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.shopping_bag_outlined,
                      size: 34, color: GodropColors.mute),
                ),
                const SizedBox(height: 16),
                const Text('Your cart is empty',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: GodropColors.ink)),
                const SizedBox(height: 6),
                const Text(
                    'Add items from restaurants, grocery\nstores, pharmacies or retail shops.',
                    style: TextStyle(
                        fontSize: 13, color: GodropColors.slate, height: 1.5),
                    textAlign: TextAlign.center),
              ],
            ),
          );
        }

        const typeOrder = [
          PartnerType.restaurant,
          PartnerType.grocery,
          PartnerType.retail,
          PartnerType.pharmacy
        ];
        final grouped = <PartnerType, List<VendorCart>>{};
        for (final cart in carts) {
          (grouped[cart.partnerType] ??= []).add(cart);
        }

        final sections =
            typeOrder.where((t) => grouped.containsKey(t)).toList();
        final grandSubtotal = carts.fold(0, (s, c) => s + c.subtotalKobo);
        final grandItems = carts.fold(0, (s, c) => s + c.totalItems);

        int cardIndex = 0;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: [
            for (int si = 0; si < sections.length; si++) ...[
              if (si > 0) const SizedBox(height: 6),
              _TypeSectionHeader(type: sections[si]),
              const SizedBox(height: 8),
              for (final cart in grouped[sections[si]]!) ...[
                AnimatedEntrance(
                  delay: Duration(milliseconds: cardIndex++ * 60),
                  child: _VendorCartCard(cart: cart),
                ),
                const SizedBox(height: 10),
              ],
            ],
            if (carts.length > 1) ...[
              const SizedBox(height: 4),
              _GrandTotalCard(
                  subtotalKobo: grandSubtotal, itemCount: grandItems),
            ],
          ],
        );
      },
    );
  }
}

// ── Type section header ───────────────────────────────────────────────────────

class _TypeSectionHeader extends StatelessWidget {
  final PartnerType type;
  const _TypeSectionHeader({required this.type});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: type.color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(type.icon, color: type.color, size: 15),
        ),
        const SizedBox(width: 8),
        Text(type.label,
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: type.color,
                letterSpacing: 0.2)),
      ],
    );
  }
}

// ── Vendor cart card ──────────────────────────────────────────────────────────

class _VendorCartCard extends StatelessWidget {
  final VendorCart cart;
  const _VendorCartCard({required this.cart});

  static String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  void _confirmClear(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _ClearCartSheet(
        partnerName: cart.partnerName,
        onConfirm: () => context.read<CartCubit>().clearVendor(cart.partnerId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GodropColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: GodropColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Vendor header
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: cart.partnerType.color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(cart.partnerType.icon,
                      color: cart.partnerType.color, size: 19),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(cart.partnerName,
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: GodropColors.ink),
                          overflow: TextOverflow.ellipsis),
                      Text(
                          '${cart.totalItems} item${cart.totalItems == 1 ? '' : 's'}',
                          style: const TextStyle(
                              fontSize: 12, color: GodropColors.mute)),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => _confirmClear(context),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: GodropColors.error.withValues(alpha: 0.07),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Clear',
                        style: TextStyle(
                            fontSize: 12,
                            color: GodropColors.error,
                            fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, indent: 14, endIndent: 14),

          // Items
          ...cart.items.asMap().entries.map((e) {
            final idx = e.key;
            final item = e.value;
            return Column(
              children: [
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 28,
                        child: item.emoji.isNotEmpty
                            ? Text(item.emoji,
                                style: const TextStyle(fontSize: 20))
                            : const Icon(Icons.fastfood_rounded,
                                size: 20, color: GodropColors.mute),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.name,
                                style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: GodropColors.ink),
                                overflow: TextOverflow.ellipsis),
                            Text(_fmt(item.priceKobo),
                                style: const TextStyle(
                                    fontSize: 12,
                                    color: GodropColors.orange,
                                    fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Qty controls
                      Row(
                        children: [
                          _MiniQtyBtn(
                            icon: item.quantity <= 1
                                ? Icons.delete_outline_rounded
                                : Icons.remove_rounded,
                            isDelete: item.quantity <= 1,
                            onTap: () => context
                                .read<CartCubit>()
                                .decrement(cart.partnerId, item.id),
                          ),
                          SizedBox(
                            width: 30,
                            child: Center(
                              child: Text('${item.quantity}',
                                  style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: GodropColors.ink)),
                            ),
                          ),
                          _MiniQtyBtn(
                            icon: Icons.add_rounded,
                            onTap: () => context
                                .read<CartCubit>()
                                .increment(cart.partnerId, item.id),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (idx < cart.items.length - 1)
                  const Divider(height: 1, indent: 50, endIndent: 14),
              ],
            );
          }),

          const Divider(height: 1, indent: 14, endIndent: 14),

          // Subtotal row + checkout button
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Subtotal',
                        style:
                            TextStyle(fontSize: 11, color: GodropColors.mute)),
                    Text(_fmt(cart.subtotalKobo),
                        style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: GodropColors.ink)),
                  ],
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => context
                      .push('/food/cart', extra: {'partnerId': cart.partnerId}),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: GodropColors.blue,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Checkout',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600)),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward_rounded,
                            color: Colors.white, size: 15),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Grand total bar (shown when 2+ vendors) ───────────────────────────────────

class _GrandTotalCard extends StatelessWidget {
  final int subtotalKobo;
  final int itemCount;
  const _GrandTotalCard({required this.subtotalKobo, required this.itemCount});

  static String _fmt(int kobo) =>
      '₦${(kobo / 100).toStringAsFixed(0).replaceAllMapped(RegExp(r'\B(?=(\d{3})+(?!\d))'), (_) => ',')}';

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: GodropColors.blue.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: GodropColors.blue.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          const Icon(Icons.shopping_cart_rounded,
              size: 18, color: GodropColors.blue),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '$itemCount items across multiple stores',
              style: const TextStyle(fontSize: 13, color: GodropColors.slate),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text('Total',
                  style: TextStyle(fontSize: 11, color: GodropColors.mute)),
              Text(_fmt(subtotalKobo),
                  style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: GodropColors.ink)),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Mini qty button ───────────────────────────────────────────────────────────

class _MiniQtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool isDelete;
  const _MiniQtyBtn(
      {required this.icon, required this.onTap, this.isDelete = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 26,
        height: 26,
        decoration: BoxDecoration(
          color: isDelete
              ? GodropColors.error.withValues(alpha: 0.08)
              : GodropColors.background,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Icon(icon,
            size: 14, color: isDelete ? GodropColors.error : GodropColors.ink),
      ),
    );
  }
}

// ── Clear cart confirmation sheet ─────────────────────────────────────────────

class _ClearCartSheet extends StatelessWidget {
  final String partnerName;
  final VoidCallback onConfirm;
  const _ClearCartSheet({required this.partnerName, required this.onConfirm});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24), topRight: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                  color: GodropColors.border,
                  borderRadius: BorderRadius.circular(2)),
            ),
            const SizedBox(height: 20),
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: GodropColors.error.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.delete_outline_rounded,
                  size: 28, color: GodropColors.error),
            ),
            const SizedBox(height: 14),
            Text('Clear $partnerName?',
                style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: GodropColors.ink),
                textAlign: TextAlign.center),
            const SizedBox(height: 6),
            const Text('All items in this cart will be removed.',
                style: TextStyle(fontSize: 13, color: GodropColors.slate),
                textAlign: TextAlign.center),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      height: 46,
                      decoration: BoxDecoration(
                        color: GodropColors.background,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: const Text('Keep items',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: GodropColors.ink)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                      onConfirm();
                    },
                    child: Container(
                      height: 46,
                      decoration: BoxDecoration(
                        color: GodropColors.error,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: const Text('Clear cart',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: Colors.white)),
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
}
