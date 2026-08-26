import { FurnitureItemDef, FURNITURE_CATALOG } from '../data/FurnitureItems';
import { IsometricGrid, TILE_WIDTH, TILE_HEIGHT } from '../engine/IsometricGrid';

export interface PlacedFurniture {
  instanceId: string;
  defId: string;
  gx: number;
  gy: number;
  gz: number;
  rotation: 0 | 1 | 2 | 3; // 0=SE, 1=SW, 2=NW, 3=NE
  isLit?: boolean;
  customColor?: string;
}

export class FurnitureRenderer {
  public static drawFurniture(
    ctx: CanvasRenderingContext2D,
    item: PlacedFurniture,
    isHovered: boolean = false,
    isSelected: boolean = false
  ) {
    const def = FURNITURE_CATALOG.find(f => f.id === item.defId);
    if (!def) return;

    const screen = IsometricGrid.gridToScreen(item.gx, item.gy, item.gz);
    ctx.save();
    ctx.translate(screen.x, screen.y);

    // Apply rotation flip if needed
    if (item.rotation === 1 || item.rotation === 2) {
      ctx.scale(-1, 1);
    }

    const pColor = item.customColor || def.colorPalette.primary;
    const sColor = def.colorPalette.secondary;
    const aColor = def.colorPalette.accent || '#ffffff';

    switch (def.spriteType) {
      case 'sofa_lounge':
        this.drawSofa(ctx, pColor, sColor, aColor);
        break;
      case 'chair_egg':
        this.drawEggChair(ctx, pColor, sColor, aColor);
        break;
      case 'bar_stool':
        this.drawBarStool(ctx, pColor, sColor);
        break;
      case 'beanbag':
        this.drawBeanbag(ctx, pColor, sColor);
        break;
      case 'gold_throne':
        this.drawGoldThrone(ctx, pColor, sColor);
        break;
      case 'park_bench':
        this.drawParkBench(ctx, pColor, sColor);
        break;
      case 'sun_lounger':
        this.drawSunLounger(ctx, pColor, sColor);
        break;
      case 'glass_table':
        this.drawGlassTable(ctx, pColor, sColor);
        break;
      case 'buffet_table':
        this.drawBuffetTable(ctx, pColor, sColor);
        break;
      case 'bar_counter':
        this.drawBarCounter(ctx, pColor, sColor, aColor);
        break;
      case 'dj_booth':
        this.drawDJBooth(ctx, pColor, sColor, aColor);
        break;
      case 'speaker_stack':
        this.drawSpeakerStack(ctx, pColor, sColor);
        break;
      case 'flat_tv':
        this.drawFlatTV(ctx, pColor, sColor, aColor);
        break;
      case 'arcade_cabinet':
        this.drawArcadeCabinet(ctx, pColor, sColor, aColor);
        break;
      case 'lava_lamp':
        this.drawLavaLamp(ctx, pColor, sColor, item.isLit !== false);
        break;
      case 'stage_spotlight':
        this.drawSpotlight(ctx, pColor, sColor, item.isLit !== false);
        break;
      case 'disco_ball':
        this.drawDiscoBall(ctx, pColor, sColor);
        break;
      case 'water_fountain':
        this.drawFountain(ctx, pColor, sColor, aColor);
        break;
      case 'palm_tree':
        this.drawPalmTree(ctx, pColor, sColor);
        break;
      case 'flower_bed':
        this.drawFlowerBed(ctx, pColor, sColor, aColor);
        break;
      case 'runway_tile':
        this.drawRunwayTile(ctx, pColor, sColor, aColor);
        break;
      case 'zebra_rug':
        this.drawZebraRug(ctx, pColor, sColor);
        break;
      case 'gold_trophy':
        this.drawGoldTrophy(ctx, pColor, sColor);
        break;
      case 'rave_tile':
        this.drawRaveTile(ctx, pColor, sColor, aColor);
        break;
      default:
        this.drawGenericBlock(ctx, pColor, sColor, def.elevation);
    }

    if (isSelected || isHovered) {
      ctx.strokeStyle = isSelected ? '#00e676' : '#00bcd4';
      ctx.lineWidth = 2;
      ctx.strokeRect(-24, -def.elevation - 10, 48, def.elevation + 20);
    }

    ctx.restore();
  }

  private static drawSofa(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    // Sofa base cushion
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.roundRect(-30, -18, 60, 20, 6);
    ctx.fill();

    // Seat cushions
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.roundRect(-26, -14, 24, 12, 4);
    ctx.roundRect(2, -14, 24, 12, 4);
    ctx.fill();

    // Backrest
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.roundRect(-32, -34, 64, 18, 6);
    ctx.fill();

    // Armrests
    ctx.fillStyle = a;
    ctx.fillRect(-34, -26, 6, 22);
    ctx.fillRect(28, -26, 6, 22);
  }

  private static drawEggChair(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    // Chrome stand
    ctx.fillStyle = a;
    ctx.fillRect(-2, -6, 4, 12);
    ctx.beginPath();
    ctx.ellipse(0, 6, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer pod shell
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.ellipse(0, -16, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner cushion
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.ellipse(0, -14, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawBarStool(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = s;
    ctx.fillRect(-2, -14, 4, 18);
    ctx.beginPath();
    ctx.ellipse(0, 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.ellipse(0, -16, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-11, -16, 22, 4);
  }

  private static drawBeanbag(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.ellipse(0, -6, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.ellipse(0, -9, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawGoldThrone(ctx: CanvasRenderingContext2D, p: string, s: string) {
    // Gold tall backrest
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.roundRect(-16, -42, 32, 40, 6);
    ctx.fill();

    // Red royal velvet cushion
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.roundRect(-12, -36, 24, 28, 4);
    ctx.fill();

    // Seat
    ctx.beginPath();
    ctx.roundRect(-14, -12, 28, 14, 4);
    ctx.fill();
  }

  private static drawParkBench(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = s;
    ctx.fillRect(-24, 0, 4, 8);
    ctx.fillRect(20, 0, 4, 8);

    ctx.fillStyle = p;
    ctx.fillRect(-26, -6, 52, 6);
    ctx.fillRect(-26, -18, 52, 5);
    ctx.fillRect(-26, -26, 52, 5);
  }

  private static drawSunLounger(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = s;
    ctx.fillRect(-22, -2, 44, 6);
    ctx.fillStyle = p;
    ctx.fillRect(-20, -6, 40, 4);
    ctx.beginPath();
    ctx.moveTo(10, -6);
    ctx.lineTo(22, -18);
    ctx.lineTo(24, -16);
    ctx.lineTo(12, -4);
    ctx.closePath();
    ctx.fill();
  }

  private static drawGlassTable(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = '#78909c';
    ctx.fillRect(-10, -4, 3, 10);
    ctx.fillRect(7, -4, 3, 10);

    ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, -6, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e0f7fa';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private static drawBuffetTable(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = p;
    ctx.fillRect(-26, 0, 52, 10);
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.ellipse(0, -6, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawBarCounter(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    ctx.fillStyle = p;
    ctx.fillRect(-28, -14, 56, 24);
    // Neon glow strip
    ctx.fillStyle = s;
    ctx.fillRect(-28, -6, 56, 3);
    // Top counter
    ctx.fillStyle = a;
    ctx.beginPath();
    ctx.ellipse(0, -16, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawDJBooth(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    // Booth desk
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.roundRect(-28, -24, 56, 30, 4);
    ctx.fill();

    // Turntables
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(-14, -20, 9, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(14, -20, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vinyl grooves
    ctx.strokeStyle = s;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Audio Visualizer screen on front
    ctx.fillStyle = a;
    for (let i = 0; i < 6; i++) {
      const h = 4 + Math.sin(Date.now() / 150 + i) * 6;
      ctx.fillRect(-18 + i * 6, -2, 4, -h);
    }
  }

  private static drawSpeakerStack(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.roundRect(-14, -42, 28, 46, 4);
    ctx.fill();

    // Subwoofer cones
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.arc(0, -30, 8, 0, Math.PI * 2);
    ctx.arc(0, -12, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawFlatTV(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    ctx.fillStyle = '#111';
    ctx.fillRect(-26, -34, 52, 32);
    // Screen glowing
    ctx.fillStyle = s;
    ctx.fillRect(-23, -31, 46, 26);
    // Woozworld Logo on screen
    ctx.fillStyle = a;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WOOZ TV', 0, -16);
  }

  private static drawArcadeCabinet(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.moveTo(-14, 6);
    ctx.lineTo(-14, -42);
    ctx.lineTo(8, -42);
    ctx.lineTo(14, -30);
    ctx.lineTo(14, 6);
    ctx.closePath();
    ctx.fill();

    // Marquee
    ctx.fillStyle = s;
    ctx.fillRect(-12, -40, 22, 8);

    // Screen
    ctx.fillStyle = '#000';
    ctx.fillRect(-10, -28, 20, 16);
    ctx.fillStyle = a;
    ctx.fillRect(-8, -26, 16, 12);
  }

  private static drawLavaLamp(ctx: CanvasRenderingContext2D, p: string, s: string, isLit: boolean) {
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-4, 0, 8, 4);
    ctx.fillRect(-3, -26, 6, 4);

    // Glass bottle
    ctx.fillStyle = isLit ? p : '#555';
    ctx.beginPath();
    ctx.roundRect(-5, -22, 10, 22, 4);
    ctx.fill();

    if (isLit) {
      // Lava bubbles
      ctx.fillStyle = s;
      const bY = Math.sin(Date.now() / 400) * 5;
      ctx.beginPath();
      ctx.arc(0, -12 + bY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawSpotlight(ctx: CanvasRenderingContext2D, p: string, s: string, isLit: boolean) {
    ctx.fillStyle = s;
    ctx.fillRect(-2, -36, 4, 40);
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(0, -36, 8, 0, Math.PI * 2);
    ctx.fill();

    if (isLit) {
      ctx.fillStyle = 'rgba(255, 235, 59, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, -36);
      ctx.lineTo(-35, 10);
      ctx.lineTo(35, 10);
      ctx.closePath();
      ctx.fill();
    }
  }

  private static drawDiscoBall(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -55);
    ctx.lineTo(0, -42);
    ctx.stroke();

    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.arc(0, -34, 10, 0, Math.PI * 2);
    ctx.fill();

    // Glitter sparkles
    ctx.fillStyle = s;
    for (let i = 0; i < 4; i++) {
      const angle = (Date.now() / 200 + (i * Math.PI) / 2) % (Math.PI * 2);
      const sx = Math.cos(angle) * 7;
      const sy = Math.sin(angle) * 7;
      ctx.fillRect(sx - 1, -34 + sy - 1, 2, 2);
    }
  }

  private static drawFountain(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    // Marble basin
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water pool
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.ellipse(0, -2, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center fountain tier
    ctx.fillStyle = s;
    ctx.fillRect(-5, -20, 10, 18);
    ctx.beginPath();
    ctx.ellipse(0, -20, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water jet
    ctx.fillStyle = a;
    const spray = Math.sin(Date.now() / 150) * 3;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-4, -32 + spray);
    ctx.lineTo(4, -32 + spray);
    ctx.closePath();
    ctx.fill();
  }

  private static drawPalmTree(ctx: CanvasRenderingContext2D, p: string, s: string) {
    // Trunk
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.moveTo(-4, 4);
    ctx.quadraticCurveTo(-10, -24, 0, -48);
    ctx.quadraticCurveTo(8, -24, 4, 4);
    ctx.closePath();
    ctx.fill();

    // Leaves
    ctx.fillStyle = p;
    const leaves = [-0.9, -0.4, 0.1, 0.6, 1.1];
    leaves.forEach(ang => {
      ctx.save();
      ctx.translate(0, -48);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(14, 0, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private static drawFlowerBed(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    ctx.fillStyle = a; // soil
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Colorful tulips
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.arc(-8, -4, 4, 0, Math.PI * 2);
    ctx.arc(6, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.arc(0, -7, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawRunwayTile(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', 0, 4);
  }

  private static drawZebraRug(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s;
    ctx.fillRect(-20, -4, 40, 3);
    ctx.fillRect(-15, 3, 30, 3);
    ctx.fillRect(-15, -10, 30, 3);
  }

  private static drawGoldTrophy(ctx: CanvasRenderingContext2D, p: string, s: string) {
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-8, -4, 16, 8);

    ctx.fillStyle = p;
    ctx.beginPath();
    ctx.moveTo(-10, -22);
    ctx.lineTo(10, -22);
    ctx.lineTo(6, -10);
    ctx.lineTo(-6, -10);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-3, -10, 6, 6);
  }

  private static drawRaveTile(ctx: CanvasRenderingContext2D, p: string, s: string, a: string) {
    const hue = (Date.now() / 15) % 360;
    ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
    ctx.beginPath();
    ctx.moveTo(0, -TILE_HEIGHT / 2);
    ctx.lineTo(TILE_WIDTH / 2, 0);
    ctx.lineTo(0, TILE_HEIGHT / 2);
    ctx.lineTo(-TILE_WIDTH / 2, 0);
    ctx.closePath();
    ctx.fill();
  }

  private static drawGenericBlock(ctx: CanvasRenderingContext2D, p: string, s: string, elevation: number) {
    ctx.fillStyle = p;
    ctx.fillRect(-15, -elevation, 30, elevation);
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.ellipse(0, -elevation, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
