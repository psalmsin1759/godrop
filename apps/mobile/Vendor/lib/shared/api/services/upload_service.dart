import 'package:dio/dio.dart';
import '../../models/catalog_models.dart';

/// Multipart catalog-image upload — plain Dio because retrofit's multipart
/// codegen adds little for a single endpoint.
class UploadService {
  final Dio _dio;
  UploadService(this._dio);

  Future<String> uploadCatalogImage(String filePath) async {
    final form = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final res = await _dio.post(
      '/vendor-admin/catalog/image',
      data: form,
      options: Options(contentType: 'multipart/form-data'),
    );
    final data = res.data as Map<String, dynamic>;
    return UploadedImage.fromJson(data['data'] as Map<String, dynamic>).url;
  }

  Future<String> uploadDisputeEvidence(String filePath) async {
    final form = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final res = await _dio.post(
      '/vendor-admin/disputes/upload',
      data: form,
      options: Options(contentType: 'multipart/form-data'),
    );
    final data = res.data as Map<String, dynamic>;
    return UploadedImage.fromJson(data['data'] as Map<String, dynamic>).url;
  }
}
