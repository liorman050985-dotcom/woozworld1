import { audioEngine } from '../engine/AudioEngine';

export interface FloatingBubble {
  id: string;
  senderName: string;
  text: string;
  worldX: number;
  worldY: number;
  timer: number;
  color?: string;
}

export class ChatBubbleManager {
  private bubbles: FloatingBubble[] = [];

  public addBubble(senderName: string, text: string, worldX: number, worldY: number, color?: string) {
    audioEngine.playPop();
    // Remove old bubble from same sender
    this.bubbles = this.bubbles.filter(b => b.senderName !== senderName);

    this.bubbles.push({
      id: 'bubble_' + Date.now() + '_' + Math.random(),
      senderName,
      text,
      worldX,
      worldY,
      timer: 5.0,
      color
    });
  }

  public update(deltaTime: number) {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      this.bubbles[i].timer -= deltaTime;
      if (this.bubbles[i].timer <= 0) {
        this.bubbles.splice(i, 1);
      }
    }
  }

  public updateSenderPos(senderName: string, worldX: number, worldY: number) {
    const bubble = this.bubbles.find(b => b.senderName === senderName);
    if (bubble) {
      bubble.worldX = worldX;
      bubble.worldY = worldY;
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const b of this.bubbles) {
      const bubbleY = b.worldY - 90;
      const bubbleX = b.worldX;

      ctx.font = 'bold 13px Fredoka, sans-serif';
      const textWidth = ctx.measureText(b.text).width;
      const padding = 12;
      const boxW = Math.min(240, textWidth + padding * 2);
      const boxH = 30;

      // Draw bubble background
      ctx.fillStyle = b.color || '#ffffff';
      ctx.beginPath();
      ctx.roundRect(bubbleX - boxW / 2, bubbleY - boxH, boxW, boxH, 14);
      ctx.fill();

      // Shadow & border
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Speech pointer tail
      ctx.fillStyle = b.color || '#ffffff';
      ctx.beginPath();
      ctx.moveTo(bubbleX - 6, bubbleY);
      ctx.lineTo(bubbleX, bubbleY + 6);
      ctx.lineTo(bubbleX + 6, bubbleY);
      ctx.closePath();
      ctx.fill();

      // Text
      ctx.fillStyle = '#111111';
      ctx.textAlign = 'center';
      ctx.fillText(b.text, bubbleX, bubbleY - 10);
    }
    ctx.restore();
  }
}
