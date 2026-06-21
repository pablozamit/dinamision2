import { useState, useEffect, useRef } from 'react';
import PhaserGame, { type IRefPhaserGame } from './components/PhaserGame';
import MissionIntro from './components/MissionIntro';
import FinalScreen from './components/FinalScreen';
import AgataDialogueOverlay from './components/AgataDialogueOverlay';

import { EventBus } from './game/EventBus';
import { loadProgress, saveProgress, type GameProgress } from './game/utils/storage';
import { pillars } from './data/brandData';
import type { Brand } from './data/brandData';
import './index.css';

type AppPhase = 'mission' | 'hub' | 'pillar' | 'final';

/**
 * `App` - Orquestador principal del flujo del juego.
 *
 * Fases:
 *  - `mission`: MissionIntro (landing + form)
 *  - `hub`: PhaserGame corriendo HubScene
 *  - `pillar`: PhaserGame corriendo PillarScene + BrandPanel overlay
 *  - `final`: FinalScreen (futuro)
 *
 * Toda la comunicación con Phaser se hace vía EventBus. El ref del juego
 * solo se usa para iniciar/detener escenas (no para mutar estado).
 */
export default function App() {
  const [phase, setPhase] = useState<AppPhase>('mission');
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [currentPillar, setCurrentPillar] = useState<string | null>(null);
  const gameRef = useRef<IRefPhaserGame>({ game: null, scene: null });

  // Re-hidratar progreso persistido al montar
  useEffect(() => {
    const stored = loadProgress();
    if (stored) {
      setProgress(stored);
      if (stored.pillarsCompleted.length >= 4) {
        setPhase('final');
      } else {
        setPhase('hub');
      }
    }
  }, []);

  // Suscribirse a eventos del juego
  useEffect(() => {
    const onPortalEntered = (pillarId: string): void => {
      setCurrentPillar(pillarId);
      setPhase('pillar');
    };

    const onPillarProgress = (data: { pillar: string; completed: number; total: number }): void => {
      setProgress((prev) => {
        if (!prev) return prev;
        const updated: GameProgress = {
          ...prev,
          currentPillar: data.pillar,
        };
        saveProgress(updated);
        return updated;
      });
    };

    const onFraseClaveCollected = (frase: string): void => {
      setProgress((prev) => {
        if (!prev) return prev;
        if (prev.frasesClave.includes(frase)) return prev;
        const updated: GameProgress = {
          ...prev,
          frasesClave: [...prev.frasesClave, frase],
        };
        saveProgress(updated);
        return updated;
      });
    };

    const onPillarCompleted = (pillarId: string): void => {
      setProgress((prev) => {
        if (!prev) return prev;
        if (prev.pillarsCompleted.includes(pillarId)) return prev;
        const updated: GameProgress = {
          ...prev,
          pillarsCompleted: [...prev.pillarsCompleted, pillarId],
        };
        saveProgress(updated);
        return updated;
      });
    };

    const onDialogueFinished = (): void => {
      // Phaser gestiona las transiciones de escena por sí solo.
      // Aquí solo sincronizamos el estado de React: 'phase' lo marca
      // 'current-scene-ready', NO este evento genérico de diálogo.
      setCurrentPillar(null);
    };

    const onSceneReady = (scene: Phaser.Scene): void => {
      const key = scene.scene.key;
      if (key === 'HubScene') {
        setCurrentPillar(null);
        const stored = loadProgress();
        if (stored && stored.pillarsCompleted.length >= 4) {
          setPhase('final');
        } else {
          setPhase('hub');
        }
      } else if (key === 'PillarScene') {
        setPhase('pillar');
      }
    };

    EventBus.on('portal-entered', onPortalEntered);
    EventBus.on('pillar-progress-updated', onPillarProgress);
    EventBus.on('frase-clave-collected', onFraseClaveCollected);
    EventBus.on('pillar-completed', onPillarCompleted);
    EventBus.on('dialogue-finished', onDialogueFinished);
    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.off('portal-entered', onPortalEntered);
      EventBus.off('pillar-progress-updated', onPillarProgress);
      EventBus.off('frase-clave-collected', onFraseClaveCollected);
      EventBus.off('pillar-completed', onPillarCompleted);
      EventBus.off('dialogue-finished', onDialogueFinished);
      EventBus.off('current-scene-ready', onSceneReady);
    };
  }, []);

  // Cuando entramos al hub, iniciamos HubScene (solo si Phaser no está ya en transición)
  useEffect(() => {
    const sm = gameRef.current.scene?.scene;
    if (phase !== 'hub' || !sm) return;
    if (sm.isActive('PreloadScene')) return;
    if (sm.isActive('HubScene')) return;
    if (sm.isSleeping('HubScene')) {
      sm.wake('HubScene');
    } else {
      sm.start('HubScene');
    }
  }, [phase]);

  const handleMissionComplete = (newProgress: GameProgress): void => {
    setProgress(newProgress);
    setPhase('hub');
    EventBus.emit('lead-capture-complete');
  };

  return (
    <div className="fi-app">
      {phase === 'mission' && <MissionIntro onComplete={handleMissionComplete} />}

      {(phase === 'hub' || phase === 'pillar') && (
        <div className="fi-game-stage">
          <PhaserGame ref={gameRef} />
          <AgataDialogueOverlay />
        </div>
      )}

      {phase === 'final' && (
        <FinalScreen userName={progress?.name ?? ''} />
      )}
    </div>
  );
}
