import './StepCell.css';

interface StepCellProps {
  active: boolean;
  playing: boolean;
  disabled: boolean;
  color: string;
  stepIndex: number;
  isBarLine: boolean;
  onClick: () => void;
}

export function StepCell({ active, playing, disabled, color, isBarLine, onClick }: StepCellProps) {
  return (
    <div
      className={`step-cell ${active ? 'on' : 'off'} ${playing ? 'playing' : ''} ${disabled ? 'disabled' : ''} ${isBarLine ? 'bar-line' : ''}`}
      style={active ? ({
        '--track-color': color,
        background: color,
        boxShadow: playing
          ? `0 0 10px ${color}, 0 0 20px ${color}60`
          : `0 0 4px ${color}80`,
      } as React.CSSProperties) : undefined}
      onClick={disabled ? undefined : onClick}
    />
  );
}
