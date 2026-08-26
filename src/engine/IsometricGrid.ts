export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;
export const WALL_HEIGHT = 100;

export interface Point2D {
  x: number;
  y: number;
}

export interface GridCoord {
  gx: number;
  gy: number;
  gz?: number;
}

export interface TileData {
  type: 'grass' | 'pavement' | 'wood' | 'marble' | 'checker' | 'disco' | 'sand' | 'water' | 'carpet_red';
  elevation: number;
  color?: string;
}

export class IsometricGrid {
  public static gridToScreen(gx: number, gy: number, gz: number = 0): Point2D {
    const x = (gx - gy) * (TILE_WIDTH / 2);
    const y = (gx + gy) * (TILE_HEIGHT / 2) - gz;
    return { x, y };
  }

  public static screenToGrid(screenX: number, screenY: number): GridCoord {
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;
    const gx = (screenX / halfW + screenY / halfH) / 2;
    const gy = (screenY / halfH - screenX / halfW) / 2;
    return {
      gx: Math.floor(gx),
      gy: Math.floor(gy)
    };
  }

  public static getDepth(gx: number, gy: number, gz: number = 0, priorityOffset: number = 0): number {
    return (gx + gy) * 1000 + gz * 10 + priorityOffset;
  }

  public static drawTile(
    ctx: CanvasRenderingContext2D,
    gx: number,
    gy: number,
    tile: TileData,
    isHovered: boolean = false,
    isSelected: boolean = false
  ) {
    const screen = this.gridToScreen(gx, gy, tile.elevation);
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y - halfH);
    ctx.lineTo(screen.x + halfW, screen.y);
    ctx.lineTo(screen.x, screen.y + halfH);
    ctx.lineTo(screen.x - halfW, screen.y);
    ctx.closePath();

    // Tile fill styles
    switch (tile.type) {
      case 'grass':
        ctx.fillStyle = '#4caf50';
        break;
      case 'pavement':
        ctx.fillStyle = '#78909c';
        break;
      case 'wood':
        ctx.fillStyle = '#8d6e63';
        break;
      case 'marble':
        ctx.fillStyle = '#eceff1';
        break;
      case 'checker':
        ctx.fillStyle = (gx + gy) % 2 === 0 ? '#ffffff' : '#263238';
        break;
      case 'disco':
        const hue = (Date.now() / 20 + (gx + gy) * 45) % 360;
        ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
        break;
      case 'sand':
        ctx.fillStyle = '#ffe082';
        break;
      case 'water':
        const wave = Math.sin(Date.now() / 300 + gx) * 10;
        ctx.fillStyle = `hsl(${195 + wave}, 85%, 55%)`;
        break;
      case 'carpet_red':
        ctx.fillStyle = '#d50000';
        break;
      default:
        ctx.fillStyle = tile.color || '#546e7a';
    }

    ctx.fill();

    // Tile Border / Grid line
    ctx.strokeStyle = isSelected
      ? '#00e676'
      : isHovered
      ? '#00bcd4'
      : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = isSelected || isHovered ? 2.5 : 1;
    ctx.stroke();

    // Subtle 3D thickness on bottom if elevated
    if (tile.elevation > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.moveTo(screen.x - halfW, screen.y);
      ctx.lineTo(screen.x, screen.y + halfH);
      ctx.lineTo(screen.x, screen.y + halfH + tile.elevation);
      ctx.lineTo(screen.x - halfW, screen.y + tile.elevation);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.moveTo(screen.x + halfW, screen.y);
      ctx.lineTo(screen.x, screen.y + halfH);
      ctx.lineTo(screen.x, screen.y + halfH + tile.elevation);
      ctx.lineTo(screen.x + halfW, screen.y + tile.elevation);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  public static drawWall(
    ctx: CanvasRenderingContext2D,
    gx: number,
    gy: number,
    side: 'left' | 'right',
    color: string = '#2c3e50',
    wallpaperPattern: string = 'solid'
  ) {
    const screen = this.gridToScreen(gx, gy, 0);
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;

    ctx.save();
    ctx.beginPath();

    if (side === 'left') {
      // Wall along Y axis (North-West wall)
      ctx.moveTo(screen.x - halfW, screen.y);
      ctx.lineTo(screen.x, screen.y - halfH);
      ctx.lineTo(screen.x, screen.y - halfH - WALL_HEIGHT);
      ctx.lineTo(screen.x - halfW, screen.y - WALL_HEIGHT);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.stroke();

      // Top trim
      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screen.x - halfW, screen.y - WALL_HEIGHT);
      ctx.lineTo(screen.x, screen.y - halfH - WALL_HEIGHT);
      ctx.stroke();
    } else {
      // Wall along X axis (North-East wall)
      ctx.moveTo(screen.x + halfW, screen.y);
      ctx.lineTo(screen.x, screen.y - halfH);
      ctx.lineTo(screen.x, screen.y - halfH - WALL_HEIGHT);
      ctx.lineTo(screen.x + halfW, screen.y - WALL_HEIGHT);
      ctx.closePath();
      // Slightly darker for isometric lighting
      ctx.fillStyle = shadeColor(color, -20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.stroke();

      // Top trim
      ctx.strokeStyle = '#00838f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screen.x + halfW, screen.y - WALL_HEIGHT);
      ctx.lineTo(screen.x, screen.y - halfH - WALL_HEIGHT);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function shadeColor(color: string, percent: number): string {
  let num = parseInt(color.replace('#', ''), 16);
  if (isNaN(num)) return color;
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = (num >> 8 & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}
