import { audioEngine } from '../engine/AudioEngine';
import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';

export class AvatarContextMenu {
  private container: HTMLElement | null = null;
  private onActionCallback: (action: string, targetName: string) => void = () => {};

  public openFor(
    target: { name: string; level?: number; role?: string; isPlayer?: boolean },
    screenX: number,
    screenY: number,
    onAction: (action: string, targetName: string) => void
  ) {
    this.onActionCallback = onAction;
    this.close();

    const el = document.createElement('div');
    el.id = 'avatar-context-menu';
    el.className = 'retro-modal';
    el.style.position = 'fixed';
    el.style.left = `${Math.min(window.innerWidth - 220, Math.max(10, screenX - 100))}px`;
    el.style.top = `${Math.min(window.innerHeight - 260, Math.max(70, screenY - 140))}px`;
    el.style.width = '200px';
    el.style.zIndex = '40';
    el.style.borderRadius = '16px';
    el.style.border = '2.5px solid #00bcd4';
    el.style.boxShadow = '0 10px 25px rgba(0,0,0,0.8)';
    el.style.animation = 'popIn 0.15s ease-out';

    el.innerHTML = `
      <div style="background:linear-gradient(180deg, #1e3654 0%, #102033 100%); padding:8px 12px; border-bottom:2px solid #00bcd4; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13px; font-weight:700; color:#fff;">${target.name}</span>
        <button id="ctx-close-btn" style="background:none; border:none; color:#ff5252; font-weight:900; cursor:pointer; font-size:14px;">✕</button>
      </div>

      <div style="padding:8px; display:flex; flex-direction:column; gap:6px; background:#162438;">
        <button class="builder-tool-btn ctx-btn" data-act="profile" style="text-align:left; padding:6px 10px;">⭐ View Profile</button>
        <button class="builder-tool-btn ctx-btn" data-act="whisper" style="text-align:left; padding:6px 10px;">💬 Whisper</button>
        <button class="builder-tool-btn ctx-btn" data-act="friend" style="text-align:left; padding:6px 10px;">➕ Add Friend</button>
        <button class="builder-tool-btn ctx-btn" data-act="trade" style="text-align:left; padding:6px 10px;">🤝 Trade ItemZ</button>
        <button class="builder-tool-btn ctx-btn" data-act="wave" style="text-align:left; padding:6px 10px;">👋 Wave</button>
      </div>
    `;

    document.body.appendChild(el);
    this.container = el;

    document.getElementById('ctx-close-btn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.close();
    });

    document.querySelectorAll('.ctx-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audioEngine.playClick();
        const act = (e.currentTarget as HTMLElement).dataset.act;
        if (act) {
          this.onActionCallback(act, target.name);
          this.close();
        }
      });
    });
  }

  public close() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
