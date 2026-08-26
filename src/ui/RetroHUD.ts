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
  public onNameChanged: (newName: string) => void = () => {};

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
                <span class="player-name-text" id="hud-player-name">${this.player.name}</span>
                <button id="hud-edit-name-btn" title="Change your username" style="background:none; border:none; color:#00e5ff; cursor:pointer; font-size:12px; padding:0 2px;">✏️</button>
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

      <!-- Bottom Action Dock: Classic Glossy Buttons -->
      <footer class="retro-bottom-dock">
        <div class="action-dock-container">
          <button class="dock-btn" id="dock-btn-world" title="World Navigator">
            <span class="dock-btn-icon">🗺️</span>
            <span class="dock-btn-label">World</span>
          </button>
          <button class="dock-btn" id="dock-btn-penthouse" title="My Penthouse Unitz">
            <span class="dock-btn-icon">🏠</span>
            <span class="dock-btn-label">My Unitz</span>
          </button>
          <button class="dock-btn" id="dock-btn-wardrobe" title="ClosetZ Wardrobe Studio">
            <span class="dock-btn-icon">👗</span>
            <span class="dock-btn-label">Wardrobe</span>
          </button>
          <button class="dock-btn" id="dock-btn-colors" title="Circular Color Wheel">
            <span class="dock-btn-icon">🎨</span>
            <span class="dock-btn-label">Colors</span>
          </button>
          <button class="dock-btn" id="dock-btn-shop" title="ShopZ (All Items Free)">
            <span class="dock-btn-icon">🛍️</span>
            <span class="dock-btn-label">ShopZ</span>
          </button>
          <button class="dock-btn" id="dock-btn-build" title="Unitz Decorator Tool">
            <span class="dock-btn-icon">🔨</span>
            <span class="dock-btn-label">Decorate</span>
          </button>
          <button class="dock-btn" id="dock-btn-emotes" title="ActionZ & Emotes">
            <span class="dock-btn-icon">🕺</span>
            <span class="dock-btn-label">Emotes</span>
          </button>
          <button class="dock-btn" id="dock-btn-profile" title="WoozIn Profile Card">
            <span class="dock-btn-icon">⭐</span>
            <span class="dock-btn-label">WoozIn</span>
          </button>
        </div>

        <!-- Chat Input Bar -->
        <div class="chat-input-bar">
          <input
            type="text"
            id="chat-input-field"
            class="chat-input-field"
            placeholder="Type your message and press Enter to chat in the room..."
            maxlength="120"
          />
          <button id="chat-send-btn" class="chat-send-btn" title="Send Chat">
            <span>💬 Send</span>
          </button>
        </div>
      </footer>
    `;

    this.bindEvents();
    this.updatePortrait();
  }

  public updatePortrait() {
    this.previewCanvas = document.getElementById('hud-avatar-portrait') as HTMLCanvasElement;
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
      if (this.previewCtx) {
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        AvatarRenderer.drawAvatar(
          this.previewCtx,
          40,
          105,
          this.player.customization,
          0,
          'idle',
          0,
          1.4
        );
      }
    }
  }

  public updateRoomTitle(name: string) {
    const el = document.getElementById('hud-room-name');
    if (el) el.textContent = name;
  }

  public updatePlayerName(name: string) {
    const el = document.getElementById('hud-player-name');
    if (el) el.textContent = name;
  }

  private promptChangeName() {
    const currentName = this.player.name;
    const modal = document.createElement('div');
    modal.className = 'retro-modal-backdrop open';
    modal.style.zIndex = '100';

    modal.innerHTML = `
      <div class="retro-modal" style="width:380px;">
        <div class="modal-header">
          <div class="modal-title"><span>✏️</span> Change Character Name</div>
          <button class="modal-close-btn" id="name-modal-close">✕</button>
        </div>
        <div class="modal-body" style="padding:20px; display:flex; flex-direction:column; gap:14px; text-align:center;">
          <div style="font-size:13px; color:#b0c4de;">
            Enter your new Woozen character name (2-16 characters):
          </div>
          <input
            type="text"
            id="new-name-input-field"
            value="${currentName}"
            maxlength="16"
            style="background:#101c2e; border:2px solid #00bcd4; border-radius:10px; padding:10px; color:#fff; font-size:16px; font-weight:bold; text-align:center;"
          />
          <div style="display:flex; justify-content:center; gap:10px;">
            <button id="save-new-name-btn" class="builder-tool-btn" style="background:#00e676; color:#000; font-weight:bold; padding:8px 20px;">
              ✓ Save Name
            </button>
            <button id="cancel-new-name-btn" class="builder-tool-btn" style="background:#37474f; color:#fff; padding:8px 16px;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#new-name-input-field') as HTMLInputElement;
    input.focus();
    input.select();

    const closeModal = () => modal.remove();

    const handleSave = () => {
      const val = input.value.trim();
      if (val.length >= 2) {
        audioEngine.playFanfare();
        this.player.setName(val);
        this.updatePlayerName(this.player.name);
        this.onNameChanged(this.player.name);
        closeModal();
      }
    };

    modal.querySelector('#name-modal-close')?.addEventListener('click', closeModal);
    modal.querySelector('#cancel-new-name-btn')?.addEventListener('click', closeModal);
    modal.querySelector('#save-new-name-btn')?.addEventListener('click', handleSave);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') closeModal();
    });
  }

  private bindEvents() {
    document.getElementById('hud-profile-badge')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenProfile();
    });

    document.getElementById('hud-edit-name-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      audioEngine.playPop();
      this.promptChangeName();
    });

    document.getElementById('dock-btn-world')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenNavigator();
    });

    document.getElementById('dock-btn-penthouse')?.addEventListener('click', () => {
      audioEngine.playPop();
      this.unitzManager.switchRoom('personal_penthouse');
      this.updateRoomTitle(this.unitzManager.currentRoom.name);
    });

    document.getElementById('dock-btn-wardrobe')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenWardrobe();
    });

    document.getElementById('dock-btn-colors')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenColorWheel();
    });

    document.getElementById('dock-btn-shop')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenShop();
    });

    document.getElementById('dock-btn-build')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onToggleBuildMode();
    });

    document.getElementById('dock-btn-emotes')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onToggleEmotes();
    });

    document.getElementById('dock-btn-profile')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.onOpenProfile();
    });

    // Chat Bar Input
    const chatInput = document.getElementById('chat-input-field') as HTMLInputElement;
    const sendBtn = document.getElementById('chat-send-btn');

    const handleSend = () => {
      if (chatInput && chatInput.value.trim().length > 0) {
        this.onSendChatMessage(chatInput.value.trim());
        chatInput.value = '';
      }
    };

    sendBtn?.addEventListener('click', handleSend);
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSend();
      }
    });

    // Music & Fullscreen
    document.getElementById('hud-music-btn')?.addEventListener('click', () => {
      const trackName = audioEngine.nextTrack();
      const label = document.getElementById('hud-music-label');
      if (label) label.textContent = trackName.split(' ')[0];
    });

    document.getElementById('hud-mute-btn')?.addEventListener('click', () => {
      const muted = audioEngine.toggleMute();
      const icon = document.getElementById('hud-mute-icon');
      if (icon) icon.textContent = muted ? '🔇' : '🔊';
    });

    document.getElementById('hud-fullscreen-btn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }
}
