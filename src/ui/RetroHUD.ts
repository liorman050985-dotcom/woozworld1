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
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="player-name-text" id="hud-player-name">${this.player.name}</span>
                <button id="hud-edit-name-btn" title="Change your username" style="background:rgba(0,188,212,0.2); border:1px solid #00e5ff; border-radius:4px; color:#00e5ff; cursor:pointer; font-size:11px; padding:2px 5px; font-weight:bold;">
                  ✏️ Edit
                </button>
                <span style="font-size:14px; color:#ffd700;" title="VIP Master Resident">👑</span>
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
            <div class="currency-icon" style="background:linear-gradient(180deg, #fff59d, #fbc02d); color:#e65100; font-size:16px;">⚡</div>
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-size:9px; color:#fff59d; font-weight:800; letter-spacing:0.5px;">ENERGY</span>
              <div style="width:55px; height:7px; background:#1a1a24; border:1px solid #ffca28; border-radius:4px; overflow:hidden;">
                <div style="width:100%; height:100%; background:linear-gradient(90deg, #ffee58, #ff8f00);"></div>
              </div>
            </div>
          </div>

          <!-- Currencies: Wooz & Beex -->
          <div class="currencies-container">
            <div class="currency-pill wooz" title="Infinite Wooz (0 Price Mode)">
              <div class="currency-icon wooz-icon" style="font-weight:900;">W</div>
              <span class="currency-val" id="hud-wooz-val">${this.player.wooz.toLocaleString()}</span>
            </div>
            <div class="currency-pill beex" title="Infinite Beex (0 Price Mode)">
              <div class="currency-icon beex-icon" style="font-weight:900;">B</div>
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
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#00e5ff"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            <span id="hud-music-label">Plaza BGM</span>
          </button>
          <button class="top-btn" id="hud-mute-btn" title="Mute/Unmute Audio">
            <span id="hud-mute-icon">🔊</span>
          </button>
          <button class="top-btn" id="hud-fullscreen-btn" title="Toggle Fullscreen">
            <span>⛶</span>
          </button>
        </div>
      </header>

      <!-- Bottom Action Dock: Authentic Vector Flash Icons -->
      <footer class="retro-bottom-dock">
        <div class="action-dock-container" style="background:linear-gradient(180deg, #1b304d 0%, #0d1a2d 100%); border:3px solid #00bcd4; border-radius:32px; padding:6px 14px; display:flex; align-items:center; gap:8px; box-shadow:0 10px 30px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.4);">
          
          <!-- 1. World -->
          <button class="dock-btn" id="dock-btn-world" title="World Navigator">
            <div class="dock-icon-circle" style="background:linear-gradient(180deg, #0288d1 0%, #01579b 100%); border:2px solid #81d4fa;">
              <svg viewBox="0 0 36 36" width="26" height="26">
                <circle cx="18" cy="18" r="12" fill="#039be5" stroke="#b3e5fc" stroke-width="1.2"/>
                <path d="M 8 13 Q 18 18 28 13" stroke="#e1f5fe" stroke-width="1.2" fill="none"/>
                <path d="M 8 23 Q 18 18 28 23" stroke="#e1f5fe" stroke-width="1.2" fill="none"/>
                <ellipse cx="18" cy="18" rx="5" ry="12" stroke="#e1f5fe" stroke-width="1.2" fill="none"/>
                <ellipse cx="18" cy="18" rx="15" ry="6" stroke="#ffd54f" stroke-width="2" fill="none" transform="rotate(-25 18 18)"/>
              </svg>
            </div>
            <span class="dock-btn-label">World</span>
          </button>

          <!-- 2. My Unitz -->
          <button class="dock-btn" id="dock-btn-penthouse" title="My Penthouse Unitz">
            <div class="dock-icon-circle" style="background:linear-gradient(180deg, #7b1fa2 0%, #4a148c 100%); border:2px solid #e1bee7;">
              <svg viewBox="0 0 36 36" width="26" height="26">
                <path d="M 18 5 L 31 16 L 5 16 Z" fill="#ff4081" stroke="#ff80ab" stroke-width="1.2"/>
                <rect x="8" y="15" width="20" height="15" rx="2" fill="#ba68c8" stroke="#f3e5f5" stroke-width="1.2"/>
                <rect x="14" y="20" width="8" height="10" rx="1.5" fill="#ffd54f"/>
                <rect x="10" y="17" width="3" height="3" rx="0.5" fill="#80deea"/>
                <rect x="23" y="17" width="3" height="3" rx="0.5" fill="#80deea"/>
              </svg>
            </div>
            <span class="dock-btn-label">My Unitz</span>
          </button>

          <!-- 3. Wardrobe (ClosetZ) -->
          <button class="dock-btn" id="dock-btn-wardrobe" title="ClosetZ Wardrobe Studio">
            <div class="dock-icon-circle" style="background:linear-gradient(180deg, #00acc1 0%, #006064 100%); border:2px solid #80deea;">
              <svg viewBox="0 0 36 36" width="26" height="26">
                <circle cx="18" cy="8" r="2.5" fill="none" stroke="#ffd54f" stroke-width="2"/>
                <path d="M 10 13 L 18 10 L 26 13 Z" fill="none" stroke="#ffd54f" stroke-width="1.8"/>
                <path d="M 10 13 L 6 19 L 11 21 L 12 30 L 24 30 L 25 21 L 30 19 L 26 13 Z" fill="#26c6da" stroke="#ffffff" stroke-width="1.2"/>
                <polygon points="18,17 19,20 22,20 19.5,22 20.5,25 18,23 15.5,25 16.5,22 14,20 17,20" fill="#ffd54f"/>
              </svg>
            </div>
            <span class="dock-btn-label">Wardrobe</span>
          </button>

          <!-- 4. Colors (Color Wheel) -->
          <button class="dock-btn" id="dock-btn-colors" title="Circular Color Wheel">
            <div class="dock-icon-circle" style="background:linear-gradient(180deg, #37474f 0%, #212121 100%); border:2px solid #ffffff;">
              <svg viewBox="0 0 36 36" width="26" height="26">
                <circle cx="18" cy="18" r="13" fill="#263238" stroke="#ffffff" stroke-width="1.5"/>
                <path d="M 18 18 L 18 5 A 13 13 0 0 1 31 18 Z" fill="#ff1744"/>
                <path d="M 18 18 L 31 18 A 13 13 0 0 1 18 31 Z" fill="#ffea00"/>
                <path d="M 18 18 L 18 31 A 13 13 0 0 1 5 18 Z" fill="#00e676"/>
                <path d="M 18 18 L 5 18 A 13 13 0 0 1 18 5 Z" fill="#2979ff"/>
                <circle cx="18" cy="18" r="4.5" fill="#ffffff" stroke="#222" stroke-width="1"/>
                <circle cx="18" cy="18" r="2" fill="#00e5ff"/>
              </svg>
            </div>
            <span class="dock-btn-label">Colors</span>
          </button>

          <!-- 5. ShopZ -->
          <button class="dock-btn" id="dock-btn-shop" title="ShopZ (All Items Free)">
            <div class="dock-icon-circle" style="background:linear-gradient(180deg, #d81b60 0%, #880e4f 100%); border:2px solid #ff80ab;">
              <svg viewBox="0 0 36 36" width="26" height="26">
                <path d="M 13 12 Q 13 5 18 5 Q 23 5 23 12" fill="none" stroke="#ffe082" stroke-width="2.2" stroke-linecap="round"/>
                <rect x="7" y="11" width="22" height="20" rx="3.5" fill="#e91e63" stroke="#ffffff" stroke-width="1.2"/>
                <path d="M 12 18 L 15 25 L 18 20 L 21 25 L 24 18" stroke="#ffd54f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
            <span class="dock-btn-label">ShopZ</span>
          </button>

          <!-- 6. Decorate -->
          <button class="dock-btn" id="dock-btn-build" title="Unitz Decorator Tool">
            <div class="dock-icon-circle" style="background:linear-gradient(180deg, #f57f17 0%, #e65100 100%); border:2px solid #ffe082;">
              <svg viewBox="0 0 36 36" width="26" height="26">
                <path d="M 8 28 L 21 15 M 19 13 L 25 7 L 29 11 L 23 17" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <path d="M 28 28 L 15 15 M 11 11 L 7 15 L 11 19" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
            <span class="dock-btn-label">Decorate</span>
          </button>

          <!-- 7. ActionZ & Emotes -->
          <button class="dock-btn" id="dock-btn-emotes" title="ActionZ & Emotes">
            <div class="dock-icon-circle" style="background:linear-gradient(180deg, #fbc02d 0%, #f57f17 100%); border:2px solid #fff59d;">
              <svg viewBox="0 0 36 36" width="26" height="26">
                <circle cx="18" cy="8" r="3.5" fill="#fff" stroke="#ff6f00" stroke-width="1"/>
                <path d="M 18 12 L 18 22 M 18 14 L 11 10 M 18 14 L 25 18 M 18 22 L 12 30 M 18 22 L 24 30" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <polygon points="28,6 29,8 31,9 29,10 28,12 27,10 25,9 27,8" fill="#00e5ff"/>
              </svg>
            </div>
            <span class="dock-btn-label">Emotes</span>
          </button>

          <!-- 8. WoozIn -->
          <button class="dock-btn" id="dock-btn-profile" title="WoozIn Profile Card">
            <div class="dock-icon-circle" style="background:linear-gradient(180deg, #ffd54f 0%, #ff8f00 100%); border:2px solid #ffffff;">
              <svg viewBox="0 0 36 36" width="26" height="26">
                <polygon points="18,3 22,12 32,13.5 24.5,21 26.5,31 18,26 9.5,31 11.5,21 4,13.5 14,12" fill="#ffd54f" stroke="#ffffff" stroke-width="1.5"/>
              </svg>
            </div>
            <span class="dock-btn-label">WoozIn</span>
          </button>
        </div>

        <!-- Chat Input Bar: Sleek Flash Capsule -->
        <div class="chat-capsule-bar" style="background:linear-gradient(180deg, #18283e 0%, #0f1c2d 100%); border:2.5px solid #00bcd4; border-radius:28px; padding:4px 6px 4px 14px; display:flex; align-items:center; gap:8px; width:340px; box-shadow:0 8px 25px rgba(0,0,0,0.7);">
          <div style="font-size:16px; color:#00e5ff; display:flex; align-items:center;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#00e5ff"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          </div>
          <input
            type="text"
            id="chat-input-field"
            class="chat-input-field"
            placeholder="Type your message and press Enter..."
            maxlength="120"
            style="flex:1; background:transparent; border:none; outline:none; color:#fff; font-size:13px; font-weight:600; font-family:'Fredoka', sans-serif;"
          />
          <button id="chat-send-btn" class="builder-tool-btn" style="background:linear-gradient(180deg, #00e676 0%, #00b248 100%); border:1.5px solid #b9f6ca; color:#000; font-weight:900; font-size:12px; padding:6px 14px; border-radius:20px; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Send Chat">
            <span>Send ➔</span>
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
