import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../app/theme.dart';
import '../../shared/models/profile_models.dart';
import '../../shared/widgets/invest_avatar.dart';
import '../../shared/widgets/invest_button.dart';
import '../../shared/widgets/invest_field.dart';
import '../../shared/widgets/state_views.dart';
import '../../shared/widgets/top_bar.dart';
import 'bloc/profile_cubit.dart';

/// Screen 25 — profile details: avatar with edit dot, editable fields,
/// verified badges on email/phone.
class ProfileDetailsScreen extends StatefulWidget {
  const ProfileDetailsScreen({super.key});

  @override
  State<ProfileDetailsScreen> createState() => _ProfileDetailsScreenState();
}

class _ProfileDetailsScreenState extends State<ProfileDetailsScreen> {
  final _fullName = TextEditingController();
  final _username = TextEditingController();
  final _address = TextEditingController();
  bool _seeded = false;

  @override
  void initState() {
    super.initState();
    final state = context.read<ProfileCubit>().state;
    if (state is! ProfileLoaded) context.read<ProfileCubit>().load();
  }

  @override
  void dispose() {
    _fullName.dispose();
    _username.dispose();
    _address.dispose();
    super.dispose();
  }

  void _seed(ProfileLoaded state) {
    if (_seeded) return;
    _seeded = true;
    _fullName.text = state.investor.fullName;
    _username.text = state.investor.username ?? '';
    _address.text = state.investor.address ?? '';
  }

  Future<void> _save() async {
    final parts = _fullName.text.trim().split(RegExp(r'\s+'));
    final body = UpdateProfileBody(
      firstName: parts.isNotEmpty ? parts.first : null,
      lastName: parts.length > 1 ? parts.sublist(1).join(' ') : null,
      username: _username.text.trim().isEmpty ? null : _username.text.trim(),
      address: _address.text.trim().isEmpty ? null : _address.text.trim(),
    );
    final ok = await context.read<ProfileCubit>().update(body);
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated'),
          backgroundColor: InvestColors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<ProfileCubit, ProfileState>(
          listener: (context, state) {
            if (state is ProfileLoaded && state.error != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text(state.error!),
                    backgroundColor: InvestColors.red),
              );
            }
          },
          builder: (context, state) {
            if (state is ProfileLoading || state is ProfileInitial) {
              return const Column(
                children: [
                  InvestTopBar(title: 'Profile Details'),
                  Expanded(child: LoadingView()),
                ],
              );
            }
            if (state is ProfileError) {
              return Column(
                children: [
                  const InvestTopBar(title: 'Profile Details'),
                  Expanded(
                    child: ErrorView(
                      message: state.message,
                      onRetry: () => context.read<ProfileCubit>().load(),
                    ),
                  ),
                ],
              );
            }
            final loaded = state as ProfileLoaded;
            _seed(loaded);
            final inv = loaded.investor;
            return Column(
              children: [
                const InvestTopBar(title: 'Profile Details'),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
                    children: [
                      Center(
                        child: Stack(
                          children: [
                            InvestAvatar(
                              size: 84,
                              ring: true,
                              initials:
                                  '${inv.firstName.isNotEmpty ? inv.firstName[0] : ''}${inv.lastName.isNotEmpty ? inv.lastName[0] : ''}',
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  color: InvestColors.blue,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color: InvestColors.bg, width: 3),
                                ),
                                child: const Icon(Icons.edit,
                                    size: 14, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 22),
                      InvestField(
                        label: 'Full name',
                        controller: _fullName,
                        icon: Icons.person_outline,
                      ),
                      InvestField(
                        label: 'Username',
                        controller: _username,
                        hint: '@username',
                        icon: Icons.alternate_email,
                      ),
                      _readOnly('Email address', inv.email,
                          verified: inv.isEmailVerified),
                      _readOnly('Phone number', inv.phone,
                          verified: inv.isPhoneVerified),
                      InvestField(
                        label: 'Address',
                        controller: _address,
                        hint: '12B Admiralty Way, Lekki, Lagos',
                        icon: Icons.home_outlined,
                      ),
                      const SizedBox(height: 10),
                      InvestButton(
                        label: 'Save changes',
                        loading: loaded.saving,
                        onPressed: loaded.saving ? null : _save,
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _readOnly(String label, String value, {bool verified = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: InvestColors.sub,
            ),
          ),
          const SizedBox(height: 7),
          Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: InvestColors.raise2,
              borderRadius: BorderRadius.circular(13),
              border: Border.all(color: InvestColors.line),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    value,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: InvestColors.text,
                    ),
                  ),
                ),
                if (verified)
                  const Row(
                    children: [
                      Icon(Icons.check_circle,
                          size: 14, color: InvestColors.green),
                      SizedBox(width: 4),
                      Text(
                        'Verified',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w700,
                          color: InvestColors.green,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
