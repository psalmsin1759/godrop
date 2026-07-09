import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../shared/api/api.dart';
import '../../../shared/models/catalog_models.dart';
import '../../auth/bloc/auth_cubit.dart' show parseDioError;
import 'products_state.dart';

class ProductsCubit extends Cubit<ProductsState> {
  ProductsCubit() : super(ProductsInitial());

  final _service = CatalogService(DioClient.instance);
  final _upload = UploadService(DioClient.instance);
  String? _categoryFilter;

  String? get categoryFilter => _categoryFilter;

  Future<void> load({String? categoryId, bool silent = false}) async {
    _categoryFilter = categoryId;
    if (!silent) emit(ProductsLoading());
    try {
      final res = await _service.listProducts(categoryId: categoryId);
      emit(ProductsLoaded(
        products: res.data,
        categoryFilter: categoryId,
        total: res.total,
        page: res.page,
      ));
    } on DioException catch (e) {
      emit(ProductsError(parseDioError(e)));
    } catch (_) {
      emit(ProductsError('Failed to load products.'));
    }
  }

  Future<void> loadMore() async {
    final current = state;
    if (current is! ProductsLoaded ||
        current.loadingMore ||
        !current.hasMore) {
      return;
    }
    emit(current.copyWith(loadingMore: true));
    try {
      final res = await _service.listProducts(
          categoryId: _categoryFilter, page: current.page + 1);
      emit(current.copyWith(
        products: [...current.products, ...res.data],
        total: res.total,
        page: res.page,
        loadingMore: false,
      ));
    } catch (_) {
      emit(current.copyWith(loadingMore: false));
    }
  }

  Future<String> uploadImage(String filePath) =>
      _upload.uploadCatalogImage(filePath);

  Future<String?> save({
    String? id,
    required String categoryId,
    required String name,
    String? description,
    required int priceKobo,
    String? imageUrl,
    bool? isAvailable,
    int? stock,
  }) async {
    try {
      final body = ProductBody(
        categoryId: categoryId,
        name: name,
        description: description,
        priceKobo: priceKobo,
        imageUrl: imageUrl,
        isAvailable: isAvailable,
        stock: stock,
      );
      if (id == null) {
        await _service.createProduct(body);
      } else {
        await _service.updateProduct(id, body);
      }
      await load(categoryId: _categoryFilter, silent: true);
      return null;
    } on DioException catch (e) {
      return parseDioError(e);
    } catch (_) {
      return 'Could not save product.';
    }
  }

  /// Optimistic availability toggle; reverts on failure.
  Future<String?> toggleAvailability(String id, bool isAvailable) async {
    final current = state;
    if (current is ProductsLoaded) {
      emit(current.copyWith(
        products: [
          for (final p in current.products)
            p.id == id
                ? Product(
                    id: p.id,
                    categoryId: p.categoryId,
                    name: p.name,
                    description: p.description,
                    priceKobo: p.priceKobo,
                    imageUrl: p.imageUrl,
                    isAvailable: isAvailable,
                    stock: p.stock,
                    category: p.category,
                  )
                : p
        ],
      ));
    }
    try {
      await _service.toggleAvailability(
          id, ToggleAvailabilityBody(isAvailable: isAvailable));
      return null;
    } on DioException catch (e) {
      if (current is ProductsLoaded) emit(current);
      return parseDioError(e);
    } catch (_) {
      if (current is ProductsLoaded) emit(current);
      return 'Could not update availability.';
    }
  }

  Future<String?> delete(String id) async {
    try {
      await _service.deleteProduct(id);
      await load(categoryId: _categoryFilter, silent: true);
      return null;
    } on DioException catch (e) {
      return parseDioError(e);
    } catch (_) {
      return 'Could not delete product.';
    }
  }
}
