"""
Génère les icônes de FitCoach aux couleurs du thème (src/constants/theme.ts).

- icon.png          1024x1024 RGB SANS canal alpha (exigence App Store)
- adaptive-icon.png 1024x1024 RGBA, marque dans la zone sûre centrale (Android)
- splash.png        1024x1024 RGBA, marque accent sur fond transparent (composite sur blanc)
- favicon.png       64x64 RGB (web)

Rendu par suréchantillonnage x4 puis réduction LANCZOS pour des bords lisses.
"""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
SS = 4  # facteur de suréchantillonnage

ACCENT = (91, 110, 245)       # #5B6EF5
ACCENT_DARK = (70, 85, 201)   # #4655C9
WHITE = (255, 255, 255)


def gradient(size, c1, c2):
    """Dégradé diagonal (haut-gauche -> bas-droite)."""
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            px[x, y] = (
                round(c1[0] + (c2[0] - c1[0]) * t),
                round(c1[1] + (c2[1] - c1[1]) * t),
                round(c1[2] + (c2[2] - c1[2]) * t),
            )
    return img


def draw_dumbbell(draw, cx, cy, scale, color):
    """Haltère centrée en (cx, cy). `scale` = 1.0 -> largeur ~710 px."""
    def rr(x0, y0, x1, y1, r):
        draw.rounded_rectangle(
            [cx + x0 * scale, cy + y0 * scale, cx + x1 * scale, cy + y1 * scale],
            radius=r * scale, fill=color,
        )

    # barre centrale
    rr(-190, -38, 190, 38, 30)
    # disques principaux
    rr(-292, -160, -170, 160, 42)
    rr(170, -160, 292, 160, 42)
    # collerettes extérieures
    rr(-356, -100, -280, 100, 30)
    rr(280, -100, 356, 100, 30)


def render_mark(size, mark_scale, color, bg=None):
    """Rend la marque sur un fond (RGB) ou en transparent (RGBA)."""
    big = size * SS
    if bg is None:
        img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    else:
        img = bg.resize((big, big), Image.LANCZOS).convert("RGBA")

    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # échelle : 1.0 => marque de ~710px de large sur un canevas de 1024
    draw_dumbbell(d, big / 2, big / 2, (big / 1024) * mark_scale, color + (255,))
    img = Image.alpha_composite(img, layer)
    return img.resize((size, size), Image.LANCZOS)


# --- 1. icon.png : 1024x1024, dégradé plein bord, SANS alpha ---
grad = gradient(256, ACCENT, ACCENT_DARK)  # petit puis agrandi (dégradé lisse)
icon = render_mark(1024, 1.0, WHITE, bg=grad).convert("RGB")
icon.save(f"{OUT}/icon.png", "PNG")

# --- 2. adaptive-icon.png : marque réduite (zone sûre 66 %), fond transparent ---
adaptive = render_mark(1024, 0.62, WHITE)
adaptive.save(f"{OUT}/adaptive-icon.png", "PNG")

# --- 3. splash.png : marque accent sur transparent (fond blanc via app.json) ---
splash = render_mark(1024, 0.78, ACCENT)
splash.save(f"{OUT}/splash.png", "PNG")

# --- 4. favicon.png : 64x64 sans alpha ---
favicon = render_mark(64, 1.0, WHITE, bg=grad).convert("RGB")
favicon.save(f"{OUT}/favicon.png", "PNG")

print("OK — icônes générées")
