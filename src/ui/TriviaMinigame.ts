import { TRIVIA_QUESTIONS } from '../data/Dialogues';
import { Player } from '../entities/Player';
import { audioEngine } from '../engine/AudioEngine';
import confetti from 'canvas-confetti';

export class TriviaMinigame {
  private player: Player;
  private container: HTMLElement | null = null;
  private currentQuestionIndex: number = 0;
  private correctAnswers: number = 0;
  private onFinished: () => void = () => {};

  constructor(player: Player) {
    this.player = player;
  }

  public start(onFinished: () => void) {
    this.onFinished = onFinished;
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;

    let backdrop = document.getElementById('trivia-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'trivia-modal-backdrop';
      backdrop.className = 'retro-modal-backdrop';
      document.body.appendChild(backdrop);
    }
    this.container = backdrop;
    this.render();
    backdrop.classList.add('open');
  }

  public close() {
    if (this.container) {
      this.container.classList.remove('open');
      this.onFinished();
    }
  }

  private render() {
    if (!this.container) return;

    if (this.currentQuestionIndex >= TRIVIA_QUESTIONS.length) {
      this.renderResults();
      return;
    }

    const q = TRIVIA_QUESTIONS[this.currentQuestionIndex];

    this.container.innerHTML = `
      <div class="minigame-container">
        <div style="font-size:22px; font-weight:900; color:#7c3aed;">
          🕹️ Max's Retro Arcade Trivia
        </div>
        <div style="font-size:13px; color:#b0c4de;">
          Question ${this.currentQuestionIndex + 1} of ${TRIVIA_QUESTIONS.length}
        </div>

        <div style="font-size:17px; font-weight:700; color:#fff; margin:16px 0;">
          "${q.question}"
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
          ${q.options.map((opt, idx) => `
            <button class="runway-pose-btn trivia-opt-btn" data-opt-idx="${idx}" style="text-align:left; padding:12px 18px;">
              ${idx + 1}. ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderResults() {
    if (!this.container) return;

    const isWin = this.correctAnswers >= 3;
    if (isWin) {
      audioEngine.playFanfare();
      confetti({ particleCount: 100, spread: 70 });
      this.player.addXp(400);
    }

    this.container.innerHTML = `
      <div class="minigame-container">
        <h2 style="color:#7c3aed; font-size:26px;">🎮 TRIVIA COMPLETE!</h2>
        <div style="font-size:18px; color:#fff; font-weight:700;">
          Score: ${this.correctAnswers} / ${TRIVIA_QUESTIONS.length} Correct
        </div>
        <div style="font-size:14px; color:#b0c4de;">
          ${isWin ? "MaxWooz: 'Legendary! You're a true virtual world veteran!'" : "MaxWooz: 'Not bad! Study up on your lore and challenge me again!'"}
        </div>
        ${isWin ? '<div style="color:#00e676; font-weight:700;">+400 XP Added!</div>' : ''}
        <button class="wardrobe-btn" id="trivia-done-btn" style="padding:10px 24px; font-size:15px; background:#7c3aed; color:#fff;">
          Close Arcade
        </button>
      </div>
    `;

    document.getElementById('trivia-done-btn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.close();
    });
  }

  private bindEvents() {
    document.querySelectorAll('.trivia-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idxStr = (e.currentTarget as HTMLElement).dataset.optIdx;
        if (idxStr !== undefined) {
          const selected = parseInt(idxStr);
          const q = TRIVIA_QUESTIONS[this.currentQuestionIndex];
          if (selected === q.correctIndex) {
            audioEngine.playPop();
            this.correctAnswers++;
          } else {
            audioEngine.playClick();
          }
          this.currentQuestionIndex++;
          this.render();
        }
      });
    });
  }
}
