import type { PillarId } from '../game/entities/Portal';

export interface PillarAssetConfig {
  id: PillarId;
  label: string;
  icon: string;
  color: number;
  glowColor: number;
}

export const PILLAR_ASSETS: Record<PillarId, PillarAssetConfig> = {
  gamification: {
    id: 'gamification',
    label: 'GAMIFICACIÓN',
    icon: '/assets/icons/gamificacion.png',
    color: 0x3a7bd5,
    glowColor: 0x6ec6ff,
  },
  acompanamiento: {
    id: 'acompanamiento',
    label: 'ACOMPAÑAMIENTO',
    icon: '/assets/icons/acompanamiento.png',
    color: 0x4caf50,
    glowColor: 0x80e27e,
  },
  celebracion: {
    id: 'celebracion',
    label: 'CELEBRACIÓN',
    icon: '/assets/icons/celebracion.png',
    color: 0xf6a000,
    glowColor: 0xffd54f,
  },
  comunidad: {
    id: 'comunidad',
    label: 'COMUNIDAD',
    icon: '/assets/icons/comunidad.png',
    color: 0x9c27b0,
    glowColor: 0xce93d8,
  },
};

export const PILLAR_ORDER: PillarId[] = [
  'gamification',
  'acompanamiento',
  'celebracion',
  'comunidad',
];