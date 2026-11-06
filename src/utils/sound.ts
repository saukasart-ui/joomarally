class SoundEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private slideGain: GainNode | null = null;
  private muted: boolean = false;
  private initialized: boolean = false;

  public init() {
    if (this.initialized) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Primary 3-cylinder / 4-cylinder TSI rally exhaust note
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 58;

      // Sub-harmonic rumble
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'triangle';
      this.subOsc.frequency.value = 29;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 310;

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0;

      this.engineOsc.connect(filter);
      this.subOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
      this.subOsc.start();

      // Gravel tire scrub / drift noise
      const bufferSize = this.ctx.sampleRate * 1.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 780;
      bandpass.Q.value = 1.1;

      this.slideGain = this.ctx.createGain();
      this.slideGain.gain.value = 0;

      whiteNoise.connect(bandpass);
      bandpass.connect(this.slideGain);
      this.slideGain.connect(this.ctx.destination);
      whiteNoise.start();

      this.initialized = true;
    } catch {
      // Ignore if audio is blocked
    }
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute) {
      this.stopContinuous();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public updateDriving(speedRatio: number, slipRatio: number, throttle: boolean, active: boolean) {
    if (
      !this.initialized ||
      !this.ctx ||
      !this.engineOsc ||
      !this.subOsc ||
      !this.engineGain ||
      !this.slideGain
    ) {
      return;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const now = this.ctx.currentTime;
    if (!active || this.muted) {
      this.engineGain.gain.setTargetAtTime(0, now, 0.05);
      this.slideGain.gain.setTargetAtTime(0, now, 0.05);
      return;
    }

    // Simulate 5-speed rally gearbox RPM curve
    const absSpeed = Math.abs(speedRatio);
    const gearThresholds = [0, 0.18, 0.38, 0.60, 0.82, 1.15];
    let gear = 0;
    for (let g = 0; g < 5; g++) {
      if (absSpeed >= gearThresholds[g]) gear = g;
    }
    const gMin = gearThresholds[gear];
    const gMax = gearThresholds[gear + 1];
    const gearProgress = Math.min(1, Math.max(0, (absSpeed - gMin) / (gMax - gMin)));
    const rpmNormalized = 0.28 + gearProgress * 0.72 + (throttle ? 0.08 : -0.05);

    const targetFreq = 46 + rpmNormalized * 135 + gear * 8;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.04);
    this.subOsc.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.04);

    const engineVol = 0.045 + (throttle ? 0.045 : 0.015) + absSpeed * 0.03;
    this.engineGain.gain.setTargetAtTime(engineVol, now, 0.05);

    const gravelVol =
      absSpeed > 0.08
        ? Math.min(0.14, absSpeed * 0.03 + Math.min(1, slipRatio) * 0.11)
        : 0;
    this.slideGain.gain.setTargetAtTime(gravelVol, now, 0.04);
  }

  public stopContinuous() {
    if (!this.initialized || !this.ctx || !this.engineGain || !this.slideGain) return;
    const now = this.ctx.currentTime;
    this.engineGain.gain.setTargetAtTime(0, now, 0.03);
    this.slideGain.gain.setTargetAtTime(0, now, 0.03);
  }

  public playCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.stopContinuous();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.38);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playFinish() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.stopContinuous();

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }
}

export const sound = new SoundEngine();
