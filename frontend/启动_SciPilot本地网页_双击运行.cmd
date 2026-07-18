@echo off
setlocal
chcp 65001 >nul

set "FRONTEND_ROOT=%~dp0"
set "FRONTEND_DIST=%FRONTEND_ROOT%dist"
set "SERVER_SCRIPT=%FRONTEND_ROOT%提供_SciPilot前端静态网页服务.py"
set "PYTHON_EXE=python"

if not exist "%FRONTEND_DIST%\index.html" (
  echo [错误] 没有找到已经构建好的网页：dist\index.html
  echo 请先在 frontend 目录运行 npm run build。
  pause
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  set "PYTHON_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
)

if not exist "%PYTHON_EXE%" (
  echo [错误] 没有找到 Python，无法启动本地网页服务。
  echo 请安装 Python 3，或从 Codex 中运行本项目。
  pause
  exit /b 1
)

echo 正在启动 SciPilot 本地网页……
echo 浏览器地址：http://127.0.0.1:5173/
echo 关闭这个窗口即可停止网页服务。
echo.

start "" "http://127.0.0.1:5173/"
"%PYTHON_EXE%" "%SERVER_SCRIPT%" --root "%FRONTEND_DIST%" --host 127.0.0.1 --port 5173

if errorlevel 1 (
  echo.
  echo [提示] 如果显示端口被占用，请先关闭其他 SciPilot 启动窗口后重试。
  pause
)
