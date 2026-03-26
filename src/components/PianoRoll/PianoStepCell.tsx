import type { PianoStep } from '../../types';
import styles from './PianoStepCell.module.css';

interface Props {
  step: PianoStep;
  isPlaying: boolean;
  isSelected: boolean;
  trackColor: string;
  isBarLine: boolean;
  onClick: () => void;
}

export function PianoStepCell({ step, isPlaying, isSelected, trackColor, isBarLine, onClick }: Props) {
  return (
    <div
      className={`${styles.cell} ${step.active ? styles.on : styles.off} ${isPlaying ? styles.playing : ''} ${isSelected ? styles.selected : ''} ${isBarLine ? styles.barLine : ''}`}
      style={step.active ? { background: trackColor, borderColor: 'transparent' } : undefined}
      onClick={onClick}
    >
      {step.active && step.note && (
        <span className={styles.noteLabel}>{step.note}</span>
      )}
    </div>
  );
}
