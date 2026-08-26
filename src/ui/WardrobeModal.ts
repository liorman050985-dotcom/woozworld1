import { Player } from '../entities/Player';
import { CLOTHING_CATALOG, PRESET_COLOR_PALETTES, ClothingItem } from '../data/ClothingItems';
import { AvatarRenderer, Direction } from '../entities/AvatarRenderer';
import { audioEngine } from '../engine/AudioEngine';

export class WardrobeModal {
  private player: Player;
  private container: HTMLElement | null = null;
  private previewCanvas: HTMLCanvasElement | null = null;
  private previewCtx: CanvasRenderingContext2D | null = null;
  private colorWheelCanvas: HTMLCanvasElement | null = null;
  private colorWheelCtx: CanvasRenderingContext2D | null = null;
  private currentCategory: ClothingItem['category'] = 'hair';
  private previewDirection: Direction = 0;
  private activeColorSlot: 'primary' | 'secondary' | 'skin' = 'primary';
  private onUpdateCallback: () => void = () => {};

  constructor(player: Player, onUpdateCallback: () => void) {
    this.player = player;
    this.onUpdateCallback = onUpdateCallback;
  }

  public open() {
    let backdrop = document.getElementById('wardrobe-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'wardrobe-modal-backdrop';
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
      this.player.saveToStorage();
      this.onUpdateCallback();
    }
  }

  private render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="retro-modal" style="width: 860px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>🎨</span> Woozworld Color Wheel & Dressing Studio
          </div>
          <button class="modal-close-btn" id="wardrobe-close-btn">✕</button>
        </div>

        <div class="modal-body">
          <div class="wardrobe-container" style="width: 100%; height: 530px;">
            <!-- Left: 360 Avatar Preview -->
            <div class="wardrobe-preview-pane">
              <div class="wardrobe-canvas-box">
                <canvas id="wardrobe-preview-canvas" width="220" height="340"></canvas>
              </div>

              <div class="wardrobe-rotate-controls">
                <button class="wardrobe-btn" id="wardrobe-rot-left">⟲ Turn Left</button>
                <button class="wardrobe-btn" id="wardrobe-rot-right">Turn Right ⟳</button>
              </div>
            </div>

            <!-- Right: Item Selection & Classic Circular Color Wheel -->
            <div class="wardrobe-editor-pane">
              <!-- Category Tabs -->
              <div class="wardrobe-tabs">
                <button class="wardrobe-tab ${this.currentCategory === 'hair' ? 'active' : ''}" data-cat="hair">Hair</button>
                <button class="wardrobe-tab ${this.currentCategory === 'face' ? 'active' : ''}" data-cat="face">Face</button>
                <button class="wardrobe-tab ${this.currentCategory === 'top' ? 'active' : ''}" data-cat="top">Tops</button>
                <button class="wardrobe-tab ${this.currentCategory === 'bottom' ? 'active' : ''}" data-cat="bottom">Bottoms</button>
                <button class="wardrobe-tab ${this.currentCategory === 'shoes' ? 'active' : ''}" data-cat="shoes">Shoes</button>
                <button class="wardrobe-tab ${this.currentCategory === 'head' ? 'active' : ''}" data-cat="head">Hats</button>
                <button class="wardrobe-tab ${this.currentCategory === 'back' ? 'active' : ''}" data-cat="back">Wings</button>
              </div>

              <!-- Gender Sub-Filter -->
              <div style="display:flex; gap:6px; margin-bottom:8px;">
                <button class="wardrobe-gender-btn ${this.currentGenderFilter === 'all' ? 'active' : ''}" data-gender="all" style="padding:3px 10px; border-radius:12px; font-size:11px; font-weight:800; background:${this.currentGenderFilter === 'all' ? '#00e5ff' : '#1e3352'}; color:${this.currentGenderFilter === 'all' ? '#000' : '#fff'}; border:1px solid #00bcd4; cursor:pointer;">🌟 All Styles</button>
                <button class="wardrobe-gender-btn ${this.currentGenderFilter === 'm' ? 'active' : ''}" data-gender="m" style="padding:3px 10px; border-radius:12px; font-size:11px; font-weight:800; background:${this.currentGenderFilter === 'm' ? '#00e5ff' : '#1e3352'}; color:${this.currentGenderFilter === 'm' ? '#000' : '#fff'}; border:1px solid #00bcd4; cursor:pointer;">👦 Boys / Guy</button>
                <button class="wardrobe-gender-btn ${this.currentGenderFilter === 'f' ? 'active' : ''}" data-gender="f" style="padding:3px 10px; border-radius:12px; font-size:11px; font-weight:800; background:${this.currentGenderFilter === 'f' ? '#00e5ff' : '#1e3352'}; color:${this.currentGenderFilter === 'f' ? '#000' : '#fff'}; border:1px solid #00bcd4; cursor:pointer;">👧 Girls / Chic</button>
              </div>

              <!-- Clothing Item Grid -->
              <div class="wardrobe-items-grid" id="wardrobe-items-grid" style="max-height:160px;">
                ${this.renderItemsGrid()}
              </div>

              <!-- Authentic Circular Color Wheel & Palette -->
              <div class="color-picker-section">
                <div class="color-slots-row">
                  <span style="font-size:12px; font-weight:700;">Active Zone:</span>
                  <button class="color-slot-btn ${this.activeColorSlot === 'primary' ? 'active' : ''}" id="slot-primary">
                    <span class="color-swatch" style="background: ${this.getCurrentPrimaryColor()}"></span> Color 1
                  </button>
                  <button class="color-slot-btn ${this.activeColorSlot === 'secondary' ? 'active' : ''}" id="slot-secondary">
                    <span class="color-swatch" style="background: ${this.getCurrentSecondaryColor()}"></span> Color 2
                  </button>
                  <button class="color-slot-btn ${this.activeColorSlot === 'skin' ? 'active' : ''}" id="slot-skin">
                    <span class="color-swatch" style="background: ${this.player.customization.skinColor}"></span> Skin Tone
                  </button>
                  <input type="color" id="wardrobe-native-color-picker" value="${this.getCurrentPrimaryColor()}" style="margin-left:auto; cursor:pointer; width:34px; height:28px; border-radius:6px; border:1px solid #fff;">
                </div>

                <div style="display:flex; gap:16px; align-items:center;">
                  <!-- Interactive Circular Color Wheel Canvas -->
                  <div style="position:relative; width:120px; height:120px;">
                    <canvas id="color-wheel-canvas" width="120" height="120" style="border-radius:50%; cursor:crosshair; box-shadow:0 2px 8px rgba(0,0,0,0.5);"></canvas>
                  </div>

                  <!-- Quick Swatches -->
                  <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                    <div style="font-size:11px; color:#b0c4de; font-weight:700;">Instant Swatches:</div>
                    <div class="palette-swatches">
                      ${PRESET_COLOR_PALETTES.map(color => `
                        <button class="swatch-btn" style="background: ${color};" data-color="${color}"></button>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.initCanvas();
    this.drawColorWheel();
  }

  private currentGenderFilter: 'all' | 'm' | 'f' = 'all';

  private renderItemsGrid(): string {
    const items = CLOTHING_CATALOG.filter(c => 
      c.category === this.currentCategory && 
      (this.currentGenderFilter === 'all' || !c.gender || c.gender === 'all' || c.gender === this.currentGenderFilter)
    );
    return items.map(item => {
      const isSelected = this.isItemSelected(item);
      const genderBadge = item.gender === 'm' ? '👦' : (item.gender === 'f' ? '👧' : '✨');
      return `
        <div class="clothing-card ${isSelected ? 'selected' : ''}" data-id="${item.id}" title="${item.name}">
          <div class="clothing-thumb">
            <span style="font-size:24px;">${this.getCategoryIcon(item.category)}</span>
            <span style="position:absolute; top:2px; right:4px; font-size:10px;">${genderBadge}</span>
          </div>
          <span class="clothing-name" title="${item.name}">${item.name}</span>
        </div>
      `;
    }).join('');
  }

  private isItemSelected(item: ClothingItem): boolean {
    const cust = this.player.customization;
    switch (item.category) {
      case 'hair': return cust.hair.id === item.id;
      case 'top': return cust.top.id === item.id;
      case 'bottom': return cust.bottom.id === item.id;
      case 'shoes': return cust.shoes.id === item.id;
      case 'head': return cust.headAccessory?.id === item.id;
      case 'back': return cust.backAccessory?.id === item.id;
      case 'face': return cust.face.id === item.id;
      default: return false;
    }
  }

  private getCategoryIcon(cat: ClothingItem['category']): string {
    switch (cat) {
      case 'hair': return '💇';
      case 'face': return '👀';
      case 'top': return '👕';
      case 'bottom': return '👖';
      case 'shoes': return '👟';
      case 'head': return '👑';
      case 'back': return '🧚';
      default: return '✨';
    }
  }

  private getCurrentPrimaryColor(): string {
    const cust = this.player.customization;
    switch (this.currentCategory) {
      case 'hair': return cust.hair.primaryColor;
      case 'top': return cust.top.primaryColor;
      case 'bottom': return cust.bottom.primaryColor;
      case 'shoes': return cust.shoes.primaryColor;
      case 'head': return cust.headAccessory?.primaryColor || '#ff4081';
      case 'back': return cust.backAccessory?.primaryColor || '#00e5ff';
      default: return '#00bcd4';
    }
  }

  private getCurrentSecondaryColor(): string {
    const cust = this.player.customization;
    switch (this.currentCategory) {
      case 'hair': return cust.hair.secondaryColor;
      case 'top': return cust.top.secondaryColor;
      case 'bottom': return cust.bottom.secondaryColor;
      case 'shoes': return cust.shoes.secondaryColor;
      case 'head': return cust.headAccessory?.secondaryColor || '#ffffff';
      case 'back': return cust.backAccessory?.secondaryColor || '#ffffff';
      default: return '#ffffff';
    }
  }

  private initCanvas() {
    this.previewCanvas = document.getElementById('wardrobe-preview-canvas') as HTMLCanvasElement;
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
      this.drawPreview();
    }
  }

  private drawPreview() {
    if (!this.previewCanvas || !this.previewCtx) return;
    this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

    AvatarRenderer.drawAvatar(
      this.previewCtx,
      this.previewCanvas.width / 2,
      this.previewCanvas.height - 40,
      this.player.customization,
      this.previewDirection,
      'idle',
      0,
      2.2
    );
  }

  private drawColorWheel() {
    this.colorWheelCanvas = document.getElementById('color-wheel-canvas') as HTMLCanvasElement;
    if (!this.colorWheelCanvas) return;
    this.colorWheelCtx = this.colorWheelCanvas.getContext('2d');
    if (!this.colorWheelCtx) return;

    const ctx = this.colorWheelCtx;
    const radius = this.colorWheelCanvas.width / 2;
    const toRad = Math.PI / 180;

    ctx.clearRect(0, 0, this.colorWheelCanvas.width, this.colorWheelCanvas.height);

    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 2) * toRad;
      const endAngle = (angle + 2) * toRad;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  private bindEvents() {
    document.getElementById('wardrobe-close-btn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.close();
    });

    document.getElementById('wardrobe-rot-left')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.previewDirection = ((this.previewDirection + 7) % 8) as Direction;
      this.drawPreview();
    });

    document.getElementById('wardrobe-rot-right')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.previewDirection = ((this.previewDirection + 1) % 8) as Direction;
      this.drawPreview();
    });

    document.querySelectorAll('.wardrobe-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        audioEngine.playClick();
        const cat = (e.currentTarget as HTMLElement).dataset.cat as ClothingItem['category'];
        if (cat) {
          this.currentCategory = cat;
          this.render();
        }
      });
    });

    document.querySelectorAll('.wardrobe-gender-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audioEngine.playPop();
        const g = (e.currentTarget as HTMLElement).dataset.gender as 'all' | 'm' | 'f';
        if (g) {
          this.currentGenderFilter = g;
          this.render();
        }
      });
    });

    document.querySelectorAll('.clothing-card').forEach(card => {
      card.addEventListener('click', (e) => {
        audioEngine.playPop();
        const id = (e.currentTarget as HTMLElement).dataset.id;
        const item = CLOTHING_CATALOG.find(c => c.id === id);
        if (!item) return;

        const cust = this.player.customization;
        switch (item.category) {
          case 'hair': cust.hair.id = item.id; cust.hair.style = item.style; break;
          case 'top': cust.top.id = item.id; cust.top.style = item.style; break;
          case 'bottom': cust.bottom.id = item.id; cust.bottom.style = item.style; break;
          case 'shoes': cust.shoes.id = item.id; cust.shoes.style = item.style; break;
          case 'head':
            cust.headAccessory = {
              id: item.id,
              style: item.style,
              primaryColor: cust.headAccessory?.primaryColor || item.defaultColors.primary,
              secondaryColor: cust.headAccessory?.secondaryColor || item.defaultColors.secondary || '#ffffff'
            };
            break;
          case 'back':
            cust.backAccessory = {
              id: item.id,
              style: item.style,
              primaryColor: cust.backAccessory?.primaryColor || item.defaultColors.primary,
              secondaryColor: cust.backAccessory?.secondaryColor || item.defaultColors.secondary || '#ffffff'
            };
            break;
          case 'face': cust.face.id = item.id; cust.face.style = item.style; break;
        }

        this.render();
      });
    });

    document.getElementById('slot-primary')?.addEventListener('click', () => {
      this.activeColorSlot = 'primary';
      this.render();
    });

    document.getElementById('slot-secondary')?.addEventListener('click', () => {
      this.activeColorSlot = 'secondary';
      this.render();
    });

    document.getElementById('slot-skin')?.addEventListener('click', () => {
      this.activeColorSlot = 'skin';
      this.render();
    });

    document.querySelectorAll('.swatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audioEngine.playPop();
        const color = (e.currentTarget as HTMLElement).dataset.color;
        if (color) this.applyColor(color);
      });
    });

    const picker = document.getElementById('wardrobe-native-color-picker') as HTMLInputElement;
    picker?.addEventListener('input', (e) => {
      const color = (e.target as HTMLInputElement).value;
      this.applyColor(color);
    });

    // Circular Color Wheel click & drag handling
    const colorWheel = document.getElementById('color-wheel-canvas') as HTMLCanvasElement;
    if (colorWheel) {
      const pickWheelColor = (e: MouseEvent) => {
        const rect = colorWheel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = colorWheel.getContext('2d');
        if (ctx) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          if (pixel[3] > 0) {
            const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
            this.applyColor(hex);
          }
        }
      };

      colorWheel.addEventListener('click', pickWheelColor);
    }
  }

  private applyColor(color: string) {
    const cust = this.player.customization;
    if (this.activeColorSlot === 'skin') {
      cust.skinColor = color;
    } else if (this.activeColorSlot === 'primary') {
      switch (this.currentCategory) {
        case 'hair': cust.hair.primaryColor = color; break;
        case 'top': cust.top.primaryColor = color; break;
        case 'bottom': cust.bottom.primaryColor = color; break;
        case 'shoes': cust.shoes.primaryColor = color; break;
        case 'head': if (cust.headAccessory) cust.headAccessory.primaryColor = color; break;
        case 'back': if (cust.backAccessory) cust.backAccessory.primaryColor = color; break;
      }
    } else if (this.activeColorSlot === 'secondary') {
      switch (this.currentCategory) {
        case 'hair': cust.hair.secondaryColor = color; break;
        case 'top': cust.top.secondaryColor = color; break;
        case 'bottom': cust.bottom.secondaryColor = color; break;
        case 'shoes': cust.shoes.secondaryColor = color; break;
        case 'head': if (cust.headAccessory) cust.headAccessory.secondaryColor = color; break;
        case 'back': if (cust.backAccessory) cust.backAccessory.secondaryColor = color; break;
      }
    }

    this.render();
  }
}
