import confetti from 'canvas-confetti';
import { Player } from '../entities/Player';
import { AvatarAnimation } from '../entities/AvatarRenderer';
import { audioEngine } from '../engine/AudioEngine';

export class FashionMinigame {
  private player: Player;
  private container: HTMLElement | null = null;
  private timer: number = 0;
  private maxTime: number = 15;
  private timerInterval: number | null = null;
  private score: number = 0;
  private targetPose: AvatarAnimation = 'pose';
  private requiredPoses: { anim: AvatarAnimation; name: string; emoji: string }[] = [
    { anim: 'pose', name: 'Model Pose', emoji: '💃' },
    { anim: 'dance', name: 'Vogue Dance', emoji: '🕺' },
    { anim: 'wave', name: 'Flirty Wave', emoji: '👋' },
    { anim: 'laugh', name: 'Starlet Smile', emoji: '✨' }
  ];
  private currentPoseIndex: number = 0;
  private onFinished: () => void = () => {};

  constructor(player: Player) {
    this.player = player;
  }

  public start(onFinished: () => void) {
    this.onFinished = onFinished;
    this.score = 0;
    this.currentPoseIndex = 0;
    this.targetPose = this.requiredPoses[0].anim;
    this.timer = this.maxTime;

    let backdrop = document.getElementById('fashion-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'fashion-modal-backdrop';
      backdrop.className = 'retro-modal-backdrop';
      document.body.appendChild(backdrop);
    }
    this.container = backdrop;
    this.render();
    backdrop.classList.add('open');

    this.timerInterval = window.setInterval(() => {
      this.timer -= 0.1;
      const fill = document.getElementById('runway-timer-fill');
      if (fill) {
        fill.style.width = `${Math.max(0, (this.timer / this.maxTime) * 100)}%`;
      }
      if (this.timer <= 0) {
        this.finish(false);
      }
    }, 100);
  }

  public finish(isWin: boolean) {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (isWin) {
      audioEngine.playFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      this.player.addXp(500);
    }

    if (this.container) {
      this.container.innerHTML = `
        <div class="minigame-container">
          <h2 style="color:#ffd700; font-size:26px;">${isWin ? '🏆 PERFECT 10/10 RUNWAY!' : '⏱️ TIME UP!'}</h2>
          <div style="font-size:16px; color:#fff; line-height:1.5;">
            ${isWin ? "MyaWooz: 'Darling, you absolutely SLAYED that runway! Total perfection!'" : "MyaWooz: 'Good effort sweetie! Practice your poses and try again!'"}
          </div>
          <div style="font-size:18px; color:#00e676; font-weight:700;">
            ${isWin ? '+500 VIP XP Earned!' : ''}
          </div>
          <button class="wardrobe-btn" id="runway-done-btn" style="padding:10px 24px; font-size:15px; background:#ff4081; color:#fff;">
            Continue
          </button>
        </div>
      `;

      document.getElementById('runway-done-btn')?.addEventListener('click', () => {
        audioEngine.playClick();
        if (this.container) {
          this.container.classList.remove('open');
        }
        this.onFinished();
      });
    }
  }

  private render() {
    if (!this.container) return;

    const currentTarget = this.requiredPoses[this.currentPoseIndex];

    this.container.innerHTML = `
      <div class="minigame-container">
        <div style="font-size:22px; font-weight:900; color:#ff4081;">
          👠 Woozworld Runway Showdown
        </div>
        <div style="font-size:14px; color:#b0c4de;">
          Match the judge's pose prompt before time runs out! (Round ${this.currentPoseIndex + 1}/4)
        </div>

        <div class="minigame-timer-bar">
          <div class="minigame-timer-fill" id="runway-timer-fill" style="width: 100%;"></div>
        </div>

        <div class="runway-pose-target">
          ${currentTarget.emoji}
        </div>
        <div style="font-size:18px; font-weight:700; color:#ffd700;">
          Prompt: ${currentTarget.name}
        </div>

        <div class="runway-actions-grid">
          ${this.requiredPoses.map(p => `
            <button class="runway-pose-btn" data-pose="${p.anim}">
              <div style="font-size:26px;">${p.emoji}</div>
              <div>${p.name}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    document.querySelectorAll('.runway-pose-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pose = (e.currentTarget as HTMLElement).dataset.pose as AvatarAnimation;
        if (pose === this.requiredPoses[this.currentPoseIndex].anim) {
          audioEngine.playPop();
          this.player.setAnimation(pose);
          this.currentPoseIndex++;
          if (this.currentPoseIndex >= this.requiredPoses.length) {
            this.finish(true);
          } else {
            this.render();
          }
        } else {
          audioEngine.playClick();
        }
      });
    });
  }
}
