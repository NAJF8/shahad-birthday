// Crystal Music Box Synthesizer & Audio Player for Shahad Adel Microsite
class BirthdayAudioPlayer {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentStep = 0;
    this.timerId = null;
    this.onStateChangeCallbacks = [];
    
    // Happy Birthday melody notes in Hz (Music Box frequency tuning)
    this.melody = [
      { note: 392.00, dur: 0.4 }, // G4
      { note: 392.00, dur: 0.4 }, // G4
      { note: 440.00, dur: 0.8 }, // A4
      { note: 392.00, dur: 0.8 }, // G4
      { note: 523.25, dur: 0.8 }, // C5
      { note: 493.88, dur: 1.4 }, // B4
      
      { note: 392.00, dur: 0.4 }, // G4
      { note: 392.00, dur: 0.4 }, // G4
      { note: 440.00, dur: 0.8 }, // A4
      { note: 392.00, dur: 0.8 }, // G4
      { note: 587.33, dur: 0.8 }, // D5
      { note: 523.25, dur: 1.4 }, // C5
      
      { note: 392.00, dur: 0.4 }, // G4
      { note: 392.00, dur: 0.4 }, // G4
      { note: 783.99, dur: 0.8 }, // G5
      { note: 659.25, dur: 0.8 }, // E5
      { note: 523.25, dur: 0.8 }, // C5
      { note: 493.88, dur: 0.8 }, // B4
      { note: 440.00, dur: 1.4 }, // A4
      
      { note: 698.46, dur: 0.4 }, // F5
      { note: 698.46, dur: 0.4 }, // F5
      { note: 659.25, dur: 0.8 }, // E5
      { note: 523.25, dur: 0.8 }, // C5
      { note: 587.33, dur: 0.8 }, // D5
      { note: 523.25, dur: 1.8 }, // C5
    ];
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a crystal music box chime note
  playChime(freq, duration = 1.2) {
    if (!this.audioCtx || this.isMuted) return;

    const now = this.audioCtx.currentTime;
    
    // Fundamental oscillator (sine)
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Harmonic bell overtone (high subtle shimmer)
    const osc2 = this.audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, now); // metallic music box ratio

    const gain1 = this.audioCtx.createGain();
    const gain2 = this.audioCtx.createGain();
    const masterGain = this.audioCtx.createGain();

    // Fast attack and natural music-box decay
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);

    masterGain.gain.setValueAtTime(0.7, now);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    masterGain.connect(this.audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
  }

  playMelodyLoop() {
    if (!this.isPlaying) return;
    
    const step = this.melody[this.currentStep];
    this.playChime(step.note, step.dur * 1.5);

    const delay = step.dur * 750; // tempo adjustment (dreamy pacing)
    this.currentStep = (this.currentStep + 1) % this.melody.length;

    this.timerId = setTimeout(() => {
      this.playMelodyLoop();
    }, delay);
  }

  start() {
    this.initAudio();
    this.isPlaying = true;
    this.currentStep = 0;
    this.playMelodyLoop();
    this.notifyState();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.notifyState();
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.push(cb);
  }

  notifyState() {
    this.onStateChangeCallbacks.forEach(cb => cb(this.isPlaying));
  }
}

window.birthdayAudio = new BirthdayAudioPlayer();
