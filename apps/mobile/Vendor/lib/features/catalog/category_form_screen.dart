import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../shared/models/catalog_models.dart';
import '../../shared/widgets/godrop_button.dart';
import '../../shared/widgets/godrop_field.dart';
import 'bloc/categories_cubit.dart';

/// Create/edit category form. Pass an existing [ProductCategory] as router
/// `extra` to edit; omit for create.
class CategoryFormScreen extends StatefulWidget {
  final ProductCategory? category;
  const CategoryFormScreen({super.key, this.category});

  @override
  State<CategoryFormScreen> createState() => _CategoryFormScreenState();
}

class _CategoryFormScreenState extends State<CategoryFormScreen> {
  late final _nameCtrl = TextEditingController(text: widget.category?.name);
  late final _descCtrl =
      TextEditingController(text: widget.category?.description);
  late final _sortCtrl =
      TextEditingController(text: widget.category?.sortOrder.toString());
  bool _saving = false;

  bool get _isEdit => widget.category != null;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _sortCtrl.dispose();
    super.dispose();
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
    if (name.isEmpty) return _toast('Category name is required');
    setState(() => _saving = true);
    final err = await context.read<CategoriesCubit>().save(
          id: widget.category?.id,
          name: name,
          description:
              _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
          sortOrder: int.tryParse(_sortCtrl.text.trim()),
        );
    if (!mounted) return;
    if (err != null) {
      _toast(err);
      setState(() => _saving = false);
    } else {
      _toast(_isEdit ? 'Category updated' : 'Category added', error: false);
      context.pop();
    }
  }

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dCtx) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete category?'),
        content: Text(
            '"${widget.category!.name}" will be removed. Categories with products cannot be deleted.'),
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
        await context.read<CategoriesCubit>().delete(widget.category!.id);
    if (!mounted) return;
    if (err != null) {
      _toast(err);
      setState(() => _saving = false);
    } else {
      _toast('Category deleted', error: false);
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GodropColors.background,
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit category' : 'New category'),
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
            GodropField(
              controller: _nameCtrl,
              label: 'Name',
              hint: 'e.g. Mains, Drinks, Sides',
            ),
            const SizedBox(height: 16),
            GodropField(
              controller: _descCtrl,
              label: 'Description (optional)',
              hint: 'Short description shown to customers',
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            GodropField(
              controller: _sortCtrl,
              label: 'Sort order (lower shows first)',
              hint: 'e.g. 1',
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            ),
            const SizedBox(height: 28),
            GodropButton(
              label: _saving
                  ? 'Saving...'
                  : _isEdit
                      ? 'Save changes'
                      : 'Add category',
              onTap: _saving ? null : _save,
            ),
          ],
        ),
      ),
    );
  }
}
