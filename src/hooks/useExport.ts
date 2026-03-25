import * as Tone from 'tone';
import type { Pattern, Track, InstrumentName } from '../types';
import { createSynth, getTriggerNote, isNoiseBased } from '../utils/synths';

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

function triggerInOffline(
  synth: Tone.MembraneSynth | Tone.NoiseSynth | Tone.Synth | Tone.MetalSynth | Tone.PolySynth | Tone.PluckSynth,
  instrument: InstrumentName,
  time: number
) {
  if (isNoiseBased(instrument)) {
    (synth as Tone.NoiseSynth).triggerAttackRelease('16n', time);
  } else if (synth instanceof Tone.PolySynth) {
    synth.triggerAttackRelease(['C3', 'E3', 'G3'], '8n', time);
  } else if (synth instanceof Tone.PluckSynth) {
    synth.triggerAttack(getTriggerNote(instrument), time);
  } else if (synth instanceof Tone.MembraneSynth || synth instanceof Tone.MetalSynth) {
    (synth as Tone.MembraneSynth).triggerAttackRelease(getTriggerNote(instrument), '8n', time);
  } else {
    const duration = ['Pad', 'Organ', 'Sweep', 'Riser'].includes(instrument) ? '4n' : '16n';
    (synth as Tone.Synth).triggerAttackRelease(getTriggerNote(instrument), duration, time);
  }
}

export async function exportWav(tracks: Track[], bpm: number, globalSteps: number): Promise<void> {
  const stepDuration = 60 / bpm / 4;
  const totalDuration = stepDuration * globalSteps + 2;

  const toneBuffer = await Tone.Offline(async ({ transport }) => {
    transport.bpm.value = bpm;
    const synths: Array<{ synth: ReturnType<typeof createSynth>; track: Track }> = [];

    for (const track of tracks) {
      if (track.muted) continue;
      const synth = createSynth(track.instrument);
      const vol = new Tone.Volume(Tone.gainToDb(track.volume / 100));
      synth.connect(vol);
      vol.toDestination();
      synths.push({ synth, track });
    }

    const steps = Array.from({ length: globalSteps }, (_, i) => i);
    new Tone.Sequence(
      (time, step) => {
        for (const { synth, track } of synths) {
          if (!track.steps[step as number]) continue;
          try {
            triggerInOffline(synth, track.instrument, time);
          } catch {}
        }
      },
      steps,
      '16n'
    ).start(0);

    transport.start();
  }, totalDuration);

  const audioBuffer = toneBuffer.get() as AudioBuffer;
  const wav = audioBufferToWav(audioBuffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'beatstudio-export.wav';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJson(pattern: Pattern): void {
  const json = JSON.stringify(pattern, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pattern.name ?? 'beatstudio-pattern'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyPatternToClipboard(pattern: Pattern): void {
  navigator.clipboard.writeText(JSON.stringify(pattern, null, 2)).catch(() => {});
}
