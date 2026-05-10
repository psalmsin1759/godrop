import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/rider_models.dart';
import '../../../shared/services/token_storage.dart';
import 'jobs_state.dart';

class JobsCubit extends Cubit<JobsState> {
  JobsCubit() : super(const JobsInitial());

  final _service = RiderOrdersService(DioClient.instance);
  WebSocketChannel? _channel;
  StreamSubscription? _wsSub;
  StreamSubscription? _fcmSub;
  bool _connecting = false;

  static Uri _buildWsUri(String? token) {
    final query = token != null ? '?token=${Uri.encodeComponent(token)}' : '';
    return Uri.parse('wss://godrop-production.up.railway.app/ws/rider/jobs$query');
  }

  void connectJobStream() {
    _listenFcm();
    if (_channel != null || _connecting) return;
    _doConnect();
  }

  Future<void> _doConnect() async {
    if (_connecting || _channel != null || isClosed) return;
    _connecting = true;
    try {
      final token = await TokenStorage.getAccessToken();
      if (isClosed) return;
      final uri = _buildWsUri(token);
      debugPrint('[WS/Rider] Connecting to $uri');
      final channel = WebSocketChannel.connect(uri);
      await channel.ready; // throws on TCP/TLS failure — caught below
      if (isClosed) { channel.sink.close(); return; }
      _channel = channel;
      debugPrint('[WS/Rider] Connected');
      _wsSub = _channel!.stream.listen(
        _onWsMessage,
        onError: (e) {
          debugPrint('[WS/Rider] Error: $e — reconnecting in 5s');
          _closeChannel();
          _scheduleReconnect();
        },
        onDone: () {
          debugPrint('[WS/Rider] Connection closed — reconnecting in 5s');
          _closeChannel();
          _scheduleReconnect();
        },
      );
    } catch (e) {
      debugPrint('[WS/Rider] Connect failed: $e — reconnecting in 5s');
      _closeChannel();
      _scheduleReconnect();
    } finally {
      _connecting = false;
    }
  }

  void _listenFcm() {
    _fcmSub ??= FirebaseMessaging.onMessage.listen((message) {
      final type = message.data['type'] as String? ?? 'unknown';
      debugPrint('[FCM/Rider] Foreground message | type=$type');
      if (type == 'NEW_ORDER' && state is! JobsLoading) loadJobs();
    });
  }

  void _closeChannel() {
    _wsSub?.cancel();
    _channel?.sink.close();
    _channel = null;
    _wsSub = null;
  }

  void _scheduleReconnect() {
    if (isClosed) return;
    Future.delayed(const Duration(seconds: 5), () {
      if (!isClosed && _channel == null && !_connecting) _doConnect();
    });
  }

  void _onWsMessage(dynamic raw) {
    final Map<String, dynamic> msg;
    try {
      msg = jsonDecode(raw as String) as Map<String, dynamic>;
    } catch (_) { return; }

    final type = msg['type'] as String? ?? 'unknown';
    debugPrint('[WS/Rider] Message received | type=$type');

    if (type != 'NEW_ORDER') return;

    // Always reload from the API so stale/taken orders are cleared at the same time
    if (state is! JobsLoading) loadJobs();
  }

  @override
  Future<void> close() {
    _fcmSub?.cancel();
    _closeChannel();
    return super.close();
  }

  Future<void> loadJobs() async {
    emit(const JobsLoading());
    try {
      final availableData =
          await _service.listAvailableOrders() as Map<String, dynamic>;
      final assignedData =
          await _service.listOrders(status: 'ACCEPTED') as Map<String, dynamic>;

      final pending = (availableData['data'] as List)
          .map((j) => RiderOrder.fromJson(j as Map<String, dynamic>))
          .toList();
      final assigned = (assignedData['data'] as List)
          .map((j) => RiderOrder.fromJson(j as Map<String, dynamic>))
          .toList();

      emit(JobsLoaded(pending: pending, assigned: assigned));
    } on DioException catch (e) {
      emit(JobsError(_parseError(e)));
    }
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['error'];
    if (message is String) return message;
    return 'Failed to load jobs. Pull down to retry.';
  }
}

class JobDetailCubit extends Cubit<JobDetailState> {
  JobDetailCubit() : super(const JobDetailInitial());

  final _service = RiderOrdersService(DioClient.instance);

  Future<void> loadOrder(String orderId) async {
    emit(const JobDetailLoading());
    try {
      final data =
          await _service.getOrder(orderId) as Map<String, dynamic>;
      final order =
          RiderOrderDetail.fromJson(data['data'] as Map<String, dynamic>);
      emit(JobDetailLoaded(order));
    } on DioException catch (e) {
      emit(JobDetailError(_parseError(e)));
    }
  }

  Future<void> acceptOrder(String orderId) async {
    emit(const JobDetailLoading());
    try {
      final data =
          await _service.acceptOrder(orderId) as Map<String, dynamic>;
      final order =
          RiderOrder.fromJson(data['data'] as Map<String, dynamic>);
      emit(JobActionSuccess(order, 'accepted'));
    } on DioException catch (e) {
      emit(JobDetailError(_parseError(e)));
    }
  }

  Future<void> rejectOrder(String orderId, {String? reason}) async {
    emit(const JobDetailLoading());
    try {
      final data = await _service.rejectOrder(
          orderId, {'reason': reason ?? 'Rider declined'}) as Map<String, dynamic>;
      final order =
          RiderOrder.fromJson(data['data'] as Map<String, dynamic>);
      emit(JobActionSuccess(order, 'rejected'));
    } on DioException catch (e) {
      emit(JobDetailError(_parseError(e)));
    }
  }

  String _parseError(DioException e) {
    final message = e.response?.data?['error'];
    if (message is String) return message;
    return 'Something went wrong. Please try again.';
  }
}
