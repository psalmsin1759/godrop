import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/profile_models.dart';
import '../../../shared/utils/errors.dart';

sealed class SupportState extends Equatable {
  const SupportState();
  @override
  List<Object?> get props => [];
}

class SupportLoading extends SupportState {}

class SupportLoaded extends SupportState {
  const SupportLoaded(this.faqs);
  final List<Faq> faqs;
  @override
  List<Object?> get props => [faqs];
}

class SupportError extends SupportState {
  const SupportError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class SupportCubit extends Cubit<SupportState> {
  SupportCubit() : super(SupportLoading());

  final _profileService = ProfileService(DioClient.instance);

  Future<void> load() async {
    emit(SupportLoading());
    try {
      final res = await _profileService.getFaqs();
      emit(SupportLoaded(res.data));
    } on DioException catch (e) {
      emit(SupportError(parseDioError(e)));
    } catch (_) {
      emit(const SupportError('Something went wrong. Please try again.'));
    }
  }
}
