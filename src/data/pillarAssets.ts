import type { PillarId } from '../game/entities/Portal';
import { pillars } from './brandData';

export interface PillarAssetConfig {
  id: PillarId;
  label: string;
  icon: string;
  color: number;
  glowColor: number;
}

const ICON_BY_PILLAR: Record<PillarId, string> = {
  gamification: '/assets/icons/gamificacion.png',
  acompanamiento: '/assets/icons/acompanamiento.png',
  celebracion: '/assets/icons/celebracion.png',
  comunidad: '/assets/icons/comunidad.png',
};

export const PILLAR_ASSETS: Record<PillarId, PillarAssetConfig> = Object.fromEntries(
  pillars.map((p) => [
    p.id,
    {
      id: p.id as PillarId,
      label: p.name,
      icon: ICON_BY_PILLAR[p.id as PillarId],
      color: p.color,
      glowColor: p.glowColor,
    },
  ]),
) as Record<PillarId, PillarAssetConfig>;

export const PILLAR_ORDER: PillarId[] = pillars.map((p) => p.id as PillarId);