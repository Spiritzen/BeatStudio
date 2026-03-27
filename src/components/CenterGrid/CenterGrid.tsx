import { useRef, useState } from 'react';
import type { Track } from '../../types';
import { StepCell } from './StepCell';
import { Playhead } from './Playhead';
import { PianoStepCell } from '../PianoRoll/PianoStepCell';
import { PianoKeyboard } from '../PianoRoll/PianoKeyboard';
import { isMelodic } from '../../utils/synths';
import './CenterGrid.css';

const STEP_W = 28;
const STEP_GAP = 3;

interface CenterGridProps {
  tracks: Track[];
  globalSteps: number;
  currentStep: number;
  isPlaying: boolean;
  onToggleStep: (trackId: string, stepIndex: number) => void;
  onTogglePianoStep: (trackId: string, stepIndex: number) => void;
  onSetPianoStepNote: (trackId: string, stepIndex: number, note: string) => void;
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
  zoom?: number;
}

export function CenterGrid({
  tracks, globalSteps, currentStep, isPlaying,
  onToggleStep, onTogglePianoStep, onSetPianoStepNote,
  selectedTrackId, onSelectTrack, zoom = 1,
}: CenterGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPianoStep, setSelectedPianoStep] = useState<{ trackId: string; stepIndex: number } | null>(null);

  const beatNumbers = Array.from({ length: globalSteps }, (_, i) => i);

  const handlePianoStepClick = (trackId: string, stepIndex: number) => {
    onTogglePianoStep(trackId, stepIndex);
    setSelectedPianoStep(prev =>
      prev?.trackId === trackId && prev?.stepIndex === stepIndex ? null : { trackId, stepIndex }
    );
  };

  const handleClosePiano = () => setSelectedPianoStep(null);

  const handleSetNote = (note: string) => {
    if (!selectedPianoStep) return;
    onSetPianoStepNote(selectedPianoStep.trackId, selectedPianoStep.stepIndex, note);
    if (note === '') setSelectedPianoStep(null);
  };

  const selectedPianoTrack = selectedPianoStep
    ? tracks.find(t => t.id === selectedPianoStep.trackId)
    : null;
  const currentPianoNote = selectedPianoTrack?.pianoSteps?.[selectedPianoStep!?.stepIndex]?.note ?? '';

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
            {tracks.map(track => {
              const showPianoCell = isMelodic(track.instrument) && !!track.pianoSteps;
              return (
                <div
                  key={track.id}
                  className={`grid-row ${selectedTrackId === track.id ? 'selected' : ''}`}
                  onClick={() => onSelectTrack(track.id)}
                >
                  {beatNumbers.map(i => {
                    const isPlayingStep = isPlaying && currentStep === i;
                    const isBar = i % 4 === 0 && i > 0;

                    if (showPianoCell) {
                      const step = track.pianoSteps?.[i] ?? { active: false, note: '' };
                      const isSelected = selectedPianoStep?.trackId === track.id && selectedPianoStep?.stepIndex === i;
                      return (
                        <PianoStepCell
                          key={i}
                          step={step}
                          isPlaying={isPlayingStep}
                          isSelected={isSelected}
                          trackColor={track.color}
                          isBarLine={isBar}
                          onClick={() => handlePianoStepClick(track.id, i)}
                        />
                      );
                    }

                    return (
                      <StepCell
                        key={i}
                        stepIndex={i}
                        active={track.steps[i] ?? false}
                        playing={isPlayingStep}
                        disabled={false}
                        color={track.color}
                        isBarLine={isBar}
                        onClick={() => onToggleStep(track.id, i)}
                      />
                    );
                  })}
                </div>
              );
            })}

            <Playhead
              currentStep={currentStep}
              stepWidth={STEP_W}
              stepGap={STEP_GAP}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      </div>

      {selectedPianoStep && (
        <PianoKeyboard
          stepIndex={selectedPianoStep.stepIndex}
          currentNote={currentPianoNote}
          instrumentName={selectedPianoTrack?.instrument}
          onSelectNote={handleSetNote}
          onClose={handleClosePiano}
        />
      )}
    </div>
  );
}
