import './Playhead.css';

interface PlayheadProps {
  currentStep: number;
  stepWidth: number;
  stepGap: number;
  isPlaying: boolean;
}

export function Playhead({ currentStep, stepWidth, stepGap, isPlaying }: PlayheadProps) {
  if (!isPlaying || currentStep < 0) return null;

  const HEADER_H = 28;
  // Calculate X position accounting for bar separators (every 4 steps)
  const barsBefore = Math.floor(currentStep / 4);
  const x = currentStep * (stepWidth + stepGap) + barsBefore * 4 + (stepWidth / 2) - 1;

  return (
    <div
      className="playhead"
      style={{
        left: x,
        top: HEADER_H,
      }}
    />
  );
}
