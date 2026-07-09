import 'package:json_annotation/json_annotation.dart';
import 'auth_models.dart';
import 'invest_models.dart';
import 'wallet_models.dart';

part 'home_models.g.dart';

/// `GET /investor/home` — everything the home screen needs in one call.
@JsonSerializable()
class HomeResponse {
  final Investor investor;
  final InvestorPortfolio portfolio;
  final InvestorWallets wallets;
  @JsonKey(defaultValue: [])
  final List<AssetClassInfo> assetClasses;
  @JsonKey(defaultValue: [])
  final List<InvestmentAsset> assets;
  @JsonKey(defaultValue: [])
  final List<InvestorTx> recentActivity;
  @JsonKey(defaultValue: 0)
  final int unreadNotifications;

  const HomeResponse({
    required this.investor,
    required this.portfolio,
    required this.wallets,
    required this.assetClasses,
    required this.assets,
    required this.recentActivity,
    required this.unreadNotifications,
  });

  factory HomeResponse.fromJson(Map<String, dynamic> json) =>
      _$HomeResponseFromJson(json);
  Map<String, dynamic> toJson() => _$HomeResponseToJson(this);
}
