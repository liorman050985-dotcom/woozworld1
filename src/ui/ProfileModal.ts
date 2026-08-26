import { Player } from '../entities/Player';
import { AvatarRenderer } from '../entities/AvatarRenderer';
import { audioEngine } from '../engine/AudioEngine';

export class ProfileModal {
  private player: Player;
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(player: Player) {
    this.player = player;
  }

  public open() {
    let backdrop = document.getElementById('profile-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'profile-modal-backdrop';
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
    }
  }

  private render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="retro-modal" style="width: 620px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>⭐</span> WoozIn Profile Card
          </div>
          <button class="modal-close-btn" id="profile-close-btn">✕</button>
        </div>

        <div class="modal-body" style="padding:20px; display:flex; gap:20px;">
          <!-- Left: Full Avatar Display -->
          <div style="width:200px; height:280px; background:radial-gradient(circle, #29487d 0%, #101c30 100%); border:2px solid #00bcd4; border-radius:16px; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 2px 10px rgba(0,0,0,0.5);">
            <canvas id="profile-avatar-canvas" width="180" height="260"></canvas>
          </div>

          <!-- Right: Player Stats & Badges -->
          <div style="flex:1; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h2 style="font-size:22px; color:#fff; font-weight:900;">${this.player.name}</h2>
                <div style="color:#00bcd4; font-size:13px; font-weight:700;">★ VIP Superstar Resident</div>
              </div>
              <span class="level-star" style="font-size:13px; padding:4px 10px;">Lv.${this.player.level}</span>
            </div>

            <!-- Status input -->
            <div style="background:#132034; border:1px solid #2d476e; border-radius:10px; padding:8px 12px; font-size:13px; color:#b0c4de;">
              💬 Status: <em>"Living the classic offline Woozworld dream! ✨"</em>
            </div>

            <!-- Stats grid -->
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px;">
              <div style="background:#17263d; padding:8px 10px; border-radius:8px; border:1px solid #304e78;">
                <div style="font-size:11px; color:#78909c;">Wooz Balance</div>
                <div style="font-size:15px; font-weight:900; color:#ffd700;">${this.player.wooz.toLocaleString()} W</div>
              </div>
              <div style="background:#17263d; padding:8px 10px; border-radius:8px; border:1px solid #304e78;">
                <div style="font-size:11px; color:#78909c;">Beex Balance</div>
                <div style="font-size:15px; font-weight:900; color:#00e5ff;">${this.player.beex.toLocaleString()} B</div>
              </div>
              <div style="background:#17263d; padding:8px 10px; border-radius:8px; border:1px solid #304e78;">
                <div style="font-size:11px; color:#78909c;">Energy</div>
                <div style="font-size:15px; font-weight:900; color:#ffeb3b;">⚡ 100 / 100</div>
              </div>
              <div style="background:#17263d; padding:8px 10px; border-radius:8px; border:1px solid #304e78;">
                <div style="font-size:11px; color:#78909c;">Prestige Rank</div>
                <div style="font-size:15px; font-weight:900; color:#ff4081;">VIP Master</div>
              </div>
            </div>

            <!-- Badges Collection -->
            <div>
              <div style="font-size:12px; font-weight:700; color:#ffc107; margin-bottom:4px;">Unlocked Badges:</div>
              <div style="display:flex; gap:6px;">
                <span style="font-size:22px;" title="Original Flash Era Pioneer">🏆</span>
                <span style="font-size:22px;" title="Runway Fashion Master">👠</span>
                <span style="font-size:22px;" title="VIP Unitz Architect">🏠</span>
                <span style="font-size:22px;" title="Woozband Bestie">💖</span>
                <span style="font-size:22px;" title="Trivia King">🎮</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.drawAvatar();
  }

  private drawAvatar() {
    this.canvas = document.getElementById('profile-avatar-canvas') as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        AvatarRenderer.drawAvatar(
          this.ctx,
          90,
          230,
          this.player.customization,
          0,
          'pose',
          0,
          1.8
        );
      }
    }
  }

  private bindEvents() {
    document.getElementById('profile-close-btn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.close();
    });
  }
}
