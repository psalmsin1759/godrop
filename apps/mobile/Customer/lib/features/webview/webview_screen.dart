import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../app/theme.dart';

class WebviewScreen extends StatefulWidget {
  final String url;
  final String title;
  const WebviewScreen({super.key, required this.url, required this.title});

  @override
  State<WebviewScreen> createState() => _WebviewScreenState();
}

class _WebviewScreenState extends State<WebviewScreen> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) => setState(() => _loading = false),
        onWebResourceError: (_) => setState(() => _loading = false),
      ))
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: GodropColors.white,
        leading: GestureDetector(
          onTap: () => context.pop(),
          child: const Icon(Icons.close_rounded, size: 22, color: GodropColors.ink),
        ),
        title: Text(widget.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: GodropColors.ink)),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loading)
            const Center(child: CircularProgressIndicator(color: GodropColors.blue, strokeWidth: 2.5)),
        ],
      ),
    );
  }
}
