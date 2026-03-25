import { useState, useRef } from 'react';
import type { Track, InstrumentName } from '../../types';
import { TrackItem } from './TrackItem';
import { AddTrackModal } from './AddTrackModal';
import './LeftPanel.css';

interface LeftPanelProps {
  tracks: Track[];
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
  onMute: (id: string) => void;
  onSolo: (id: string) => void;
  onVolumeChange: (id: string, vol: number) => void;
  onNameChange: (id: string, name: string) => void;
  onAddTrack: (name: string, instr: InstrumentName) => void;
  onReorder: (from: number, to: number) => void;
}

export function LeftPanel({
  tracks, selectedTrackId,
  onSelectTrack, onMute, onSolo,
  onVolumeChange, onNameChange,
  onAddTrack, onReorder,
}: LeftPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (toIndex: number) => {
    if (dragIndexRef.current !== null && dragIndexRef.current !== toIndex) {
      onReorder(dragIndexRef.current, toIndex);
    }
    dragIndexRef.current = null;
    setDragOver(null);
  };

  return (
    <aside className="left-panel">
      <div className="left-panel-header">
        <span className="label">Pistes</span>
        <button className="btn-add-track" onClick={() => setShowModal(true)} title="Ajouter une piste">
          + Piste
        </button>
      </div>

      <div className="tracks-list">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => { dragIndexRef.current = null; setDragOver(null); }}
            className={dragOver === index ? 'drag-over' : ''}
          >
            <TrackItem
              track={track}
              isSelected={selectedTrackId === track.id}
              onSelect={() => onSelectTrack(track.id)}
              onMute={() => onMute(track.id)}
              onSolo={() => onSolo(track.id)}
              onVolumeChange={vol => onVolumeChange(track.id, vol)}
              onNameChange={name => onNameChange(track.id, name)}
              isDragging={dragIndexRef.current === index}
            />
          </div>
        ))}

        {tracks.length === 0 && (
          <div className="tracks-empty">
            <p>Aucune piste</p>
            <p>Cliquez sur "+ Piste" pour commencer</p>
          </div>
        )}
      </div>

      {showModal && (
        <AddTrackModal
          onAdd={onAddTrack}
          onClose={() => setShowModal(false)}
        />
      )}
    </aside>
  );
}
