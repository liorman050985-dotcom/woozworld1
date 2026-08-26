import { UnitzManager } from '../world/UnitzManager';
import { FURNITURE_CATALOG, FurnitureItemDef } from '../data/FurnitureItems';
import { TileData } from '../engine/IsometricGrid';
import { audioEngine } from '../engine/AudioEngine';

export class UnitzBuilderUI {
  private unitzManager: UnitzManager;
  private container: HTMLElement | null = null;
  private activeTab: 'furniture' | 'floor' | 'walls' | 'settings' = 'furniture';
  private selectedCategory: string = 'all';
  public onGoToPersonalUnitz: () => void = () => {};

  constructor(unitzManager: UnitzManager) {
    this.unitzManager = unitzManager;
  }

  public show() {
    let el = document.getElementById('unitz-builder-bar');
    if (!el) {
      el = document.createElement('div');
      el.id = 'unitz-builder-bar';
      el.className = 'unitz-builder-bar';
      document.body.appendChild(el);
    }
    this.container = el;
    this.unitzManager.isBuildMode = true;
    this.render();
  }

  public hide() {
    this.unitzManager.isBuildMode = false;
    this.unitzManager.selectedBuildDefId = null;
    this.unitzManager.selectedPlacedFurniture = null;
    this.unitzManager.paintTileType = null;
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  public toggle() {
    if (this.unitzManager.isBuildMode) {
      this.hide();
    } else {
      this.show();
    }
  }

  public render() {
    if (!this.container) return;

    // Notice if in a public room
    if (this.unitzManager.currentRoom.category !== 'personal') {
      this.container.innerHTML = `
        <div class="builder-title">
          <span>🔨 Unitz Decorator</span>
          <button id="builder-close-btn" style="background:none; border:none; color:#fff; cursor:pointer; font-size:16px;">✕</button>
        </div>
        <div style="padding:14px; text-align:center; color:#fff; display:flex; flex-direction:column; align-items:center; gap:8px;">
          <div style="font-size:32px;">🏠</div>
          <div style="font-size:15px; font-weight:800; color:#ffd54f;">Personal Unitz Only</div>
          <div style="font-size:12px; color:#b0bec5; line-height:1.4; max-width:340px;">
            Furniture, sofas, and room decorations can only be placed and arranged inside your <strong>Personal Penthouse</strong>, not in public areas!
          </div>
          <button id="go-to-personal-btn" class="builder-tool-btn" style="background:#00e676; color:#000; font-weight:900; padding:8px 18px; border-radius:10px; cursor:pointer; margin-top:4px;">
            🚀 Teleport to My Penthouse
          </button>
        </div>
      `;
      document.getElementById('builder-close-btn')?.addEventListener('click', () => {
        audioEngine.playClick();
        this.hide();
      });
      document.getElementById('go-to-personal-btn')?.addEventListener('click', () => {
        audioEngine.playPop();
        this.onGoToPersonalUnitz();
        this.render();
      });
      return;
    }

    this.container.innerHTML = `
      <div class="builder-title">
        <span>🔨 Unitz Decorator (Personal Penthouse)</span>
        <button id="builder-close-btn" style="background:none; border:none; color:#fff; cursor:pointer; font-size:16px;">✕</button>
      </div>

      <!-- Mode Tabs -->
      <div class="builder-tool-group">
        <button class="builder-tool-btn ${this.activeTab === 'furniture' ? 'active' : ''}" id="tool-tab-furn">Furniture</button>
        <button class="builder-tool-btn ${this.activeTab === 'floor' ? 'active' : ''}" id="tool-tab-floor">Floor</button>
        <button class="builder-tool-btn ${this.activeTab === 'walls' ? 'active' : ''}" id="tool-tab-walls">Walls</button>
        <button class="builder-tool-btn ${this.activeTab === 'settings' ? 'active' : ''}" id="tool-tab-settings">Room Settings</button>
      </div>

      <!-- Tab Content Area -->
      <div class="builder-content-area" style="max-height: 140px; overflow-y: auto; padding: 4px;">
        ${this.renderTabContent()}
      </div>

      <!-- Selected Furniture Controls (Rotate, Elevate, Delete) -->
      ${this.renderSelectionControls()}
    `;

    this.bindEvents();
  }

  private renderTabContent(): string {
    if (this.activeTab === 'furniture') {
      const categories: (FurnitureItemDef['category'] | 'all')[] = ['all', 'seating', 'surfaces', 'lighting', 'plants', 'decor', 'electronics', 'special'];
      const filtered = FURNITURE_CATALOG.filter(f =>
        this.selectedCategory === 'all' ? true : f.category === this.selectedCategory
      );

      return `
        <div style="display:flex; gap:4px; margin-bottom:6px; overflow-x:auto;">
          ${categories.map(c => `
            <button class="builder-tool-btn ${this.selectedCategory === c ? 'active' : ''} category-filter-btn" data-cat="${c}" style="font-size:10px; padding:3px 6px;">
              ${c.toUpperCase()}
            </button>
          `).join('')}
        </div>
        <div class="furniture-catalog-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap:6px;">
          ${filtered.map(f => {
            const isSelected = this.unitzManager.selectedBuildDefId === f.id;
            return `
              <div class="furniture-card ${isSelected ? 'selected' : ''}" data-def-id="${f.id}" style="padding:4px; background:#101c2e; border:1.5px solid ${isSelected ? '#00e5ff' : '#223856'}; border-radius:8px; text-align:center; cursor:pointer;">
                <div style="font-size:20px; line-height:1.2;">${this.getCategoryIcon(f.category)}</div>
                <div style="font-size:10px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.name}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'floor') {
      const floorTypes: { type: TileData['type']; label: string; color: string }[] = [
        { type: 'wood', label: 'Wood', color: '#5c3a21' },
        { type: 'checker', label: 'Checker', color: '#1976d2' },
        { type: 'marble', label: 'Marble', color: '#eceff1' },
        { type: 'disco', label: 'Disco Rave', color: '#e91e63' },
        { type: 'carpet_red', label: 'Plush Carpet', color: '#c2185b' },
        { type: 'grass', label: 'Lawn Grass', color: '#4caf50' },
        { type: 'sand', label: 'Golden Sand', color: '#ffb74d' },
        { type: 'water', label: 'Aqua Pool', color: '#00e5ff' },
        { type: 'pavement', label: 'Pavement', color: '#78909c' },
      ];

      return `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap:6px;">
          ${floorTypes.map(ft => {
            const isSelected = this.unitzManager.paintTileType === ft.type;
            return `
              <button class="builder-tool-btn tile-paint-btn ${isSelected ? 'active' : ''}" data-tile-type="${ft.type}" style="background:${ft.color}; color:#fff; text-shadow:0 1px 2px #000; font-size:11px; padding:8px 4px; border:2px solid ${isSelected ? '#ffd700' : 'transparent'};">
                ${ft.label}
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'walls') {
      const wallColors = ['#1e3352', '#3e2723', '#263238', '#4a148c', '#880e4f', '#004d40', '#bf360c', '#37474f'];
      return `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="font-size:12px; color:#b0c4de;">Pick room wall paint color:</div>
          <div style="display:flex; gap:8px;">
            ${wallColors.map(c => `
              <div class="wall-color-swatch" data-color="${c}" style="width:32px; height:32px; background:${c}; border:2px solid #fff; border-radius:6px; cursor:pointer;"></div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; gap:8px; padding:4px;">
        <button class="builder-tool-btn" id="btn-export-room" style="background:#00bcd4; color:#000;">💾 Export Room JSON</button>
        <button class="builder-tool-btn" id="btn-clear-furniture" style="background:#ff5252; color:#fff;">🗑️ Clear All Furniture</button>
      </div>
    `;
  }

  private renderSelectionControls(): string {
    const f = this.unitzManager.selectedPlacedFurniture;
    if (!f) return '';

    const def = FURNITURE_CATALOG.find(d => d.id === f.defId);

    return `
      <div style="margin-top:6px; padding:6px 10px; background:#0d1827; border:1.5px solid #ff9800; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; font-weight:700; color:#ffb74d;">Selected: ${def?.name || 'Item'}</span>
        <div style="display:flex; gap:4px;">
          <button class="builder-tool-btn" id="btn-rotate" title="Rotate (Key: R)">🔄 Rotate</button>
          <button class="builder-tool-btn" id="btn-elev-up" title="Raise (Key: E)">⬆ Raise</button>
          <button class="builder-tool-btn" id="btn-elev-down" title="Lower (Key: Q)">⬇ Lower</button>
          <button class="builder-tool-btn" id="btn-delete" style="background:#d32f2f;" title="Delete (Key: Del)">❌ Delete</button>
        </div>
      </div>
    `;
  }

  private getCategoryIcon(cat: FurnitureItemDef['category']): string {
    switch (cat) {
      case 'seating': return '🛋️';
      case 'surfaces': return '🪑';
      case 'electronics': return '📺';
      case 'decor': return '🖼️';
      case 'plants': return '🪴';
      case 'lighting': return '💡';
      default: return '📦';
    }
  }

  private bindEvents() {
    document.getElementById('builder-close-btn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.hide();
    });

    document.getElementById('tool-tab-furn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.activeTab = 'furniture';
      this.unitzManager.paintTileType = null;
      this.render();
    });

    document.getElementById('tool-tab-floor')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.activeTab = 'floor';
      this.unitzManager.selectedBuildDefId = null;
      this.render();
    });

    document.getElementById('tool-tab-walls')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.activeTab = 'walls';
      this.render();
    });

    document.getElementById('tool-tab-settings')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.activeTab = 'settings';
      this.render();
    });

    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audioEngine.playClick();
        this.selectedCategory = (e.currentTarget as HTMLElement).dataset.cat || 'all';
        this.render();
      });
    });

    document.querySelectorAll('.furniture-card').forEach(card => {
      card.addEventListener('click', (e) => {
        audioEngine.playPop();
        const defId = (e.currentTarget as HTMLElement).dataset.defId;
        if (defId) {
          this.unitzManager.selectedBuildDefId = defId;
          this.unitzManager.selectedPlacedFurniture = null;
          this.unitzManager.paintTileType = null;
          this.render();
        }
      });
    });

    document.querySelectorAll('.tile-paint-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audioEngine.playPop();
        const type = (e.currentTarget as HTMLElement).dataset.tileType as TileData['type'];
        this.unitzManager.paintTileType = type;
        this.unitzManager.selectedBuildDefId = null;
        this.unitzManager.selectedPlacedFurniture = null;
        this.render();
      });
    });

    document.querySelectorAll('.wall-color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        audioEngine.playPop();
        const color = (e.currentTarget as HTMLElement).dataset.color;
        if (color) {
          this.unitzManager.currentRoom.wallColor = color;
          this.unitzManager.saveRoomsToStorage();
        }
      });
    });

    document.getElementById('btn-rotate')?.addEventListener('click', () => {
      if (this.unitzManager.selectedPlacedFurniture) {
        audioEngine.playClick();
        this.unitzManager.rotateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId);
      }
    });

    document.getElementById('btn-elev-up')?.addEventListener('click', () => {
      if (this.unitzManager.selectedPlacedFurniture) {
        audioEngine.playClick();
        this.unitzManager.elevateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId, 4);
      }
    });

    document.getElementById('btn-elev-down')?.addEventListener('click', () => {
      if (this.unitzManager.selectedPlacedFurniture) {
        audioEngine.playClick();
        this.unitzManager.elevateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId, -4);
      }
    });

    document.getElementById('btn-delete')?.addEventListener('click', () => {
      if (this.unitzManager.selectedPlacedFurniture) {
        audioEngine.playPop();
        this.unitzManager.removeFurniture(this.unitzManager.selectedPlacedFurniture.instanceId);
        this.render();
      }
    });

    document.getElementById('btn-export-room')?.addEventListener('click', () => {
      audioEngine.playFanfare();
      const json = this.unitzManager.exportRoomsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.unitzManager.currentRoom.name.replace(/\s+/g, '_')}_unitz.json`;
      a.click();
    });

    document.getElementById('btn-clear-furniture')?.addEventListener('click', () => {
      if (confirm('Clear all placed furniture in this room?')) {
        audioEngine.playPop();
        this.unitzManager.currentRoom.furniture = [];
        this.unitzManager.saveRoomsToStorage();
        this.render();
      }
    });
  }
}
