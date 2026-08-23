// Audio synthesis module for LoveFable AI using Web Audio API and Web Speech API

class BackgroundMusicSynth {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private currentTimer: number | null = null;
  private activeOscillators: OscillatorNode[] = [];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) { // 0 to 1
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime, 0.1);
    }
  }

  public startMusic(mood: string, volume: number = 0.5) {
    this.stopMusic();
    this.init();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    if (mood === 'music_box') {
      this.playMusicBoxLoop();
    } else if (mood === 'rain_ambient') {
      this.playRainAmbientLoop();
    } else if (mood === 'chill_lofi') {
      this.playLofiLoop();
    } else if (mood === 'romantic_strings') {
      this.playStringsLoop();
    } else {
      // Default: soft piano
      this.playPianoLoop();
    }
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.currentTimer) {
      window.clearInterval(this.currentTimer);
      this.currentTimer = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore
      }
    });
    this.activeOscillators = [];
  }

  private playNote(freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', peakGain: number = 0.2) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Envelope: soft attack, gentle decay
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.1);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);

    this.activeOscillators.push(osc);
    setTimeout(() => {
      const idx = this.activeOscillators.indexOf(osc);
      if (idx !== -1) this.activeOscillators.splice(idx, 1);
    }, (duration + 0.5) * 1000);
  }

  // Piano chord progressions (Cmaj7, Am7, Fmaj7, G6)
  private playPianoLoop() {
    if (!this.ctx) return;
    // Frequencies for C major 7 / romantic arpeggios
    const C4 = 261.63, E4 = 329.63, G4 = 392.00, B4 = 493.88, D5 = 587.33, E5 = 659.25;
    const A3 = 220.00, C5 = 523.25, F4 = 349.23, A4 = 440.00, G3 = 196.00;

    const chords = [
      [C4, E4, G4, B4, D5],
      [A3, C4, E4, G4, C5],
      [F4, A4, C5, E5],
      [G3, B4, D5, G4],
    ];

    let chordIdx = 0;
    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = chords[chordIdx % chords.length];

      // Play bass note
      this.playNote(chord[0] / 2, now, 3.5, 'triangle', 0.15);

      // Play soft arpeggio
      chord.forEach((freq, i) => {
        this.playNote(freq, now + i * 0.35, 2.5, 'sine', 0.12);
      });

      // High gentle accent note
      if (chordIdx % 2 === 0) {
        this.playNote(E5, now + 1.8, 2.0, 'sine', 0.08);
      } else {
        this.playNote(D5, now + 1.8, 2.0, 'sine', 0.08);
      }

      chordIdx++;
    };

    tick();
    this.currentTimer = window.setInterval(tick, 4000);
  }

  // Music Box lullaby (higher pitched sine, bell-like decay)
  private playMusicBoxLoop() {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 880.00, 659.25, 587.33, 659.25]; // C5, E5, G5, C6, A5, E5, D5, E5
    let idx = 0;

    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = notes[idx % notes.length];

      this.playNote(freq, now, 1.2, 'sine', 0.15);
      if (idx % 2 === 0) {
        this.playNote(freq / 2, now, 1.8, 'sine', 0.08);
      }
      idx++;
    };

    tick();
    this.currentTimer = window.setInterval(tick, 700);
  }

  // Rain ambient with soft harmonic pad
  private playRainAmbientLoop() {
    if (!this.ctx) return;
    const padFreqs = [174.61, 220.00, 261.63, 329.63]; // F3, A3, C4, E4 soft pad
    let step = 0;

    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const baseFreq = padFreqs[step % padFreqs.length];

      this.playNote(baseFreq, now, 4.0, 'sine', 0.08);
      this.playNote(baseFreq * 1.5, now + 0.5, 3.5, 'triangle', 0.05);

      step++;
    };

    tick();
    this.currentTimer = window.setInterval(tick, 3500);
  }

  // Lofi / Cozy warmth
  private playLofiLoop() {
    if (!this.ctx) return;
    const chords = [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
    ];
    let idx = 0;

    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = chords[idx % chords.length];

      chord.forEach((freq, i) => {
        this.playNote(freq, now + i * 0.15, 3.0, 'triangle', 0.1);
      });

      idx++;
    };

    tick();
    this.currentTimer = window.setInterval(tick, 3200);
  }

  // Romantic strings (warm saw/triangle blend)
  private playStringsLoop() {
    if (!this.ctx) return;
    const freqs = [196.00, 246.94, 293.66, 392.00, 493.88];
    let idx = 0;

    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const f = freqs[idx % freqs.length];

      this.playNote(f, now, 5.0, 'triangle', 0.1);
      this.playNote(f * 1.25, now + 1.0, 4.0, 'sine', 0.08);

      idx++;
    };

    tick();
    this.currentTimer = window.setInterval(tick, 4500);
  }
}

export const bgMusicSynth = new BackgroundMusicSynth();

// Speech Synthesis Helper for voice narration out loud
export class SpeechNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onBoundaryCallback: ((wordIndex: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public speak(
    text: string,
    gender: 'female' | 'male' | 'soft' = 'female',
    speed: number = 1.0,
    volume: number = 0.8,
    onBoundary?: (wordIndex: number) => void,
    onEnd?: () => void
  ) {
    this.stop();
    if (!this.synth) return;

    this.onBoundaryCallback = onBoundary || null;
    this.onEndCallback = onEnd || null;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.6, Math.min(1.5, speed * 0.95));
    utterance.volume = volume;

    const voices = this.synth.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (voices.length > 0) {
      if (gender === 'female' || gender === 'soft') {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('google us english') || v.lang.startsWith('en')) || voices[0];
        utterance.pitch = gender === 'soft' ? 1.1 : 1.0;
      } else {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('alex') || v.lang.startsWith('en')) || voices[0];
        utterance.pitch = 0.9;
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    let wordCounter = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        if (this.onBoundaryCallback) {
          this.onBoundaryCallback(wordCounter);
        }
        wordCounter++;
      }
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechNarrator = new SpeechNarrator();
