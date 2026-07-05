# =============================================================
#  Facefusion — Installateur automatique Windows 10/11 (NVIDIA)
# =============================================================
#  Usage :
#    1) Clic droit sur ce fichier > "Executer avec PowerShell"
#    2) Ou dans un terminal PowerShell admin :
#         Set-ExecutionPolicy -Scope Process Bypass -Force
#         .\install-facefusion.ps1
# =============================================================

$ErrorActionPreference = "Stop"
$InstallDir = "C:\facefusion"
$PythonVersion = "3.12"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "  [!]  $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "  [X]  $Message" -ForegroundColor Red
}

function Test-Command {
    param([string]$Cmd)
    $null = Get-Command $Cmd -ErrorAction SilentlyContinue
    return $?
}

# ------------------------------------------------------------
# 0. Verifications preliminaires
# ------------------------------------------------------------
Write-Host ""
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host "  FACEFUSION - Installation automatique" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta

Write-Step "Verification carte NVIDIA"
try {
    $gpuInfo = & nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>$null
    if ($gpuInfo) {
        Write-Ok "GPU detectee : $gpuInfo"
    } else {
        Write-Warn "nvidia-smi non trouve. Le pilote NVIDIA est-il installe ?"
        Write-Warn "Telecharge : https://www.nvidia.com/Download/index.aspx"
        $continue = Read-Host "Continuer quand meme ? (o/N)"
        if ($continue -ne "o") { exit 1 }
    }
} catch {
    Write-Warn "Impossible de detecter la GPU NVIDIA."
}

# ------------------------------------------------------------
# 1. Installer winget si manquant (Windows 10 seulement)
# ------------------------------------------------------------
Write-Step "Verification winget (gestionnaire de paquets Windows)"
if (Test-Command "winget") {
    Write-Ok "winget disponible"
} else {
    Write-Err "winget n'est pas installe."
    Write-Host "  Installe-le depuis le Microsoft Store :"
    Write-Host "  https://apps.microsoft.com/detail/9nblggh4nns1"
    Read-Host "Appuie sur Entree une fois winget installe"
}

# ------------------------------------------------------------
# 2. Git
# ------------------------------------------------------------
Write-Step "Installation de Git"
if (Test-Command "git") {
    Write-Ok "Git deja installe : $(git --version)"
} else {
    winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Ok "Git installe"
}

# ------------------------------------------------------------
# 3. Python 3.12
# ------------------------------------------------------------
Write-Step "Installation de Python $PythonVersion"
$pythonCmd = $null
foreach ($cmd in @("python3.12", "python")) {
    if (Test-Command $cmd) {
        $ver = & $cmd --version 2>&1
        if ($ver -match "3\.12") {
            $pythonCmd = $cmd
            Write-Ok "Python 3.12 trouve : $ver"
            break
        }
    }
}

if (-not $pythonCmd) {
    Write-Host "  Installation Python 3.12 via winget..."
    winget install --id Python.Python.3.12 -e --accept-source-agreements --accept-package-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path","User")
    $pythonCmd = "python"
    Write-Ok "Python 3.12 installe"
}

# ------------------------------------------------------------
# 4. FFmpeg
# ------------------------------------------------------------
Write-Step "Installation de FFmpeg"
if (Test-Command "ffmpeg") {
    Write-Ok "FFmpeg deja installe"
} else {
    winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Ok "FFmpeg installe"
}

# ------------------------------------------------------------
# 5. Cloner Facefusion
# ------------------------------------------------------------
Write-Step "Telechargement de Facefusion (git clone)"
if (Test-Path $InstallDir) {
    Write-Warn "$InstallDir existe deja."
    $update = Read-Host "Faire un 'git pull' pour mettre a jour ? (o/N)"
    if ($update -eq "o") {
        Push-Location $InstallDir
        git pull
        Pop-Location
        Write-Ok "Facefusion mis a jour"
    } else {
        Write-Ok "Utilisation de l'installation existante"
    }
} else {
    git clone https://github.com/facefusion/facefusion $InstallDir
    Write-Ok "Facefusion clone dans $InstallDir"
}

# ------------------------------------------------------------
# 6. Environnement virtuel + dependances CUDA
# ------------------------------------------------------------
Write-Step "Creation de l'environnement virtuel Python"
Push-Location $InstallDir

if (-not (Test-Path "$InstallDir\venv")) {
    & $pythonCmd -m venv venv
    Write-Ok "venv cree"
} else {
    Write-Ok "venv existe deja"
}

Write-Step "Activation du venv et installation des dependances (CUDA)"
& "$InstallDir\venv\Scripts\Activate.ps1"

# Mise a jour pip
python -m pip install --upgrade pip

# Facefusion embarque un script d'install qui gere ONNX Runtime + Torch CUDA
python install.py --onnxruntime cuda --skip-conda

Write-Ok "Toutes les dependances Python installees"

Pop-Location

# ------------------------------------------------------------
# 7. Creer un lanceur double-clic
# ------------------------------------------------------------
Write-Step "Creation du lanceur launch-facefusion.bat"
$launcher = @"
@echo off
cd /d $InstallDir
call venv\Scripts\activate.bat
echo.
echo ============================================
echo   Facefusion - Interface web
echo   Ouvre ton navigateur sur http://localhost:7860
echo   (Ctrl+C ici pour arreter)
echo ============================================
echo.
python facefusion.py run
pause
"@

$launcherPath = "$env:USERPROFILE\Desktop\Facefusion.bat"
$launcher | Out-File -FilePath $launcherPath -Encoding ASCII
Write-Ok "Lanceur cree sur le Bureau : Facefusion.bat"

# ------------------------------------------------------------
# 8. Fin
# ------------------------------------------------------------
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  INSTALLATION TERMINEE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour lancer Facefusion :" -ForegroundColor White
Write-Host "  - Double-clique sur 'Facefusion.bat' sur ton Bureau"
Write-Host "  - Ou execute : $InstallDir\launch.bat"
Write-Host ""
Write-Host "L'interface s'ouvrira sur http://localhost:7860" -ForegroundColor White
Write-Host ""
Write-Host "Guide d'utilisation : voir README.md dans le dossier tools/face-swap/" -ForegroundColor White
Write-Host ""
