import type { InstrumentName } from '../../types';
import { INSTRUMENT_CATEGORIES } from '../../types';
import { previewInstrument } from '../../utils/previewInstrument';
import './InstrumentPicker.css';

interface InstrumentPickerProps {
  current: InstrumentName;
  onChange: (instr: InstrumentName) => void;
}

export function InstrumentPicker({ current, onChange }: InstrumentPickerProps) {
  const handleClick = (instr: InstrumentName) => {
    onChange(instr);
    setTimeout(() => previewInstrument(instr), 100);
  };

  return (
    <div className="instrument-picker">
      {Object.entries(INSTRUMENT_CATEGORIES).map(([cat, instruments]) => (
        <div key={cat} className="instr-category">
          <div className="label instr-cat-label">{cat}</div>
          <div className="instr-grid">
            {instruments.map(instr => (
              <button
                key={instr}
                className={`instr-btn ${current === instr ? 'selected' : ''}`}
                onClick={() => handleClick(instr)}
              >
                {instr}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
