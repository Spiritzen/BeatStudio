export const KEY_TO_NOTE: Record<string, string> = {
  // Touches blanches — rangée du bas
  'a': 'C3', 's': 'D3', 'd': 'E3', 'f': 'F3',
  'g': 'G3', 'h': 'A3', 'j': 'B3',
  // Touches blanches — octave suivante
  'k': 'C4', 'l': 'D4', ';': 'E4',
  // Touches noires
  'w': 'C#3', 'e': 'D#3', 't': 'F#3',
  'y': 'G#3', 'u': 'A#3',
  'o': 'C#4', 'p': 'D#4',
};

export const isBlackKey = (note: string): boolean => note.includes('#');
