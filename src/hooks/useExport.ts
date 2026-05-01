import * as Tone from 'tone';
import type { Pattern } from '../types';
import { encodeWav } from '../utils/encodeWav';

export type ExportStatus = 'recording' | 'encoding' | 'done' | 'error';

/**
 * 🎵 EXPORT WAV
 */
export async function exportWav(
  patternName: string,
  globalSteps: number,
  bpm: number,
  onProgress?: (status: ExportStatus) => void
): Promise<void> {
  try {
    onProgress?.('recording');

    const rawCtx = Tone.context.rawContext as AudioContext;
    const dest = rawCtx.createMediaStreamDestination();

    const toneDestNode = (Tone.getDestination() as any).input as AudioNode;
    toneDestNode.connect(dest);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/ogg';

    const recorder = new MediaRecorder(dest.stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const stepDuration = 60 / bpm / 4;
    const loopDuration = globalSteps * stepDuration;
    const durationMs = loopDuration * 1000;

    recorder.start(100);

    await new Promise<void>((resolve) =>
      setTimeout(resolve, durationMs + 300)
    );

    recorder.stop();
    toneDestNode.disconnect(dest);

    onProgress?.('encoding');

    await new Promise<void>((resolve, reject) => {
      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: mimeType });
          const arrayBuffer = await blob.arrayBuffer();

          const audioCtx = new AudioContext();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          audioCtx.close();

          const wavBlob = encodeWav(audioBuffer);

          const url = URL.createObjectURL(wavBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${patternName.replace(/[^a-z0-9]/gi, '_')}.wav`;

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          URL.revokeObjectURL(url);

          onProgress?.('done');
          resolve();
        } catch (err) {
          console.error('WAV encoding error:', err);
          onProgress?.('error');
          reject(err);
        }
      };
    });

  } catch (err) {
    console.error('WAV export error:', err);
    onProgress?.('error');
    throw err;
  }
}

/**
 * 📄 EXPORT JSON
 */
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

/**
 * 📋 COPY JSON
 */
export function copyPatternToClipboard(pattern: Pattern): void {
  navigator.clipboard
    .writeText(JSON.stringify(pattern, null, 2))
    .catch(() => {});
}