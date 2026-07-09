import 'dart:io';

import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/auth_models.dart';
import '../../../shared/models/profile_models.dart';
import '../../../shared/utils/errors.dart';

sealed class KycState extends Equatable {
  const KycState();
  @override
  List<Object?> get props => [];
}

class KycLoading extends KycState {}

class KycLoaded extends KycState {
  const KycLoaded(this.kyc, {this.submitting = false, this.error});
  final InvestorKyc kyc;
  final bool submitting;
  final String? error;
  @override
  List<Object?> get props => [kyc, submitting, error];
}

class KycError extends KycState {
  const KycError(this.message);
  final String message;
  @override
  List<Object?> get props => [message];
}

class KycCubit extends Cubit<KycState> {
  KycCubit() : super(KycLoading());

  final _profileService = ProfileService(DioClient.instance);

  Future<void> load() async {
    emit(KycLoading());
    try {
      final res = await _profileService.getKyc();
      emit(KycLoaded(res.data));
    } on DioException catch (e) {
      emit(KycError(parseDioError(e)));
    } catch (_) {
      emit(const KycError('Something went wrong. Please try again.'));
    }
  }

  Future<bool> submitBvn(String bvn) => _submit(
      () async => (await _profileService.submitBvn(BvnBody(bvn: bvn))).data);

  Future<bool> uploadId(File document) => _submit(
      () async => (await _profileService.uploadIdDocument(document)).data);

  Future<bool> uploadAddressProof(File document) => _submit(
      () async => (await _profileService.uploadAddressProof(document)).data);

  Future<bool> _submit(Future<InvestorKyc> Function() call) async {
    final current = state;
    if (current is KycLoaded) emit(KycLoaded(current.kyc, submitting: true));
    try {
      final kyc = await call();
      emit(KycLoaded(kyc));
      return true;
    } on DioException catch (e) {
      final base = state;
      if (base is KycLoaded) {
        emit(KycLoaded(base.kyc, error: parseDioError(e)));
      } else {
        emit(KycError(parseDioError(e)));
      }
      return false;
    }
  }
}
