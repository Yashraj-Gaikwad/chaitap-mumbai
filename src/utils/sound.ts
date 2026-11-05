/**
 * Web Audio API synthesizer for offline audio feedback.
 * Synthesizes pure 880 Hz payment confirmation chime and tactile NFC card tap sounds.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Synthesizes Devcon payment confirmation chime:
   * Native 880 Hz sine wave (A5) with rich harmonic overtone and exponential decay
   */
  public playPaymentSuccessChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Primary 880 Hz tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // 880 Hz
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // Melodic uplift
      
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      // Harmonizing high chime (1760 Hz bell overtone)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now + 0.05);

      gain2.gain.setValueAtTime(0.001, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.2, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.7);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.9);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Short tactile NFC tap tick sound
   */
  public playNfcTapSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Silent catch
    }
  }

  /**
   * Warning / Double Spend buzz sound
   */
  public playErrorBuzz(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Silent catch
    }
  }
}

export const sound = new SoundSynthesizer();
