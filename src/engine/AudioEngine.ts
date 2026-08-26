export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentTrackIndex: number = 0;
  private musicTimer: number | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;

  public tracks = [
    { name: 'Woozworld Central Plaza (Pop Funk)', tempo: 120, key: 'C' },
    { name: 'Club Wooz (Neon Electro Rave)', tempo: 130, key: 'F' },
    { name: 'Fashion Runway (Chic House)', tempo: 124, key: 'A' },
    { name: 'Tropical VIP Chill (Beach Grooves)', tempo: 110, key: 'G' }
  ];

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.value = 0.5;

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.value = 0.25;
      this.musicGainNode.connect(this.masterGainNode);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.value = 0.35;
      this.sfxGainNode.connect(this.masterGainNode);

      this.masterGainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  public playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playStep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + Math.random() * 30, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playFurnitureSnap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.06); // E5

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = this.ctx.currentTime + idx * 0.12;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  public playEmoteChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const chords = [440, 554.37, 659.25]; // A major
    chords.forEach((freq) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    });
  }

  public startBackgroundMusic(trackIndex: number = 0) {
    this.initContext();
    this.currentTrackIndex = trackIndex % this.tracks.length;
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }

    let beat = 0;
    // Retro chord progression patterns
    const basslines = [
      [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23], // Pop Funk
      [174.61, 174.61, 261.63, 349.23, 130.81, 130.81, 196.00, 261.63], // Rave
      [220.00, 261.63, 329.63, 392.00, 174.61, 220.00, 261.63, 329.63], // Runway
      [196.00, 246.94, 293.66, 392.00, 164.81, 220.00, 261.63, 329.63]  // Beach
    ];

    const leadMelodies = [
      [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 783.99, 880.00],
      [698.46, 698.46, 783.99, 880.00, 523.25, 659.25, 587.33, 523.25],
      [880.00, 1046.50, 880.00, 659.25, 783.99, 880.00, 1046.50, 1174.66],
      [392.00, 493.88, 587.33, 493.88, 440.00, 523.25, 659.25, 587.33]
    ];

    const currentBass = basslines[this.currentTrackIndex];
    const currentLead = leadMelodies[this.currentTrackIndex];
    const bpm = this.tracks[this.currentTrackIndex].tempo;
    const intervalMs = (60 / bpm / 2) * 1000;

    this.musicTimer = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.musicGainNode) return;

      const now = this.ctx.currentTime;
      // Play bass note
      const bassNote = currentBass[beat % currentBass.length];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.value = bassNote / 2;

      bassGain.gain.setValueAtTime(0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 0.9);

      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGainNode);
      bassOsc.start(now);
      bassOsc.stop(now + (intervalMs / 1000) * 0.9);

      // Play lead chime on every other beat
      if (beat % 2 === 0) {
        const leadNote = currentLead[(beat / 2) % currentLead.length];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.value = leadNote;

        leadGain.gain.setValueAtTime(0.12, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 1.5);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGainNode);
        leadOsc.start(now);
        leadOsc.stop(now + (intervalMs / 1000) * 1.5);
      }

      beat++;
    }, intervalMs);
  }

  public nextTrack(): string {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.startBackgroundMusic(this.currentTrackIndex);
    return this.tracks[this.currentTrackIndex].name;
  }

  public getCurrentTrackName(): string {
    return this.tracks[this.currentTrackIndex].name;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();
