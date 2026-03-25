import { useRef } from 'react';
import type { Track } from '../../types';
import { StepCell } from './StepCell';
import { Playhead } from './Playhead';
import './CenterGrid.css';

const STEP_W = 28;
const STEP_GAP = 3;

interface CenterGridProps {
  tracks: Track[];
  globalSteps: number;
  currentStep: number;
  isPlaying: boolean;
  onToggleStep: (trackId: string, stepIndex: number) => void;
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
  zoom?: number;
}

export function CenterGrid({
  tracks, globalSteps, currentStep, isPlaying, onToggleStep, selectedTrackId, onSelectTrack, zoom = 1,
}: CenterGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const beatNumbers = Array.from({ length: globalSteps }, (_, i) => i);

  return (
    <div className="center-grid-wrapper">
      <div className="center-grid-scroll" ref={containerRef}>
        <div className="center-grid">
          {/* Header row with beat numbers */}
          <div className="grid-header">
            <div className="beat-numbers">
              {beatNumbers.map(i => {
                const isBar = i % 4 === 0;
                return (
                  <div
                    key={i}
                    className={`beat-num ${isBar ? 'beat-bar' : ''} ${i % 4 === 0 && i > 0 ? 'beat-separator' : ''}`}
                    style={{ width: STEP_W, marginLeft: (i % 4 === 0 && i > 0) ? 4 : 0 }}
                  >
                    {isBar ? Math.floor(i / 4) + 1 : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track rows */}
          <div className="grid-body" style={{ position: 'relative', zoom }}>
            {tracks.map(track => (
              <div
                key={track.id}
                className={`grid-row ${selectedTrackId === track.id ? 'selected' : ''}`}
                onClick={() => onSelectTrack(track.id)}
              >
                {beatNumbers.map(i => {
                  const isPlaying2 = isPlaying && currentStep === i;
                  const isBar = i % 4 === 0 && i > 0;
                  return (
                    <StepCell
                      key={i}
                      stepIndex={i}
                      active={track.steps[i] ?? false}
                      playing={isPlaying2}
                      disabled={false}
                      color={track.color}
                      isBarLine={isBar}
                      onClick={() => onToggleStep(track.id, i)}
                    />
                  );
                })}
              </div>
            ))}

            <Playhead
              currentStep={currentStep}
              stepWidth={STEP_W}
              stepGap={STEP_GAP}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
