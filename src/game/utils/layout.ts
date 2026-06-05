import Phaser from 'phaser';

export interface SafeZones {
  hudTop: number;
  agataBottom: number;
  playArea: Phaser.Geom.Rectangle;
  isMobile: boolean;
  isCoarsePointer: boolean;
}

const HUD_TOP_MOBILE = 128;
const HUD_TOP_DESKTOP = 100;
const AGATA_BOTTOM_MOBILE = 200;
const AGATA_BOTTOM_DESKTOP = 160;

/**
 * Calcula zonas seguras para HUD React, Ágata y área de juego según el viewport.
 */
export function getSafeZones(scale: Phaser.Scale.ScaleManager): SafeZones {
  const w = scale.width;
  const h = scale.height;
  const isMobile = w < 640 || h < 700;
  const isCoarsePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const hudTop = isMobile ? HUD_TOP_MOBILE : HUD_TOP_DESKTOP;
  const agataBottom = isMobile ? AGATA_BOTTOM_MOBILE : AGATA_BOTTOM_DESKTOP;

  const playArea = new Phaser.Geom.Rectangle(
    24,
    hudTop + 16,
    w - 48,
    h - hudTop - agataBottom - 24,
  );

  return { hudTop, agataBottom, playArea, isMobile, isCoarsePointer };
}

/**
 * Posición del sprite Ágata (esquina inferior izquierda, dentro del canvas).
 */
export function getAgataPosition(
  scale: Phaser.Scale.ScaleManager,
  frameHeight: number,
  displayScale: number,
): { x: number; y: number; scale: number } {
  const zones = getSafeZones(scale);
  const displayH = frameHeight * displayScale;
  const x = scale.width * 0.14;
  const y = scale.height - zones.agataBottom * 0.55 + displayH * 0.35;
  const mobileScale = zones.isMobile ? displayScale * 0.85 : displayScale;
  return { x, y, scale: mobileScale };
}

/** Grid 2×2 de portales en el área de juego. */
export function getHubPortalPositions(
  playArea: Phaser.Geom.Rectangle,
): Array<{ x: number; y: number }> {
  const cols = [0.28, 0.72];
  const rows = [0.38, 0.62];
  const positions: Array<{ x: number; y: number }> = [];
  for (const row of rows) {
    for (const col of cols) {
      positions.push({
        x: playArea.x + playArea.width * col,
        y: playArea.y + playArea.height * row,
      });
    }
  }
  return positions;
}