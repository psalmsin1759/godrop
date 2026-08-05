import 'package:flutter/material.dart';
import 'package:new_version_plus/new_version_plus.dart';
import 'package:new_version_plus/model/version_status.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/godrop_button.dart';
import 'user_prefs.dart';

/// Checks Google Play / the App Store for a newer build than the one
/// installed, and if found, prompts the user to update. Never blocks or
/// crashes the app — any failure (offline, store scraping broken, etc.) is
/// swallowed silently.
class AppUpdateService {
  AppUpdateService._();

  static bool _checked = false;

  static Future<void> checkForUpdate(BuildContext context) async {
    if (_checked) return;
    _checked = true;
    try {
      final status = await NewVersionPlus(
        androidId: 'com.qnetix.godropvendor',
        iOSId: 'com.qnetix.godropvendor',
      ).getVersionStatus();
      if (status == null || !status.canUpdate) return;
      if (status.storeVersion == UserPrefs.dismissedUpdateVersion) return;
      if (!context.mounted) return;
      _showDialog(context, status);
    } catch (_) {
      // Ignore — network/parse/platform failures should never surface.
    }
  }

  static void _showDialog(BuildContext context, VersionStatus status) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (dCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Update available'),
        content: const Text(
          'A new version of GoDrop Vendor is available. Update now for the latest features and fixes.',
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          TextButton(
            onPressed: () {
              UserPrefs.saveDismissedUpdateVersion(status.storeVersion);
              Navigator.pop(dCtx);
            },
            child: const Text('Not now'),
          ),
          GodropButton(
            label: 'Update',
            fullWidth: false,
            height: 40,
            onTap: () async {
              Navigator.pop(dCtx);
              try {
                await launchUrl(Uri.parse(status.appStoreLink),
                    mode: LaunchMode.externalApplication);
              } catch (_) {}
            },
          ),
        ],
      ),
    );
  }
}
