import { useEffect, useState, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel/LeftPanel';
import { CenterGrid } from './components/CenterGrid/CenterGrid';
import { RightPanel } from './components/RightPanel/RightPanel';
import { Footer } from './components/Footer';
import { WelcomeModal } from './components/WelcomeModal';
import { usePattern } from './hooks/usePattern';
import { useSequencer } from './hooks/useSequencer';
import type { Track, InstrumentName } from './types';
import './styles/globals.css';
import './App.css';

export default function App() {
  const [mode, setMode] = useState<'tone' | 'sample'>('tone');
  const [zoom, setZoom] = useState(1);
  const [showWelcome, setShowWelcome] = useState(true);

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
  } = usePattern();

  const handleDemo = () => setShowWelcome(false);

  const handleNew = () => {
    loadPattern({ version: '1.0.0', bpm: 120, globalSteps: 16, tracks: [], createdAt: new Date().toISOString() });
    setShowWelcome(false);
  };

  const handleLoad = (pattern: any) => {
    loadPattern(pattern);
    setShowWelcome(false);
  };

  const { isPlaying, currentStep, togglePlay } = useSequencer(tracks, bpm, globalSteps, mode);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId) ?? null;

  const handleUpdateTrack = useCallback((changes: Partial<Track>) => {
    if (!selectedTrackId) return;
    // Switching to Piano: initialize pianoSteps if not already present
    if (changes.instrument === 'Piano') {
      const track = tracks.find(t => t.id === selectedTrackId);
      if (track && !track.pianoSteps) {
        updateTrack(selectedTrackId, {
          ...changes,
          pianoSteps: Array(globalSteps).fill(null).map(() => ({ active: false, note: '' })),
        });
        return;
      }
    }
    updateTrack(selectedTrackId, changes);
  }, [selectedTrackId, tracks, globalSteps, updateTrack]);

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
        savePattern('default');
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
  }, [togglePlay, undo, savePattern, selectedTrackId, duplicateTrack, toggleMute]);

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
        onTogglePlay={togglePlay}
        onBpmChange={updateBpm}
        onStepsChange={updateGlobalSteps}
        onModeChange={setMode}
        onSave={savePattern}
        onPatternNameChange={setPatternName}
        onExportPattern={exportPattern}
        onImportPattern={loadPattern}
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
