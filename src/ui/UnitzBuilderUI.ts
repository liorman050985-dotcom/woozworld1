import { UnitzManager } from '../world/UnitzManager';
import { FURNITURE_CATALOG, FurnitureItemDef } from '../data/FurnitureItems';
import { TileData } from '../engine/IsometricGrid';
import { audioEngine } from '../engine/AudioEngine';

export class UnitzBuilderUI {
  private unitzManager: UnitzManager;
  private container: HTMLElement | null = null;
  private activeTab: 'furniture' | 'floor' | 'walls' | 'settings' = 'furniture';
  private selectedCategory: string = 'all';

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

    this.container.innerHTML = `
      <div class="builder-title">
        <span>🔨 Unitz Decorator</span>
        <button id="builder-close-btn" style="background:none; border:none; color:#fff; cursor:pointer; font-size:16px;">✕</button>
      </div>

      <!-- Mode Tabs -->
      <div class="builder-tool-group">
        <button class="builder-tool-btn ${this.activeTab === 'furniture' ? 'active' : ''}" id="tool-tab-furn">Furniture</button>
        <button class="builder-tool-btn ${this.activeTab === 'floor' ? 'active' : ''}" id="tool-tab-floor">Floor</button>
        <button class="builder-tool-btn ${this.activeTab === 'walls' ? 'active' : ''}" id="tool-tab-walls">Walls</button>
        <button class="builder-tool-btn ${this.activeTab === 'settings' ? 'active' : ''}" id="tool-tab-save">Share</button>
      </div>

      <!-- Tab Contents -->
      <div style="flex:1; display:flex; flex-direction:column; gap:8px;">
        ${this.renderTabContent()}
      </div>

      <!-- Selected Item Actions Toolbar -->
      ${this.unitzManager.selectedPlacedFurniture ? `
        <div style="background:#0d1624; border:1px solid #00bcd4; border-radius:8px; padding:8px; display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:11px; font-weight:700; color:#00bcd4;">Selected Item:</div>
          <div style="display:flex; gap:4px;">
            <button class="builder-tool-btn" id="btn-rotate-furn" title="Rotate (R)">⟳ Rotate</button>
            <button class="builder-tool-btn" id="btn-elevate-up" title="Raise (+)">▲ Up</button>
            <button class="builder-tool-btn" id="btn-elevate-down" title="Lower (-)">▼ Down</button>
            <button class="builder-tool-btn" id="btn-delete-furn" style="background:#d32f2f;" title="Delete (X)">🗑 Del</button>
          </div>
        </div>
      ` : ''}
    `;

    this.bindEvents();
  }

  private renderTabContent(): string {
    if (this.activeTab === 'furniture') {
      return `
        <div style="font-size:11px; color:#b0c4de;">Click to select, then click floor to place:</div>
        <div class="furniture-catalog-scroll">
          ${FURNITURE_CATALOG.map(f => `
            <div class="furniture-item-card ${this.unitzManager.selectedBuildDefId === f.id ? 'selected' : ''}" data-def-id="${f.id}">
              <div class="furniture-thumb">
                <span style="font-size:20px;">🪑</span>
              </div>
              <span class="furniture-name">${f.name}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (this.activeTab === 'floor') {
      const tileTypes: { type: TileData['type']; label: string; icon: string }[] = [
        { type: 'wood', label: 'Hardwood', icon: '🪵' },
        { type: 'marble', label: 'VIP Marble', icon: '🏛️' },
        { type: 'checker', label: 'Checkerboard', icon: '🏁' },
        { type: 'disco', label: 'Neon Disco', icon: '🪩' },
        { type: 'grass', label: 'Lawn Grass', icon: '🌱' },
        { type: 'carpet_red', label: 'Red Carpet', icon: '👠' },
        { type: 'sand', label: 'Beach Sand', icon: '🏖️' },
        { type: 'water', label: 'Pool Water', icon: '🌊' }
      ];

      return `
        <div style="font-size:11px; color:#b0c4de;">Pick tile pattern, click floor to paint:</div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
          ${tileTypes.map(t => `
            <button class="builder-tool-btn ${this.unitzManager.paintTileType === t.type ? 'active' : ''}" data-tile-type="${t.type}" style="display:flex; align-items:center; gap:4px; justify-content:center;">
              <span>${t.icon}</span> ${t.label}
            </button>
          `).join('')}
        </div>
      `;
    } else if (this.activeTab === 'walls') {
      const wallColors = [
        '#1d2d44', '#100b20', '#2b092b', '#023e8a', '#264653',
        '#2b2d42', '#3d0c02', '#1b4332', '#4a0e4e', '#37474f'
      ];
      return `
        <div style="font-size:11px; color:#b0c4de;">Choose room wallpaper tone:</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
          ${wallColors.map(c => `
            <button class="swatch-btn" style="background:${c}; width:30px; height:30px;" data-wall-color="${c}"></button>
          `).join('')}
        </div>
      `;
    } else {
      return `
        <div style="font-size:11px; color:#b0c4de;">Export & Share Unitz JSON:</div>
        <button class="builder-tool-btn" id="btn-export-json" style="width:100%; margin-top:6px;">📥 Export Rooms to File</button>
        <label class="builder-tool-btn" style="width:100%; display:block; text-align:center; margin-top:6px; cursor:pointer;">
          📤 Import Rooms JSON
          <input type="file" id="input-import-json" accept=".json" style="display:none;" />
        </label>
      `;
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
      this.unitzManager.selectedBuildDefId = null;
      this.unitzManager.paintTileType = null;
      this.render();
    });

    document.getElementById('tool-tab-save')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.activeTab = 'settings';
      this.render();
    });

    // Furniture card clicks
    document.querySelectorAll('.furniture-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        audioEngine.playClick();
        const defId = (e.currentTarget as HTMLElement).dataset.defId;
        this.unitzManager.selectedBuildDefId = defId || null;
        this.unitzManager.paintTileType = null;
        this.render();
      });
    });

    // Tile pattern buttons
    document.querySelectorAll('[data-tile-type]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audioEngine.playClick();
        const type = (e.currentTarget as HTMLElement).dataset.tileType as TileData['type'];
        this.unitzManager.paintTileType = type;
        this.unitzManager.selectedBuildDefId = null;
        this.render();
      });
    });

    // Wall swatches
    document.querySelectorAll('[data-wall-color]').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        audioEngine.playPop();
        const color = (e.currentTarget as HTMLElement).dataset.wallColor;
        if (color) this.unitzManager.setWallColor(color);
      });
    });

    // Placed furniture operations
    document.getElementById('btn-rotate-furn')?.addEventListener('click', () => {
      if (this.unitzManager.selectedPlacedFurniture) {
        audioEngine.playClick();
        this.unitzManager.rotateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId);
      }
    });

    document.getElementById('btn-elevate-up')?.addEventListener('click', () => {
      if (this.unitzManager.selectedPlacedFurniture) {
        audioEngine.playClick();
        this.unitzManager.elevateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId, 4);
      }
    });

    document.getElementById('btn-elevate-down')?.addEventListener('click', () => {
      if (this.unitzManager.selectedPlacedFurniture) {
        audioEngine.playClick();
        this.unitzManager.elevateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId, -4);
      }
    });

    document.getElementById('btn-delete-furn')?.addEventListener('click', () => {
      if (this.unitzManager.selectedPlacedFurniture) {
        audioEngine.playPop();
        this.unitzManager.removeFurniture(this.unitzManager.selectedPlacedFurniture.instanceId);
        this.render();
      }
    });

    // Export / Import
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(this.unitzManager.exportRoomsJSON());
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'woozoffline_unitz_backup.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    const fileInput = document.getElementById('input-import-json') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const contents = event.target?.result as string;
          if (contents && this.unitzManager.importRoomsJSON(contents)) {
            alert('Rooms imported successfully!');
            this.render();
          }
        };
        reader.readAsText(file);
      }
    });
  }
}
