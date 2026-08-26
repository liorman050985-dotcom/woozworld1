import { Player } from '../entities/Player';
import { AvatarAnimation } from '../entities/AvatarRenderer';
import { audioEngine } from '../engine/AudioEngine';

export class EmoteWheel {
  private player: Player;
  private container: HTMLElement | null = null;
  private onSelectCallback: (anim: AvatarAnimation) => void = () => {};

  constructor(player: Player, onSelectCallback: (anim: AvatarAnimation) => void) {
    this.player = player;
    this.onSelectCallback = onSelectCallback;
  }

  public show() {
    let el = document.getElementById('emote-wheel-menu');
    if (!el) {
      el = document.createElement('div');
      el.id = 'emote-wheel-menu';
      el.className = 'emote-menu';
      document.body.appendChild(el);
    }
    this.container = el;
    this.render();
  }

  public hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  public toggle() {
    if (this.container) {
      this.hide();
    } else {
      this.show();
    }
  }

  private render() {
    if (!this.container) return;

    const emotes: { id: AvatarAnimation; name: string; emoji: string }[] = [
      { id: 'dance', name: 'Breakdance', emoji: '🕺' },
      { id: 'wave', name: 'Wave Hello', emoji: '👋' },
      { id: 'pose', name: 'Runway Pose', emoji: '💃' },
      { id: 'laugh', name: 'Giggle', emoji: '😆' },
      { id: 'cry', name: 'Cry Tears', emoji: '😭' },
      { id: 'idle', name: 'Stand Idle', emoji: '🧍' }
    ];

    this.container.innerHTML = emotes.map(e => `
      <button class="emote-btn" data-anim="${e.id}">
        <span class="emote-emoji">${e.emoji}</span>
        <span>${e.name}</span>
      </button>
    `).join('');

    this.bindEvents();
  }

  private bindEvents() {
    document.querySelectorAll('.emote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audioEngine.playEmoteChime();
        const anim = (e.currentTarget as HTMLElement).dataset.anim as AvatarAnimation;
        if (anim) {
          this.player.setAnimation(anim);
          this.onSelectCallback(anim);
        }
        this.hide();
      });
    });
  }
}
