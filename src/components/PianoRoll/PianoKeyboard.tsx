import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { KEY_TO_NOTE } from '../../utils/pianoKeyMap';
import styles from './PianoKeyboard.module.css';

const WHITE_W = 28;
const WHITE_H = 80;
const BLACK_W = 18;
const BLACK_H = 52;
const OCTAVE_W = 7 * WHITE_W;

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Left offset of each black key within its octave (px)
const BLACK_OFFSETS: Record<string, number> = {
  'C#': 1 * WHITE_W - BLACK_W / 2,
  'D#': 2 * WHITE_W - BLACK_W / 2,
  'F#': 4 * WHITE_W - BLACK_W / 2,
  'G#': 5 * WHITE_W - BLACK_W / 2,
  'A#': 6 * WHITE_W - BLACK_W / 2,
};

interface Props {
  stepIndex: number;
  currentNote: string;
  onSelectNote: (note: string) => void;
  onClose: () => void;
}

export function PianoKeyboard({ stepIndex, currentNote, onSelectNote, onClose }: Props) {
  const synthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
    }).toDestination();
    synthRef.current.volume.value = -12;
    return () => { synthRef.current?.dispose(); };
  }, []);

  // Keyboard shortcuts — capture phase to intercept before App.tsx handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = KEY_TO_NOTE[e.key.toLowerCase()];
      if (note) {
        e.stopPropagation();
        onSelectNote(note);
        return;
      }
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onSelectNote, onClose]);

  const handleNoteClick = async (note: string) => {
    try {
      await Tone.start();
      synthRef.current?.triggerAttackRelease(note, '8n');
    } catch {}
    onSelectNote(note);
  };

  const octaves = [1, 2, 3, 4];

  return (
    <div className={styles.pianoZone}>
      <div className={styles.pianoHeader}>
        <span className={styles.pianoTitle}>
          Step {stepIndex + 1}
          {currentNote && <span className={styles.currentNote}> — {currentNote}</span>}
        </span>
        <div className={styles.headerActions}>
          <button className={styles.clearBtn} onClick={() => onSelectNote('')}>Effacer</button>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
      </div>

      <div className={styles.keyboard}>
        {octaves.map(octave => (
          <div
            key={octave}
            className={styles.octave}
            style={{ width: OCTAVE_W, height: WHITE_H, position: 'relative', flexShrink: 0 }}
          >
            {/* Touches blanches */}
            {WHITE_NOTES.map((n, i) => {
              const note = `${n}${octave}`;
              const active = currentNote === note;
              return (
                <div
                  key={note}
                  className={`${styles.key} ${styles.white} ${active ? styles.active : ''}`}
                  style={{ position: 'absolute', left: i * WHITE_W, width: WHITE_W, height: WHITE_H }}
                  onClick={() => handleNoteClick(note)}
                  title={note}
                >
                  <span className={styles.keyLabel}>{note}</span>
                </div>
              );
            })}
            {/* Touches noires */}
            {Object.entries(BLACK_OFFSETS).map(([n, offset]) => {
              const note = `${n}${octave}`;
              const active = currentNote === note;
              return (
                <div
                  key={note}
                  className={`${styles.key} ${styles.black} ${active ? styles.active : ''}`}
                  style={{ position: 'absolute', left: offset, width: BLACK_W, height: BLACK_H }}
                  onClick={(e) => { e.stopPropagation(); handleNoteClick(note); }}
                  title={note}
                />
              );
            })}
          </div>
        ))}
      </div>

      <p className={styles.hint}>
        A S D F G H J = C→B (oct.3) · W E T Y U = touches noires · Échap = fermer
      </p>
    </div>
  );
}
