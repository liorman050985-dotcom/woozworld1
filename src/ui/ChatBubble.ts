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
      el.style.bottom = '75px';
      el.style.left = '16px';
      el.style.width = '320px';
      el.style.maxHeight = '140px';
      el.style.overflowY = 'auto';
      el.style.background = 'rgba(10, 18, 30, 0.75)';
      el.style.border = '1.5px solid rgba(0, 188, 212, 0.4)';
      el.style.borderRadius = '12px';
      el.style.padding = '8px 10px';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.gap = '4px';
      el.style.zIndex = '15';
      el.style.pointerEvents = 'auto';
      el.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
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
      color: color || (isSelf ? '#ffffff' : '#e0f7fa'),
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

    if (this.chatHistory.length > 30) {
      this.chatHistory.shift();
    }

    this.renderLog();
  }

  private renderLog() {
    if (!this.logContainer) return;
    this.logContainer.innerHTML = this.chatHistory.map(entry => `
      <div style="font-size:12px; line-height:1.3; color:#fff; word-break:break-word;">
        <span style="color:#78909c; font-size:10px;">[${entry.time}]</span>
        <strong style="color:${entry.color};">${entry.senderName}:</strong>
        <span>${entry.text}</span>
      </div>
    `).join('');

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
      const nameWidth = ctx.measureText(b.senderName).width;
      const boxW = Math.max(120, Math.min(260, Math.max(textWidth, nameWidth) + 24));
      const boxH = 42;

      // Bubble Background
      ctx.fillStyle = b.color || '#ffffff';
      ctx.beginPath();
      ctx.roundRect(bubbleX - boxW / 2, bubbleY - boxH, boxW, boxH, 14);
      ctx.fill();

      // Border with accent
      ctx.strokeStyle = b.isSelf ? '#ffc107' : '#00bcd4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tail
      ctx.fillStyle = b.color || '#ffffff';
      ctx.beginPath();
      ctx.moveTo(bubbleX - 7, bubbleY);
      ctx.lineTo(bubbleX, bubbleY + 8);
      ctx.lineTo(bubbleX + 7, bubbleY);
      ctx.closePath();
      ctx.fill();

      // Sender Name Tag inside bubble header
      ctx.font = 'bold 10px Fredoka, sans-serif';
      ctx.fillStyle = b.isSelf ? '#d84315' : '#00838f';
      ctx.textAlign = 'center';
      ctx.fillText(b.senderName, bubbleX, bubbleY - 26);

      // Chat Message Text
      ctx.font = 'bold 13px Fredoka, sans-serif';
      ctx.fillStyle = '#111111';
      ctx.fillText(b.text, bubbleX, bubbleY - 10);
    }
    ctx.restore();
  }
}
