import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/team_models.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'team_state.dart';

class TeamCubit extends Cubit<TeamState> {
  TeamCubit() : super(TeamInitial());

  final _service = TeamService(DioClient.instance);

  Future<void> load({bool silent = false}) async {
    if (!silent) emit(TeamLoading());
    try {
      final res = await _service.listTeam();
      emit(TeamLoaded(res.data));
    } on DioException catch (e) {
      emit(TeamError(parseDioError(e)));
    } catch (_) {
      emit(TeamError('Failed to load team.'));
    }
  }

  Future<String?> invite({
    required String email,
    required String firstName,
    required String lastName,
    required String role,
  }) async {
    try {
      await _service.inviteMember(InviteTeamMemberBody(
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: role,
      ));
      await load(silent: true);
      return null;
    } on DioException catch (e) {
      return parseDioError(e);
    } catch (_) {
      return 'Could not send the invite.';
    }
  }

  Future<String?> updateRole(String memberId, String role) async {
    try {
      await _service.updateMember(memberId, UpdateTeamMemberBody(role: role));
      await load(silent: true);
      return null;
    } on DioException catch (e) {
      return parseDioError(e);
    } catch (_) {
      return 'Could not update the role.';
    }
  }

  Future<String?> remove(String memberId) async {
    try {
      await _service.removeMember(memberId);
      await load(silent: true);
      return null;
    } on DioException catch (e) {
      return parseDioError(e);
    } catch (_) {
      return 'Could not remove the member.';
    }
  }
}
