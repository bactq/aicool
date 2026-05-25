# webcool Windows package

Build a self-contained Windows x64 package:

```powershell
powershell -ExecutionPolicy Bypass -File .\webcool\package\windows\build-windows.ps1
```

Or use the batch wrappers from the repository root:

```bat
webcool\package\windows\build-debug.bat
webcool\package\windows\build-release.bat
```

Common options:

```powershell
powershell -ExecutionPolicy Bypass -File .\webcool\package\windows\build-windows.ps1 -Configuration Release
powershell -ExecutionPolicy Bypass -File .\webcool\package\windows\build-windows.ps1 -SkipBuild
powershell -ExecutionPolicy Bypass -File .\webcool\package\windows\build-windows.ps1 -FfmpegPath D:\tools\ffmpeg.exe
```

The batch wrappers pass through extra options:

```bat
webcool\package\windows\build-debug.bat -SkipBuild
webcool\package\windows\build-release.bat -FfmpegPath D:\tools\ffmpeg.exe
```

Output:

- `webcool/package/windows/out/stage/webcool-<version>-windows-x64-debug/`
- `webcool/package/windows/out/webcool-<version>-windows-x64-debug.zip`
- `webcool/package/windows/out/stage/webcool-<version>-windows-x64-release/`
- `webcool/package/windows/out/webcool-<version>-windows-x64-release.zip`

The package contains:

- `webcool.exe`
- `sqlite.dll`
- `ffmpeg.exe`
- `html/`
- `run-webcool.ps1`
- `install.ps1`
- `uninstall.ps1`

Run after extracting:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-webcool.ps1
```

Install to the current user profile:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```
