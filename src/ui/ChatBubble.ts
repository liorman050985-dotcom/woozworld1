import { audioEngine } from '../engine/AudioEngine';

export interface FloatingBubble {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  worldX: number;
  worldY: number;
  timer: number;
  color?: string;
  isSelf?: boolean;
}

export interface ChatLogEntry {
  senderName: string;
  text: string;
  time: string;
  color: string;
  isSelf: boolean;
}

export class ChatBubbleManager {
  private bubbles: Map<string, FloatingBubble> = new Map();
  public chatHistory: ChatLogEntry[] = [];
  private logContainer: HTMLElement | null = null;

  constructor() {
    this.initLogContainer();
  }

  private initLogContainer() {
    let el = document.getElementById('chat-history-log');
    if (!el) {
      el = document.createElement('div');
      el.id = 'chat-history-log';
      el.style.position = 'fixed';
      el.style.bottom = '80px';
      el.style.left = '16px';
      el.style.width = '360px';
      el.style.maxHeight = '160px';
      el.style.overflowY = 'auto';
      el.style.background = 'linear-gradient(180deg, rgba(16, 28, 45, 0.85) 0%, rgba(8, 15, 26, 0.92) 100%)';
      el.style.border = '2px solid rgba(0, 188, 212, 0.5)';
      el.style.borderRadius = '16px';
      el.style.padding = '10px 14px';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.gap = '6px';
      el.style.zIndex = '15';
      el.style.pointerEvents = 'auto';
      el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.15)';
      el.style.backdropFilter = 'blur(8px)';
      document.body.appendChild(el);
    }
    this.logContainer = el;
  }

  public addBubble(
    senderId: string,
    senderName: string,
    text: string,
    worldX: number,
    worldY: number,
    color?: string,
    isSelf: boolean = false
  ) {
    audioEngine.playPop();

    this.bubbles.set(senderId, {
      id: 'bubble_' + senderId,
      senderId,
      senderName,
      text,
      worldX,
      worldY,
      timer: 5.5,
      color: color || (isSelf ? '#ffffff' : '#f0fcfc'),
      isSelf
    });

    // Add to chat history log
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const nameColor = isSelf ? '#ffd700' : '#00e5ff';

    this.chatHistory.push({
      senderName,
      text,
      time: timeStr,
      color: nameColor,
      isSelf
    });

    if (this.chatHistory.length > 40) {
      this.chatHistory.shift();
    }

    this.renderLog();
  }

  private renderLog() {
    if (!this.logContainer) return;
    this.logContainer.innerHTML = `
      <div style="font-size:10px; font-weight:800; color:#78909c; letter-spacing:1px; margin-bottom:2px; text-transform:uppercase; display:flex; justify-content:space-between; align-items:center;">
        <span>💬 Room Chat History</span>
        <span style="color:#00e5ff;">Live</span>
      </div>
      ${this.chatHistory.map(entry => `
        <div style="font-size:12.5px; line-height:1.35; color:#f0f4f8; word-break:break-word; padding:2px 0;">
          <span style="color:#607d8b; font-size:10px; font-weight:600;">[${entry.time}]</span>
          <strong style="color:${entry.color}; text-shadow:0 1px 3px rgba(0,0,0,0.8);">${entry.senderName}:</strong>
          <span style="color:#ffffff; font-weight:500;">${entry.text}</span>
        </div>
      `).join('')}
    `;

    this.logContainer.scrollTop = this.logContainer.scrollHeight;
  }

  public update(deltaTime: number) {
    for (const [id, bubble] of this.bubbles.entries()) {
      bubble.timer -= deltaTime;
      if (bubble.timer <= 0) {
        this.bubbles.delete(id);
      }
    }
  }

  public updateSenderPos(senderId: string, worldX: number, worldY: number) {
    const bubble = this.bubbles.get(senderId);
    if (bubble) {
      bubble.worldX = worldX;
      bubble.worldY = worldY;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const b of this.bubbles.values()) {
      const bubbleY = b.worldY - 95;
      const bubbleX = b.worldX;

      ctx.font = 'bold 13px Fredoka, sans-serif';
      const textWidth = ctx.measureText(b.text).width;
      ctx.font = 'bold 11px Fredoka, sans-serif';
      const nameWidth = ctx.measureText(b.senderName).width;

      const boxW = Math.max(130, Math.min(270, Math.max(textWidth, nameWidth) + 26));
      const boxH = 44;

      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(bubbleX - boxW / 2 + 2, bubbleY - boxH + 3, boxW, boxH, 14);
      ctx.fill();

      // Bubble Background (Glossy white with subtle gradient)
      const grad = ctx.createLinearGradient(0, bubbleY - boxH, 0, bubbleY);
      if (b.isSelf) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#fffde7');
      } else {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#e0f7fa');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(bubbleX - boxW / 2, bubbleY - boxH, boxW, boxH, 14);
      ctx.fill();

      // Border
      ctx.strokeStyle = b.isSelf ? '#ffd54f' : '#00bcd4';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Tail
      ctx.fillStyle = b.isSelf ? '#fffde7' : '#e0f7fa';
      ctx.beginPath();
      ctx.moveTo(bubbleX - 7, bubbleY);
      ctx.lineTo(bubbleX, bubbleY + 8);
      ctx.lineTo(bubbleX + 7, bubbleY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = b.isSelf ? '#ffd54f' : '#00bcd4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sender Name Chip Header
      ctx.font = 'bold 10.5px Fredoka, sans-serif';
      ctx.fillStyle = b.isSelf ? '#e65100' : '#00838f';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${b.senderName}`, bubbleX, bubbleY - 27);

      // Chat Message Text
      ctx.font = 'bold 13px Fredoka, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(b.text, bubbleX, bubbleY - 10);
    }
    ctx.restore();
  }
}
