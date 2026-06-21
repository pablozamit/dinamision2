import Phaser from 'phaser';
import { AGATA_FRAME_HEIGHT } from '../config/agataAssets';

export interface SafeZones {
  hudTop: number;
  agataLaneWidth: number;
  playArea: Phaser.Geom.Rectangle;
  isMobile: boolean;
  isCoarsePointer: boolean;
}

const PLAY_MARGIN = 12;

export function getSafeZones(scale: Phaser.Scale.ScaleManager): SafeZones {
  const w = scale.width;
  const h = scale.height;
  const isMobile = w <= 480;
  const isCoarsePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const hudTop = 0;
  const agataLaneWidth = Math.round(w * (isMobile ? 0.42 : 0.28));

  // En móvil el playArea se expande a pantalla completa para el reparto de espacio
  const playArea = new Phaser.Geom.Rectangle(
    isMobile ? PLAY_MARGIN : agataLaneWidth + PLAY_MARGIN,
    PLAY_MARGIN,
    isMobile ? w - PLAY_MARGIN * 2 : w - agataLaneWidth - PLAY_MARGIN * 2,
    h - PLAY_MARGIN * 2,
  );

  return { hudTop, agataLaneWidth, playArea, isMobile, isCoarsePointer };
}

/** Posiciones de estaciones de marca en un pilar (sala de lápidas). */
export function getPillarStationPositions(
  playArea: Phaser.Geom.Rectangle,
  count: number,
): Array<{ x: number; y: number }> {
  if (count <= 0) return [];
  const isMobile = playArea.x <= PLAY_MARGIN + 5;
  const w = isMobile ? playArea.width + PLAY_MARGIN * 2 : playArea.width;
  const cols = isMobile ? 1 : Math.min(count, 3);
  const rows = Math.ceil(count / cols);
  const out: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    // CORREGIDO: En móvil, desplazamos la columna de lápidas ligeramente al 62% del ancho 
    // para dejar el lado izquierdo totalmente libre para el sprite de Ágata.
    const posX = isMobile 
      ? w * 0.62 
      : playArea.x + playArea.width * ((col + 1) / (cols + 1));

    out.push({
      x: posX,
      y: playArea.y + playArea.height * (isMobile
        ? (0.44 + (row / Math.max(count - 1, 1)) * 0.44)
        : (0.38 + (row / Math.max(rows, 1)) * 0.28)),
    });
  }
  return out;
}

/** NPC Ágata: columna izquierda del área de juego. */
export function getAgataNpcPosition(
  scale: Phaser.Scale.ScaleManager,
  zones: SafeZones,
): { x: number; y: number; scale: number; bubbleMaxWidth: number } {
  const targetHeight = zones.isMobile
    ? Math.min(scale.height * 0.35, 260)
    : Math.min(scale.height * 0.42, 340);

  const spriteScale = targetHeight / AGATA_FRAME_HEIGHT;

  const x = zones.isMobile
    ? scale.width * 0.20
    : zones.agataLaneWidth * 0.52;

  const y = scale.height - (zones.isMobile ? 20 : 40);

  return {
    x,
    y,
    scale: spriteScale,
    bubbleMaxWidth: zones.isMobile ? scale.width * 0.82 : 340,
  };
}

/** Portales en la zona del hub principal. */
export function getHubPortalPositions(playArea: Phaser.Geom.Rectangle): Array<{ x: number; y: number }> {
  const isMobile = playArea.x <= PLAY_MARGIN + 5;
  const w = isMobile ? playArea.width + PLAY_MARGIN * 2 : playArea.width;
  const h = playArea.height + PLAY_MARGIN * 2;

  if (isMobile) {
    // CORREGIDO: Ubicamos los 4 portales en la mitad derecha e inferior de la pantalla móvil.
    // Esto deja la parte superior libre para el diálogo de React y la parte inferior izquierda libre para Ágata.
    return [
      { x: w * 0.46, y: h * 0.44 }, // Gamificación (Fila 1 - Izquierda)
      { x: w * 0.82, y: h * 0.44 }, // Acompañamiento (Fila 1 - Derecha)
      { x: w * 0.46, y: h * 0.74 }, // Celebración (Fila 2 - Izquierda)
      { x: w * 0.82, y: h * 0.74 }, // Comunidad y Co-creación (Fila 2 - Derecha)
    ];
  } else {
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
