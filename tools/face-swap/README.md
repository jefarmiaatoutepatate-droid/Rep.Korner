# Face-Swap Vidéo — Facefusion (Windows + NVIDIA)

Outil open source pour appliquer ton visage sur une vidéo existante.

## 🚀 Installation en 1 clic

1. **Télécharge le dossier `tools/face-swap/`** sur ton PC Windows.
2. **Clic droit** sur `install-facefusion.ps1` → **Exécuter avec PowerShell**.
   - Si Windows bloque : ouvre PowerShell en admin, tape :
     ```
     Set-ExecutionPolicy -Scope Process Bypass -Force
     ```
     puis relance le script.
3. Attends 10–20 min (téléchargement Python, Torch CUDA, modèles IA, ~5 Go).
4. Un raccourci **`Facefusion.bat`** apparaît sur ton Bureau.

## ▶️ Utilisation

1. Double-clique sur `Facefusion.bat` sur ton Bureau.
2. Ouvre ton navigateur sur **http://localhost:7860**.
3. Dans l'interface web :
   - **SOURCE** → uploade une photo HD de ta tête (face caméra, bien éclairée).
   - **TARGET** → uploade la vidéo cible.
   - **Processors** → coche :
     - `face_swapper` (obligatoire)
     - `face_enhancer` (modèle `gfpgan_1.4` recommandé — corrige les artefacts)
     - `frame_enhancer` (optionnel — upscale la vidéo, plus lent)
   - **Face Selector Mode** → `reference` (ne swap qu'une personne dans la vidéo)
   - Clique **START** en bas.
4. Le fichier de sortie est dans `C:\facefusion\.outputs\` par défaut.

## ⚙️ Réglages recommandés par GPU

| GPU | face_swapper | face_enhancer | frame_enhancer | Résolution max |
|---|---|---|---|---|
| RTX 3060 12Go | ✅ | ✅ gfpgan_1.4 | ⚠️ lent | 1080p |
| RTX 4070 12Go | ✅ | ✅ gfpgan_1.4 | ✅ | 1080p |
| RTX 4080/4090 | ✅ | ✅ codeformer | ✅ real_esrgan_x4 | 4K |
| < 8 Go VRAM | ✅ | ⚠️ désactive | ❌ | 720p max |

## 💡 Astuces qualité

- **Photo source** : idéalement plusieurs angles (face, 3/4 droite, 3/4 gauche) via multi-source.
- **Éclairage** : la lumière de la source doit ressembler à celle de la vidéo cible.
- **Résolution vidéo** : réduis à 1080p si tu manques de VRAM (utilise HandBrake pour compresser).
- **Longueur** : commence par des vidéos de 5–10 s pour tester tes réglages avant de traiter une longue vidéo.

## 🔧 Dépannage

| Erreur | Solution |
|---|---|
| `CUDA out of memory` | Baisse la résolution ou désactive `frame_enhancer` |
| `No module named 'onnxruntime'` | Relance `python install.py --onnxruntime cuda` dans `C:\facefusion\` |
| Le visage n'est pas détecté | Utilise une photo source plus nette / face caméra |
| Sortie très floue | Active `face_enhancer` (gfpgan_1.4) |
| Traitement très lent | Vérifie que CUDA est actif : `python -c "import torch; print(torch.cuda.is_available())"` → doit dire `True` |

## ⚖️ Utilisation légale et éthique

Le face-swap ne doit être utilisé que :
- Sur **toi-même**,
- Ou avec le **consentement explicite** des personnes concernées.

Le deepfake non-consenti (revenge porn, désinformation, usurpation d'identité) est **illégal** en France (art. 226-8 Code pénal, jusqu'à 2 ans de prison + 45 000 €) et dans la plupart des pays. Cet outil est fourni à des fins créatives et personnelles uniquement.

## 📚 Ressources

- Facefusion officiel : https://github.com/facefusion/facefusion
- Documentation : https://docs.facefusion.io
- Communauté Discord : https://discord.gg/facefusion
