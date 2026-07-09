// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'home_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

HomeResponse _$HomeResponseFromJson(Map<String, dynamic> json) => HomeResponse(
      investor: Investor.fromJson(json['investor'] as Map<String, dynamic>),
      portfolio:
          InvestorPortfolio.fromJson(json['portfolio'] as Map<String, dynamic>),
      wallets:
          InvestorWallets.fromJson(json['wallets'] as Map<String, dynamic>),
      assetClasses: (json['assetClasses'] as List<dynamic>?)
              ?.map((e) => AssetClassInfo.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      assets: (json['assets'] as List<dynamic>?)
              ?.map((e) => InvestmentAsset.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      recentActivity: (json['recentActivity'] as List<dynamic>?)
              ?.map((e) => InvestorTx.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      unreadNotifications: (json['unreadNotifications'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$HomeResponseToJson(HomeResponse instance) =>
    <String, dynamic>{
      'investor': instance.investor,
      'portfolio': instance.portfolio,
      'wallets': instance.wallets,
      'assetClasses': instance.assetClasses,
      'assets': instance.assets,
      'recentActivity': instance.recentActivity,
      'unreadNotifications': instance.unreadNotifications,
    };
