import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/home_models.dart';
import '../../../shared/services/user_prefs.dart';
import '../../../shared/utils/errors.dart';

sealed class HomeState extends Equatable {
  const HomeState();
  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  const HomeLoaded(this.data, {required this.balanceHidden});
  final HomeResponse data;
  final bool balanceHidden;
  @override
  List<Object?> get props => [data, balanceHidden];
}

class HomeError extends HomeState {
  const HomeError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class HomeCubit extends Cubit<HomeState> {
  HomeCubit() : super(HomeInitial());

  final _investService = InvestService(DioClient.instance);

  Future<void> load({bool silent = false}) async {
    if (!silent) emit(HomeLoading());
    try {
      final data = await _investService.getHome();
      emit(HomeLoaded(data, balanceHidden: UserPrefs.balanceHidden));
    } on DioException catch (e) {
      emit(HomeError(parseDioError(e)));
    } catch (_) {
      emit(const HomeError('Something went wrong. Please try again.'));
    }
  }

  Future<void> toggleBalanceHidden() async {
    final current = state;
    if (current is! HomeLoaded) return;
    await UserPrefs.setBalanceHidden(!current.balanceHidden);
    emit(HomeLoaded(current.data, balanceHidden: !current.balanceHidden));
  }
}
