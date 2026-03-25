import type { FxParams } from '../../types';
import './FxSection.css';

interface FxSectionProps {
  fx: FxParams;
  onChange: (fx: FxParams) => void;
}

export function FxSection({ fx, onChange }: FxSectionProps) {
  const update = (key: keyof FxParams, changes: Partial<FxParams[keyof FxParams]>) => {
    onChange({ ...fx, [key]: { ...fx[key], ...changes } });
  };

  return (
    <div className="fx-section">
      {/* Reverb */}
      <div className="fx-row">
        <div className="fx-header">
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={fx.reverb.enabled}
              onChange={e => update('reverb', { enabled: e.target.checked })}
            />
            <span className="fx-toggle-track" />
          </label>
          <span className="fx-name">Reverb</span>
          <span className="fx-value">{Math.round(fx.reverb.wet * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(fx.reverb.wet * 100)}
          onChange={e => update('reverb', { wet: parseInt(e.target.value) / 100 })}
          disabled={!fx.reverb.enabled}
          className="fx-slider"
        />
      </div>

      {/* Delay */}
      <div className="fx-row">
        <div className="fx-header">
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={fx.delay.enabled}
              onChange={e => update('delay', { enabled: e.target.checked })}
            />
            <span className="fx-toggle-track" />
          </label>
          <span className="fx-name">Delay</span>
          <span className="fx-value">{Math.round(fx.delay.wet * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(fx.delay.wet * 100)}
          onChange={e => update('delay', { wet: parseInt(e.target.value) / 100 })}
          disabled={!fx.delay.enabled}
          className="fx-slider"
        />
      </div>

      {/* Distortion */}
      <div className="fx-row">
        <div className="fx-header">
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={fx.distortion.enabled}
              onChange={e => update('distortion', { enabled: e.target.checked })}
            />
            <span className="fx-toggle-track" />
          </label>
          <span className="fx-name">Distortion</span>
          <span className="fx-value">{Math.round(fx.distortion.wet * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(fx.distortion.wet * 100)}
          onChange={e => update('distortion', { wet: parseInt(e.target.value) / 100 })}
          disabled={!fx.distortion.enabled}
          className="fx-slider"
        />
      </div>

      {/* Filter */}
      <div className="fx-row">
        <div className="fx-header">
          <label className="fx-toggle">
            <input
              type="checkbox"
              checked={fx.filter.enabled}
              onChange={e => update('filter', { enabled: e.target.checked })}
            />
            <span className="fx-toggle-track" />
          </label>
          <span className="fx-name">Filter</span>
          <div className="filter-type-toggle">
            <button
              className={`filter-btn ${fx.filter.type === 'lowpass' ? 'active' : ''}`}
              onClick={() => update('filter', { type: 'lowpass' })}
            >LP</button>
            <button
              className={`filter-btn ${fx.filter.type === 'highpass' ? 'active' : ''}`}
              onClick={() => update('filter', { type: 'highpass' })}
            >HP</button>
          </div>
          <span className="fx-value">{fx.filter.frequency >= 1000 ? `${(fx.filter.frequency/1000).toFixed(1)}k` : fx.filter.frequency}Hz</span>
        </div>
        <input
          type="range"
          min={20}
          max={20000}
          step={10}
          value={fx.filter.frequency}
          onChange={e => update('filter', { frequency: parseInt(e.target.value) })}
          disabled={!fx.filter.enabled}
          className="fx-slider"
        />
      </div>
    </div>
  );
}
