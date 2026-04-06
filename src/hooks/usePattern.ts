import { useState, useCallback, useRef, useEffect } from 'react';
import type { Track, InstrumentName, Pattern, PianoStep } from '../types';
import { TRACK_COLORS } from '../types';
import { isMelodic } from '../utils/synths';

const DEFAULT_STEPS = 16;

function snapTo4(val: number): number {
  return Math.round(Math.max(8, Math.min(256, val)) / 4) * 4;
}

function resizePattern(pattern: boolean[], newSize: number): boolean[] {
  if (newSize > pattern.length) {
    return [...pattern, ...Array(newSize - pattern.length).fill(false)];
  }
  return pattern.slice(0, newSize);
}

function resizePianoSteps(steps: PianoStep[], newSize: number): PianoStep[] {
  if (newSize > steps.length) {
    return [...steps, ...Array(newSize - steps.length).fill(null).map(() => ({ active: false, note: '' }))];
  }
  return steps.slice(0, newSize);
}

function makePianoSteps(count: number): PianoStep[] {
  return Array(count).fill(null).map(() => ({ active: false, note: '' }));
}

function createDefaultTrack(id: string, name: string, instrument: InstrumentName, color: string, steps = DEFAULT_STEPS): Track {
  return {
    id,
    name,
    color,
    instrument,
    steps: Array(steps).fill(false),
    volume: 80,
    pan: 0,
    muted: false,
    soloed: false,
    fx: {
      reverb: { enabled: false, wet: 0.3 },
      delay: { enabled: false, wet: 0.3 },
      distortion: { enabled: false, wet: 0.3 },
      filter: { enabled: false, frequency: 1000, type: 'lowpass' },
    },
    ...(isMelodic(instrument) ? { pianoSteps: makePianoSteps(steps) } : {}),
  };
}

function buildDefaultTracks(): Track[] {
  const tracks = [
    createDefaultTrack('1', 'Kick', 'Kick', '#f59e0b'),
    createDefaultTrack('2', 'Snare', 'Snare', '#ef4444'),
    createDefaultTrack('3', 'Hi-Hat', 'HiHat', '#10b981'),
    createDefaultTrack('4', 'Bass', 'Bass Synth', '#7c3aed'),
  ];
  tracks[0].steps[0] = true;
  tracks[0].steps[4] = true;
  tracks[0].steps[8] = true;
  tracks[0].steps[12] = true;
  tracks[1].steps[4] = true;
  tracks[1].steps[12] = true;
  tracks[2].steps[2] = true;
  tracks[2].steps[6] = true;
  tracks[2].steps[10] = true;
  tracks[2].steps[14] = true;
  return tracks;
}

function loadFromStorage(): { tracks: Track[]; bpm: number; globalSteps: number; name: string } | null {
  try {
    const raw = localStorage.getItem('beatstudio-patterns');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.patterns && data.lastUsed && data.patterns[data.lastUsed]) {
      const p = data.patterns[data.lastUsed];
      return {
        tracks: p.tracks,
        bpm: p.bpm ?? 120,
        globalSteps: p.globalSteps ?? DEFAULT_STEPS,
        name: data.lastUsed || 'default',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function usePattern() {
  const stored = loadFromStorage();
  const [tracks, setTracks] = useState<Track[]>(stored?.tracks ?? buildDefaultTracks());
  const [globalSteps, setGlobalSteps] = useState<number>(stored?.globalSteps ?? DEFAULT_STEPS);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
    (stored?.tracks ?? buildDefaultTracks())[0]?.id ?? null
  );
  const [bpm, setBpm] = useState<number>(stored?.bpm ?? 120);
  const [patternName, setPatternNameState] = useState<string>(stored?.name ?? 'default');
  const patternNameRef = useRef<string>(stored?.name ?? 'default');
  const historyRef = useRef<Track[][]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setPatternName = useCallback((name: string) => {
    patternNameRef.current = name;
    setPatternNameState(name);
  }, []);

  const autoSave = useCallback((newTracks: Track[], newBpm: number, newGlobalSteps: number) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const raw = localStorage.getItem('beatstudio-patterns');
        const data = raw ? JSON.parse(raw) : { patterns: {}, lastUsed: '' };
        const pName = patternNameRef.current || 'default';
        data.patterns[pName] = {
          version: '1.0.0',
          name: pName,
          bpm: newBpm,
          globalSteps: newGlobalSteps,
          tracks: newTracks,
          createdAt: new Date().toISOString(),
        };
        data.lastUsed = pName;
        localStorage.setItem('beatstudio-patterns', JSON.stringify(data));
      } catch {}
    }, 500);
  }, []);

  const updateGlobalSteps = useCallback((val: number) => {
    const snapped = snapTo4(val);
    setGlobalSteps(snapped);
    setTracks(prev => {
      const next = prev.map(t => ({
      ...t,
      steps: resizePattern(t.steps, snapped),
      ...(t.pianoSteps ? { pianoSteps: resizePianoSteps(t.pianoSteps, snapped) } : {}),
    }));
      autoSave(next, bpm, snapped);
      return next;
    });
  }, [bpm, autoSave]);

  const toggleStep = useCallback((trackId: string, stepIndex: number) => {
    setTracks(prev => {
      historyRef.current.push(prev);
      if (historyRef.current.length > 50) historyRef.current.shift();
      const next = prev.map(t =>
        t.id === trackId
          ? { ...t, steps: t.steps.map((s, i) => (i === stepIndex ? !s : s)) }
          : t
      );
      autoSave(next, bpm, globalSteps);
      return next;
    });
  }, [bpm, globalSteps, autoSave]);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    setTracks(prev);
    autoSave(prev, bpm, globalSteps);
  }, [bpm, globalSteps, autoSave]);

  const addTrack = useCallback((name: string, instrument: InstrumentName) => {
    setTracks(prev => {
      const id = Date.now().toString();
      const color = TRACK_COLORS[prev.length % TRACK_COLORS.length];
      const newTrack = createDefaultTrack(id, name, instrument, color, globalSteps);
      const next = [...prev, newTrack];
      autoSave(next, bpm, globalSteps);
      setSelectedTrackId(id);
      return next;
    });
  }, [bpm, globalSteps, autoSave]);

  const removeTrack = useCallback((trackId: string) => {
    setTracks(prev => {
      historyRef.current.push(prev);
      const next = prev.filter(t => t.id !== trackId);
      autoSave(next, bpm, globalSteps);
      setSelectedTrackId(s => s === trackId ? (next[0]?.id ?? null) : s);
      return next;
    });
  }, [bpm, globalSteps, autoSave]);

  const updateTrack = useCallback((trackId: string, changes: Partial<Track>) => {
    setTracks(prev => {
      const next = prev.map(t => (t.id === trackId ? { ...t, ...changes } : t));
      autoSave(next, bpm, globalSteps);
      return next;
    });
  }, [bpm, globalSteps, autoSave]);

  const updateBpm = useCallback((newBpm: number) => {
    setBpm(newBpm);
    setTracks(prev => { autoSave(prev, newBpm, globalSteps); return prev; });
  }, [globalSteps, autoSave]);

  const reorderTracks = useCallback((fromIndex: number, toIndex: number) => {
    setTracks(prev => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      autoSave(next, bpm, globalSteps);
      return next;
    });
  }, [bpm, globalSteps, autoSave]);

  const duplicateTrack = useCallback((trackId: string) => {
    setTracks(prev => {
      const src = prev.find(t => t.id === trackId);
      if (!src) return prev;
      const newTrack: Track = {
        ...src,
        id: Date.now().toString(),
        name: src.name + ' (copy)',
        steps: [...src.steps],
        ...(src.pianoSteps ? { pianoSteps: src.pianoSteps.map(s => ({ ...s })) } : {}),
        fx: {
          reverb: { ...src.fx.reverb },
          delay: { ...src.fx.delay },
          distortion: { ...src.fx.distortion },
          filter: { ...src.fx.filter },
        },
      };
      const idx = prev.indexOf(src);
      const next = [...prev.slice(0, idx + 1), newTrack, ...prev.slice(idx + 1)];
      autoSave(next, bpm, globalSteps);
      setSelectedTrackId(newTrack.id);
      return next;
    });
  }, [bpm, globalSteps, autoSave]);

  const savePattern = useCallback((name: string) => {
    setPatternName(name);
    try {
      const raw = localStorage.getItem('beatstudio-patterns');
      const data = raw ? JSON.parse(raw) : { patterns: {}, lastUsed: '' };
      data.patterns[name] = {
        version: '1.0.0',
        name,
        bpm,
        globalSteps,
        tracks,
        createdAt: new Date().toISOString(),
      };
      data.lastUsed = name;
      localStorage.setItem('beatstudio-patterns', JSON.stringify(data));
    } catch {}
  }, [bpm, globalSteps, tracks, setPatternName]);

  const loadPattern = useCallback((pattern: Pattern) => {
    const steps = pattern.globalSteps ?? DEFAULT_STEPS;
    if (pattern.name) setPatternName(pattern.name);
    setGlobalSteps(steps);
    setTracks(pattern.tracks);
    setBpm(pattern.bpm);
    setSelectedTrackId(pattern.tracks[0]?.id ?? null);
  }, [setPatternName]);

  const exportPattern = useCallback((): Pattern => ({
    version: '1.0.0',
    name: patternName,
    bpm,
    globalSteps,
    tracks,
    createdAt: new Date().toISOString(),
  }), [patternName, bpm, globalSteps, tracks]);

  // First-launch: fetch default pattern if localStorage is empty
  useEffect(() => {
    const raw = localStorage.getItem('beatstudio-patterns');
    if (!raw) {
      fetch(`${import.meta.env.BASE_URL}patterns/default.json`)
        .then(r => r.json())
        .then((p: Pattern) => loadPattern(p))
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePianoStep = useCallback((trackId: string, stepIndex: number) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId || !t.pianoSteps) return t;
      const newSteps = [...t.pianoSteps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], active: !newSteps[stepIndex].active };
      return { ...t, pianoSteps: newSteps };
    }));
  }, []);

  const setPianoStepNote = useCallback((trackId: string, stepIndex: number, note: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId || !t.pianoSteps) return t;
      const newSteps = [...t.pianoSteps];
      newSteps[stepIndex] = { active: note !== '', note };
      return { ...t, pianoSteps: newSteps };
    }));
  }, []);

  const changeTrackInstrument = useCallback((trackId: string, newInst: InstrumentName) => {
    setTracks(prev => {
      const next = prev.map(t => {
        if (t.id !== trackId) return t;
        const wasMelodic = isMelodic(t.instrument);
        const willBeMelodic = isMelodic(newInst);

        // Mélodique → Mélodique : conserver pianoSteps
        if (wasMelodic && willBeMelodic) {
          return { ...t, instrument: newInst };
        }
        // Percussion → Mélodique : initialiser pianoSteps depuis le pattern
        if (!wasMelodic && willBeMelodic) {
          const pianoSteps: PianoStep[] = t.steps.map(active => ({ active, note: '' }));
          return { ...t, instrument: newInst, pianoSteps };
        }
        // Mélodique → Percussion : effacer pianoSteps, reconvertir en pattern booléen
        if (wasMelodic && !willBeMelodic) {
          const steps = t.pianoSteps ? t.pianoSteps.map(ps => ps.active) : t.steps;
          return { ...t, instrument: newInst, pianoSteps: undefined, steps };
        }
        // Percussion → Percussion : juste changer l'instrument
        return { ...t, instrument: newInst };
      });
      autoSave(next, bpm, globalSteps);
      return next;
    });
  }, [bpm, globalSteps, autoSave]);

  const toggleMute = useCallback((trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  }, []);

  const toggleSolo = useCallback((trackId: string) => {
    setTracks(prev => {
      const isSoloed = prev.find(t => t.id === trackId)?.soloed;
      return prev.map(t => t.id === trackId ? { ...t, soloed: !isSoloed } : { ...t, soloed: false });
    });
  }, []);

  return {
    tracks, setTracks,
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
  };
}
