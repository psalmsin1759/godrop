import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/user_prefs.dart';

class DeliveryAddressCubit extends Cubit<String> {
  DeliveryAddressCubit() : super(UserPrefs.deliveryAddress);

  Future<void> setAddress(String address) async {
    await UserPrefs.saveDeliveryAddress(address);
    emit(address);
  }
}
