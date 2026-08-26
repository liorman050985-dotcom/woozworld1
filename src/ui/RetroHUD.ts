import { Player } from '../entities/Player';
import { UnitzManager } from '../world/UnitzManager';
import { AvatarRenderer } from '../entities/AvatarRenderer';
import { audioEngine } from '../engine/AudioEngine';

export class RetroHUD {
  private player: Player;
  private unitzManager: UnitzManager;
  private previewCanvas: HTMLCanvasElement | null = null;
  private previewCtx: CanvasRenderingContext2D | null = null;

  public onOpenWardrobe: () => void = () => {};
  public onOpenShop: () => void = () => {};
  public onOpenNavigator: () => void = () => {};
  public onToggleBuildMode: () => void = () => {};
  public onToggleEmotes: () => void = () => {};
  public onOpenProfile: () => void = () => {};
  public onOpenColorWheel: () => void = () => {};
  public onSendChatMessage: (text: string) => void = () => {};

  constructor(player: Player, unitzManager: UnitzManager) {
    this.player = player;
    this.unitzManager = unitzManager;
  }

  public render(container: HTMLElement) {
    container.innerHTML = `
      <!-- Top HUD Bar: Exact Classic Flash Layout -->
      <header class="retro-top-bar">
        <div class="top-bar-left">
          <!-- Profile Badge -->
          <div class="player-badge" id="hud-profile-badge" style="cursor:pointer;" title="Open WoozIn Profile Card">
            <div class="player-avatar-preview-circle">
              <canvas id="hud-avatar-portrait" width="80" height="80"></canvas>
            </div>
            <div class="player-info-meta">
              <div style="display:flex; align-items:center; gap:4px;">
                <span class="player-name-text">${this.player.name}</span>
                <span style="font-size:12px; color:#ffd700;" title="VIP Master Resident">👑</span>
              </div>
              <div class="level-row">
                <span class="level-star">★ Lv.${this.player.level}</span>
                <div class="xp-bar-bg">
                  <div class="xp-bar-fill" style="width: ${(this.player.xp / this.player.maxXp) * 100}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Energy Bar (Classic Yellow Lightning Bolts) -->
          <div class="currency-pill energy-pill" style="border-color:#ffee58;" title="Infinite VIP Energy">
            <div class="currency-icon" style="background:linear-gradient(180deg, #fff59d, #fbc02d); color:#e65100;">⚡</div>
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:10px; color:#fff59d; font-weight:700;">ENERGY</span>
              <div style="width:50px; height:6px; background:#222; border-radius:3px; overflow:hidden;">
                <div style="width:100%; height:100%; background:linear-gradient(90deg, #ffee58, #ffb300);"></div>
              </div>
            </div>
          </div>

          <!-- Currencies: Wooz & Beex -->
          <div class="currencies-container">
            <div class="currency-pill wooz" title="Infinite Wooz (0 Price Mode)">
              <div class="currency-icon wooz-icon">W</div>
              <span class="currency-val" id="hud-wooz-val">${this.player.wooz.toLocaleString()}</span>
            </div>
            <div class="currency-pill beex" title="Infinite Beex (0 Price Mode)">
              <div class="currency-icon beex-icon">B</div>
              <span class="currency-val" id="hud-beex-val">${this.player.beex.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="top-bar-center">
          <div class="room-title-badge">
            <span class="dot"></span>
            <span id="hud-room-name">${this.unitzManager.currentRoom.name}</span>
          </div>
        </div>

        <div class="top-bar-right">
          <button class="top-btn" id="hud-music-btn" title="Toggle Flash Music Track">
            <span>🎵</span> <span id="hud-music-label">Plaza BGM</span>
          </button>
          <button class="top-btn" id="hud-mute-btn" title="Mute/Unmute Audio">
            <span id="hud-mute-icon">🔊</span>
          </button>
          <button class="top-btn" id="hud-fullscreen-btn" title="Toggle Fullscreen">
            <span>⛶</span>
          </button>
        </div>
      </header>

      <!-- Bottom Action Dock: Classic Iconic Dock -->
      <footer class="retro-bottom-dock">
        <div class="dock-container">
          <button class="dock-btn" id="dock-btn-nav" title="World Navigator Map">
            <div class="btn-icon-wrapper" style="background:linear-gradient(180deg, #0288d1, #01579b);">🌐</div>
            <span class="label">World</span>
          </button>

          <button class="dock-btn" id="dock-btn-my-unitz" title="Go to My Unitz">
            <div class="btn-icon-wrapper" style="background:linear-gradient(180deg, #43a047, #1b5e20);">🏠</div>
            <span class="label">My Unitz</span>
          </button>

          <button class="dock-btn" id="dock-btn-wardrobe" title="Closet / Wardrobe">
            <div class="btn-icon-wrapper" style="background:linear-gradient(180deg, #ec407a, #ad1457);">👗</div>
            <span class="label">Wardrobe</span>
          </button>

          <button class="dock-btn" id="dock-btn-color-wheel" title="Iconic Color Wheel Studio">
            <div class="btn-icon-wrapper" style="background:linear-gradient(180deg, #ab47bc, #6a1b9a);">🎨</div>
            <span class="label">Colors</span>
          </button>

          <button class="dock-btn" id="dock-btn-shop" title="WoozBoutique Shop">
            <div class="btn-icon-wrapper" style="background:linear-gradient(180deg, #ff9800, #e65100);">🛍️</div>
            <span class="label">Shop</span>
          </button>

          <button class="dock-btn" id="dock-btn-build" title="Unitz Decorator Tool">
            <div class="btn-icon-wrapper" style="background:linear-gradient(180deg, #fbc02d, #f57f17);">🔨</div>
            <span class="label">Decorate</span>
          </button>

          <button class="dock-btn" id="dock-btn-emotes" title="Poses & Emotes Wheel">
            <div class="btn-icon-wrapper" style="background:linear-gradient(180deg, #26c6da, #00838f);">🕺</div>
            <span class="label">Emotes</span>
          </button>

          <button class="dock-btn" id="dock-btn-profile" title="WoozIn Profile Card">
            <div class="btn-icon-wrapper" style="background:linear-gradient(180deg, #7e57c2, #4527a0);">⭐</div>
            <span class="label">WoozIn</span>
          </button>
        </div>

        <!-- Classic comic chat box input -->
        <div class="chat-dock-bar">
          <input
            type="text"
            class="chat-input"
            id="hud-chat-input"
            placeholder="Say something to the room..."
            maxlength="90"
          />
          <button class="chat-send-btn" id="hud-chat-send" title="Send (Enter)">
            💬
          </button>
        </div>
      </footer>
    `;

    this.bindEvents();
    this.initPortraitCanvas();
  }

  private initPortraitCanvas() {
    this.previewCanvas = document.getElementById('hud-avatar-portrait') as HTMLCanvasElement;
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
      this.updatePortrait();
    }
  }

  public updatePortrait() {
    if (!this.previewCanvas || !this.previewCtx) return;
    this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    AvatarRenderer.drawAvatar(
      this.previewCtx,
      40,
      75,
      this.player.customization,
      0,
      'idle',
      0,
      1.1
    );
  }

  public updateRoomTitle(name: string) {
    const el = document.getElementById('hud-room-name');
    if (el) el.textContent = name;
  }

  public updateCurrency() {
    const wEl = document.getElementById('hud-wooz-val');
    const bEl = document.getElementById('hud-beex-val');
    if (wEl) wEl.textContent = this.player.wooz.toLocaleString();
    if (bEl) bEl.textContent = this.player.beex.toLocaleString();
  }

  private bindEvents() {
    document.getElementById('hud-profile-badge')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenProfile();
    });

    document.getElementById('dock-btn-profile')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenProfile();
    });

    document.getElementById('dock-btn-nav')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenNavigator();
    });

    document.getElementById('dock-btn-my-unitz')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.unitzManager.changeRoom('personal_penthouse', this.player);
      this.updateRoomTitle(this.unitzManager.currentRoom.name);
      audioEngine.startBackgroundMusic(0);
    });

    document.getElementById('dock-btn-wardrobe')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenWardrobe();
    });

    document.getElementById('dock-btn-color-wheel')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenWardrobe();
    });

    document.getElementById('dock-btn-shop')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenShop();
    });

    document.getElementById('dock-btn-build')?.addEventListener('click', () => {
      audioEngine.playClick();
      const btn = document.getElementById('dock-btn-build');
      btn?.classList.toggle('active');
      this.onToggleBuildMode();
    });

    document.getElementById('dock-btn-emotes')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onToggleEmotes();
    });

    const chatInput = document.getElementById('hud-chat-input') as HTMLInputElement;
    const sendBtn = document.getElementById('hud-chat-send');

    const handleSend = () => {
      if (chatInput && chatInput.value.trim().length > 0) {
        const msg = chatInput.value.trim();
        chatInput.value = '';
        this.onSendChatMessage(msg);
      }
    };

    sendBtn?.addEventListener('click', handleSend);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    });

    const musicBtn = document.getElementById('hud-music-btn');
    const musicLabel = document.getElementById('hud-music-label');
    musicBtn?.addEventListener('click', () => {
      const nextName = audioEngine.nextTrack();
      if (musicLabel) musicLabel.textContent = nextName.split(' ')[0] + ' Track';
    });

    const muteBtn = document.getElementById('hud-mute-btn');
    const muteIcon = document.getElementById('hud-mute-icon');
    muteBtn?.addEventListener('click', () => {
      const muted = audioEngine.toggleMute();
      if (muteIcon) muteIcon.textContent = muted ? '🔇' : '🔊';
    });

    const fsBtn = document.getElementById('hud-fullscreen-btn');
    fsBtn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }
}
