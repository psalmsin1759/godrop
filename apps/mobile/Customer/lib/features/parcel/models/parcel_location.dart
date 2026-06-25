import 'package:hive/hive.dart';

class ParcelLocation {
  final double lat;
  final double lng;
  final String name;

  const ParcelLocation({
    required this.lat,
    required this.lng,
    required this.name,
  });
}

/// A single parcel the customer wants to send: its own destination, recipient,
/// and optional description / weight (kg).
class ParcelItem {
  final ParcelLocation dropoff;
  final String recipientName;
  final String recipientPhone;
  final String? description;
  final double? weightKg;

  const ParcelItem({
    required this.dropoff,
    this.recipientName = '',
    this.recipientPhone = '',
    this.description,
    this.weightKg,
  });

  ParcelItem copyWith({
    ParcelLocation? dropoff,
    String? recipientName,
    String? recipientPhone,
    String? description,
    double? weightKg,
  }) =>
      ParcelItem(
        dropoff: dropoff ?? this.dropoff,
        recipientName: recipientName ?? this.recipientName,
        recipientPhone: recipientPhone ?? this.recipientPhone,
        description: description ?? this.description,
        weightKg: weightKg ?? this.weightKg,
      );
}

class ParcelRouteData {
  final ParcelLocation pickup;
  // One or more parcels, each to its own drop-off.
  final List<ParcelItem> parcels;
  final String? vehicleTypeId;
  final String vehicleLabel;
  final int? quotedTotalKobo;
  final int? estimatedMinutes;
  final String paymentMethod;

  const ParcelRouteData({
    required this.pickup,
    required this.parcels,
    this.vehicleTypeId,
    this.vehicleLabel = '',
    this.quotedTotalKobo,
    this.estimatedMinutes,
    this.paymentMethod = 'card',
  });

  bool get isMultiParcel => parcels.length > 1;

  // Back-compat convenience accessors for single-destination widgets/screens.
  ParcelLocation get dropoff => parcels.isNotEmpty
      ? parcels.last.dropoff
      : const ParcelLocation(lat: 6.4281, lng: 3.4219, name: 'Victoria Island');
  List<ParcelLocation> get dropoffLocations =>
      parcels.map((p) => p.dropoff).toList();
  String get recipientName =>
      parcels.isNotEmpty ? parcels.first.recipientName : '';
  String get recipientPhone =>
      parcels.isNotEmpty ? parcels.first.recipientPhone : '';
  String get packageDescription => parcels.isNotEmpty
      ? (parcels.first.description?.isNotEmpty == true
          ? parcels.first.description!
          : 'Parcel delivery')
      : 'Parcel delivery';

  ParcelRouteData copyWith({
    ParcelLocation? pickup,
    List<ParcelItem>? parcels,
    String? vehicleTypeId,
    String? vehicleLabel,
    int? quotedTotalKobo,
    int? estimatedMinutes,
    String? paymentMethod,
  }) =>
      ParcelRouteData(
        pickup: pickup ?? this.pickup,
        parcels: parcels ?? this.parcels,
        vehicleTypeId: vehicleTypeId ?? this.vehicleTypeId,
        vehicleLabel: vehicleLabel ?? this.vehicleLabel,
        quotedTotalKobo: quotedTotalKobo ?? this.quotedTotalKobo,
        estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
        paymentMethod: paymentMethod ?? this.paymentMethod,
      );
}

class ParcelLocationAdapter extends TypeAdapter<ParcelLocation> {
  @override
  final int typeId = 0;

  @override
  ParcelLocation read(BinaryReader reader) => ParcelLocation(
        lat: reader.readDouble(),
        lng: reader.readDouble(),
        name: reader.readString(),
      );

  @override
  void write(BinaryWriter writer, ParcelLocation obj) {
    writer.writeDouble(obj.lat);
    writer.writeDouble(obj.lng);
    writer.writeString(obj.name);
  }
}
