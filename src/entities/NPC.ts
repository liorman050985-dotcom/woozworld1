import { AvatarCustomization, Direction, AvatarAnimation } from './AvatarRenderer';
import { IsometricGrid, Point2D } from '../engine/IsometricGrid';
import { BOT_CHAT_PHRASES } from '../data/Dialogues';

export class NPC {
  public id: string;
  public name: string;
  public role: 'woozband' | 'bot';
  public dialogueTreeId?: string;
  public gx: number;
  public gy: number;
  public gz: number = 0;
  public screenPos: Point2D = { x: 0, y: 0 };
  public direction: Direction = 0;
  public animation: AvatarAnimation = 'idle';
  public animFrame: number = 0;

  public customization: AvatarCustomization;
  public activeSpeechBubble: { text: string; timer: number } | null = null;

  // Autonomous wandering logic
  private wanderCooldown: number = 2 + Math.random() * 4;
  private chatCooldown: number = 5 + Math.random() * 8;
  public path: { x: number; y: number }[] = [];
  public moveSpeed: number = 2.0;
  private subTileProgress: number = 0;

  constructor(
    id: string,
    name: string,
    role: 'woozband' | 'bot',
    gx: number,
    gy: number,
    customization: AvatarCustomization,
    dialogueTreeId?: string
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.gx = gx;
    this.gy = gy;
    this.customization = customization;
    this.dialogueTreeId = dialogueTreeId;
    this.screenPos = IsometricGrid.gridToScreen(this.gx, this.gy, this.gz);
  }

  public update(
    deltaTime: number,
    getWalkableRandomTile?: () => { x: number; y: number } | null,
    findPath?: (sx: number, sy: number, tx: number, ty: number) => { x: number; y: number }[]
  ) {
    this.animFrame += deltaTime * 60;

    // Speech bubble countdown
    if (this.activeSpeechBubble) {
      this.activeSpeechBubble.timer -= deltaTime;
      if (this.activeSpeechBubble.timer <= 0) {
        this.activeSpeechBubble = null;
      }
    }

    // Path movement
    if (this.path.length > 0) {
      this.animation = 'walk';
      const target = this.path[0];
      const dx = target.x - this.gx;
      const dy = target.y - this.gy;

      // 8-way direction
      if (dx > 0 && dy === 0) this.direction = 0;
      else if (dx > 0 && dy > 0) this.direction = 1;
      else if (dx === 0 && dy > 0) this.direction = 2;
      else if (dx < 0 && dy > 0) this.direction = 3;
      else if (dx < 0 && dy === 0) this.direction = 4;
      else if (dx < 0 && dy < 0) this.direction = 5;
      else if (dx === 0 && dy < 0) this.direction = 6;
      else if (dx > 0 && dy < 0) this.direction = 7;

      this.subTileProgress += this.moveSpeed * deltaTime;

      if (this.subTileProgress >= 1.0) {
        this.gx = target.x;
        this.gy = target.y;
        this.path.shift();
        this.subTileProgress = 0;

        if (this.path.length === 0) {
          this.animation = Math.random() > 0.4 ? 'idle' : (this.role === 'woozband' ? 'pose' : 'dance');
        }
      }

      const currScreen = IsometricGrid.gridToScreen(this.gx, this.gy, this.gz);
      if (this.path.length > 0) {
        const nextScreen = IsometricGrid.gridToScreen(this.path[0].x, this.path[0].y, this.gz);
        this.screenPos.x = currScreen.x + (nextScreen.x - currScreen.x) * this.subTileProgress;
        this.screenPos.y = currScreen.y + (nextScreen.y - currScreen.y) * this.subTileProgress;
      } else {
        this.screenPos = currScreen;
      }
    } else {
      this.screenPos = IsometricGrid.gridToScreen(this.gx, this.gy, this.gz);

      // Random wandering logic for bots (Woozband moves less, bots roam more)
      this.wanderCooldown -= deltaTime;
      if (this.wanderCooldown <= 0) {
        this.wanderCooldown = 4 + Math.random() * 8;
        if (getWalkableRandomTile && findPath && Math.random() > 0.3) {
          const targetTile = getWalkableRandomTile();
          if (targetTile) {
            const newPath = findPath(this.gx, this.gy, targetTile.x, targetTile.y);
            if (newPath.length > 0 && newPath.length < 8) {
              this.path = newPath;
              this.subTileProgress = 0;
            }
          }
        }
      }

      // Random bot speech phrases
      if (this.role === 'bot') {
        this.chatCooldown -= deltaTime;
        if (this.chatCooldown <= 0) {
          this.chatCooldown = 10 + Math.random() * 15;
          if (Math.random() > 0.5 && !this.activeSpeechBubble) {
            const phrase = BOT_CHAT_PHRASES[Math.floor(Math.random() * BOT_CHAT_PHRASES.length)];
            this.speak(phrase, 4.0);
          }
        }
      }
    }
  }

  public speak(text: string, durationSec: number = 4.0) {
    this.activeSpeechBubble = {
      text,
      timer: durationSec
    };
  }
}
