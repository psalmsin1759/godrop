import 'package:json_annotation/json_annotation.dart';

part 'dispute_models.g.dart';

const disputeCategories = <String, String>{
  'WRONG_ITEM': 'Wrong item',
  'MISSING_ITEMS': 'Missing items',
  'DAMAGED_ITEM': 'Damaged item',
  'FOOD_QUALITY': 'Food quality',
  'LATE_DELIVERY': 'Late delivery',
  'NEVER_ARRIVED': 'Never arrived',
  'RIDER_BEHAVIOR': 'Rider behavior',
  'VENDOR_BEHAVIOR': 'Vendor behavior',
  'CUSTOMER_BEHAVIOR': 'Customer behavior',
  'PAYMENT_ISSUE': 'Payment issue',
  'OTHER': 'Other',
};

/// Categories relevant to a rider reporting a problem on a delivery —
/// excludes RIDER_BEHAVIOR, which is for others to report against them.
const riderDisputeCategories = [
  'CUSTOMER_BEHAVIOR',
  'VENDOR_BEHAVIOR',
  'LATE_DELIVERY',
  'PAYMENT_ISSUE',
  'OTHER',
];

@JsonSerializable()
class DisputeOrderSummary {
  final String id;
  final String trackingCode;
  final String type;
  final String status;
  final int totalKobo;

  const DisputeOrderSummary({
    required this.id,
    required this.trackingCode,
    required this.type,
    required this.status,
    required this.totalKobo,
  });

  factory DisputeOrderSummary.fromJson(Map<String, dynamic> json) =>
      _$DisputeOrderSummaryFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeOrderSummaryToJson(this);
}

@JsonSerializable()
class DisputeMessage {
  final String id;
  final String disputeId;
  final String senderType;
  final String senderId;
  final String message;
  @JsonKey(defaultValue: [])
  final List<String> attachmentUrls;
  @JsonKey(defaultValue: false)
  final bool isInternal;
  final String createdAt;

  const DisputeMessage({
    required this.id,
    required this.disputeId,
    required this.senderType,
    required this.senderId,
    required this.message,
    required this.attachmentUrls,
    required this.isInternal,
    required this.createdAt,
  });

  factory DisputeMessage.fromJson(Map<String, dynamic> json) =>
      _$DisputeMessageFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeMessageToJson(this);
}

@JsonSerializable()
class Dispute {
  final String id;
  final String orderId;
  final DisputeOrderSummary order;
  final String raisedByType;
  final String category;
  final String description;
  @JsonKey(defaultValue: [])
  final List<String> evidenceUrls;
  final String status;
  final String? resolutionType;
  final String? resolutionNotes;
  final int? resolutionAmountKobo;
  final String? resolvedAt;
  final String createdAt;

  const Dispute({
    required this.id,
    required this.orderId,
    required this.order,
    required this.raisedByType,
    required this.category,
    required this.description,
    required this.evidenceUrls,
    required this.status,
    this.resolutionType,
    this.resolutionNotes,
    this.resolutionAmountKobo,
    this.resolvedAt,
    required this.createdAt,
  });

  factory Dispute.fromJson(Map<String, dynamic> json) =>
      _$DisputeFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeToJson(this);
}

@JsonSerializable()
class DisputeDetail extends Dispute {
  final List<DisputeMessage> messages;

  const DisputeDetail({
    required super.id,
    required super.orderId,
    required super.order,
    required super.raisedByType,
    required super.category,
    required super.description,
    required super.evidenceUrls,
    required super.status,
    super.resolutionType,
    super.resolutionNotes,
    super.resolutionAmountKobo,
    super.resolvedAt,
    required super.createdAt,
    required this.messages,
  });

  factory DisputeDetail.fromJson(Map<String, dynamic> json) =>
      _$DisputeDetailFromJson(json);
  @override
  Map<String, dynamic> toJson() => _$DisputeDetailToJson(this);
}
