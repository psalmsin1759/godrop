import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../features/parcel/models/parcel_location.dart';

class PlacesPrediction {
  final String placeId;
  final String mainText;
  final String secondaryText;

  const PlacesPrediction({
    required this.placeId,
    required this.mainText,
    required this.secondaryText,
  });
}

class PlacesService {
  static const _key = 'AIzaSyDQrymY31J4gl5ws6SStg42Vpk_AfWFt_U';
  static const _base = 'https://places.googleapis.com/v1';

  static Future<List<PlacesPrediction>> autocomplete(String input) async {
    if (input.trim().length < 2) return [];
    try {
      final uri = Uri.parse('$_base/places:autocomplete');
      final res = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': _key,
        },
        body: json.encode({
          'input': input,
          'includedRegionCodes': ['ng'],
          'locationBias': {
            'circle': {
              'center': {'latitude': 6.5244, 'longitude': 3.3792},
              'radius': 100000.0,
            },
          },
          'languageCode': 'en',
        }),
      );
      final data = json.decode(res.body) as Map<String, dynamic>;
      final suggestions = data['suggestions'] as List? ?? [];
      return suggestions.map((s) {
        final pred = s['placePrediction'] as Map<String, dynamic>;
        final sf = pred['structuredFormat'] as Map<String, dynamic>;
        return PlacesPrediction(
          placeId: pred['placeId'] as String,
          mainText: (sf['mainText']?['text'] ?? '') as String,
          secondaryText: (sf['secondaryText']?['text'] ?? '') as String,
        );
      }).toList();
    } catch (_) {}
    return [];
  }

  /// Converts GPS coordinates to a human-readable address string.
  /// Returns null if geocoding fails.
  static Future<String?> reverseGeocode(double lat, double lng) async {
    try {
      final uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', {
        'latlng': '$lat,$lng',
        'key': _key,
        'language': 'en',
      });
      final res = await http.get(uri);
      final data = json.decode(res.body) as Map<String, dynamic>;
      if (data['status'] != 'OK') return null;
      final results = data['results'] as List;
      if (results.isEmpty) return null;
      return results[0]['formatted_address'] as String;
    } catch (_) {}
    return null;
  }

  /// Returns popular neighbourhood names near Lagos from the Places Nearby Search API.
  static Future<List<String>> fetchPopularAreas() async {
    try {
      final uri = Uri.parse('$_base/places:searchNearby');
      final res = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': _key,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress',
        },
        body: json.encode({
          'includedTypes': ['sublocality'],
          'locationRestriction': {
            'circle': {
              'center': {'latitude': 6.5244, 'longitude': 3.3792},
              'radius': 80000.0,
            },
          },
          'maxResultCount': 15,
        }),
      );
      final data = json.decode(res.body) as Map<String, dynamic>;
      final places = data['places'] as List? ?? [];
      return places
          .map((p) => p['formattedAddress'] as String? ?? '')
          .where((s) => s.isNotEmpty)
          .toList();
    } catch (_) {}
    return [];
  }

  static Future<ParcelLocation?> getDetails(String placeId, String name) async {
    try {
      final uri = Uri.parse('$_base/places/$placeId');
      final res = await http.get(
        uri,
        headers: {
          'X-Goog-Api-Key': _key,
          'X-Goog-FieldMask': 'id,displayName,location',
        },
      );
      final data = json.decode(res.body) as Map<String, dynamic>;
      if (data.containsKey('location')) {
        final loc = data['location'] as Map<String, dynamic>;
        return ParcelLocation(
          lat: (loc['latitude'] as num).toDouble(),
          lng: (loc['longitude'] as num).toDouble(),
          name: name,
        );
      }
    } catch (_) {}
    return null;
  }
}
