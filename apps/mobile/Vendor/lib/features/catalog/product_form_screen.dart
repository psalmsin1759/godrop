import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme.dart';
import '../../shared/models/catalog_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import 'bloc/categories_cubit.dart';
import 'bloc/categories_state.dart';
import 'bloc/products_cubit.dart';

/// Create/edit product form. Pass an existing [Product] as router `extra`
/// to edit; omit for create.
class ProductFormScreen extends StatefulWidget {
  final Product? product;
  const ProductFormScreen({super.key, this.product});

  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  late final _nameCtrl = TextEditingController(text: widget.product?.name);
  late final _descCtrl =
      TextEditingController(text: widget.product?.description);
  late final _priceCtrl = TextEditingController(
      text: widget.product != null
          ? (widget.product!.priceKobo / 100).toStringAsFixed(
              widget.product!.priceKobo % 100 == 0 ? 0 : 2)
          : null);
  late final _stockCtrl =
      TextEditingController(text: widget.product?.stock?.toString());

  String? _categoryId;
  String? _imageUrl;
  File? _pickedImage;
  bool _isAvailable = true;
  bool _saving = false;

  bool get _isEdit => widget.product != null;

  @override
  void initState() {
    super.initState();
    _categoryId = widget.product?.categoryId;
    _imageUrl = widget.product?.imageUrl;
    _isAvailable = widget.product?.isAvailable ?? true;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _priceCtrl.dispose();
    _stockCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picked = await ImagePicker().pickImage(
        source: ImageSource.gallery, maxWidth: 1200, imageQuality: 85);
    if (picked != null) setState(() => _pickedImage = File(picked.path));
  }

  void _toast(String msg, {bool error = true}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? Colors.red.shade700 : GodropColors.success,
      behavior: SnackBarBehavior.floating,
    ));
  }

  Future<void> _save() async {
    final name = _nameCtrl.text.trim();
    final priceNaira = double.tryParse(_priceCtrl.text.replaceAll(',', ''));
    if (name.isEmpty) return _toast('Product name is required');
    if (_categoryId == null) return _toast('Pick a category');
    if (priceNaira == null || priceNaira <= 0) {
      return _toast('Enter a valid price');
    }

    setState(() => _saving = true);
    final cubit = context.read<ProductsCubit>();
    try {
      var imageUrl = _imageUrl;
      if (_pickedImage != null) {
        imageUrl = await cubit.uploadImage(_pickedImage!.path);
      }
      final err = await cubit.save(
        id: widget.product?.id,
        categoryId: _categoryId!,
        name: name,
        description:
            _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
        priceKobo: (priceNaira * 100).round(),
        imageUrl: imageUrl,
        isAvailable: _isAvailable,
        stock: int.tryParse(_stockCtrl.text.trim()),
      );
      if (!mounted) return;
      if (err != null) {
        _toast(err);
      } else {
        _toast(_isEdit ? 'Product updated' : 'Product added', error: false);
        context.pop();
        return;
      }
    } catch (_) {
      if (mounted) _toast('Image upload failed. Please try again.');
    }
    if (mounted) setState(() => _saving = false);
  }

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dCtx) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete product?'),
        content: Text(
            '"${widget.product!.name}" will be removed from your menu permanently.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dCtx, false),
              child: const Text('Keep')),
          TextButton(
            onPressed: () => Navigator.pop(dCtx, true),
            child: const Text('Delete',
                style: TextStyle(color: GodropColors.error)),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _saving = true);
    final err =
        await context.read<ProductsCubit>().delete(widget.product!.id);
    if (!mounted) return;
    if (err != null) {
      _toast(err);
      setState(() => _saving = false);
    } else {
      _toast('Product deleted', error: false);
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit product' : 'New product'),
        backgroundColor: GodropColors.background,
        actions: [
          if (_isEdit)
            IconButton(
              onPressed: _saving ? null : _delete,
              icon: const Icon(Icons.delete_outline_rounded,
                  color: GodropColors.error),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: GestureDetector(
                onTap: _pickImage,
                child: Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    color: GodropColors.card,
                    borderRadius: BorderRadius.circular(24),
                    border:
                        Border.all(color: GodropColors.border, width: 1.5),
                    boxShadow: GodropColors.softShadow,
                    image: _pickedImage != null
                        ? DecorationImage(
                            image: FileImage(_pickedImage!),
                            fit: BoxFit.cover)
                        : _imageUrl != null
                            ? DecorationImage(
                                image: NetworkImage(_imageUrl!),
                                fit: BoxFit.cover)
                            : null,
                  ),
                  child: _pickedImage == null && _imageUrl == null
                      ? const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_a_photo_outlined,
                                color: GodropColors.mute, size: 24),
                            SizedBox(height: 6),
                            Text('Add photo',
                                style: TextStyle(
                                    fontSize: 12, color: GodropColors.mute)),
                          ],
                        )
                      : null,
                ),
              ),
            ),
            const SizedBox(height: 24),
            GodropField(
              controller: _nameCtrl,
              label: 'Name',
              hint: 'e.g. Jollof Rice with Chicken',
            ),
            const SizedBox(height: 16),
            _CategoryPicker(
              selectedId: _categoryId,
              onChanged: (id) => setState(() => _categoryId = id),
            ),
            const SizedBox(height: 16),
            GodropField(
              controller: _priceCtrl,
              label: 'Price (₦)',
              hint: 'e.g. 3500',
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[\d.,]')),
              ],
            ),
            const SizedBox(height: 16),
            GodropField(
              controller: _descCtrl,
              label: 'Description (optional)',
              hint: 'Tell customers what makes it great',
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            GodropField(
              controller: _stockCtrl,
              label: 'Stock (optional — leave blank for unlimited)',
              hint: 'e.g. 20',
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            ),
            const SizedBox(height: 16),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: GodropColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: GodropColors.border, width: 1.5),
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Text('Available for orders',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: GodropColors.ink)),
                  ),
                  Switch.adaptive(
                    value: _isAvailable,
                    activeTrackColor: GodropColors.success,
                    onChanged: (v) => setState(() => _isAvailable = v),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            GodropButton(
              label: _saving
                  ? 'Saving...'
                  : _isEdit
                      ? 'Save changes'
                      : 'Add product',
              onTap: _saving ? null : _save,
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryPicker extends StatelessWidget {
  final String? selectedId;
  final ValueChanged<String> onChanged;
  const _CategoryPicker({required this.selectedId, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CategoriesCubit, CategoriesState>(
      builder: (ctx, state) {
        final categories =
            state is CategoriesLoaded ? state.categories : <ProductCategory>[];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Category',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: GodropColors.slate)),
            const SizedBox(height: 8),
            if (categories.isEmpty)
              const Text('Create a category first from the Categories tab.',
                  style: TextStyle(fontSize: 13, color: GodropColors.mute))
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final c in categories)
                    GestureDetector(
                      onTap: () => onChanged(c.id),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 9),
                        decoration: BoxDecoration(
                          color: selectedId == c.id
                              ? GodropColors.blue
                              : GodropColors.card,
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(
                              color: selectedId == c.id
                                  ? GodropColors.blue
                                  : GodropColors.border),
                        ),
                        child: Text(
                          c.name,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: selectedId == c.id
                                ? GodropColors.white
                                : GodropColors.slate,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
          ],
        );
      },
    );
  }
}
