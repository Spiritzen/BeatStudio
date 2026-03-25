import { useState } from 'react';
import type { Track, InstrumentName, FxParams } from '../../types';
import { TRACK_COLORS } from '../../types';
import { InstrumentPicker } from './InstrumentPicker';
import { FxSection } from './FxSection';
import { SampleLoader } from './SampleLoader';
import './RightPanel.css';

interface RightPanelProps {
  track: Track | null;
  mode: 'tone' | 'sample';
  onUpdateTrack: (changes: Partial<Track>) => void;
  onRemoveTrack: () => void;
  onDuplicateTrack: () => void;
}

export function RightPanel({ track, mode, onUpdateTrack, onRemoveTrack, onDuplicateTrack }: RightPanelProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('instrument');

  if (!track) {
    return (
      <aside className="right-panel">
        <div className="right-panel-empty">
          <p>Sélectionnez une piste</p>
        </div>
      </aside>
    );
  }

  const handleFxChange = (fx: FxParams) => {
    onUpdateTrack({ fx });
  };

  const handleInstrumentChange = (instrument: InstrumentName) => {
    onUpdateTrack({ instrument });
  };

  const sections = [
    { id: 'track', label: 'Piste' },
    { id: 'instrument', label: 'Instrument' },
    { id: 'mix', label: 'Mix' },
    { id: 'fx', label: 'Effets' },
    ...(mode === 'sample' ? [{ id: 'sample', label: 'Sample' }] : []),
  ];

  return (
    <aside className="right-panel">
      <div className="right-panel-tabs">
        {sections.map(s => (
          <button
            key={s.id}
            className={`rp-tab ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="right-panel-content">
        {/* PISTE */}
        {activeSection === 'track' && (
          <div className="rp-section">
            <div className="rp-field">
              <label className="label">Nom</label>
              <input
                type="text"
                value={track.name}
                onChange={e => onUpdateTrack({ name: e.target.value })}
                className="rp-input"
              />
            </div>

            <div className="rp-field">
              <label className="label">Couleur</label>
              <div className="color-palette">
                {TRACK_COLORS.map(color => (
                  <button
                    key={color}
                    className={`color-dot ${track.color === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => onUpdateTrack({ color })}
                  />
                ))}
              </div>
            </div>

            <div className="rp-danger">
              <label className="label">Danger zone</label>
              <div className="danger-btns">
                <button className="btn-duplicate" onClick={onDuplicateTrack}>
                  Dupliquer la piste
                </button>
                {!confirmDelete ? (
                  <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
                    Supprimer la piste
                  </button>
                ) : (
                  <div className="confirm-delete">
                    <span>Confirmer ?</span>
                    <button className="btn-danger-confirm" onClick={() => { onRemoveTrack(); setConfirmDelete(false); }}>
                      Supprimer
                    </button>
                    <button className="btn-cancel-small" onClick={() => setConfirmDelete(false)}>
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INSTRUMENT */}
        {activeSection === 'instrument' && (
          <div className="rp-section">
            <InstrumentPicker current={track.instrument} onChange={handleInstrumentChange} />
          </div>
        )}

        {/* MIX */}
        {activeSection === 'mix' && (
          <div className="rp-section">
            <div className="rp-field">
              <div className="rp-slider-header">
                <label className="label">Volume</label>
                <span className="rp-value">{track.volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={track.volume}
                onChange={e => onUpdateTrack({ volume: parseInt(e.target.value) })}
                className="rp-slider"
              />
            </div>

            <div className="rp-field">
              <div className="rp-slider-header">
                <label className="label">Pan</label>
                <span className="rp-value">
                  {track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(track.pan * 100)}` : `L${Math.round(-track.pan * 100)}`}
                </span>
              </div>
              <input
                type="range"
                min={-100}
                max={100}
                value={Math.round(track.pan * 100)}
                onChange={e => onUpdateTrack({ pan: parseInt(e.target.value) / 100 })}
                className="rp-slider"
              />
            </div>
          </div>
        )}

        {/* FX */}
        {activeSection === 'fx' && (
          <div className="rp-section">
            <FxSection fx={track.fx} onChange={handleFxChange} />
          </div>
        )}

        {/* SAMPLE */}
        {activeSection === 'sample' && mode === 'sample' && (
          <div className="rp-section">
            <SampleLoader
              sampleName={track.sampleName}
              onLoad={(url, name) => onUpdateTrack({ sampleUrl: url, sampleName: name })}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
