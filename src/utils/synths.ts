import * as Tone from 'tone';
import type { InstrumentName } from '../types';

type AnyToneInstrument =
  | Tone.MembraneSynth
  | Tone.NoiseSynth
  | Tone.Synth
  | Tone.MetalSynth
  | Tone.PolySynth
  | Tone.PluckSynth;

export function createSynth(name: InstrumentName): AnyToneInstrument {
  switch (name) {
    case 'Kick':
      return new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 7,
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
        volume: 6,
      });

    case 'Snare':
      return new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
        volume: 6,
      });

    case 'Clap':
      return new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
        volume: 6,
      });

    case 'HiHat':
      return new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
        volume: 6,
      });

    case 'OpenHat':
      return new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
        volume: 6,
      });

    case 'Tom Hi':
      return new Tone.MembraneSynth({
        pitchDecay: 0.06,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
        volume: 6,
      });

    case 'Tom Mid':
      return new Tone.MembraneSynth({
        pitchDecay: 0.07,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 },
        volume: 6,
      });

    case 'Tom Floor':
      return new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.15 },
        volume: 6,
      });

    case 'Rimshot':
      return new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
        volume: 6,
      });

    case 'Cowbell':
      return new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.4, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: 6,
      });

    case 'Tambourine':
      return new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
        volume: 6,
      });

    case 'Conga':
      return new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 3,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
        volume: 6,
      });

    case 'Bass Synth':
      return new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
        volume: 6,
      });

    case 'Lead Synth':
      return new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.2 },
        volume: 6,
      });

    case 'Pad':
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 1.0 },
        volume: 6,
      });

    case 'Pluck':
      return new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.95,
        volume: 6,
      });

    case 'Bell':
      return new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 1.2, release: 0.8 },
        harmonicity: 5.1,
        modulationIndex: 16,
        resonance: 3200,
        octaves: 1.5,
        volume: 6,
      });

    case 'Marimba':
      return new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 },
        volume: 6,
      });

    case 'Organ':
      return new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.3 },
        volume: 6,
      });

    case 'Flute':
      return new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.5 },
        volume: 6,
      });

    case 'Noise':
      return new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 },
        volume: 6,
      });

    case 'Zap':
      return new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
        volume: 6,
      });

    case 'Laser':
      return new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
        volume: 6,
      });

    case 'Sweep':
      return new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.5, decay: 0.3, sustain: 0.5, release: 0.5 },
        volume: 6,
      });

    case 'Boom':
      return new Tone.MembraneSynth({
        pitchDecay: 0.1,
        octaves: 10,
        envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.2 },
        volume: 6,
      });

    case 'Riser':
      return new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 1.0, decay: 0.5, sustain: 0.7, release: 0.5 },
        volume: 6,
      });

    case 'Piano':
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
        volume: 0,
      });

    default:
      return new Tone.Synth();
  }
}

export function getTriggerNote(name: InstrumentName): string {
  switch (name) {
    case 'Kick': case 'Boom': return 'C1';
    case 'Tom Floor': return 'G1';
    case 'Tom Mid': return 'C2';
    case 'Tom Hi': return 'G2';
    case 'Conga': return 'D2';
    case 'Bass Synth': return 'C2';
    case 'Lead Synth': return 'C4';
    case 'Pad': return 'C3';
    case 'Pluck': return 'C3';
    case 'Bell': return 'C5';
    case 'Marimba': return 'C4';
    case 'Organ': return 'C3';
    case 'Flute': return 'G4';
    case 'Zap': return 'C5';
    case 'Laser': return 'A5';
    case 'Sweep': return 'E2';
    case 'Riser': return 'G2';
    case 'Rimshot': return 'C5';
    case 'Cowbell': return 'F4';
    default: return 'C4';
  }
}

export function isMelodic(name: InstrumentName): boolean {
  const melodic: InstrumentName[] = ['Bass Synth', 'Lead Synth', 'Pad', 'Pluck', 'Bell', 'Marimba', 'Organ', 'Flute', 'Zap', 'Laser', 'Sweep', 'Riser', 'Rimshot', 'Cowbell'];
  return melodic.includes(name);
}

export function isNoiseBased(name: InstrumentName): boolean {
  const noiseBased: InstrumentName[] = ['Snare', 'Clap', 'HiHat', 'OpenHat', 'Tambourine', 'Noise'];
  return noiseBased.includes(name);
}
