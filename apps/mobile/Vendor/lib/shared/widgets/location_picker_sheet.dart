import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../app/theme.dart';
import '../api/places_service.dart';

/// Bottom sheet for picking a location — current GPS position, popular Lagos
/// areas, and live Google Places search. Ported from the customer app's
/// LocationPickerSheet (minus saved addresses, which vendors don't have).
/// Pops with a [PickedPlace] carrying the resolved lat/lng.
class LocationPickerSheet extends StatefulWidget {
  final String title;
  final bool showCurrentLocation;

  const LocationPickerSheet({
    super.key,
    required this.title,
    this.showCurrentLocation = true,
  });

  @override
  State<LocationPickerSheet> createState() => _LocationPickerSheetState();
}

class _LocationPickerSheetState extends State<LocationPickerSheet> {
  final _controller = TextEditingController();
  final _focus = FocusNode();
  List<PlacesPrediction> _suggestions = [];
  List<String> _popularAreas = [];
  bool _searching = false;
  bool _loadingPopular = true;
  bool _resolving = false;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onChanged);
    _loadPopular();
  }

  Future<void> _loadPopular() async {
    final areas = await PlacesService.fetchPopularAreas();
    if (mounted) {
      setState(() {
        _popularAreas = areas;
        _loadingPopular = false;
      });
    }
  }

  void _onChanged() {
    _debounce?.cancel();
    final q = _controller.text.trim();
    if (q.length < 2) {
      setState(() {
        _suggestions = [];
        _searching = false;
      });
      return;
    }
    setState(() => _searching = true);
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      final res = await PlacesService.autocomplete(q);
      if (mounted) {
        setState(() {
          _suggestions = res;
          _searching = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  Future<void> _selectPrediction(PlacesPrediction p) async {
    setState(() => _resolving = true);
    final name =
        [p.mainText, p.secondaryText].where((s) => s.isNotEmpty).join(', ');
    final loc = await PlacesService.getDetails(p.placeId, name);
    if (!mounted) return;
    if (loc == null) {
      setState(() => _resolving = false);
      return;
    }
    Navigator.of(context).pop(loc);
  }

  Future<void> _useCurrentLocation() async {
    setState(() => _resolving = true);
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (mounted) setState(() => _resolving = false);
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
        locationSettings:
            const LocationSettings(accuracy: LocationAccuracy.high),
      );
      final address =
          await PlacesService.reverseGeocode(pos.latitude, pos.longitude);
      if (!mounted) return;
      Navigator.of(context).pop(PickedPlace(
          lat: pos.latitude,
          lng: pos.longitude,
          name: address ?? 'Current location'));
    } catch (_) {
      if (mounted) setState(() => _resolving = false);
    }
  }

  Future<void> _selectPopularArea(String name) async {
    setState(() => _resolving = true);
    final predictions = await PlacesService.autocomplete(name);
    if (predictions.isEmpty) {
      if (mounted) setState(() => _resolving = false);
      return;
    }
    final loc =
        await PlacesService.getDetails(predictions.first.placeId, name);
    if (!mounted) return;
    if (loc == null) {
      setState(() => _resolving = false);
      return;
    }
    Navigator.of(context).pop(loc);
  }

  @override
  Widget build(BuildContext context) {
    final viewInset = MediaQuery.of(context).viewInsets.bottom;
    final bottomPad = MediaQuery.of(context).padding.bottom;
    final screenHeight = MediaQuery.of(context).size.height;
    final showingSearch = _controller.text.trim().length >= 2;

    return Padding(
      padding: EdgeInsets.only(bottom: viewInset),
      child: Container(
        constraints: BoxConstraints(maxHeight: screenHeight * 0.85),
        decoration: const BoxDecoration(
          color: GodropColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Stack(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: GodropColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          widget.title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: GodropColors.ink,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.of(context).pop(),
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: GodropColors.background,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.close_rounded,
                              size: 18, color: GodropColors.slate),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    decoration: BoxDecoration(
                      color: GodropColors.background,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: TextField(
                      controller: _controller,
                      focusNode: _focus,
                      autofocus: true,
                      style: const TextStyle(
                          fontSize: 15, color: GodropColors.ink),
                      decoration: InputDecoration(
                        hintText: 'Search for your store address...',
                        hintStyle: const TextStyle(
                            color: GodropColors.mute, fontSize: 15),
                        prefixIcon: const Icon(Icons.search_rounded,
                            color: GodropColors.slate, size: 20),
                        suffixIcon: _searching
                            ? const Padding(
                                padding: EdgeInsets.all(14),
                                child: SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: GodropColors.blue),
                                ),
                              )
                            : (_controller.text.isNotEmpty
                                ? GestureDetector(
                                    onTap: () => _controller.clear(),
                                    child: const Icon(Icons.close_rounded,
                                        color: GodropColors.mute, size: 18),
                                  )
                                : null),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding:
                            const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: showingSearch
                      ? _buildSearchResults()
                      : _buildDefaultContent(),
                ),
                SizedBox(height: bottomPad),
              ],
            ),
            if (_resolving)
              Positioned.fill(
                child: Container(
                  color: GodropColors.card.withValues(alpha: 0.7),
                  child: const Center(
                    child:
                        CircularProgressIndicator(color: GodropColors.blue),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchResults() {
    if (_suggestions.isEmpty && !_searching) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 32),
        child: Center(
          child: Text(
            'No matches found',
            style: TextStyle(color: GodropColors.mute, fontSize: 14),
          ),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
      itemCount: _suggestions.length,
      itemBuilder: (_, i) {
        final p = _suggestions[i];
        return _PickerRow(
          icon: Icons.location_on_outlined,
          iconBg: GodropColors.background,
          iconColor: GodropColors.slate,
          title: p.mainText,
          subtitle: p.secondaryText.isNotEmpty ? p.secondaryText : null,
          onTap: () => _selectPrediction(p),
        );
      },
    );
  }

  Widget _buildDefaultContent() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
      children: [
        if (widget.showCurrentLocation)
          _PickerRow(
            icon: Icons.my_location_rounded,
            iconGradient: GodropColors.blueGradient,
            title: 'Use current location',
            subtitle: "Pin your live GPS position — best if you're at the store",
            onTap: _useCurrentLocation,
          ),
        const _PickerSectionLabel('Popular in Lagos'),
        if (_loadingPopular)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Center(
              child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: GodropColors.blue),
              ),
            ),
          )
        else if (_popularAreas.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Text(
              'No suggestions available right now.',
              style: TextStyle(color: GodropColors.mute, fontSize: 13),
            ),
          )
        else
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _popularAreas
                  .map((area) => GestureDetector(
                        onTap: () => _selectPopularArea(area),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 9),
                          decoration: BoxDecoration(
                            color: GodropColors.background,
                            borderRadius: BorderRadius.circular(100),
                            border:
                                Border.all(color: GodropColors.border),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.place_rounded,
                                  size: 14, color: GodropColors.orange),
                              const SizedBox(width: 6),
                              Text(
                                area.split(',').first,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: GodropColors.ink,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ))
                  .toList(),
            ),
          ),
      ],
    );
  }
}

class _PickerSectionLabel extends StatelessWidget {
  final String label;
  const _PickerSectionLabel(this.label);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 12, 8, 8),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: GodropColors.mute,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _PickerRow extends StatelessWidget {
  final IconData icon;
  final Color? iconBg;
  final Color? iconColor;
  final LinearGradient? iconGradient;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _PickerRow({
    required this.icon,
    required this.title,
    required this.onTap,
    this.iconBg,
    this.iconColor,
    this.iconGradient,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconGradient == null ? iconBg : null,
                gradient: iconGradient,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon,
                  size: 20,
                  color: iconGradient == null
                      ? (iconColor ?? GodropColors.slate)
                      : Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: GodropColors.ink,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle!,
                      style: const TextStyle(
                          fontSize: 12, color: GodropColors.slate),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
