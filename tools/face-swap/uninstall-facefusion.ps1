# =============================================================
#  Facefusion — Desinstallateur
# =============================================================
$InstallDir = "C:\facefusion"
$LauncherPath = "$env:USERPROFILE\Desktop\Facefusion.bat"

Write-Host "Ce script va supprimer :" -ForegroundColor Yellow
Write-Host "  - $InstallDir"
Write-Host "  - $LauncherPath"
Write-Host ""
$confirm = Read-Host "Confirmer ? (o/N)"

if ($confirm -eq "o") {
    if (Test-Path $InstallDir) {
        Remove-Item -Recurse -Force $InstallDir
        Write-Host "[OK] Dossier Facefusion supprime" -ForegroundColor Green
    }
    if (Test-Path $LauncherPath) {
        Remove-Item -Force $LauncherPath
        Write-Host "[OK] Lanceur Bureau supprime" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Note : Python / Git / FFmpeg ne sont PAS desinstalles" -ForegroundColor Yellow
    Write-Host "       (ils peuvent servir a d'autres logiciels)."
    Write-Host "       Utilise 'winget uninstall' si tu veux les enlever."
} else {
    Write-Host "Annule." -ForegroundColor Cyan
}
