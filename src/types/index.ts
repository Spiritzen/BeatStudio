export type InstrumentName =
  | 'Kick' | 'Snare' | 'Clap' | 'HiHat' | 'OpenHat'
  | 'Tom Hi' | 'Tom Mid' | 'Tom Floor' | 'Rimshot' | 'Cowbell'
  | 'Tambourine' | 'Conga'
  | 'Bass Synth' | 'Lead Synth' | 'Pad' | 'Pluck' | 'Bell'
  | 'Marimba' | 'Organ' | 'Flute'
  | 'Noise' | 'Zap' | 'Laser' | 'Sweep' | 'Boom' | 'Riser';

export interface FxParams {
  reverb: { enabled: boolean; wet: number };
  delay: { enabled: boolean; wet: number };
  distortion: { enabled: boolean; wet: number };
  filter: { enabled: boolean; frequency: number; type: 'lowpass' | 'highpass' };
}

export interface Track {
  id: string;
  name: string;
  color: string;
  instrument: InstrumentName;
  steps: boolean[];
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  fx: FxParams;
  sampleUrl?: string;
  sampleName?: string;
}

export interface Pattern {
  version: string;
  name?: string;
  bpm: number;
  globalSteps: number;
  tracks: Track[];
  createdAt: string;
}

export interface AppState {
  tracks: Track[];
  bpm: number;
  isPlaying: boolean;
  currentStep: number;
  selectedTrackId: string | null;
  mode: 'tone' | 'sample';
}

export const TRACK_COLORS = [
  '#7c3aed', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
  '#8b5cf6', '#06b6d4',
];

export const INSTRUMENT_CATEGORIES: Record<string, InstrumentName[]> = {
  'Percussions': ['Kick', 'Snare', 'Clap', 'HiHat', 'OpenHat', 'Tom Hi', 'Tom Mid', 'Tom Floor', 'Rimshot', 'Cowbell', 'Tambourine', 'Conga'],
  'Mélodique': ['Bass Synth', 'Lead Synth', 'Pad', 'Pluck', 'Bell', 'Marimba', 'Organ', 'Flute'],
  'FX': ['Noise', 'Zap', 'Laser', 'Sweep', 'Boom', 'Riser'],
};
