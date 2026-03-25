import { useState, useRef } from 'react';
import type { Track } from '../../types';
import './TrackItem.css';

interface TrackItemProps {
  track: Track;
  isSelected: boolean;
  onSelect: () => void;
  onMute: () => void;
  onSolo: () => void;
  onVolumeChange: (vol: number) => void;
  onNameChange: (name: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

export function TrackItem({
  track, isSelected, onSelect, onMute, onSolo,
  onVolumeChange, onNameChange,
  dragHandleProps, isDragging,
}: TrackItemProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(track.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitName = () => {
    setEditing(false);
    onNameChange(editName.trim() || track.name);
  };

  return (
    <div
      className={`track-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${track.muted ? 'muted' : ''}`}
      onClick={onSelect}
    >
      <div className="track-drag-handle" {...dragHandleProps} title="Glisser pour réordonner">
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
          <rect x="1" y="1" width="3" height="3" rx="1"/>
          <rect x="6" y="1" width="3" height="3" rx="1"/>
          <rect x="1" y="5.5" width="3" height="3" rx="1"/>
          <rect x="6" y="5.5" width="3" height="3" rx="1"/>
          <rect x="1" y="10" width="3" height="3" rx="1"/>
          <rect x="6" y="10" width="3" height="3" rx="1"/>
        </svg>
      </div>

      <div className="track-color-dot" style={{ background: track.color }} />

      <div className="track-info">
        {editing ? (
          <input
            ref={inputRef}
            className="track-name-input"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditing(false); }}
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span
            className="track-name"
            onDoubleClick={e => { e.stopPropagation(); setEditing(true); setEditName(track.name); }}
            title="Double-clic pour éditer"
          >
            {track.name}
          </span>
        )}
        <span className="track-instrument">{track.instrument}</span>
      </div>

      <div className="track-controls" onClick={e => e.stopPropagation()}>
        <button
          className={`track-btn mute-btn ${track.muted ? 'active' : ''}`}
          onClick={onMute}
          title="Mute (M)"
        >M</button>
        <button
          className={`track-btn solo-btn ${track.soloed ? 'active' : ''}`}
          onClick={onSolo}
          title="Solo"
        >S</button>
      </div>

      <div className="track-bottom" onClick={e => e.stopPropagation()}>
        <div className="track-volume-row">
          <span className="label">Vol</span>
          <input
            type="range"
            min={0}
            max={100}
            value={track.volume}
            onChange={e => onVolumeChange(parseInt(e.target.value))}
            className="track-volume"
          />
          <span className="track-vol-value">{track.volume}%</span>
        </div>
      </div>
    </div>
  );
}
