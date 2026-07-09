import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/admin_models.dart';
import '../../../shared/services/user_prefs.dart';

/// Holds the signed-in vendor admin for role-gating across the app.
/// `null` means the profile hasn't loaded yet; role falls back to the
/// locally cached value so the UI can gate immediately.
class SessionCubit extends Cubit<VendorAdmin?> {
  SessionCubit() : super(null);

  final _profileService = ProfileService(DioClient.instance);

  String get role => state?.role ?? UserPrefs.adminRole;
  bool get isOwner => role == 'OWNER';
  bool get isManagerOrAbove => role == 'OWNER' || role == 'MANAGER';

  void set(VendorAdmin admin) => emit(admin);

  Future<void> load() async {
    try {
      final res = await _profileService.getProfile();
      await UserPrefs.saveSession(
        name: res.data.fullName,
        email: res.data.email,
        role: res.data.role,
        vendorName: res.data.vendor?.name ?? '',
      );
      emit(res.data);
    } on DioException catch (_) {
      // Keep cached session; screens surface their own errors.
    } catch (_) {}
  }

  void clear() => emit(null);
}
