#!/usr/bin/env python3
"""
Genera un spritesheet de walk cycle (16 frames) a partir de agata-idle.png.

Técnica: bobbing walk — extrae frames del idle, aplica desplazamiento vertical
sinusoidal y ligera inclinación para simular el movimiento de caminar.
"""

from PIL import Image
import math
import os

# ── Configuración ──
SRC_PATH = "public/assets/characters/agata-idle.png"
OUT_PATH = "public/assets/characters/agata-walk.png"
FRAME_W = 256
FRAME_H = 256
GRID_COLS = 4
GRID_ROWS = 4
TOTAL_FRAMES = GRID_COLS * GRID_ROWS  # 16

# Parámetros del bobbing walk
BOB_AMP = 10           # amplitud del rebote vertical (px)
BOB_CYCLES = 4         # ciclos de bobbing en los 16 frames
TILT_AMP = 2.5         # amplitud de inclinación (grados)
SCALE_SQUASH = 0.03    # compresión vertical en el punto más bajo

def extract_frame(src: Image.Image, col: int, row: int) -> Image.Image:
    """Extrae un frame de la grid 5×5 del spritesheet fuente."""
    left = col * FRAME_W
    top = row * FRAME_H
    return src.crop((left, top, left + FRAME_W, top + FRAME_H))

def main():
    src = Image.open(SRC_PATH).convert("RGBA")
    src_w, src_h = src.size
    src_cols = src_w // FRAME_W
    src_rows = src_h // FRAME_H
    src_total = src_cols * src_rows

    print(f"Source: {SRC_PATH} ({src_w}x{src_h}) -> {src_cols}x{src_rows} = {src_total} frames")

    # Seleccionar 16 frames distintos del idle (espaciados para variación)
    src_indices = [
        0, 2, 4, 6,
        8, 10, 12, 14,
        16, 18, 20, 22,
        24, 1, 3, 5,
    ]

    out = Image.new("RGBA", (GRID_COLS * FRAME_W, GRID_ROWS * FRAME_H), (0, 0, 0, 0))

    for i, src_idx in enumerate(src_indices):
        col = i % GRID_COLS
        row = i // GRID_COLS

        # extraer frame fuente
        src_col = src_idx % src_cols
        src_row = src_idx // src_cols
        frame = extract_frame(src, src_col, src_row)

        # calcular bobbing (fase del paso)
        phase = (i / TOTAL_FRAMES) * BOB_CYCLES * 2 * math.pi
        bob_y = int(math.sin(phase) * BOB_AMP)

        # inclinación (lean hacia adelante en ciertos momentos)
        tilt = math.sin(phase + math.pi / 4) * TILT_AMP

        # squash & stretch sutil
        stretch = 1.0 + math.sin(phase + math.pi) * SCALE_SQUASH

        # aplicar transformaciones
        if abs(tilt) > 0.1 or abs(stretch - 1.0) > 0.001:
            # expandir canvas para evitar recortes en la rotación
            padding = 40
            big = Image.new("RGBA", (FRAME_W + padding * 2, FRAME_H + padding * 2), (0, 0, 0, 0))
            big.paste(frame, (padding, padding), frame)

            # rotar
            rotated = big.rotate(-tilt, resample=Image.BICUBIC, expand=False)

            # escalar (squash/stretch)
            new_w = int((FRAME_W + padding * 2) * (1.0 + (1.0 - stretch) * 0.5))
            new_h = int((FRAME_H + padding * 2) * stretch)
            scaled = rotated.resize((new_w, new_h), Image.LANCZOS)

            # recortar al tamaño original centrado
            left = (scaled.width - FRAME_W) // 2
            top = (scaled.height - FRAME_H) // 2
            frame = scaled.crop((left, top, left + FRAME_W, top + FRAME_H))

        # aplicar bobbing vertical (mover hacia arriba/abajo)
        if bob_y != 0:
            shifted = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
            shifted.paste(frame, (0, bob_y), frame)
            frame = shifted

        # pegar en el spritesheet de salida
        out_x = col * FRAME_W
        out_y = row * FRAME_H
        out.paste(frame, (out_x, out_y), frame)

        print(f"  Frame {i:2d} (src {src_idx:2d}) -> grid ({col},{row})  bob={bob_y:+3d}px  tilt={tilt:+.1f}deg")

    out.save(OUT_PATH)
    print(f"\n[SAVED] Walk cycle to {OUT_PATH} ({out.size[0]}x{out.size[1]})")

if __name__ == "__main__":
    main()
