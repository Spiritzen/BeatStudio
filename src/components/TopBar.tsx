import { useState, useRef, useEffect } from 'react';
import type { Pattern } from '../types';
import { exportJson, copyPatternToClipboard, exportWav } from '../hooks/useExport';
import './TopBar.css';

interface TopBarProps {
  isPlaying: boolean;
  bpm: number;
  globalSteps: number;
  mode: 'tone' | 'sample';
  patternName: string;
  isDirty: boolean;
  onTogglePlay: () => void;
  onBpmChange: (bpm: number) => void;
  onStepsChange: (steps: number) => void;
  onModeChange: (mode: 'tone' | 'sample') => void;
  onSave: (name: string) => void;
  onPatternNameChange: (name: string) => void;
  onExportPattern: () => Pattern;
  onImportPattern: (p: Pattern) => void;
}

interface Prefab {
  name: string;
  file: string;
  description: string;
  emoji: string;
}

const PREFABS: Prefab[] = [
  {
    name: 'Default Beat',
    file: 'default.json',
    description: 'Pattern de démonstration',
    emoji: '🥁',
  },
  {
    name: 'Zelda Theme',
    file: 'ZeldaTheme_BeatStudio_v2.json',
    description: 'Thème principal de Zelda au piano',
    emoji: '🗡️',
  },
  {
    name: 'Jingle Bells Rock',
    file: 'JingleBellsRock_BeatStudio.json',
    description: 'Jingle Bells version rock — Guitare électrique',
    emoji: '🎸',
  },
];

export function TopBar({
  isPlaying, bpm, globalSteps, mode, patternName, isDirty,
  onTogglePlay, onBpmChange, onStepsChange, onModeChange,
  onSave, onPatternNameChange, onExportPattern, onImportPattern,
}: TopBarProps) {
  const [stepsInput, setStepsInput] = useState(String(globalSteps));
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(patternName);

  const commitName = () => {
    setEditingName(false);
    const trimmed = localName.trim() || patternName;
    setLocalName(trimmed);
    onPatternNameChange(trimmed);
  };

  const commitSteps = (raw: string) => {
    let val = parseInt(raw) || 16;
    val = Math.max(8, Math.min(256, val));
    val = Math.round(val / 4) * 4;
    setStepsInput(String(val));
    onStepsChange(val);
  };

  const handleStepsDelta = (delta: number) => {
    let val = Math.max(8, Math.min(256, globalSteps + delta));
    val = Math.round(val / 4) * 4;
    setStepsInput(String(val));
    onStepsChange(val);
  };

  if (String(globalSteps) !== stepsInput && document.activeElement?.className !== 'steps-input') {
    // only sync when not focused
  }

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState(patternName);
  const [exportStatus, setExportStatus] = useState<'idle' | 'recording' | 'encoding' | 'done' | 'error'>('idle');

  // Prefabs
  const [showPrefabs, setShowPrefabs] = useState(false);
  useEffect(() => {
    if (!showPrefabs) return;
    const close = () => setShowPrefabs(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showPrefabs]);

  const handleLoadPrefab = async (prefab: Prefab) => {
    const doLoad = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}patterns/${prefab.file}`);
        if (!res.ok) throw new Error(`Fichier introuvable : ${prefab.file}`);
        const pattern: Pattern = await res.json();
        onImportPattern(pattern);
        onPatternNameChange(prefab.name);
        setShowPrefabs(false);
      } catch (err) {
        console.error('Prefab load error:', err);
        alert(`Impossible de charger le prefab "${prefab.name}".`);
      }
    };

    if (isDirty) {
      const confirmed = window.confirm(
        `Voulez-vous charger "${prefab.name}" ?\nLes modifications non sauvegardées seront perdues.`
      );
      if (confirmed) await doLoad();
    } else {
      await doLoad();
    }
  };

  // Standalone load button
  const loadFileRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    loadFileRef.current?.click();
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const doLoad = () => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string) as Pattern;
          if (!parsed.tracks || !Array.isArray(parsed.tracks)) {
            alert('Format de fichier invalide.');
            return;
          }
          onImportPattern(parsed);
          onPatternNameChange(parsed.name || file.name.replace('.json', ''));
        } catch {
          alert('Fichier JSON invalide.');
        }
      };
      reader.readAsText(file);
      if (loadFileRef.current) loadFileRef.current.value = '';
    };

    if (isDirty) {
      const confirmed = window.confirm(
        'Voulez-vous charger ce pattern ?\nLes modifications non sauvegardées seront perdues.'
      );
      if (confirmed) doLoad();
      else if (loadFileRef.current) loadFileRef.current.value = '';
    } else {
      doLoad();
    }
  };

  const handleBpmChange = (delta: number) => {
    const next = Math.min(240, Math.max(40, bpm + delta));
    onBpmChange(next);
  };

  const handleBpmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) onBpmChange(Math.min(240, Math.max(40, val)));
  };

  const handleExportWav = async () => {
    setShowExportMenu(false);
    if (exportStatus !== 'idle') return;

    const wasPlaying = isPlaying;
    if (!wasPlaying) {
      onTogglePlay();
      await new Promise(r => setTimeout(r, 250));
    }

    try {
      await exportWav(patternName, globalSteps, bpm, (status) => setExportStatus(status));
    } catch {
      // error state set by exportWav
    } finally {
      if (!wasPlaying) {
        onTogglePlay();
      }
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <span className="topbar-title">BeatStudio</span>
      </div>

      <div className="pattern-name-wrapper">
        {editingName ? (
          <input
            className="pattern-name-input"
            value={localName}
            onChange={e => setLocalName(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') { setEditingName(false); setLocalName(patternName); }
            }}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <div
            className="pattern-name-display"
            onDoubleClick={() => { setEditingName(true); setLocalName(patternName); }}
            title="Double-clic pour renommer"
          >
            <span className="pattern-name-text">{patternName}</span>
            {isDirty && <span className="pattern-dirty-dot" title="Modifications non sauvegardées" />}
            <svg className="pattern-name-edit-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        )}
      </div>

      <div className="topbar-controls">
        <button
          className={`btn-play ${isPlaying ? 'playing' : ''}`}
          onClick={onTogglePlay}
          title="Play/Stop (Espace)"
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>

        <div className="bpm-control">
          <button className="bpm-btn" onClick={() => handleBpmChange(-1)}>−</button>
          <div className="bpm-display">
            <input
              type="number"
              min={40}
              max={240}
              value={bpm}
              onChange={handleBpmInput}
              className="bpm-input"
            />
            <span className="bpm-label">BPM</span>
          </div>
          <button className="bpm-btn" onClick={() => handleBpmChange(1)}>+</button>
        </div>

        <div className="steps-control">
          <span className="steps-label">STEPS</span>
          <button className="steps-btn" onClick={() => handleStepsDelta(-4)}>−</button>
          <input
            type="number"
            className="steps-input"
            value={stepsInput}
            min={8}
            max={256}
            step={4}
            onChange={e => setStepsInput(e.target.value)}
            onBlur={e => commitSteps(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          />
          <button className="steps-btn" onClick={() => handleStepsDelta(4)}>+</button>
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'tone' ? 'active' : ''}`}
            onClick={() => onModeChange('tone')}
          >Tone.js</button>
          <button
            className={`mode-btn ${mode === 'sample' ? 'active' : ''}`}
            onClick={() => onModeChange('sample')}
          >Samples</button>
        </div>
      </div>

      <div className="topbar-actions">
        {exportStatus !== 'idle' && exportStatus !== 'done' && exportStatus !== 'error' && (
          <span className="exporting-label">
            {exportStatus === 'recording' ? '⏺ Enregistrement...' : '⚙ Encodage WAV...'}
          </span>
        )}

        {/* Prefabs dropdown */}
        <div className="prefabs-wrap">
          <button
            className="btn-action prefabs-btn"
            onClick={(e) => { e.stopPropagation(); setShowPrefabs(v => !v); }}
            title="Charger un pattern prédéfini"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            Prefabs ▾
          </button>
          {showPrefabs && (
            <div className="prefabs-dropdown" onClick={e => e.stopPropagation()}>
              <div className="prefabs-title">Patterns prédéfinis</div>
              {PREFABS.map(prefab => (
                <button
                  key={prefab.file}
                  className="prefab-item"
                  onClick={() => handleLoadPrefab(prefab)}
                >
                  <span className="prefab-emoji">{prefab.emoji}</span>
                  <div className="prefab-text">
                    <span className="prefab-name">{prefab.name}</span>
                    <span className="prefab-desc">{prefab.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Standalone load button */}
        <button
          className="btn-action load-btn"
          onClick={handleLoadClick}
          title="Charger un pattern JSON"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          Charger
        </button>
        <input
          ref={loadFileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileLoad}
        />

        <button className="btn-action" onClick={() => setShowSaveModal(true)} title="Ctrl+S">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          Sauvegarder
        </button>

        <div className="export-wrapper">
          <button
            className="btn-action btn-export"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exporter ▾
          </button>
          {showExportMenu && (
            <div className="export-menu" onMouseLeave={() => setShowExportMenu(false)}>
              <button onClick={() => { exportJson(onExportPattern()); setShowExportMenu(false); }}>
                Exporter pattern JSON
              </button>
              <button onClick={handleExportWav} disabled={exportStatus !== 'idle'}>
                {exportStatus === 'idle' && 'Exporter WAV'}
                {exportStatus === 'recording' && '⏺ Enregistrement...'}
                {exportStatus === 'encoding' && '⚙ Encodage...'}
                {exportStatus === 'done' && '✅ Téléchargé !'}
                {exportStatus === 'error' && '❌ Erreur — réessayer'}
              </button>
              <button onClick={() => { copyPatternToClipboard(onExportPattern()); setShowExportMenu(false); }}>
                Copier pattern
              </button>
            </div>
          )}
        </div>
      </div>

      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Sauvegarder le pattern</h3>
            <input
              type="text"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Nom du pattern"
              className="modal-input"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') { onSave(saveName); setShowSaveModal(false); }
                if (e.key === 'Escape') setShowSaveModal(false);
              }}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSaveModal(false)}>Annuler</button>
              <button className="btn-confirm" onClick={() => { onSave(saveName); setShowSaveModal(false); }}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
