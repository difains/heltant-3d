/**
 * Dragon Raja: Heltant 3D - Procedural Web Audio Engine
 * Zero external asset dependencies; synthesizes wind, footsteps, campfire, chimes, and OPG hum.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.windNode = null;
    this.windGain = null;
    this.crackleInterval = null;
    this.opgOsc = null;
    this.opgGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initWindAmbience();
      this.initTorchCrackle();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initWindAmbience() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    whiteNoise.start(0);

    // Subtle wind swell modulation
    setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const targetFreq = 220 + Math.random() * 260;
      filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 1.5);
    }, 3000);
  }

  initTorchCrackle() {
    this.crackleInterval = setInterval(() => {
      if (!this.ctx || this.isMuted || Math.random() > 0.4) return;
      this.playCracklePop();
    }, 400);
  }

  playCracklePop() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120 + Math.random() * 400, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + Math.random() * 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playFootstep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playInteractionChime() {
    if (!this.ctx || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    });
  }

  playOpgHum(active) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    if (active) {
      if (this.opgOsc) {
        try { this.opgOsc.stop(); } catch(e){}
      }
      this.opgOsc = this.ctx.createOscillator();
      this.opgGain = this.ctx.createGain();
      this.opgOsc.type = 'sawtooth';
      this.opgOsc.frequency.setValueAtTime(65, now);
      this.opgOsc.frequency.exponentialRampToValueAtTime(110, now + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      this.opgGain.gain.setValueAtTime(0.01, now);
      this.opgGain.gain.linearRampToValueAtTime(0.15, now + 0.3);

      this.opgOsc.connect(filter);
      filter.connect(this.opgGain);
      this.opgGain.connect(this.ctx.destination);
      this.opgOsc.start(now);
    } else {
      if (this.opgGain) {
        this.opgGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        setTimeout(() => {
          if (this.opgOsc) {
            try { this.opgOsc.stop(); } catch(e){}
            this.opgOsc = null;
          }
        }, 350);
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime, 0.2);
    }
    return this.isMuted;
  }
}

export const sound = new SoundEngine();
