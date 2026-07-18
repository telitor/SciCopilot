"""在 localhost 上提供 SciPilot 已构建前端，并兼容 React 前端路由。"""

from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


class SinglePageApplicationHandler(SimpleHTTPRequestHandler):
    """静态文件不存在时回退到 index.html，避免刷新子页面出现 404。"""

    def end_headers(self) -> None:
        # 本地前端会被重新构建；禁用浏览器缓存可避免继续显示旧版哈希资源。
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def do_GET(self) -> None:  # noqa: N802 - 标准库方法名
        request_path = unquote(urlparse(self.path).path).lstrip("/")
        requested_file = Path(self.directory) / request_path

        if request_path and not requested_file.exists():
            self.path = "/index.html"

        super().do_GET()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="运行 SciPilot 本地前端")
    parser.add_argument("--root", required=True, help="frontend/dist 目录")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5173)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = Path(args.root).resolve()
    index_file = root / "index.html"

    if not index_file.is_file():
        raise SystemExit(f"找不到网页入口：{index_file}")

    handler = partial(SinglePageApplicationHandler, directory=str(root))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"SciPilot 已运行：http://{args.host}:{args.port}/", flush=True)
    print("按 Ctrl+C 或关闭窗口即可停止。", flush=True)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSciPilot 本地网页已停止。")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
