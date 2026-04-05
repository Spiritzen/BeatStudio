import { useEffect, useState, useCallback, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel/LeftPanel';
import { CenterGrid } from './components/CenterGrid/CenterGrid';
import { RightPanel } from './components/RightPanel/RightPanel';
import { Footer } from './components/Footer';
import { WelcomeModal } from './components/WelcomeModal';
import { usePattern } from './hooks/usePattern';
import { useSequencer } from './hooks/useSequencer';
import { isMobileDevice } from './utils/deviceDetect';
import type { Track, Pattern } from './types';

import DevPremiumToggle from "./dev/DevPremiumToggle";
import AuthForm from "./components/Auth/AuthForm";
import { supabase } from "./lib/supabaseClient"; // ✅ AJOUT

import './styles/globals.css';
import './App.css';

export default function App() {
  const [mode, setMode] = useState<'tone' | 'sample'>('tone');
  const [zoom, setZoom] = useState(1);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mobileOverride, setMobileOverride] = useState(false);

  const [user, setUser] = useState<any>(null); // ✅ USER STATE

  const handleZoomChange = (val: number) => {
    setZoom(Math.round(Math.max(0.5, Math.min(2, val)) * 10) / 10);
  };

  const {
    tracks,
    globalSteps, updateGlobalSteps,
    selectedTrackId, setSelectedTrackId,
    bpm, updateBpm,
    patternName, setPatternName,
    toggleStep, undo,
    addTrack, removeTrack, updateTrack, reorderTracks, duplicateTrack,
    savePattern, loadPattern, exportPattern,
    toggleMute, toggleSolo,
    togglePianoStep, setPianoStepNote,
    changeTrackInstrument,
  } = usePattern();

  const [isDirty, setIsDirty] = useState(false);
  const firstMountRef = useRef(false);
  const suppressDirtyRef = useRef(false);

  useEffect(() => {
    if (!firstMountRef.current) {
      firstMountRef.current = true;
      return;
    }
    if (suppressDirtyRef.current) {
      suppressDirtyRef.current = false;
      return;
    }
    setIsDirty(true);
  }, [tracks, bpm, globalSteps]);

  const handleSavePattern = useCallback((name: string) => {
    savePattern(name);
    setIsDirty(false);
  }, [savePattern]);

  const handleLoadPattern = useCallback((pattern: Pattern) => {
    suppressDirtyRef.current = true;
    loadPattern(pattern);
    setIsDirty(false);
  }, [loadPattern]);

  // 🔥 DEMO ZELDA
  const handleDemo = async () => {
    try {
      const url = `${import.meta.env.BASE_URL}patterns/ZeldaTheme_BeatStudio_v2.json`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const pattern = await res.json();

      handleLoadPattern(pattern);
      setShowWelcome(false);

    } catch (err) {
      console.error("Erreur chargement démo Zelda :", err);
      alert("Impossible de charger la démo Zelda");
    }
  };

  const handleNew = () => {
    handleLoadPattern({
      version: '1.0.0',
      bpm: 120,
      globalSteps: 16,
      tracks: [],
      createdAt: new Date().toISOString()
    });
    setShowWelcome(false);
  };

  const handleLoad = (pattern: any) => {
    handleLoadPattern(pattern);
    setShowWelcome(false);
  };

  const { isPlaying, currentStep, togglePlay } =
    useSequencer(tracks, bpm, globalSteps, mode);

  const selectedTrack =
    tracks.find(t => t.id === selectedTrackId) ?? null;

  const handleUpdateTrack = useCallback((changes: Partial<Track>) => {
    if (!selectedTrackId) return;

    if (changes.instrument !== undefined) {
      changeTrackInstrument(selectedTrackId, changes.instrument);
      return;
    }

    updateTrack(selectedTrackId, changes);
  }, [selectedTrackId, changeTrackInstrument, updateTrack]);

  // ⌨️ SHORTCUTS
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        togglePlay();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !isInput) {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSavePattern(patternName || 'default');
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !isInput) {
        e.preventDefault();
        if (selectedTrackId) duplicateTrack(selectedTrackId);
      }

      if (e.key === 'm' && !isInput && selectedTrackId) {
        toggleMute(selectedTrackId);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    togglePlay,
    undo,
    handleSavePattern,
    patternName,
    selectedTrackId,
    duplicateTrack,
    toggleMute
  ]);

  // 🔐 AUTH LISTENER
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 📱 MOBILE
  if (isMobileDevice() && !mobileOverride) {
    return <div>Mobile non supporté</div>;
  }

  return (
    <>
      {showWelcome && (
        <WelcomeModal
          onDemo={handleDemo}
          onNew={handleNew}
          onLoad={handleLoad}
        />
      )}

      <div className="app">
        <TopBar
          isPlaying={isPlaying}
          bpm={bpm}
          globalSteps={globalSteps}
          mode={mode}
          patternName={patternName}
          isDirty={isDirty}
          onTogglePlay={togglePlay}
          onBpmChange={updateBpm}
          onStepsChange={updateGlobalSteps}
          onModeChange={setMode}
          onSave={handleSavePattern}
          onPatternNameChange={setPatternName}
          onExportPattern={exportPattern}
          onImportPattern={handleLoadPattern}
        />

        <div className="app-body">
          <LeftPanel
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            onSelectTrack={setSelectedTrackId}
            onMute={toggleMute}
            onSolo={toggleSolo}
            onVolumeChange={(id, vol) =>
              updateTrack(id, { volume: vol })
            }
            onNameChange={(id, name) =>
              updateTrack(id, { name })
            }
            onAddTrack={(name, instr) =>
              addTrack(name, instr)
            }
            onReorder={reorderTracks}
          />

          <CenterGrid
            tracks={tracks}
            globalSteps={globalSteps}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onToggleStep={toggleStep}
            onTogglePianoStep={togglePianoStep}
            onSetPianoStepNote={setPianoStepNote}
            selectedTrackId={selectedTrackId}
            onSelectTrack={setSelectedTrackId}
            zoom={zoom}
          />

          <RightPanel
            track={selectedTrack}
            mode={mode}
            onUpdateTrack={handleUpdateTrack}
            onRemoveTrack={() =>
              selectedTrackId && removeTrack(selectedTrackId)
            }
            onDuplicateTrack={() =>
              selectedTrackId && duplicateTrack(selectedTrackId)
            }
          />
        </div>

        <Footer zoom={zoom} onZoomChange={handleZoomChange} />
      </div>

      {/* 🔥 DEV TOOLS */}
      <DevPremiumToggle />
     {/* <AuthForm /> */}

      {/* 👤 USER CONNECTÉ */}
      {user && (
        <div style={{
          position: "fixed",
          top: 20,
          left: 260,
          background: "#111",
          padding: "10px",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "12px"
        }}>
          <div>👤 {user.email}</div>

          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              marginTop: "6px",
              padding: "4px 8px",
              background: "#7c3aed",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
}