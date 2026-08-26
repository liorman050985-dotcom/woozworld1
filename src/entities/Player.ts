import { AvatarCustomization, AvatarRenderer, Direction, AvatarAnimation } from './AvatarRenderer';
import { IsometricGrid, Point2D } from '../engine/IsometricGrid';
import { CLOTHING_CATALOG } from '../data/ClothingItems';

const STORAGE_KEY = 'woozoffline_player_save_v1';

export class Player {
  public id: string = 'player_main';
  public name: string = 'WoozStar';
  public level: number = 42;
  public xp: number = 7850;
  public maxXp: number = 10000;
  public wooz: number = 999999;
  public beex: number = 999999;

  // Position
  public gx: number = 5;
  public gy: number = 5;
  public gz: number = 0;
  public screenPos: Point2D = { x: 0, y: 0 };
  public direction: Direction = 0;
  public animation: AvatarAnimation = 'idle';
  public animFrame: number = 0;

  // Path movement
  public path: { x: number; y: number }[] = [];
  public moveSpeed: number = 3.5;
  public isMoving: boolean = false;
  private subTileProgress: number = 0;
  public sittingOnFurnitureId: string | null = null;

  public customization: AvatarCustomization = {
    skinColor: '#ffd8b3',
    gender: 'all',
    hair: {
      id: 'hair_classic_emo',
      style: 'scene_swoop',
      primaryColor: '#212121',
      secondaryColor: '#ff007f'
    },
    face: {
      id: 'face_sparkle_eyes',
      style: 'sparkle',
      eyeColor: '#00bcd4',
      expression: 'sparkle'
    },
    top: {
      id: 'top_wooz_hoodie',
      style: 'hoodie_street',
      primaryColor: '#00bcd4',
      secondaryColor: '#ffffff',
      detailColor: '#ff4081'
    },
    bottom: {
      id: 'bottom_skinny_ripped',
      style: 'jeans_ripped',
      primaryColor: '#1565c0',
      secondaryColor: '#90caf9'
    },
    shoes: {
      id: 'shoes_hi_tops',
      style: 'hi_tops',
      primaryColor: '#00bcd4',
      secondaryColor: '#ffffff'
    },
    headAccessory: {
      id: 'head_kitty_headphones',
      style: 'kitty_headphones',
      primaryColor: '#ff4081',
      secondaryColor: '#00e5ff'
    },
    backAccessory: {
      id: 'back_fairy_wings',
      style: 'fairy_wings',
      primaryColor: '#80deea',
      secondaryColor: '#f48fb1'
    }
  };

  // Inventory of clothing IDs unlocked (all unlocked by default!)
  public unlockedClothingIds: Set<string> = new Set(CLOTHING_CATALOG.map(c => c.id));

  constructor() {
    this.loadFromStorage();
    this.screenPos = IsometricGrid.gridToScreen(this.gx, this.gy, this.gz);
  }

  public update(deltaTime: number, onStepSFX?: () => void) {
    this.animFrame += deltaTime * 60;

    if (this.path.length > 0) {
      this.isMoving = true;
      this.animation = 'walk';
      this.sittingOnFurnitureId = null;

      const target = this.path[0];
      const dx = target.x - this.gx;
      const dy = target.y - this.gy;

      // Determine 8-way isometric direction
      this.direction = this.calcDirection(dx, dy);

      this.subTileProgress += this.moveSpeed * deltaTime;

      if (this.subTileProgress >= 1.0) {
        this.gx = target.x;
        this.gy = target.y;
        this.path.shift();
        this.subTileProgress = 0;

        if (onStepSFX) {
          onStepSFX();
        }

        if (this.path.length === 0) {
          this.isMoving = false;
          this.animation = 'idle';
        }
      }

      // Smooth interpolation for screen position
      const currScreen = IsometricGrid.gridToScreen(this.gx, this.gy, this.gz);
      if (this.path.length > 0) {
        const nextScreen = IsometricGrid.gridToScreen(this.path[0].x, this.path[0].y, this.gz);
        this.screenPos.x = currScreen.x + (nextScreen.x - currScreen.x) * this.subTileProgress;
        this.screenPos.y = currScreen.y + (nextScreen.y - currScreen.y) * this.subTileProgress;
      } else {
        this.screenPos = currScreen;
      }
    } else {
      this.isMoving = false;
      this.screenPos = IsometricGrid.gridToScreen(this.gx, this.gy, this.gz);
    }
  }

  public setPath(newPath: { x: number; y: number }[]) {
    if (newPath.length > 0) {
      this.path = newPath;
      this.subTileProgress = 0;
    }
  }

  public stopMoving() {
    this.path = [];
    this.isMoving = false;
    this.animation = 'idle';
  }

  public sit(furnitureId: string, seatTile: { x: number; y: number }, elevation: number = 8) {
    this.stopMoving();
    this.gx = seatTile.x;
    this.gy = seatTile.y;
    this.gz = elevation;
    this.sittingOnFurnitureId = furnitureId;
    this.animation = 'sit';
    this.screenPos = IsometricGrid.gridToScreen(this.gx, this.gy, this.gz);
  }

  public setAnimation(anim: AvatarAnimation) {
    this.animation = anim;
    if (anim !== 'walk') {
      this.stopMoving();
    }
  }

  public addXp(amount: number): boolean {
    this.xp += amount;
    let leveledUp = false;
    while (this.xp >= this.maxXp) {
      this.xp -= this.maxXp;
      this.level++;
      this.maxXp = Math.floor(this.maxXp * 1.25);
      leveledUp = true;
    }
    this.saveToStorage();
    return leveledUp;
  }

  private calcDirection(dx: number, dy: number): Direction {
    if (dx > 0 && dy === 0) return 0; // SE
    if (dx > 0 && dy > 0) return 1; // S
    if (dx === 0 && dy > 0) return 2; // SW
    if (dx < 0 && dy > 0) return 3; // W
    if (dx < 0 && dy === 0) return 4; // NW
    if (dx < 0 && dy < 0) return 5; // N
    if (dx === 0 && dy < 0) return 6; // NE
    if (dx > 0 && dy < 0) return 7; // E
    return 0;
  }

  public saveToStorage() {
    try {
      const data = {
        name: this.name,
        level: this.level,
        xp: this.xp,
        maxXp: this.maxXp,
        wooz: this.wooz,
        beex: this.beex,
        customization: this.customization
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  public loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.name) this.name = data.name;
        if (data.level) this.level = data.level;
        if (data.xp) this.xp = data.xp;
        if (data.maxXp) this.maxXp = data.maxXp;
        if (data.customization) this.customization = data.customization;
      }
    } catch (e) {
      console.warn('Storage load failed:', e);
    }
  }
}
