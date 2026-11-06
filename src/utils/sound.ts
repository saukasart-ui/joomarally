interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (vol: number) => void;
  getPlayerState: () => number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          height?: string | number;
          width?: string | number;
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PUNANE_SKODA_YT_ID = 'TbZWGIQkYyo'; // KräkiKevin - Punane Skoda (Prod. W1CKED)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private slideGain: GainNode | null = null;
  private muted: boolean = false;
  private initialized: boolean = false;

  // Background music ("KräkiKevin - Punane Skoda" YouTube Player + Web Audio fallback + optional MP3 override)
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private customAudio: HTMLAudioElement | null = null;
  private usingCustomAudio: boolean = false;
  private ytPlayer: YTPlayer | null = null;
  private ytReady: boolean = false;
  private ytPlaying: boolean = false;
  private userInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.setupYouTubePlayer();
    }
  }

  private setupYouTubePlayer() {
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || this.ytPlayer) return;
      let container = document.getElementById('yt-bgm-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'yt-bgm-container';
        container.style.position = 'fixed';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.bottom = '0';
        container.style.right = '0';
        container.style.opacity = '0.01';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '-1';
        document.body.appendChild(container);
      }
      const playerEl = document.createElement('div');
      container.appendChild(playerEl);

      this.ytPlayer = new window.YT.Player(playerEl, {
        width: 200,
        height: 113,
        videoId: PUNANE_SKODA_YT_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: PUNANE_SKODA_YT_ID,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            this.ytReady = true;
            e.target.setVolume(65);
            if (this.userInteracted && !this.muted && !this.usingCustomAudio) {
              e.target.unMute();
              e.target.playVideo();
            }
          },
          onStateChange: (e) => {
            // 1 = PLAYING, 0 = ENDED
            if (e.data === 1) {
              this.ytPlaying = true;
            } else if (e.data === 0) {
              e.target.playVideo();
            } else if (e.data === 2 || e.data === -1) {
              this.ytPlaying = false;
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }
  }

  public init() {
    this.userInteracted = true;
    if (this.ytReady && this.ytPlayer && !this.muted && !this.usingCustomAudio) {
      try {
        this.ytPlayer.unMute();
        this.ytPlayer.setVolume(65);
        this.ytPlayer.playVideo();
      } catch {
        // Ignore
      }
    }
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (this.usingCustomAudio && this.customAudio && !this.muted && this.customAudio.paused) {
        this.customAudio.play().catch(() => {});
      }
      return;
    }
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
      this.startBackgroundMusic();
    } catch {
      // Ignore if audio is blocked
    }
  }

  public loadCustomTrackFile(file: File) {
    this.init();
    const url = URL.createObjectURL(file);
    if (this.customAudio) {
      this.customAudio.pause();
    }
    if (this.ytReady && this.ytPlayer) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // Ignore
      }
    }
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.55;
    this.customAudio = audio;
    this.usingCustomAudio = true;
    if (!this.muted) {
      audio.play().catch(() => {});
    }
  }

  private startBackgroundMusic() {
    if (this.bgmTimer !== null) return;
    // 140 BPM energetic rally-house / euro-rave beat ("Punane Škoda" fallback when YT player is not active)
    const stepMs = (60 / 140 / 4) * 1000; // 16th note ~ 107ms
    this.bgmTimer = window.setInterval(() => {
      if (this.muted || !this.ctx || this.usingCustomAudio || this.ytPlaying) return;
      if (this.ctx.state === 'suspended') return;

      const s = this.bgmStep % 32;
      this.bgmStep = (this.bgmStep + 1) % 64;
      const now = this.ctx.currentTime;

      // 1. Punchy 4-on-the-floor Kick on 0, 4, 8, 12, 16, 20, 24, 28
      if (s % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(135, now);
        kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.11);

        kickGain.gain.setValueAtTime(0.16, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(now);
        kickOsc.stop(now + 0.15);
      }

      // 2. Off-beat Donk / Rally Bass on 2, 6, 10, 14, 18, 22, 26, 30
      if (s % 4 === 2) {
        const bassNotes = [
          110.0, 110.0, 130.81, 130.81,
          146.83, 146.83, 130.81, 164.81,
        ];
        const bFreq = bassNotes[Math.floor(s / 4) % bassNotes.length];
        const donkOsc = this.ctx.createOscillator();
        const donkFilter = this.ctx.createBiquadFilter();
        const donkGain = this.ctx.createGain();

        donkOsc.type = 'sawtooth';
        donkOsc.frequency.setValueAtTime(bFreq * 1.6, now);
        donkOsc.frequency.exponentialRampToValueAtTime(bFreq, now + 0.06);

        donkFilter.type = 'bandpass';
        donkFilter.frequency.setValueAtTime(420, now);
        donkFilter.Q.value = 2.6;

        donkGain.gain.setValueAtTime(0.11, now);
        donkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        donkOsc.connect(donkFilter);
        donkFilter.connect(donkGain);
        donkGain.connect(this.ctx.destination);
        donkOsc.start(now);
        donkOsc.stop(now + 0.14);
      }

      // 3. Catchy "Punane Škoda" Lead Synth Melody (A minor euro-rally hook)
      const leadPattern: (number | null)[] = [
        440.0, null, 523.25, 440.0, 587.33, null, 523.25, null,
        659.25, null, 587.33, 523.25, 493.88, null, 440.0, 392.0,
        440.0, null, 523.25, 440.0, 659.25, null, 587.33, null,
        783.99, null, 659.25, 587.33, 523.25, 493.88, 440.0, null,
      ];
      const leadFreq = leadPattern[s];
      if (leadFreq !== null) {
        const leadOsc = this.ctx.createOscillator();
        const leadFilter = this.ctx.createBiquadFilter();
        const leadGain = this.ctx.createGain();

        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadFilter.type = 'lowpass';
        leadFilter.frequency.setValueAtTime(1650, now);

        leadGain.gain.setValueAtTime(0.048, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        leadOsc.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        leadOsc.start(now);
        leadOsc.stop(now + 0.12);
      }
    }, stepMs);
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    if (mute) {
      this.stopContinuous();
      if (this.customAudio) {
        this.customAudio.pause();
      }
      if (this.ytReady && this.ytPlayer) {
        try {
          this.ytPlayer.mute();
          this.ytPlayer.pauseVideo();
        } catch {
          // Ignore
        }
      }
    } else {
      if (this.usingCustomAudio && this.customAudio) {
        this.customAudio.play().catch(() => {});
      } else if (this.ytReady && this.ytPlayer && this.userInteracted) {
        try {
          this.ytPlayer.unMute();
          this.ytPlayer.setVolume(65);
          this.ytPlayer.playVideo();
        } catch {
          // Ignore
        }
      }
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
