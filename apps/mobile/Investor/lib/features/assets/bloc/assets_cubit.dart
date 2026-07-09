import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/invest_models.dart';
import '../../../shared/utils/errors.dart';

sealed class AssetsState extends Equatable {
  const AssetsState();
  @override
  List<Object?> get props => [];
}

class AssetsInitial extends AssetsState {}

class AssetsLoading extends AssetsState {}

class AssetsLoaded extends AssetsState {
  const AssetsLoaded(this.assets, {this.vehicleClass});
  final List<InvestmentAsset> assets;
  final String? vehicleClass;
  @override
  List<Object?> get props => [assets, vehicleClass];
}

class AssetsError extends AssetsState {
  const AssetsError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class AssetsCubit extends Cubit<AssetsState> {
  AssetsCubit() : super(AssetsInitial());

  final _investService = InvestService(DioClient.instance);

  Future<void> load({String? vehicleClass}) async {
    emit(AssetsLoading());
    try {
      final res = await _investService.getAssets(vehicleClass: vehicleClass);
      emit(AssetsLoaded(res.data, vehicleClass: vehicleClass));
    } on DioException catch (e) {
      emit(AssetsError(parseDioError(e)));
    } catch (_) {
      emit(const AssetsError('Something went wrong. Please try again.'));
    }
  }
}
