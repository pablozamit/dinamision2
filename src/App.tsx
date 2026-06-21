import { useState, useEffect, useRef } from 'react';
import PhaserGame, { type IRefPhaserGame } from './components/PhaserGame';
import MissionIntro from './components/MissionIntro';
import FinalScreen from './components/FinalScreen';
import AgataDialogueOverlay from './components/AgataDialogueOverlay';
import MobilePortalsOverlay from './components/MobilePortalsOverlay';

import { EventBus } from './game/EventBus';
import { loadProgress, saveProgress, type GameProgress } from './game/utils/storage';
import './index.css';

type AppPhase = 'mission' | 'hub' | 'pillar' | 'final';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('mission');
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [currentPillar, setCurrentPillar] = useState<string | null>(null);
  const gameRef = useRef<IRefPhaserGame>({ game: null, scene: null });

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

          {phase === 'hub' && (
            <MobilePortalsOverlay 
              pillarsCompleted={progress?.pillarsCompleted ?? []} 
              onPortalClick={(pillarId) => {
                EventBus.emit('portal-entered', pillarId);
              }}
            />
          )}
        </div>
      )}

      {phase === 'final' && (
        <FinalScreen userName={progress?.name ?? ''} />
      )}
    </div>
  );
}
