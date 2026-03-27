import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import type { Track, InstrumentName } from '../types';
import { createSynth, getTriggerNote, isNoiseBased, isMelodic } from '../utils/synths';
import { createFxChain, updateFxChain, disposeFxChain, type TrackFxChain } from '../utils/effects';
import { isMobileDevice } from '../utils/deviceDetect';

type AnyToneInstrument =
  | Tone.MembraneSynth
  | Tone.NoiseSynth
  | Tone.Synth
  | Tone.MetalSynth
  | Tone.PolySynth
  | Tone.PluckSynth;

interface TrackNode {
  synth: AnyToneInstrument;
  player: Tone.Player | null;
  fx: TrackFxChain;
  instrumentName: InstrumentName;
}

function triggerMelodicInstrument(synth: AnyToneInstrument, instrument: InstrumentName, note: string, time: number): void {
  if (synth instanceof Tone.PolySynth) {
    (synth as Tone.PolySynth).triggerAttackRelease(note, '8n', time);
  } else if (synth instanceof Tone.PluckSynth) {
    (synth as Tone.PluckSynth).triggerAttack(note, time);
  } else if (synth instanceof Tone.MetalSynth) {
    (synth as Tone.MetalSynth).triggerAttackRelease('16n', time);
  } else {
    const duration = ['Pad', 'Organ', 'Sweep', 'Riser'].includes(instrument) ? '4n' : '8n';
    (synth as Tone.Synth).triggerAttackRelease(note, duration, time);
  }
}

function triggerInstrument(synth: AnyToneInstrument, instrument: InstrumentName, time: number): void {
  if (isNoiseBased(instrument)) {
    (synth as Tone.NoiseSynth).triggerAttackRelease('16n', time);
  } else if (synth instanceof Tone.PolySynth) {
    (synth as Tone.PolySynth).triggerAttackRelease(['C3', 'E3', 'G3'], '8n', time);
  } else if (synth instanceof Tone.PluckSynth) {
    (synth as Tone.PluckSynth).triggerAttack(getTriggerNote(instrument), time);
  } else if (synth instanceof Tone.MembraneSynth || synth instanceof Tone.MetalSynth) {
    (synth as Tone.MembraneSynth).triggerAttackRelease(getTriggerNote(instrument), '8n', time);
  } else {
    const duration = ['Pad', 'Organ', 'Sweep', 'Riser'].includes(instrument) ? '4n' : '16n';
    (synth as Tone.Synth).triggerAttackRelease(getTriggerNote(instrument), duration, time);
  }
}

export function useSequencer(tracks: Track[], bpm: number, globalSteps: number, mode: 'tone' | 'sample') {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const audioStarted = useRef(false);
  const sequenceRef = useRef<Tone.Sequence | null>(null);
  const trackNodesRef = useRef<Map<string, TrackNode>>(new Map());
  const tracksRef = useRef<Track[]>(tracks);
  const modeRef = useRef(mode);
  const isPlayingRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Sync BPM
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  // Update FX/mute on track changes
  useEffect(() => {
    const currentIds = new Set(tracks.map(t => t.id));
    for (const [id, node] of trackNodesRef.current) {
      if (!currentIds.has(id)) {
        node.synth.dispose();
        node.player?.dispose();
        disposeFxChain(node.fx);
        trackNodesRef.current.delete(id);
      }
    }
    const hasSolo = tracks.some(t => t.soloed);
    for (const track of tracks) {
      const node = trackNodesRef.current.get(track.id);
      if (node) {
        // Recréer le synth si l'instrument a changé
        if (node.instrumentName !== track.instrument) {
          node.synth.dispose();
          node.synth = createSynth(track.instrument);
          node.synth.connect(node.fx.distortion);
          node.instrumentName = track.instrument;
        }
        updateFxChain(node.fx, track.fx, track.volume, track.pan);
        node.fx.channel.mute = track.muted || (hasSolo && !track.soloed);
      } else {
        // Nouvelle piste (ex: chargement prefab) — créer le node immédiatement
        const fx = createFxChain();
        const synth = createSynth(track.instrument);
        synth.connect(fx.distortion);
        let player: Tone.Player | null = null;
        if (track.sampleUrl) {
          player = new Tone.Player(track.sampleUrl).connect(fx.distortion);
        }
        updateFxChain(fx, track.fx, track.volume, track.pan);
        fx.channel.mute = track.muted || (hasSolo && !track.soloed);
        trackNodesRef.current.set(track.id, { synth, player, fx, instrumentName: track.instrument });
      }
    }
  }, [tracks]);

  const ensureNodes = useCallback(() => {
    for (const track of tracksRef.current) {
      if (!trackNodesRef.current.has(track.id)) {
        const fx = createFxChain();
        const synth = createSynth(track.instrument);
        synth.connect(fx.distortion);
        let player: Tone.Player | null = null;
        if (track.sampleUrl) {
          player = new Tone.Player(track.sampleUrl).connect(fx.distortion);
        }
        updateFxChain(fx, track.fx, track.volume, track.pan);
        trackNodesRef.current.set(track.id, { synth, player, fx, instrumentName: track.instrument });
      }
    }
  }, []);

  const buildAndStartSequence = useCallback((steps: number) => {
    // Stop and dispose existing sequence
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;

    const stepIndices = Array.from({ length: steps }, (_, i) => i);

    const sequence = new Tone.Sequence(
      async (time, stepIndex) => {
        if (Tone.getContext().rawContext.state === 'suspended') {
          try { await Tone.getContext().rawContext.resume(); } catch {}
        }

        const currentTracks = tracksRef.current;
        const hasSolo = currentTracks.some(t => t.soloed);

        Tone.getDraw().schedule(() => {
          setCurrentStep(stepIndex as number);
        }, time);

        for (const track of currentTracks) {
          const shouldMute = track.muted || (hasSolo && !track.soloed);

          if (track.pianoSteps && isMelodic(track.instrument)) {
            // Piste mélodique — joue la note assignée ou la note par défaut
            const pianoStep = track.pianoSteps[stepIndex as number];
            if (!pianoStep?.active || shouldMute) continue;
            const node = trackNodesRef.current.get(track.id);
            if (!node) continue;
            try {
              const note = pianoStep.note || getTriggerNote(track.instrument);
              triggerMelodicInstrument(node.synth, track.instrument, note, time);
            } catch {}
          } else {
            // Piste normale
            if (!track.steps[stepIndex as number] || shouldMute) continue;
            const node = trackNodesRef.current.get(track.id);
            if (!node) continue;
            if (modeRef.current === 'sample' && node.player && track.sampleUrl) {
              node.player.start(time);
            } else {
              try {
                triggerInstrument(node.synth, track.instrument, time);
              } catch {}
            }
          }
        }
      },
      stepIndices,
      '16n'
    );

    sequence.start(0);
    Tone.getTransport().start();
    sequenceRef.current = sequence;
  }, []);

  // Rebuild sequence when globalSteps changes while playing
  useEffect(() => {
    if (isPlayingRef.current) {
      ensureNodes();
      buildAndStartSequence(globalSteps);
    }
  }, [globalSteps, ensureNodes, buildAndStartSequence]);

  // Keepalive — Android suspend l'AudioContext après inactivité
  useEffect(() => {
    if (!isPlaying) return;
    const keepAlive = setInterval(async () => {
      if (Tone.getContext().rawContext.state === 'suspended') {
        try { await Tone.getContext().rawContext.resume(); } catch {}
      }
    }, 1000);
    return () => clearInterval(keepAlive);
  }, [isPlaying]);

  const startAudio = useCallback(async () => {
    try {
      await Tone.start();
      await Tone.getContext().rawContext.resume();
    } catch(e) {
      console.warn('Tone.start error:', e);
    }
    if (!audioStarted.current) {
      audioStarted.current = true;
    }
  }, []);

  const play = useCallback(async () => {
    await startAudio();
    ensureNodes();
    // Petit délai sur mobile pour laisser les synths s'initialiser
    if (isMobileDevice()) {
      await new Promise(r => setTimeout(r, 100));
    }
    buildAndStartSequence(globalSteps);
    setIsPlaying(true);
    setCurrentStep(0);
  }, [globalSteps, startAudio, ensureNodes, buildAndStartSequence]);

  const stop = useCallback(() => {
    Tone.getTransport().stop();
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(-1);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlayingRef.current) {
      stop();
    } else {
      await play();
    }
  }, [play, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
      }
      Tone.getTransport().stop();
      for (const node of trackNodesRef.current.values()) {
        node.synth.dispose();
        node.player?.dispose();
        disposeFxChain(node.fx);
      }
      trackNodesRef.current.clear();
    };
  }, []);

  return { isPlaying, currentStep, togglePlay, play, stop };
}
