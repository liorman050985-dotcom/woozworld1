import { FURNITURE_CATALOG, FurnitureItemDef } from '../data/FurnitureItems';
import { CLOTHING_CATALOG, ClothingItem } from '../data/ClothingItems';
import { Player } from '../entities/Player';
import { audioEngine } from '../engine/AudioEngine';

export class ShopModal {
  private player: Player;
  private container: HTMLElement | null = null;
  private currentTab: 'furniture' | 'clothing' | 'themes' = 'furniture';
  private currentCategory: string = 'all';

  constructor(player: Player) {
    this.player = player;
  }

  public open() {
    let backdrop = document.getElementById('shop-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'shop-modal-backdrop';
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
      <div class="retro-modal" style="width: 780px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>🛍️</span> WoozBoutique (100% Free & Unlocked)
          </div>
          <button class="modal-close-btn" id="shop-close-btn">✕</button>
        </div>

        <div class="modal-body" style="padding:16px;">
          <!-- Shop Main Tabs -->
          <div class="wardrobe-tabs" style="margin-bottom:12px;">
            <button class="wardrobe-tab ${this.currentTab === 'furniture' ? 'active' : ''}" id="shop-tab-furn">🛋️ Furniture Catalog</button>
            <button class="wardrobe-tab ${this.currentTab === 'clothing' ? 'active' : ''}" id="shop-tab-cloth">👗 Fashion Collections</button>
          </div>

          <!-- Items Grid -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; max-height:400px; overflow-y:auto; padding:8px; background:rgba(0,0,0,0.25); border-radius:14px;">
            ${this.currentTab === 'furniture' ? this.renderFurnitureList() : this.renderClothingList()}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderFurnitureList(): string {
    return FURNITURE_CATALOG.map(item => `
      <div style="background:#162438; border:2px solid #28446b; border-radius:12px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; gap:8px;">
        <div style="width:50px; height:50px; border-radius:10px; background:linear-gradient(135deg, ${item.colorPalette.primary}, ${item.colorPalette.secondary}); display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.4);">
          <span style="font-size:22px;">🪑</span>
        </div>
        <div style="font-size:13px; font-weight:700; text-align:center; color:#fff;">${item.name}</div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="color:#00e676; font-weight:900; font-size:12px;">FREE / UNLOCKED</span>
        </div>
        <button class="wardrobe-btn" style="width:100%; font-size:11px; padding:4px 8px; background:#00bcd4; color:#000;" data-furn-id="${item.id}">
          ✓ In Catalog
        </button>
      </div>
    `).join('');
  }

  private renderClothingList(): string {
    return CLOTHING_CATALOG.map(item => `
      <div style="background:#162438; border:2px solid #28446b; border-radius:12px; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; gap:8px;">
        <div style="width:50px; height:50px; border-radius:10px; background:linear-gradient(135deg, ${item.defaultColors.primary}, ${item.defaultColors.secondary || '#fff'}); display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.4);">
          <span style="font-size:22px;">✨</span>
        </div>
        <div style="font-size:13px; font-weight:700; text-align:center; color:#fff;">${item.name}</div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="color:#ffd700; font-weight:900; font-size:12px;">0 Beex / FREE</span>
        </div>
        <button class="wardrobe-btn" style="width:100%; font-size:11px; padding:4px 8px; background:#ff4081; color:#fff;" data-cloth-id="${item.id}">
          ✓ Unlocked
        </button>
      </div>
    `).join('');
  }

  private bindEvents() {
    document.getElementById('shop-close-btn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.close();
    });

    document.getElementById('shop-tab-furn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.currentTab = 'furniture';
      this.render();
    });

    document.getElementById('shop-tab-cloth')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.currentTab = 'clothing';
      this.render();
    });
  }
}
