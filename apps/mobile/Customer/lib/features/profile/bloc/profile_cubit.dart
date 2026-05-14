import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/profile_models.dart';
import '../../../shared/services/user_prefs.dart';
import 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit() : super(ProfileInitial());

  final _profileService = ProfileService(DioClient.instance);
  final _ordersService = OrdersService(DioClient.instance);

  Future<void> load() async {
    if (state is ProfileLoading) return;

    // Emit cached data immediately so screen is populated even offline
    final cachedName = UserPrefs.name;
    if (cachedName.isNotEmpty) {
      final nameParts = cachedName.trim().split(' ');
      emit(ProfileLoaded(
        profile: UserProfile(
          id: '',
          firstName: nameParts.first,
          lastName: nameParts.length > 1 ? nameParts.skip(1).join(' ') : '',
          phone: '',
          email: UserPrefs.email,
          walletBalanceKobo: UserPrefs.walletBalanceKobo,
          avatarUrl: UserPrefs.avatarUrl,
        ),
        addresses: [],
        orderCount: UserPrefs.orderCount,
      ));
    } else {
      emit(ProfileLoading());
    }

    try {
      final profile = await _profileService.getProfile();
      final addrRes = await _profileService.listAddresses();

      int orderCount = UserPrefs.orderCount;
      try {
        final ordersRes = await _ordersService.listOrders(limit: 1);
        orderCount = ordersRes.meta.total;
      } catch (_) {}

      // Persist everything for offline use
      await UserPrefs.saveProfile(
        name: '${profile.firstName} ${profile.lastName}',
        email: profile.email ?? '',
      );
      await UserPrefs.saveWalletBalance(profile.walletBalanceKobo);
      await UserPrefs.saveOrderCount(orderCount);
      await UserPrefs.saveAvatarUrl(profile.avatarUrl);

      emit(ProfileLoaded(
        profile: profile,
        addresses: addrRes.addresses,
        orderCount: orderCount,
      ));
    } on DioException catch (e) {
      if (state is ProfileLoaded) return; // keep cached state
      emit(ProfileError(_parseDioError(e)));
    } catch (_) {
      if (state is ProfileLoaded) return;
      emit(ProfileError('Failed to load profile. Please try again.'));
    }
  }

  Future<void> uploadAvatar(String imagePath) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(imagePath, filename: 'avatar.jpg'),
      });
      final res = await DioClient.instance.post('/me/avatar', data: formData);
      final data = res.data as Map<String, dynamic>;
      final avatarUrl = data['avatarUrl'] as String?;
      if (avatarUrl != null) {
        await UserPrefs.saveAvatarUrl(avatarUrl);
      }
      await load();
    } catch (_) {}
  }

  String _parseDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final msg = data['message'];
      if (msg is String && msg.isNotEmpty) return msg;
    }
    return 'Something went wrong. Please try again.';
  }
}
