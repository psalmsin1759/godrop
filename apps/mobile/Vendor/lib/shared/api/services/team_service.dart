import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../models/team_models.dart';
import '../../models/common_models.dart';

part 'team_service.g.dart';

@RestApi()
abstract class TeamService {
  factory TeamService(Dio dio, {String? baseUrl}) = _TeamService;

  @GET('/vendor-admin/team')
  Future<TeamListResponse> listTeam();

  @POST('/vendor-admin/team')
  Future<TeamMemberResponse> inviteMember(@Body() InviteTeamMemberBody body);

  @PATCH('/vendor-admin/team/{memberId}')
  Future<TeamMemberResponse> updateMember(
      @Path('memberId') String memberId, @Body() UpdateTeamMemberBody body);

  @DELETE('/vendor-admin/team/{memberId}')
  Future<MessageResponse> removeMember(@Path('memberId') String memberId);
}
