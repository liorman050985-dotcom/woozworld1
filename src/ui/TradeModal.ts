import { Player } from '../entities/Player';
import { ClothingItem, CLOTHING_CATALOG } from '../data/ClothingItems';
import { audioEngine } from '../engine/AudioEngine';
import confetti from 'canvas-confetti';

export interface TradeOfferState {
  items: ClothingItem[];
  wooz: number;
  beex: number;
  isLocked: boolean;
  isConfirmed: boolean;
}

export class TradeModal {
  private player: Player;
  private targetPlayerId: string = '';
  private targetPlayerName: string = '';
  private container: HTMLElement | null = null;

  public myOffer: TradeOfferState = {
    items: [],
    wooz: 0,
    beex: 0,
    isLocked: false,
    isConfirmed: false
  };

  public theirOffer: TradeOfferState = {
    items: [],
    wooz: 0,
    beex: 0,
    isLocked: false,
    isConfirmed: false
  };

  public onSendTradeUpdate: (targetId: string, offer: TradeOfferState) => void = () => {};
  public onSendTradeConfirm: (targetId: string) => void = () => {};
  public onSendTradeCancel: (targetId: string) => void = () => {};
  public onTradeCompleted: (receivedItems: ClothingItem[], receivedWooz: number, receivedBeex: number) => void = () => {};

  constructor(player: Player) {
    this.player = player;
  }

  public openTrade(targetId: string, targetName: string) {
    this.targetPlayerId = targetId;
    this.targetPlayerName = targetName;
    this.myOffer = { items: [], wooz: 0, beex: 0, isLocked: false, isConfirmed: false };
    this.theirOffer = { items: [], wooz: 0, beex: 0, isLocked: false, isConfirmed: false };

    let backdrop = document.getElementById('trade-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'trade-modal-backdrop';
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
    if (this.targetPlayerId) {
      this.onSendTradeCancel(this.targetPlayerId);
      this.targetPlayerId = '';
    }
  }

  public updateTheirOffer(offer: TradeOfferState) {
    this.theirOffer = offer;
    this.render();
    if (this.myOffer.isConfirmed && this.theirOffer.isConfirmed) {
      this.completeTrade();
    }
  }

  public handleTheirConfirm() {
    this.theirOffer.isConfirmed = true;
    this.render();
    if (this.myOffer.isConfirmed && this.theirOffer.isConfirmed) {
      this.completeTrade();
    }
  }

  private completeTrade() {
    audioEngine.playFanfare();
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    // Deduct currencies
    this.player.wooz = Math.max(0, this.player.wooz - this.myOffer.wooz + this.theirOffer.wooz);
    this.player.beex = Math.max(0, this.player.beex - this.myOffer.beex + this.theirOffer.beex);

    // Add received items to inventory
    for (const item of this.theirOffer.items) {
      this.player.unlockedClothingIds.add(item.id);
    }
    this.player.saveToStorage();

    this.onTradeCompleted(this.theirOffer.items, this.theirOffer.wooz, this.theirOffer.beex);

    alert(`🎉 Trade Successful with ${this.targetPlayerName}!`);
    this.close();
  }

  public render() {
    if (!this.container) return;

    // Available inventory items not yet in offer
    const availableItems = CLOTHING_CATALOG.filter(item =>
      this.player.unlockedClothingIds.has(item.id) &&
      !this.myOffer.items.some(offered => offered.id === item.id)
    );

    this.container.innerHTML = `
      <div class="retro-modal" style="width: 720px; max-width: 95vw;">
        <div class="modal-header">
          <div class="modal-title">
            <span>🤝</span> TradeZ: Trading with ${this.targetPlayerName}
          </div>
          <button class="modal-close-btn" id="trade-close-btn">✕</button>
        </div>

        <div class="modal-body" style="padding:16px; display:flex; flex-direction:column; gap:14px;">
          <!-- Dual Trade Panes -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            
            <!-- Left Pane: Your Offer -->
            <div style="background:#132238; border:2px solid ${this.myOffer.isLocked ? '#00e676' : '#00bcd4'}; border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #223c5e; padding-bottom:6px;">
                <span style="font-weight:900; color:#00e5ff; font-size:14px;">Your Offer (You)</span>
                <span style="font-size:11px; padding:2px 8px; border-radius:10px; background:${this.myOffer.isLocked ? '#00e676' : '#ff9800'}; color:#000; font-weight:800;">
                  ${this.myOffer.isLocked ? '✓ LOCKED' : 'UNLOCKED'}
                </span>
              </div>

              <!-- Offer Item Slots (6 slots) -->
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                ${[0, 1, 2, 3, 4, 5].map(idx => {
                  const item = this.myOffer.items[idx];
                  return item ? `
                    <div class="trade-slot filled" data-idx="${idx}" style="height:65px; background:#182b47; border:2px solid #00bcd4; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4px; cursor:pointer; position:relative;" title="Click to remove from offer">
                      <span style="font-size:22px;">👗</span>
                      <span style="font-size:9px; color:#fff; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center;">${item.name}</span>
                      ${!this.myOffer.isLocked ? `<span style="position:absolute; top:2px; right:4px; color:#ff5252; font-size:10px; font-weight:900;">✕</span>` : ''}
                    </div>
                  ` : `
                    <div class="trade-slot empty" style="height:65px; background:#0e1929; border:1.5px dashed #2a476f; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#546e7a; font-size:11px;">
                      Empty
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Currency Inputs -->
              <div style="display:flex; gap:8px;">
                <div style="flex:1; display:flex; align-items:center; gap:4px; background:#0b1422; padding:4px 8px; border-radius:8px; border:1px solid #ffb300;">
                  <span style="color:#ffd700; font-weight:900;">W</span>
                  <input type="number" id="trade-my-wooz" value="${this.myOffer.wooz}" min="0" max="${this.player.wooz}" ${this.myOffer.isLocked ? 'disabled' : ''} style="width:100%; background:transparent; border:none; color:#fff; font-size:12px; font-weight:bold; outline:none;" placeholder="Wooz" />
                </div>
                <div style="flex:1; display:flex; align-items:center; gap:4px; background:#0b1422; padding:4px 8px; border-radius:8px; border:1px solid #00e5ff;">
                  <span style="color:#00e5ff; font-weight:900;">B</span>
                  <input type="number" id="trade-my-beex" value="${this.myOffer.beex}" min="0" max="${this.player.beex}" ${this.myOffer.isLocked ? 'disabled' : ''} style="width:100%; background:transparent; border:none; color:#fff; font-size:12px; font-weight:bold; outline:none;" placeholder="Beex" />
                </div>
              </div>

              <!-- Lock / Confirm Button -->
              <div style="display:flex; gap:6px;">
                <button id="trade-btn-lock" class="builder-tool-btn" style="flex:1; background:${this.myOffer.isLocked ? '#ff9800' : '#00bcd4'}; color:#000; font-weight:900; padding:8px;">
                  ${this.myOffer.isLocked ? '🔓 Unlock Offer' : '🔒 Lock In Offer'}
                </button>
                <button id="trade-btn-accept" class="builder-tool-btn" ${!this.myOffer.isLocked || !this.theirOffer.isLocked ? 'disabled' : ''} style="flex:1; background:${this.myOffer.isConfirmed ? '#4caf50' : '#00e676'}; color:#000; font-weight:900; padding:8px; opacity:${!this.myOffer.isLocked || !this.theirOffer.isLocked ? '0.5' : '1'};">
                  ${this.myOffer.isConfirmed ? '✓ Accepted (Waiting)' : '✓ Accept Trade'}
                </button>
              </div>
            </div>

            <!-- Right Pane: Their Offer (Live Synchronized) -->
            <div style="background:#132238; border:2px solid ${this.theirOffer.isLocked ? '#00e676' : '#78909c'}; border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #223c5e; padding-bottom:6px;">
                <span style="font-weight:900; color:#ffd700; font-size:14px;">${this.targetPlayerName}'s Offer</span>
                <span style="font-size:11px; padding:2px 8px; border-radius:10px; background:${this.theirOffer.isLocked ? '#00e676' : '#78909c'}; color:#000; font-weight:800;">
                  ${this.theirOffer.isLocked ? '✓ LOCKED' : 'UNLOCKED'}
                </span>
              </div>

              <!-- Their Item Slots -->
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                ${[0, 1, 2, 3, 4, 5].map(idx => {
                  const item = this.theirOffer.items[idx];
                  return item ? `
                    <div class="trade-slot" style="height:65px; background:#182b47; border:2px solid #ffd54f; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4px;">
                      <span style="font-size:22px;">👗</span>
                      <span style="font-size:9px; color:#fff; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center;">${item.name}</span>
                    </div>
                  ` : `
                    <div class="trade-slot empty" style="height:65px; background:#0e1929; border:1.5px dashed #2a476f; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#546e7a; font-size:11px;">
                      Empty
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Their Currencies -->
              <div style="display:flex; gap:8px;">
                <div style="flex:1; display:flex; align-items:center; gap:4px; background:#0b1422; padding:4px 8px; border-radius:8px; border:1px solid #ffb300;">
                  <span style="color:#ffd700; font-weight:900;">W</span>
                  <span style="color:#fff; font-size:12px; font-weight:bold;">${this.theirOffer.wooz}</span>
                </div>
                <div style="flex:1; display:flex; align-items:center; gap:4px; background:#0b1422; padding:4px 8px; border-radius:8px; border:1px solid #00e5ff;">
                  <span style="color:#00e5ff; font-weight:900;">B</span>
                  <span style="color:#fff; font-size:12px; font-weight:bold;">${this.theirOffer.beex}</span>
                </div>
              </div>

              <!-- Their Accept Status -->
              <div style="padding:10px; background:${this.theirOffer.isConfirmed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0,0,0,0.2)'}; border:1px solid ${this.theirOffer.isConfirmed ? '#4caf50' : '#223856'}; border-radius:8px; text-align:center; font-size:12px; font-weight:700; color:${this.theirOffer.isConfirmed ? '#00e676' : '#b0bec5'};">
                ${this.theirOffer.isConfirmed ? `✓ ${this.targetPlayerName} Accepted the Trade` : `Waiting for ${this.targetPlayerName}...`}
              </div>
            </div>
          </div>

          <!-- Bottom: Your Inventory Picker (Click item to add to offer) -->
          <div style="background:#0e1a2b; border:1.5px solid #203a5c; border-radius:12px; padding:10px;">
            <div style="font-size:12px; font-weight:800; color:#b0c4de; margin-bottom:6px;">
              📦 Click items from your inventory to add to your trade offer (Max 6):
            </div>
            <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; max-height:85px;">
              ${availableItems.map(item => `
                <div class="inventory-trade-chip" data-item-id="${item.id}" style="flex-shrink:0; background:#162842; border:1.5px solid #00bcd4; border-radius:8px; padding:6px 10px; display:flex; align-items:center; gap:6px; cursor:${this.myOffer.isLocked ? 'not-allowed' : 'pointer'}; opacity:${this.myOffer.isLocked ? '0.5' : '1'};">
                  <span>👗</span>
                  <span style="font-size:11px; font-weight:bold; color:#fff;">${item.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    document.getElementById('trade-close-btn')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.close();
    });

    // Add items from inventory to offer
    if (!this.myOffer.isLocked) {
      document.querySelectorAll('.inventory-trade-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          if (this.myOffer.items.length >= 6) {
            alert('Trade offer slot limit reached (6 items max).');
            return;
          }
          audioEngine.playPop();
          const itemId = (e.currentTarget as HTMLElement).dataset.itemId;
          const item = CLOTHING_CATALOG.find(c => c.id === itemId);
          if (item) {
            this.myOffer.items.push(item);
            this.myOffer.isConfirmed = false;
            this.render();
            this.onSendTradeUpdate(this.targetPlayerId, this.myOffer);
          }
        });
      });

      // Remove items from offer
      document.querySelectorAll('.trade-slot.filled').forEach(slot => {
        slot.addEventListener('click', (e) => {
          audioEngine.playPop();
          const idx = parseInt((e.currentTarget as HTMLElement).dataset.idx || '0', 10);
          this.myOffer.items.splice(idx, 1);
          this.myOffer.isConfirmed = false;
          this.render();
          this.onSendTradeUpdate(this.targetPlayerId, this.myOffer);
        });
      });

      // Currency change inputs
      const woozInput = document.getElementById('trade-my-wooz') as HTMLInputElement;
      const beexInput = document.getElementById('trade-my-beex') as HTMLInputElement;

      woozInput?.addEventListener('input', () => {
        this.myOffer.wooz = Math.min(this.player.wooz, Math.max(0, parseInt(woozInput.value || '0', 10)));
        this.myOffer.isConfirmed = false;
        this.onSendTradeUpdate(this.targetPlayerId, this.myOffer);
      });

      beexInput?.addEventListener('input', () => {
        this.myOffer.beex = Math.min(this.player.beex, Math.max(0, parseInt(beexInput.value || '0', 10)));
        this.myOffer.isConfirmed = false;
        this.onSendTradeUpdate(this.targetPlayerId, this.myOffer);
      });
    }

    // Lock button
    document.getElementById('trade-btn-lock')?.addEventListener('click', () => {
      audioEngine.playClick();
      this.myOffer.isLocked = !this.myOffer.isLocked;
      this.myOffer.isConfirmed = false;
      this.render();
      this.onSendTradeUpdate(this.targetPlayerId, this.myOffer);
    });

    // Accept button
    document.getElementById('trade-btn-accept')?.addEventListener('click', () => {
      if (this.myOffer.isLocked && this.theirOffer.isLocked) {
        audioEngine.playFanfare();
        this.myOffer.isConfirmed = true;
        this.render();
        this.onSendTradeConfirm(this.targetPlayerId);
        if (this.theirOffer.isConfirmed) {
          this.completeTrade();
        }
      }
    });
  }
}
