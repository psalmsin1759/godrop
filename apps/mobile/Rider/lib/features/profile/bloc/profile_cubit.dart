import 'dart:async';
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import '../../../shared/services/rider_prefs.dart';
import 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit() : super(const ProfileInitial()) {
    _ratingSub = FirebaseMessaging.onMessage.listen(_onRiderRated);
    _ratingOpenedSub = FirebaseMessaging.onMessageOpenedApp.listen(_onRiderRated);
  }

  final _service = RiderProfileService(DioClient.instance);
  StreamSubscription<RemoteMessage>? _ratingSub;
  StreamSubscription<RemoteMessage>? _ratingOpenedSub;

  /// Reflects a new customer rating in real time as soon as the FCM
  /// "RIDER_RATED" push arrives — no need to reload the whole profile.
  void _onRiderRated(RemoteMessage message) {
    if (message.data['type'] != 'RIDER_RATED') return;
    final rating = double.tryParse(message.data['rating'] ?? '');
    final ratingCount = int.tryParse(message.data['ratingCount'] ?? '');
    if (rating == null || ratingCount == null) return;

    final current = state;
    if (current is ProfileLoaded) {
      emit(ProfileLoaded(current.profile.copyWithRating(rating: rating, ratingCount: ratingCount)));
    } else if (current is ProfileSaving) {
      emit(ProfileSaving(current.profile.copyWithRating(rating: rating, ratingCount: ratingCount)));
    }
  }

  @override
  Future<void> close() {
    _ratingSub?.cancel();
    _ratingOpenedSub?.cancel();
    return super.close();
  }

  Future<void> loadProfile() async {
    emit(const ProfileLoading());
    try {
      final data = await _service.getProfile() as Map<String, dynamic>;
      final profile = RiderProfile.fromJson(data['data'] as Map<String, dynamic>);
      emit(ProfileLoaded(profile));
    } on DioException catch (e) {
      emit(ProfileError(_parseError(e)));
    }
  }

  Future<void> toggleAvailability() async {
    final current = state;
    if (current is! ProfileLoaded) return;
    emit(ProfileSaving(current.profile));
    try {
      final data = await _service
          .setAvailability({'isAvailable': !current.profile.isAvailable})
          as Map<String, dynamic>;
      final profile = RiderProfile.fromJson(data['data'] as Map<String, dynamic>);
      await RiderPrefs.saveProfile(
        id: profile.id,
        name: profile.fullName,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      );
      emit(ProfileLoaded(profile));
    } on DioException catch (e) {
      emit(ProfileError(_parseError(e)));
    }
  }

  Future<void> updateBankAccount({
    required String bankName,
    required String bankCode,
    required String accountNumber,
    required String accountName,
  }) async {
    final current = state;
    if (current is! ProfileLoaded) return;
    emit(ProfileSaving(current.profile));
    try {
      final data = await _service.updateBank({
        'bankName': bankName,
        'bankCode': bankCode,
        'accountNumber': accountNumber,
        'accountName': accountName,
      }) as Map<String, dynamic>;
      final profile = RiderProfile.fromJson(data['data'] as Map<String, dynamic>);
      emit(ProfileLoaded(profile));
    } on DioException catch (e) {
      emit(ProfileError(_parseError(e)));
    }
  }

  Future<void> submitKyc(Map<String, dynamic> kycData) async {
    final current = state;
    if (current is! ProfileLoaded) return;
    emit(ProfileSaving(current.profile));
    try {
      final data =
          await _service.submitKyc(kycData) as Map<String, dynamic>;
      final profile = RiderProfile.fromJson(data['data'] as Map<String, dynamic>);
      emit(ProfileLoaded(profile));
    } on DioException catch (e) {
      emit(ProfileError(_parseError(e)));
    }
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['error'];
    if (message is String) return message;
    return 'Something went wrong. Please try again.';
  }
}
