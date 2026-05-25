param(
    [string]$Version = "",
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Debug",
    [string]$Platform = "x64",
    [switch]$SkipBuild,
    [switch]$NoZip,
    [string]$OutputDir = "",
    [string]$FfmpegPath = "",
    [string]$MsBuildPath = ""
)

$ErrorActionPreference = "Stop"

function Log([string]$Message) {
    Write-Host "[webcool-package] $Message"
}

function Resolve-RepoRoot {
    $scriptDir = Split-Path -Parent $PSCommandPath
    return (Resolve-Path (Join-Path $scriptDir "..\..\..")).Path
}

function Find-MSBuild {
    param([string]$ExplicitPath)

    if ($ExplicitPath -and (Test-Path -LiteralPath $ExplicitPath)) {
        return (Resolve-Path -LiteralPath $ExplicitPath).Path
    }

    $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path -LiteralPath $vswhere) {
        $found = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild -find "MSBuild\Current\Bin\amd64\MSBuild.exe" 2>$null | Select-Object -First 1
        if ($found -and (Test-Path -LiteralPath $found)) {
            return $found
        }
    }

    $candidates = @(
        "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\amd64\MSBuild.exe",
        "C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\amd64\MSBuild.exe",
        "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\amd64\MSBuild.exe",
        "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\amd64\MSBuild.exe"
    )

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) {
            return $candidate
        }
    }

    throw "MSBuild.exe not found. Pass -MsBuildPath or install Visual Studio Build Tools."
}

function Copy-DirectoryContent {
    param([string]$Source, [string]$Destination)
    if (!(Test-Path -LiteralPath $Source)) {
        throw "Directory not found: $Source"
    }
    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    Copy-Item -Path (Join-Path $Source "*") -Destination $Destination -Recurse -Force
}

function Write-PackageScripts {
    param([string]$PackageRoot)

    $runScript = @'
param(
    [string]$Listen = "0.0.0.0:8080",
    [string]$UploadDir = "",
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ExtraArgs
)

$ErrorActionPreference = "Stop"
$BaseDir = Split-Path -Parent $PSCommandPath
if (!$UploadDir) {
    $UploadDir = Join-Path $BaseDir "uploads"
}

New-Item -ItemType Directory -Force -Path $UploadDir | Out-Null
$env:AICOOL_SQLITE_LIB = Join-Path $BaseDir "sqlite.dll"
$env:AICOOL_FFMPEG = Join-Path $BaseDir "ffmpeg.exe"

$argsList = @(
    "-s", $Listen,
    "-d", $UploadDir,
    "-w", (Join-Path $BaseDir "html"),
    "-S", $env:AICOOL_SQLITE_LIB,
    "-F", $env:AICOOL_FFMPEG
)
if ($ExtraArgs) {
    $argsList += $ExtraArgs
}

& (Join-Path $BaseDir "webcool.exe") @argsList
'@

    $installScript = @'
param(
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\webcool",
    [switch]$DesktopShortcut
)

$ErrorActionPreference = "Stop"
$SourceDir = Split-Path -Parent $PSCommandPath
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

$items = @("webcool.exe", "sqlite.dll", "ffmpeg.exe", "html", "run-webcool.ps1", "uninstall.ps1")
foreach ($item in $items) {
    $src = Join-Path $SourceDir $item
    if (Test-Path -LiteralPath $src) {
        Copy-Item -LiteralPath $src -Destination $InstallDir -Recurse -Force
    }
}
New-Item -ItemType Directory -Force -Path (Join-Path $InstallDir "uploads") | Out-Null

if ($DesktopShortcut) {
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath("Desktop")) "webcool.lnk"))
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$InstallDir\run-webcool.ps1`""
    $shortcut.WorkingDirectory = $InstallDir
    $shortcut.Save()
}

Write-Host "Installed webcool to: $InstallDir"
Write-Host "Start with:"
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$InstallDir\run-webcool.ps1`""
'@

    $uninstallScript = @'
param(
    [string]$InstallDir = "$env:LOCALAPPDATA\Programs\webcool",
    [switch]$RemoveUploads
)

$ErrorActionPreference = "Stop"
if (!(Test-Path -LiteralPath $InstallDir)) {
    Write-Host "Install directory not found: $InstallDir"
    exit 0
}

if ($RemoveUploads) {
    Remove-Item -LiteralPath $InstallDir -Recurse -Force
} else {
    Get-ChildItem -LiteralPath $InstallDir -Force |
        Where-Object { $_.Name -ne "uploads" } |
        Remove-Item -Recurse -Force
}

$shortcut = Join-Path ([Environment]::GetFolderPath("Desktop")) "webcool.lnk"
if (Test-Path -LiteralPath $shortcut) {
    Remove-Item -LiteralPath $shortcut -Force
}
Write-Host "Uninstalled webcool from: $InstallDir"
'@

    $readme = @'
# webcool for Windows

## Direct run

```powershell
powershell -ExecutionPolicy Bypass -File .\run-webcool.ps1
```

Default URL: http://127.0.0.1:8080/

## Install to user profile

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

Create a desktop shortcut:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -DesktopShortcut
```

## Custom listen address or upload directory

```powershell
powershell -ExecutionPolicy Bypass -File .\run-webcool.ps1 -Listen 127.0.0.1:8080 -UploadDir D:\webcool-data
```
'@

    Set-Content -LiteralPath (Join-Path $PackageRoot "run-webcool.ps1") -Value $runScript -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $PackageRoot "install.ps1") -Value $installScript -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $PackageRoot "uninstall.ps1") -Value $uninstallScript -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $PackageRoot "README-Windows.md") -Value $readme -Encoding UTF8
}

$repoRoot = Resolve-RepoRoot
$webcoolRoot = Join-Path $repoRoot "webcool"
$packageRoot = Join-Path $webcoolRoot "package"
$projectFile = Join-Path $webcoolRoot "webcool.vcxproj"

if (!$OutputDir) {
    $OutputDir = Join-Path $packageRoot "windows\out"
}
$OutputDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputDir)

if (!$SkipBuild) {
    $msbuild = Find-MSBuild -ExplicitPath $MsBuildPath
    Log "building webcool ($Configuration|$Platform)"
    & $msbuild $projectFile "/p:Configuration=$Configuration" "/p:Platform=$Platform" /m
}

$binDir = Join-Path $webcoolRoot "$Platform\$Configuration"
$webcoolExe = Join-Path $binDir "webcool.exe"
$sqliteDll = Join-Path $binDir "sqlite.dll"
if (!(Test-Path -LiteralPath $webcoolExe)) {
    throw "webcool.exe not found: $webcoolExe"
}
if (!(Test-Path -LiteralPath $sqliteDll)) {
    $sqliteFallbacks = @(
        (Join-Path $webcoolRoot "$Platform\Debug\sqlite.dll"),
        (Join-Path $repoRoot "tools\windows\sqlite.dll")
    )
    $sqliteDll = $sqliteFallbacks | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (!$sqliteDll) {
        throw "sqlite.dll not found. Expected it in $binDir or pass/copy sqlite.dll into the build output."
    }
    Log "using sqlite.dll: $sqliteDll"
}

if (!$Version) {
    $detected = & $webcoolExe -v 2>$null | Select-Object -First 1
    if ($detected) {
        $Version = $detected.Trim()
    }
}
if (!$Version) {
    $Version = "1.0.0"
}

if (!$FfmpegPath) {
    $FfmpegPath = Join-Path $repoRoot "tools\windows\ffmpeg.exe"
}
$FfmpegPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($FfmpegPath)
if (!(Test-Path -LiteralPath $FfmpegPath)) {
    throw "ffmpeg.exe not found: $FfmpegPath"
}

$packageName = "webcool-$Version-windows-$Platform-$($Configuration.ToLowerInvariant())"
$stageRoot = Join-Path $OutputDir "stage"
$appRoot = Join-Path $stageRoot $packageName
$zipPath = Join-Path $OutputDir "$packageName.zip"

Log "staging package: $appRoot"
if (Test-Path -LiteralPath $appRoot) {
    Remove-Item -LiteralPath $appRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $appRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $appRoot "uploads") | Out-Null

Copy-Item -LiteralPath $webcoolExe -Destination (Join-Path $appRoot "webcool.exe") -Force
Copy-Item -LiteralPath $sqliteDll -Destination (Join-Path $appRoot "sqlite.dll") -Force
Copy-Item -LiteralPath $FfmpegPath -Destination (Join-Path $appRoot "ffmpeg.exe") -Force
Copy-DirectoryContent -Source (Join-Path $webcoolRoot "html") -Destination (Join-Path $appRoot "html")
Write-PackageScripts -PackageRoot $appRoot

if (!$NoZip) {
    Log "creating zip: $zipPath"
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }
    Compress-Archive -LiteralPath $appRoot -DestinationPath $zipPath -Force
}

Log "done"
Write-Host "Package directory: $appRoot"
if (!$NoZip) {
    Write-Host "Package zip:       $zipPath"
}
