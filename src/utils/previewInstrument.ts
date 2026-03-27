import * as Tone from 'tone'

export const previewInstrument = async (instName: string, note?: string): Promise<void> => {
  try {
    await Tone.start()
    await Tone.getContext().rawContext.resume()

    const now = Tone.now()
    const t = instName.toLowerCase()

    // Percussions à membrane — note ignorée (pas de hauteur)
    if (['kick', 'boom', 'tom hi', 'tom mid', 'tom floor', 'conga'].includes(t)) {
      const s = new Tone.MembraneSynth().toDestination()
      const defaultNote = t === 'kick' || t === 'boom' ? 'C1'
                        : t === 'tom hi' ? 'A2'
                        : t === 'tom mid' ? 'F2'
                        : t === 'conga' ? 'E2' : 'C2'
      s.triggerAttackRelease(defaultNote, '8n', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 2000)
      return
    }

    // Bruits blancs — note ignorée
    if (['snare', 'clap', 'hihat', 'openhat', 'rimshot', 'tambourine', 'noise'].includes(t)) {
      const s = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.001,
          decay: t === 'openhat' ? 0.3 : t === 'snare' ? 0.15 : 0.05,
          sustain: 0,
          release: 0.05,
        }
      }).toDestination()
      s.triggerAttackRelease('16n', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 2000)
      return
    }

    // Métal — note ignorée (MetalSynth n'est pas piché)
    if (['cowbell', 'bell'].includes(t)) {
      const s = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: t === 'bell' ? 1.0 : 0.5, release: 0.1 },
        harmonicity: 5.1,
        modulationIndex: 16,
        resonance: 3000,
        octaves: 1.5,
      }).toDestination()
      s.triggerAttackRelease('16n', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 2000)
      return
    }

    // Pluck
    if (t === 'pluck') {
      const s = new Tone.PluckSynth().toDestination()
      s.triggerAttack(note ?? 'C4', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 2000)
      return
    }

    // Piano
    if (t === 'piano') {
      const s = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.0 },
      }).toDestination()
      s.triggerAttackRelease(note ?? 'C4', '4n', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 3000)
      return
    }

    // Pad / Organ
    if (['pad', 'organ'].includes(t)) {
      const s = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 },
      }).toDestination()
      s.triggerAttackRelease(note ?? 'C3', '4n', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 3000)
      return
    }

    // Zap
    if (t === 'zap') {
      const s = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.01 },
      }).toDestination()
      s.triggerAttackRelease(note ?? 'C5', '32n', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 1000)
      return
    }

    // Laser
    if (t === 'laser') {
      const s = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.01 },
      }).toDestination()
      s.triggerAttackRelease(note ?? 'A5', '16n', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 1000)
      return
    }

    // Sweep / Riser
    if (['sweep', 'riser'].includes(t)) {
      const s = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.3, decay: 0.1, sustain: 0.8, release: 0.3 },
      }).toDestination()
      s.triggerAttackRelease(note ?? 'G2', '4n', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 3000)
      return
    }

    // Guitare Acoustique
    if (t === 'guitare acoustique') {
      const s = new Tone.PluckSynth({
        attackNoise: 2.5,
        dampening: 3000,
        resonance: 0.96,
      }).toDestination()
      s.triggerAttack(note ?? 'E3', now)
      setTimeout(() => { try { s.dispose() } catch (_) {} }, 3000)
      return
    }

    // Guitare Électrique
    if (t === 'guitare électrique') {
      const dist = new Tone.Distortion(0.15).toDestination()
      const s = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.6, release: 0.8 },
        volume: -6,
      }).connect(dist)
      s.triggerAttackRelease(note ?? 'E3', '4n', now)
      setTimeout(() => { try { s.dispose(); dist.dispose() } catch (_) {} }, 3000)
      return
    }

    // Lyre — cristallin avec reverb
    if (t === 'lyre') {
      const reverb = new Tone.Reverb({ decay: 3, wet: 0.5 }).toDestination()
      const s = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.8, sustain: 0.2, release: 2.0 },
        volume: -4,
      }).connect(reverb)
      s.triggerAttackRelease(note ?? 'A4', '2n', now)
      setTimeout(() => { try { s.dispose(); reverb.dispose() } catch (_) {} }, 5000)
      return
    }

    // Générique (Bass Synth, Lead Synth, Marimba, Flute, ...)
    const noteMap: Record<string, string> = {
      'bass synth': 'C2',
      'lead synth': 'C4',
      'marimba':    'C4',
      'flute':      'G4',
    }
    const s = new Tone.Synth({
      oscillator: { type: t.includes('bass') ? 'sawtooth' : 'triangle' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3 },
    }).toDestination()
    s.triggerAttackRelease(note ?? noteMap[t] ?? 'C3', '8n', now)
    setTimeout(() => { try { s.dispose() } catch (_) {} }, 2000)

  } catch (e) {
    console.warn('previewInstrument error:', e)
  }
}
