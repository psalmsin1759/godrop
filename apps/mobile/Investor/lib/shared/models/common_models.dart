import 'package:json_annotation/json_annotation.dart';

part 'common_models.g.dart';

@JsonSerializable()
class Pagination {
  @JsonKey(defaultValue: 1)
  final int page;
  @JsonKey(defaultValue: 20)
  final int limit;
  @JsonKey(defaultValue: 0)
  final int total;
  @JsonKey(defaultValue: 0)
  final int totalPages;

  const Pagination({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) =>
      _$PaginationFromJson(json);
  Map<String, dynamic> toJson() => _$PaginationToJson(this);
}

@JsonSerializable()
class MessageResponse {
  final String? message;

  const MessageResponse({this.message});

  factory MessageResponse.fromJson(Map<String, dynamic> json) =>
      _$MessageResponseFromJson(json);
  Map<String, dynamic> toJson() => _$MessageResponseToJson(this);
}
