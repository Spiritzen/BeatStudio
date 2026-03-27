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
import type { Track, InstrumentName, Pattern } from './types';
import './styles/globals.css';
import './App.css';

export default function App() {
  const [mode, setMode] = useState<'tone' | 'sample'>('tone');
  const [zoom, setZoom] = useState(1);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mobileOverride, setMobileOverride] = useState(false);

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

  // ── Dirty tracking ───────────────────────────────────────────────
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
  // ─────────────────────────────────────────────────────────────────

  const handleDemo = () => setShowWelcome(false);

  const handleNew = () => {
    handleLoadPattern({ version: '1.0.0', bpm: 120, globalSteps: 16, tracks: [], createdAt: new Date().toISOString() });
    setShowWelcome(false);
  };

  const handleLoad = (pattern: any) => {
    handleLoadPattern(pattern);
    setShowWelcome(false);
  };

  const { isPlaying, currentStep, togglePlay } = useSequencer(tracks, bpm, globalSteps, mode);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId) ?? null;

  const handleUpdateTrack = useCallback((changes: Partial<Track>) => {
    if (!selectedTrackId) return;
    if (changes.instrument !== undefined) {
      changeTrackInstrument(selectedTrackId, changes.instrument);
      return;
    }
    updateTrack(selectedTrackId, changes);
  }, [selectedTrackId, changeTrackInstrument, updateTrack]);

  // Keyboard shortcuts
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
  }, [togglePlay, undo, handleSavePattern, patternName, selectedTrackId, duplicateTrack, toggleMute]);

  // ── Écran mobile ─────────────────────────────────────────────────
  if (isMobileDevice() && !mobileOverride) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#13131f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px', padding: '32px',
        fontFamily: 'sans-serif',
      }}>
        <div style={{ fontSize: '52px' }}>🖥️</div>
        <p style={{ fontSize: '18px', fontWeight: 700, color: '#7c3aed', margin: 0, textAlign: 'center' }}>
          BeatStudio
        </p>
        <p style={{ fontSize: '14px', color: '#9090b0', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
          BeatStudio est optimisé pour une utilisation sur ordinateur.
          Pour une expérience complète, ouvrez cette page sur desktop.
        </p>
        <a
          href={window.location.href}
          style={{
            fontSize: '13px', color: '#7c3aed',
            textDecoration: 'underline', margin: 0,
          }}
        >
          Ouvrir sur desktop
        </a>
        <button
          onClick={() => setMobileOverride(true)}
          style={{
            marginTop: '8px',
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid #444',
            borderRadius: '6px',
            color: '#9090b0',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Continuer quand même
        </button>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────

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
          onVolumeChange={(id, vol) => updateTrack(id, { volume: vol })}
          onNameChange={(id, name) => updateTrack(id, { name })}
          onAddTrack={(name: string, instr: InstrumentName) => addTrack(name, instr)}
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
          onRemoveTrack={() => selectedTrackId && removeTrack(selectedTrackId)}
          onDuplicateTrack={() => selectedTrackId && duplicateTrack(selectedTrackId)}
        />
      </div>

      <Footer zoom={zoom} onZoomChange={handleZoomChange} />
    </div>
    </>
  );
}
