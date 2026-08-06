// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dispute_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DisputeOrderSummary _$DisputeOrderSummaryFromJson(Map<String, dynamic> json) =>
    DisputeOrderSummary(
      id: json['id'] as String,
      trackingCode: json['trackingCode'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      totalKobo: (json['totalKobo'] as num).toInt(),
    );

Map<String, dynamic> _$DisputeOrderSummaryToJson(
        DisputeOrderSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'trackingCode': instance.trackingCode,
      'type': instance.type,
      'status': instance.status,
      'totalKobo': instance.totalKobo,
    };

DisputeMessage _$DisputeMessageFromJson(Map<String, dynamic> json) =>
    DisputeMessage(
      id: json['id'] as String,
      disputeId: json['disputeId'] as String,
      senderType: json['senderType'] as String,
      senderId: json['senderId'] as String,
      message: json['message'] as String,
      attachmentUrls: (json['attachmentUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      isInternal: json['isInternal'] as bool? ?? false,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$DisputeMessageToJson(DisputeMessage instance) =>
    <String, dynamic>{
      'id': instance.id,
      'disputeId': instance.disputeId,
      'senderType': instance.senderType,
      'senderId': instance.senderId,
      'message': instance.message,
      'attachmentUrls': instance.attachmentUrls,
      'isInternal': instance.isInternal,
      'createdAt': instance.createdAt,
    };

Dispute _$DisputeFromJson(Map<String, dynamic> json) => Dispute(
      id: json['id'] as String,
      orderId: json['orderId'] as String,
      order:
          DisputeOrderSummary.fromJson(json['order'] as Map<String, dynamic>),
      raisedByType: json['raisedByType'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      evidenceUrls: (json['evidenceUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      status: json['status'] as String,
      resolutionType: json['resolutionType'] as String?,
      resolutionNotes: json['resolutionNotes'] as String?,
      resolutionAmountKobo: (json['resolutionAmountKobo'] as num?)?.toInt(),
      resolvedAt: json['resolvedAt'] as String?,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$DisputeToJson(Dispute instance) => <String, dynamic>{
      'id': instance.id,
      'orderId': instance.orderId,
      'order': instance.order,
      'raisedByType': instance.raisedByType,
      'category': instance.category,
      'description': instance.description,
      'evidenceUrls': instance.evidenceUrls,
      'status': instance.status,
      'resolutionType': instance.resolutionType,
      'resolutionNotes': instance.resolutionNotes,
      'resolutionAmountKobo': instance.resolutionAmountKobo,
      'resolvedAt': instance.resolvedAt,
      'createdAt': instance.createdAt,
    };

DisputeDetail _$DisputeDetailFromJson(Map<String, dynamic> json) =>
    DisputeDetail(
      id: json['id'] as String,
      orderId: json['orderId'] as String,
      order:
          DisputeOrderSummary.fromJson(json['order'] as Map<String, dynamic>),
      raisedByType: json['raisedByType'] as String,
      category: json['category'] as String,
      description: json['description'] as String,
      evidenceUrls: (json['evidenceUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      status: json['status'] as String,
      resolutionType: json['resolutionType'] as String?,
      resolutionNotes: json['resolutionNotes'] as String?,
      resolutionAmountKobo: (json['resolutionAmountKobo'] as num?)?.toInt(),
      resolvedAt: json['resolvedAt'] as String?,
      createdAt: json['createdAt'] as String,
      messages: (json['messages'] as List<dynamic>)
          .map((e) => DisputeMessage.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$DisputeDetailToJson(DisputeDetail instance) =>
    <String, dynamic>{
      'id': instance.id,
      'orderId': instance.orderId,
      'order': instance.order,
      'raisedByType': instance.raisedByType,
      'category': instance.category,
      'description': instance.description,
      'evidenceUrls': instance.evidenceUrls,
      'status': instance.status,
      'resolutionType': instance.resolutionType,
      'resolutionNotes': instance.resolutionNotes,
      'resolutionAmountKobo': instance.resolutionAmountKobo,
      'resolvedAt': instance.resolvedAt,
      'createdAt': instance.createdAt,
      'messages': instance.messages,
    };
