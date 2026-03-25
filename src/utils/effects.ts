import * as Tone from 'tone';
import type { FxParams } from '../types';

export interface TrackFxChain {
  reverb: Tone.Reverb;
  delay: Tone.FeedbackDelay;
  distortion: Tone.Distortion;
  filter: Tone.Filter;
  volume: Tone.Volume;
  panner: Tone.Panner;
  channel: Tone.Channel;
}

export function createFxChain(): TrackFxChain {
  const reverb = new Tone.Reverb({ decay: 2, wet: 0 });
  const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.3, wet: 0 });
  const distortion = new Tone.Distortion({ distortion: 0.5, wet: 0 });
  const filter = new Tone.Filter({ frequency: 20000, type: 'lowpass' });
  const volume = new Tone.Volume(0);
  const panner = new Tone.Panner(0);
  const channel = new Tone.Channel().toDestination();

  // Chain: instrument → distortion → filter → reverb → delay → volume → panner → channel → out
  distortion.connect(filter);
  filter.connect(reverb);
  reverb.connect(delay);
  delay.connect(volume);
  volume.connect(panner);
  panner.connect(channel);

  return { reverb, delay, distortion, filter, volume, panner, channel };
}

export function updateFxChain(chain: TrackFxChain, fx: FxParams, volume: number, pan: number): void {
  chain.reverb.wet.value = fx.reverb.enabled ? fx.reverb.wet : 0;
  chain.delay.wet.value = fx.delay.enabled ? fx.delay.wet : 0;
  chain.distortion.wet.value = fx.distortion.enabled ? fx.distortion.wet : 0;

  if (fx.filter.enabled) {
    chain.filter.frequency.value = fx.filter.frequency;
    chain.filter.type = fx.filter.type;
  } else {
    chain.filter.frequency.value = fx.filter.type === 'lowpass' ? 20000 : 20;
  }

  chain.volume.volume.value = Tone.gainToDb(volume / 100);
  chain.panner.pan.value = Math.max(-1, Math.min(1, isFinite(pan) ? pan : 0));
}

export function disposeFxChain(chain: TrackFxChain): void {
  chain.reverb.dispose();
  chain.delay.dispose();
  chain.distortion.dispose();
  chain.filter.dispose();
  chain.volume.dispose();
  chain.panner.dispose();
  chain.channel.dispose();
}
