import { UnitzManager } from '../world/UnitzManager';
import { Player } from '../entities/Player';
import { audioEngine } from '../engine/AudioEngine';

export class WorldNavigator {
  private unitzManager: UnitzManager;
  private player: Player;
  private container: HTMLElement | null = null;
  private onRoomChanged: () => void = () => {};

  constructor(unitzManager: UnitzManager, player: Player, onRoomChanged: () => void) {
    this.unitzManager = unitzManager;
    this.player = player;
    this.onRoomChanged = onRoomChanged;
  }

  public open() {
    let backdrop = document.getElementById('navigator-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'navigator-modal-backdrop';
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

    const publicRooms = Object.values(this.unitzManager.rooms).filter(r => r.category === 'public');
    const personalRooms = Object.values(this.unitzManager.rooms).filter(r => r.category === 'personal');

    this.container.innerHTML = `
      <div class="retro-modal" style="width: 680px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>🗺️</span> Woozworld Unitz Navigator
          </div>
          <button class="modal-close-btn" id="nav-close-btn">✕</button>
        </div>

        <div class="modal-body" style="padding:20px;">
          <!-- Public Hotspots -->
          <div style="font-size:16px; font-weight:700; color:#00bcd4; margin-bottom:10px;">
            🌟 Featured Public Hotspots
          </div>

          <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-bottom:20px;">
            ${publicRooms.map(room => `
              <div class="nav-room-card" data-room-id="${room.id}" style="background:#132034; border:2px solid ${room.id === this.unitzManager.currentRoomId ? '#00e676' : '#2d476e'}; border-radius:14px; padding:12px; cursor:pointer; display:flex; gap:12px; align-items:center; transition:all 0.15s ease;">
                <div style="width:50px; height:50px; border-radius:12px; background:linear-gradient(135deg, #00bcd4, #9c27b0); display:flex; align-items:center; justify-content:center; font-size:24px;">
                  ${this.getRoomEmoji(room.id)}
                </div>
                <div style="flex:1;">
                  <div style="font-size:14px; font-weight:700; color:#fff;">${room.name}</div>
                  <div style="font-size:11px; color:#81c784;">● Active Hub (${room.npcs.length + 1} Woozens)</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Personal Unitz -->
          <div style="font-size:16px; font-weight:700; color:#ffc107; margin-bottom:10px;">
            🏠 My Personal Unitz
          </div>

          <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px;">
            ${personalRooms.map(room => `
              <div class="nav-room-card" data-room-id="${room.id}" style="background:#132034; border:2px solid ${room.id === this.unitzManager.currentRoomId ? '#00e676' : '#2d476e'}; border-radius:14px; padding:12px; cursor:pointer; display:flex; gap:12px; align-items:center; transition:all 0.15s ease;">
                <div style="width:50px; height:50px; border-radius:12px; background:linear-gradient(135deg, #ff9800, #f50057); display:flex; align-items:center; justify-content:center; font-size:24px;">
                  🛋️
                </div>
                <div style="flex:1;">
                  <div style="font-size:14px; font-weight:700; color:#fff;">${room.name}</div>
                  <div style="font-size:11px; color:#ffb74d;">Private Sandbox</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private getRoomEmoji(id: string): string {
    switch (id) {
      case 'central_plaza': return '⛲';
      case 'club_wooz': return '🪩';
      case 'fashion_runway': return '👠';
      case 'vip_beach': return '🏖️';
      default: return '🏠';
    }
  }

  private bindEvents() {
    document.getElementById('nav-close-btn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.close();
    });

    document.querySelectorAll('.nav-room-card').forEach(card => {
      card.addEventListener('click', (e) => {
        audioEngine.playPop();
        const roomId = (e.currentTarget as HTMLElement).dataset.roomId;
        if (roomId) {
          this.unitzManager.changeRoom(roomId, this.player);
          audioEngine.startBackgroundMusic(this.unitzManager.currentRoom.defaultMusicTrack);
          this.onRoomChanged();
          this.close();
        }
      });
    });
  }
}
