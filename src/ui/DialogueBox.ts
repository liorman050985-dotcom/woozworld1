import { WOOZBAND_DIALOGUES, NPCDialogueNode } from '../data/Dialogues';
import { AvatarRenderer } from '../entities/AvatarRenderer';
import { audioEngine } from '../engine/AudioEngine';

export class DialogueBox {
  private container: HTMLElement | null = null;
  private currentNode: NPCDialogueNode | null = null;
  private onAction: (action: string) => void = () => {};

  public openDialogue(nodeId: string, onAction: (action: string) => void) {
    this.currentNode = WOOZBAND_DIALOGUES[nodeId];
    if (!this.currentNode) return;
    this.onAction = onAction;

    let el = document.getElementById('dialogue-modal-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dialogue-modal-container';
      el.className = 'dialogue-modal';
      document.body.appendChild(el);
    }
    this.container = el;
    this.render();
  }

  public close() {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.currentNode = null;
    }
  }

  private render() {
    if (!this.container || !this.currentNode) return;

    this.container.innerHTML = `
      <div class="npc-avatar-box">
        <canvas id="dialogue-npc-canvas" width="110" height="110"></canvas>
      </div>

      <div class="dialogue-content">
        <div>
          <div class="npc-name">${this.currentNode.npcName}</div>
          <div class="dialogue-text">${this.currentNode.text}</div>
        </div>

        <div class="dialogue-actions">
          ${this.currentNode.options.map((opt, idx) => `
            <button class="dialogue-btn" data-opt-idx="${idx}">
              ${opt.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
    this.drawNPC();
  }

  private drawNPC() {
    const canvas = document.getElementById('dialogue-npc-canvas') as HTMLCanvasElement;
    if (canvas && this.currentNode) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        AvatarRenderer.drawAvatar(
          ctx,
          55,
          105,
          {
            skinColor: this.currentNode.avatarStyle.skinColor,
            hair: { id: this.currentNode.avatarStyle.hairId, style: this.currentNode.avatarStyle.hairId.replace('hair_', ''), primaryColor: this.currentNode.avatarStyle.hairColor, secondaryColor: '#fff' },
            face: { id: 'face_sparkle', style: 'sparkle', eyeColor: '#ff4081', expression: 'sparkle' },
            top: { id: this.currentNode.avatarStyle.topId, style: this.currentNode.avatarStyle.topId.replace('top_', ''), primaryColor: this.currentNode.avatarStyle.topColor, secondaryColor: '#fff' },
            bottom: { id: this.currentNode.avatarStyle.bottomId, style: this.currentNode.avatarStyle.bottomId.replace('bottom_', ''), primaryColor: this.currentNode.avatarStyle.bottomColor, secondaryColor: '#fff' },
            shoes: { id: 'shoes_hi_tops', style: 'hi_tops', primaryColor: '#00bcd4', secondaryColor: '#fff' }
          },
          0,
          'idle',
          0,
          1.5
        );
      }
    }
  }

  private bindEvents() {
    document.querySelectorAll('.dialogue-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        audioEngine.playClick();
        const idxStr = (e.currentTarget as HTMLElement).dataset.optIdx;
        if (idxStr !== undefined && this.currentNode) {
          const opt = this.currentNode.options[parseInt(idxStr)];
          if (opt) {
            if (opt.action === 'close') {
              this.close();
            } else if (opt.targetNodeId) {
              this.currentNode = WOOZBAND_DIALOGUES[opt.targetNodeId];
              this.render();
            } else if (opt.action) {
              this.close();
              this.onAction(opt.action);
            }
          }
        }
      });
    });
  }
}
