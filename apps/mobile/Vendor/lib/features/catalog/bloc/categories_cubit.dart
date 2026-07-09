import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/catalog_models.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'categories_state.dart';

class CategoriesCubit extends Cubit<CategoriesState> {
  CategoriesCubit() : super(CategoriesInitial());

  final _service = CatalogService(DioClient.instance);

  Future<void> load({bool silent = false}) async {
    if (!silent) emit(CategoriesLoading());
    try {
      final res = await _service.listCategories();
      emit(CategoriesLoaded(res.data));
    } on DioException catch (e) {
      emit(CategoriesError(parseDioError(e)));
    } catch (_) {
      emit(CategoriesError('Failed to load categories.'));
    }
  }

  Future<String?> save({
    String? id,
    required String name,
    String? description,
    String? imageUrl,
    int? sortOrder,
  }) async {
    try {
      final body = CategoryBody(
        name: name,
        description: description,
        imageUrl: imageUrl,
        sortOrder: sortOrder,
      );
      if (id == null) {
        await _service.createCategory(body);
      } else {
        await _service.updateCategory(id, body);
      }
      await load(silent: true);
      return null;
    } on DioException catch (e) {
      return parseDioError(e);
    } catch (_) {
      return 'Could not save category.';
    }
  }

  Future<String?> toggleActive(String id, bool isActive) async {
    try {
      await _service.toggleCategoryActive(id, ToggleActiveBody(isActive: isActive));
      await load(silent: true);
      return null;
    } on DioException catch (e) {
      return parseDioError(e);
    } catch (_) {
      return 'Could not update category.';
    }
  }

  Future<String?> delete(String id) async {
    try {
      await _service.deleteCategory(id);
      await load(silent: true);
      return null;
    } on DioException catch (e) {
      return parseDioError(e);
    } catch (_) {
      return 'Could not delete category.';
    }
  }
}
