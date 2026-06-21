import Phaser from 'phaser';
import { AGATA_FRAME_HEIGHT } from '../config/agataAssets';

export interface SafeZones {
  hudTop: number;
  agataLaneWidth: number;
  playArea: Phaser.Geom.Rectangle;
  isMobile: boolean;
  isCoarsePointer: boolean;
}

/** Margen interno del canvas (HUD va fuera del canvas en flex). */
const PLAY_MARGIN = 12;
const AGATA_LANE_RATIO = 0.38;

export function getSafeZones(scale: Phaser.Scale.ScaleManager): SafeZones {
  const w = scale.width;
  const h = scale.height;
  const isMobile = w <= 480;
  const isCoarsePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  /** HUD en React encima del canvas: el juego ya no reserva píxeles extra arriba. */
  const hudTop = 0;
  // En móvil, Ágata ocupa una porción más clara de la izquierda
  const agataLaneWidth = Math.round(w * (isMobile ? 0.42 : 0.28));

  const playArea = new Phaser.Geom.Rectangle(
    agataLaneWidth + (isMobile ? 0 : PLAY_MARGIN),
    PLAY_MARGIN,
    w - agataLaneWidth - PLAY_MARGIN,
    h - PLAY_MARGIN * 2,
  );

  return { hudTop, agataLaneWidth, playArea, isMobile, isCoarsePointer };
}

/** Posiciones de estaciones de marca en un pilar (zona derecha). */
export function getPillarStationPositions(
  playArea: Phaser.Geom.Rectangle,
  count: number,
): Array<{ x: number; y: number }> {
  if (count <= 0) return [];
  const isMobile = playArea.width < 260; // Detectar falta de anchura real
  const cols = isMobile ? 1 : Math.min(count, 3);
  const rows = Math.ceil(count / cols);
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out.push({
      x: playArea.x + playArea.width * ((col + 1) / (cols + 1)),
      y: playArea.y + playArea.height * (isMobile
        ? (0.18 + (row / Math.max(rows - 1, 1)) * 0.54)
        : (0.38 + (row / Math.max(rows, 1)) * 0.28)),
    });
  }
  return out;
}

/**
 * NPC Ágata: columna izquierda del área de juego, tamaño legible en móvil.
 */
export function getAgataNpcPosition(
  scale: Phaser.Scale.ScaleManager,
  zones: SafeZones,
): { x: number; y: number; scale: number; bubbleMaxWidth: number } {
  const targetHeight = zones.isMobile
    ? Math.min(scale.height * 0.38, 280)
    : Math.min(scale.height * 0.42, 340);

  const spriteScale = targetHeight / AGATA_FRAME_HEIGHT;

  // Posición: izquierda, apoyada en el fondo
  const x = zones.isMobile
    ? zones.agataLaneWidth * 0.55
    : zones.agataLaneWidth * 0.52;

  const y = scale.height - (zones.isMobile ? 25 : 40);

  return {
    x,
    y,
    scale: spriteScale,
    bubbleMaxWidth: zones.isMobile ? scale.width * 0.78 : 340,
  };
}

/** Portales en la zona derecha del hub (sin pisar a Ágata). */
export function getHubPortalPositions(
  playArea: Phaser.Geom.Rectangle,
): Array<{ x: number; y: number }> {
  const isMobile = playArea.x > 50; // Heuristic: if agataLaneWidth is large, it's mobile

  if (isMobile) {
    // Cuadrícula 2x2 para móvil con más espacio vertical para Ágata y burbuja
    const cols = [0.22, 0.78];
    const rows = [0.24, 0.58]; // Bajamos un poco los portales superiores y subimos los inferiores
    const out: Array<{ x: number; y: number }> = [];
    for (const row of rows) {
      for (const col of cols) {
        out.push({
          x: playArea.x + playArea.width * col,
          y: playArea.y + playArea.height * row,
        });
      }
    }
    return out;
  } else {
    // Desktop layout original (o similar)
    const cols = [0.32, 0.72];
    const rows = [0.35, 0.68];
    const out: Array<{ x: number; y: number }> = [];
    for (const row of rows) {
      for (const col of cols) {
        out.push({
          x: playArea.x + playArea.width * col,
          y: playArea.y + playArea.height * row,
        });
      }
    }
    return out;
  }
}