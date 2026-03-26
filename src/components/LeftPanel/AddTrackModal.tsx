import { useState } from 'react';
import type { InstrumentName } from '../../types';
import { INSTRUMENT_CATEGORIES } from '../../types';
import { previewInstrument } from '../../utils/previewInstrument';
import './AddTrackModal.css';

interface AddTrackModalProps {
  onAdd: (name: string, instrument: InstrumentName) => void;
  onClose: () => void;
}

export function AddTrackModal({ onAdd, onClose }: AddTrackModalProps) {
  const [selected, setSelected] = useState<InstrumentName>('Kick');
  const [name, setName] = useState('');

  const handleAdd = () => {
    onAdd(name || selected, selected);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-track-modal" onClick={e => e.stopPropagation()}>
        <h3>Ajouter une piste</h3>

        <div className="atm-name-row">
          <label className="label">Nom</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={selected}
            className="atm-name-input"
            autoFocus
          />
        </div>

        {Object.entries(INSTRUMENT_CATEGORIES).map(([cat, instruments]) => (
          <div key={cat} className="atm-category">
            <div className="label">{cat}</div>
            <div className="atm-grid">
              {instruments.map(instr => (
                <button
                  key={instr}
                  className={`atm-instr-btn ${selected === instr ? 'selected' : ''}`}
                  onClick={() => { setSelected(instr); setTimeout(() => previewInstrument(instr), 100); }}
                >
                  {instr}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="atm-actions">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-confirm" onClick={handleAdd}>Ajouter</button>
        </div>
      </div>
    </div>
  );
}
