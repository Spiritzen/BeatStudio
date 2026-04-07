export function supportsMediaRecorder(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ||
     MediaRecorder.isTypeSupported('audio/webm') ||
     MediaRecorder.isTypeSupported('audio/ogg'))
  );
}
