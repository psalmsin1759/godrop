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

class ParcelRouteData {
  final ParcelLocation pickup;
  final ParcelLocation dropoff;
  final String? vehicleTypeId;
  final String vehicleLabel;
  final int? quotedTotalKobo;
  final int? estimatedMinutes;
  final String paymentMethod;
  final String recipientName;
  final String recipientPhone;
  final String packageDescription;

  const ParcelRouteData({
    required this.pickup,
    required this.dropoff,
    this.vehicleTypeId,
    this.vehicleLabel = '',
    this.quotedTotalKobo,
    this.estimatedMinutes,
    this.paymentMethod = 'cash',
    this.recipientName = '',
    this.recipientPhone = '',
    this.packageDescription = 'Parcel delivery',
  });
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
