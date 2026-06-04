import { useState, useEffect, useRef } from 'react';
import PhaserGame, { type IRefPhaserGame } from './components/PhaserGame';
import MissionIntro from './components/MissionIntro';
import ProgressBar from './components/ProgressBar';
import BrandPanel from './components/BrandPanel';
import { EventBus } from './game/EventBus';
import { loadProgress, saveProgress, type GameProgress } from './game/utils/storage';
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
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [currentPillar, setCurrentPillar] = useState<string | null>(null);
  const gameRef = useRef<IRefPhaserGame>({ game: null, scene: null });

  // Re-hidratar progreso persistido al montar
  useEffect(() => {
    const stored = loadProgress();
    if (stored) {
      setProgress(stored);
      setPhase('hub');
    }
  }, []);

  // Suscribirse a eventos del juego
  useEffect(() => {
    const onPortalEntered = (pillarId: string): void => {
      setCurrentPillar(pillarId);
      setPhase('pillar');
    };

    const onBrandSelected = (brand: Brand): void => {
      setActiveBrand(brand);
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

    const onSceneReady = (scene: Phaser.Scene): void => {
      // Si entramos al hub y no estamos en pillar, no hacemos nada especial
      // La escena ya está corriendo por su cuenta.
      void scene;
    };

    EventBus.on('portal-entered', onPortalEntered);
    EventBus.on('brand-selected', onBrandSelected);
    EventBus.on('pillar-progress-updated', onPillarProgress);
    EventBus.on('frase-clave-collected', onFraseClaveCollected);
    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.off('portal-entered', onPortalEntered);
      EventBus.off('brand-selected', onBrandSelected);
      EventBus.off('pillar-progress-updated', onPillarProgress);
      EventBus.off('frase-clave-collected', onFraseClaveCollected);
      EventBus.off('current-scene-ready', onSceneReady);
    };
  }, []);

  // Cuando entramos al hub, iniciamos HubScene
  useEffect(() => {
    if (phase === 'hub' && gameRef.current.scene) {
      gameRef.current.scene.scene.start('HubScene');
    }
  }, [phase]);

  const handleMissionComplete = (newProgress: GameProgress): void => {
    setProgress(newProgress);
    setPhase('hub');
  };

  const handleCloseBrandPanel = (): void => {
    setActiveBrand(null);
    EventBus.emit('panel-closed');
  };

  const completedPillars = progress?.pillarsCompleted.length ?? 0;

  return (
    <div className="fi-app">
      {phase === 'mission' && <MissionIntro onComplete={handleMissionComplete} />}

      {(phase === 'hub' || phase === 'pillar') && (
        <div className="fi-game-stage">
          <PhaserGame ref={gameRef} />
          {(phase === 'hub' || phase === 'pillar') && (
            <ProgressBar
              completedPillars={completedPillars}
              totalPillars={3}
              currentPillar={currentPillar}
              frasesClaveCount={progress?.frasesClave.length ?? 0}
            />
          )}
          <BrandPanel brand={activeBrand} onClose={handleCloseBrandPanel} />
        </div>
      )}

      {phase === 'final' && (
        <div className="fi-screen fi-screen--final">
          <p>Pantalla final — pendiente para slice 6</p>
        </div>
      )}
    </div>
  );
}
