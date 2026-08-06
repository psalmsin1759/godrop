import 'package:json_annotation/json_annotation.dart';

part 'dispute_models.g.dart';

/// Human-facing labels/order kept in sync with the backend's
/// DisputeCategory enum (see apps/backend prisma schema).
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

/// Categories a customer can pick when reporting an issue — excludes
/// CUSTOMER_BEHAVIOR, which only makes sense raised by a vendor/rider.
const customerDisputeCategories = [
  'WRONG_ITEM',
  'MISSING_ITEMS',
  'DAMAGED_ITEM',
  'FOOD_QUALITY',
  'LATE_DELIVERY',
  'NEVER_ARRIVED',
  'RIDER_BEHAVIOR',
  'VENDOR_BEHAVIOR',
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

@JsonSerializable()
class CreateDisputeBody {
  final String orderId;
  final String category;
  final String description;
  final List<String>? evidenceUrls;

  const CreateDisputeBody({
    required this.orderId,
    required this.category,
    required this.description,
    this.evidenceUrls,
  });

  factory CreateDisputeBody.fromJson(Map<String, dynamic> json) =>
      _$CreateDisputeBodyFromJson(json);
  Map<String, dynamic> toJson() => _$CreateDisputeBodyToJson(this);
}

@JsonSerializable()
class AddDisputeMessageBody {
  final String message;

  const AddDisputeMessageBody({required this.message});

  factory AddDisputeMessageBody.fromJson(Map<String, dynamic> json) =>
      _$AddDisputeMessageBodyFromJson(json);
  Map<String, dynamic> toJson() => _$AddDisputeMessageBodyToJson(this);
}

@JsonSerializable()
class DisputeUploadData {
  final String url;

  const DisputeUploadData({required this.url});

  factory DisputeUploadData.fromJson(Map<String, dynamic> json) =>
      _$DisputeUploadDataFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeUploadDataToJson(this);
}

@JsonSerializable()
class DisputeUploadResponse {
  final DisputeUploadData data;

  const DisputeUploadResponse({required this.data});

  factory DisputeUploadResponse.fromJson(Map<String, dynamic> json) =>
      _$DisputeUploadResponseFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeUploadResponseToJson(this);
}

@JsonSerializable()
class DisputeResponse {
  final Dispute data;

  const DisputeResponse({required this.data});

  factory DisputeResponse.fromJson(Map<String, dynamic> json) =>
      _$DisputeResponseFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeResponseToJson(this);
}

@JsonSerializable()
class DisputeDetailResponse {
  final DisputeDetail data;

  const DisputeDetailResponse({required this.data});

  factory DisputeDetailResponse.fromJson(Map<String, dynamic> json) =>
      _$DisputeDetailResponseFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeDetailResponseToJson(this);
}

@JsonSerializable()
class DisputeMessageResponse {
  final DisputeMessage data;

  const DisputeMessageResponse({required this.data});

  factory DisputeMessageResponse.fromJson(Map<String, dynamic> json) =>
      _$DisputeMessageResponseFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeMessageResponseToJson(this);
}

@JsonSerializable()
class DisputeListResponse {
  final List<Dispute> data;

  const DisputeListResponse({required this.data});

  factory DisputeListResponse.fromJson(Map<String, dynamic> json) =>
      _$DisputeListResponseFromJson(json);
  Map<String, dynamic> toJson() => _$DisputeListResponseToJson(this);
}
