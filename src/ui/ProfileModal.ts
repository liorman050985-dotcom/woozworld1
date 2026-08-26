import { Player } from '../entities/Player';
import { AvatarRenderer, AvatarCustomization } from '../entities/AvatarRenderer';
import { audioEngine } from '../engine/AudioEngine';

export interface ProfileData {
  name: string;
  level: number;
  customization: AvatarCustomization;
  isSelf: boolean;
  status?: string;
  wooz?: number;
  beex?: number;
}

export class ProfileModal {
  private selfPlayer: Player;
  private currentProfile: ProfileData;
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private onNameChanged: (newName: string) => void = () => {};

  constructor(player: Player, onNameChanged: (newName: string) => void = () => {}) {
    this.selfPlayer = player;
    this.onNameChanged = onNameChanged;
    this.currentProfile = this.getSelfProfileData();
  }

  private getSelfProfileData(): ProfileData {
    return {
      name: this.selfPlayer.name,
      level: this.selfPlayer.level,
      customization: this.selfPlayer.customization,
      isSelf: true,
      status: "Rocking the classic Woozworld retro world! ✨",
      wooz: this.selfPlayer.wooz,
      beex: this.selfPlayer.beex
    };
  }

  public open(targetData?: ProfileData) {
    this.currentProfile = targetData || this.getSelfProfileData();

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
    const p = this.currentProfile;

    this.container.innerHTML = `
      <div class="retro-modal" style="width: 620px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>⭐</span> WoozIn: ${p.name}'s Profile
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
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:6px;">
                ${p.isSelf ? `
                  <input
                    type="text"
                    id="profile-name-input"
                    value="${p.name}"
                    maxlength="16"
                    style="background:#101c2e; border:2px solid #00bcd4; border-radius:8px; padding:4px 8px; color:#fff; font-size:18px; font-weight:900; width:170px;"
                    title="Click to edit your username"
                  />
                  <button class="builder-tool-btn" id="profile-save-name-btn" style="padding:4px 8px; font-size:12px; background:#00e676; color:#000; font-weight:bold;">
                    Save
                  </button>
                ` : `
                  <span style="font-size:20px; font-weight:900; color:#00e5ff;">${p.name}</span>
                  <span style="font-size:14px; color:#ffd700;">👑</span>
                `}
              </div>
              <span class="level-star" style="font-size:13px; padding:4px 10px;">Lv.${p.level}</span>
            </div>

            <!-- Status message -->
            <div style="background:#132034; border:1px solid #2d476e; border-radius:10px; padding:8px 12px; font-size:13px; color:#b0c4de;">
              💬 Status: <em>"${p.status || 'Hanging out in Woozworld! ✨'}"</em>
            </div>

            <!-- Stats grid -->
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px;">
              <div style="background:#17263d; padding:8px 10px; border-radius:8px; border:1px solid #304e78;">
                <div style="font-size:11px; color:#78909c;">Wooz Balance</div>
                <div style="font-size:15px; font-weight:900; color:#ffd700;">${(p.wooz ?? 999999).toLocaleString()} W</div>
              </div>
              <div style="background:#17263d; padding:8px 10px; border-radius:8px; border:1px solid #304e78;">
                <div style="font-size:11px; color:#78909c;">Beex Balance</div>
                <div style="font-size:15px; font-weight:900; color:#00e5ff;">${(p.beex ?? 999999).toLocaleString()} B</div>
              </div>
              <div style="background:#17263d; padding:8px 10px; border-radius:8px; border:1px solid #304e78;">
                <div style="font-size:11px; color:#78909c;">Energy</div>
                <div style="font-size:15px; font-weight:900; color:#ffeb3b;">⚡ 100 / 100</div>
              </div>
              <div style="background:#17263d; padding:8px 10px; border-radius:8px; border:1px solid #304e78;">
                <div style="font-size:11px; color:#78909c;">Prestige Rank</div>
                <div style="font-size:15px; font-weight:900; color:#ff4081;">VIP Resident</div>
              </div>
            </div>

            <!-- Badges Collection -->
            <div>
              <div style="font-size:12px; font-weight:700; color:#ffc107; margin-bottom:4px;">Resident Badges:</div>
              <div style="display:flex; gap:6px;">
                <span style="font-size:22px;" title="Original Flash Era Pioneer">🏆</span>
                <span style="font-size:22px;" title="Runway Fashion Master">👠</span>
                <span style="font-size:22px;" title="VIP Unitz Architect">🏠</span>
                <span style="font-size:22px;" title="Woozband Bestie">💖</span>
                <span style="font-size:22px;" title="Multiplayer Pioneer">🌐</span>
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
          this.currentProfile.customization,
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

    if (this.currentProfile.isSelf) {
      const saveNameBtn = document.getElementById('profile-save-name-btn');
      const nameInput = document.getElementById('profile-name-input') as HTMLInputElement;

      const handleSave = () => {
        if (nameInput && nameInput.value.trim().length >= 2) {
          audioEngine.playPop();
          this.selfPlayer.setName(nameInput.value.trim());
          this.onNameChanged(this.selfPlayer.name);
          this.currentProfile = this.getSelfProfileData();
          this.render();
        }
      };

      saveNameBtn?.addEventListener('click', handleSave);
      nameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSave();
      });
    }
  }
}
