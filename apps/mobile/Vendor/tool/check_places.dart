// Diagnostic: exercises the exact code path the onboarding address picker
// uses. Run with: dart run tool/check_places.dart
import '../lib/shared/api/places_service.dart';

Future<void> main() async {
  print('autocomplete("Ikeja City Mall")...');
  final preds = await PlacesService.autocomplete('Ikeja City Mall');
  print('  -> ${preds.length} predictions');
  for (final p in preds.take(3)) {
    print('     ${p.mainText} | ${p.secondaryText}');
  }

  print('fetchPopularAreas()...');
  final areas = await PlacesService.fetchPopularAreas();
  print('  -> ${areas.length} areas');

  print('reverseGeocode(6.5244, 3.3792)...');
  final addr = await PlacesService.reverseGeocode(6.5244, 3.3792);
  print('  -> $addr');
}
