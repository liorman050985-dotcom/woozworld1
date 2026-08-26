import { RoomDefinition, createPublicRooms } from './PublicRooms';
import { IsometricGrid, TileData, Point2D } from '../engine/IsometricGrid';
import { PlacedFurniture, FurnitureRenderer } from '../entities/Furniture';
import { FURNITURE_CATALOG } from '../data/FurnitureItems';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { AvatarRenderer } from '../entities/AvatarRenderer';

const ROOMS_STORAGE_KEY = 'woozoffline_saved_rooms_v1';

export class UnitzManager {
  public rooms: Record<string, RoomDefinition> = {};
  public currentRoomId: string = 'central_plaza';
  public currentRoom: RoomDefinition;

  // Build mode states
  public isBuildMode: boolean = false;
  public selectedBuildDefId: string | null = null;
  public selectedPlacedFurniture: PlacedFurniture | null = null;
  public paintTileType: TileData['type'] | null = null;
  public hoveredTile: { gx: number; gy: number } | null = null;

  constructor() {
    this.rooms = createPublicRooms();
    this.loadRoomsFromStorage();
    this.currentRoom = this.rooms[this.currentRoomId] || this.rooms['central_plaza'];
  }

  public switchRoom(roomId: string): boolean {
    if (this.rooms[roomId]) {
      this.currentRoomId = roomId;
      this.currentRoom = this.rooms[roomId];
      return true;
    }
    return false;
  }

  public changeRoom(roomId: string, player: Player): boolean {
    if (this.rooms[roomId]) {
      this.currentRoomId = roomId;
      this.currentRoom = this.rooms[roomId];

      // Reset player position safely inside new room
      player.stopMoving();
      player.gx = Math.floor(this.currentRoom.width / 2);
      player.gy = Math.floor(this.currentRoom.height / 2);
      player.gz = 0;
      player.screenPos = IsometricGrid.gridToScreen(player.gx, player.gy, player.gz);

      return true;
    }
    return false;
  }

  public isTileWalkable(gx: number, gy: number): boolean {
    if (
      gx < 0 ||
      gx >= this.currentRoom.width ||
      gy < 0 ||
      gy >= this.currentRoom.height
    ) {
      return false;
    }

    const tile = this.currentRoom.tiles[gx]?.[gy];
    if (!tile) return false;
    if (tile.type === 'water') return false;

    // Check non-walkable placed furniture
    for (const f of this.currentRoom.furniture) {
      const def = FURNITURE_CATALOG.find(d => d.id === f.defId);
      if (!def) continue;

      if (!def.isWalkable) {
        // Multi-tile bounding box calculation
        const w = f.rotation % 2 === 1 ? def.height : def.width;
        const h = f.rotation % 2 === 1 ? def.width : def.height;
        if (gx >= f.gx && gx < f.gx + w && gy >= f.gy && gy < f.gy + h) {
          return false;
        }
      }
    }

    return true;
  }

  public getFurnitureAt(gx: number, gy: number): PlacedFurniture | null {
    for (const f of this.currentRoom.furniture) {
      const def = FURNITURE_CATALOG.find(d => d.id === f.defId);
      if (!def) continue;
      const w = f.rotation % 2 === 1 ? def.height : def.width;
      const h = f.rotation % 2 === 1 ? def.width : def.height;
      if (gx >= f.gx && gx < f.gx + w && gy >= f.gy && gy < f.gy + h) {
        return f;
      }
    }
    return null;
  }

  public getNPCAt(gx: number, gy: number): NPC | null {
    for (const npc of this.currentRoom.npcs) {
      if (Math.round(npc.gx) === gx && Math.round(npc.gy) === gy) {
        return npc;
      }
    }
    return null;
  }

  public placeFurniture(defId: string, gx: number, gy: number): PlacedFurniture | null {
    if (this.currentRoom.category !== 'personal') {
      return null;
    }

    const def = FURNITURE_CATALOG.find(d => d.id === defId);
    if (!def) return null;

    const newF: PlacedFurniture = {
      instanceId: 'f_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      defId,
      gx,
      gy,
      gz: 0,
      rotation: 0
    };

    this.currentRoom.furniture.push(newF);
    this.saveRoomsToStorage();
    return newF;
  }

  public removeFurniture(instanceId: string) {
    if (this.currentRoom.category !== 'personal') return;

    this.currentRoom.furniture = this.currentRoom.furniture.filter(f => f.instanceId !== instanceId);
    if (this.selectedPlacedFurniture?.instanceId === instanceId) {
      this.selectedPlacedFurniture = null;
    }
    this.saveRoomsToStorage();
  }

  public rotateFurniture(instanceId: string) {
    if (this.currentRoom.category !== 'personal') return;

    const f = this.currentRoom.furniture.find(item => item.instanceId === instanceId);
    if (f) {
      f.rotation = ((f.rotation + 1) % 4) as 0 | 1 | 2 | 3;
      this.saveRoomsToStorage();
    }
  }

  public elevateFurniture(instanceId: string, deltaZ: number) {
    if (this.currentRoom.category !== 'personal') return;

    const f = this.currentRoom.furniture.find(item => item.instanceId === instanceId);
    if (f) {
      f.gz = Math.max(0, Math.min(60, f.gz + deltaZ));
      this.saveRoomsToStorage();
    }
  }

  public paintTile(gx: number, gy: number, type: string) {
    if (this.currentRoom.category !== 'personal') return;

    if (
      gx >= 0 &&
      gx < this.currentRoom.width &&
      gy >= 0 &&
      gy < this.currentRoom.height
    ) {
      this.currentRoom.tiles[gx][gy].type = type as TileData['type'];
      this.saveRoomsToStorage();
    }
  }

  public setWallColor(color: string) {
    this.currentRoom.wallColor = color;
    this.saveRoomsToStorage();
  }

  public render(ctx: CanvasRenderingContext2D, player: Player, remotePlayers: Map<string, any> = new Map()) {
    const room = this.currentRoom;

    // 1. Draw North-West & North-East Room Walls
    for (let y = 0; y < room.height; y++) {
      IsometricGrid.drawWall(ctx, 0, y, 'left', room.wallColor);
    }
    for (let x = 0; x < room.width; x++) {
      IsometricGrid.drawWall(ctx, x, 0, 'right', room.wallColor);
    }

    // 2. Draw Floor Tiles
    for (let x = 0; x < room.width; x++) {
      for (let y = 0; y < room.height; y++) {
        const isHovered = this.hoveredTile?.gx === x && this.hoveredTile?.gy === y;
        IsometricGrid.drawTile(ctx, x, y, room.tiles[x][y], isHovered && this.isBuildMode);
      }
    }

    // 3. Build Depth Queue for All Isometric Entities (Furniture, Player, Remote Players, NPCs)
    interface RenderQueueItem {
      depth: number;
      draw: () => void;
    }

    const queue: RenderQueueItem[] = [];

    // Furniture
    for (const f of room.furniture) {
      const def = FURNITURE_CATALOG.find(d => d.id === f.defId);
      const isSelected = this.selectedPlacedFurniture?.instanceId === f.instanceId;
      const isHovered = this.hoveredTile?.gx === f.gx && this.hoveredTile?.gy === f.gy;
      const depth = IsometricGrid.getDepth(f.gx, f.gy, f.gz, def?.isWalkable ? 0 : 50);

      queue.push({
        depth,
        draw: () => {
          FurnitureRenderer.drawFurniture(ctx, f, isHovered && this.isBuildMode, isSelected);
        }
      });
    }

    // NPCs
    for (const npc of room.npcs) {
      const depth = IsometricGrid.getDepth(npc.gx, npc.gy, npc.gz, 100);
      queue.push({
        depth,
        draw: () => {
          AvatarRenderer.drawAvatar(
            ctx,
            npc.screenPos.x,
            npc.screenPos.y,
            npc.customization,
            npc.direction,
            npc.animation,
            npc.animFrame
          );

          // Name Tag
          this.drawNameTag(ctx, npc.screenPos.x, npc.screenPos.y - 75, npc.name, npc.role === 'woozband' ? '#ff4081' : '#00bcd4');
        }
      });
    }

    // Remote Players
    for (const rPlayer of remotePlayers.values()) {
      const rDepth = IsometricGrid.getDepth(rPlayer.gx, rPlayer.gy, rPlayer.gz, 100);
      queue.push({
        depth: rDepth,
        draw: () => {
          AvatarRenderer.drawAvatar(
            ctx,
            rPlayer.screenPos.x,
            rPlayer.screenPos.y,
            rPlayer.customization,
            rPlayer.direction,
            rPlayer.animation,
            rPlayer.animFrame
          );
          this.drawNameTag(ctx, rPlayer.screenPos.x, rPlayer.screenPos.y - 75, `${rPlayer.name} (Lv.${rPlayer.level})`, '#00e676');
        }
      });
    }

    // Local Player
    const playerDepth = IsometricGrid.getDepth(player.gx, player.gy, player.gz, 100);
    queue.push({
      depth: playerDepth,
      draw: () => {
        AvatarRenderer.drawAvatar(
          ctx,
          player.screenPos.x,
          player.screenPos.y,
          player.customization,
          player.direction,
          player.animation,
          player.animFrame
        );

        // Player Name Tag & Star
        this.drawNameTag(ctx, player.screenPos.x, player.screenPos.y - 75, `${player.name} (Lv.${player.level})`, '#ffd700');
      }
    });

    // Sort ascending by depth and draw
    queue.sort((a, b) => a.depth - b.depth);
    for (const item of queue) {
      item.draw();
    }

    // 4. Draw Build Mode Placement Preview
    if (this.isBuildMode && this.selectedBuildDefId && this.hoveredTile) {
      const def = FURNITURE_CATALOG.find(d => d.id === this.selectedBuildDefId);
      if (def) {
        ctx.save();
        ctx.globalAlpha = 0.65;
        const tempF: PlacedFurniture = {
          instanceId: 'preview',
          defId: def.id,
          gx: this.hoveredTile.gx,
          gy: this.hoveredTile.gy,
          gz: 0,
          rotation: 0
        };
        FurnitureRenderer.drawFurniture(ctx, tempF, true, false);
        ctx.restore();
      }
    }
  }

  private drawNameTag(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) {
    ctx.save();
    ctx.font = 'bold 11px Fredoka, sans-serif';
    const textWidth = ctx.measureText(text).width;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2 - 6, y - 10, textWidth + 12, 16, 6);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 2);
    ctx.restore();
  }

  public saveRoomsToStorage() {
    try {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(this.rooms));
    } catch (e) {
      console.warn('Failed saving rooms to storage:', e);
    }
  }

  public loadRoomsFromStorage() {
    try {
      const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        for (const [roomId, room] of Object.entries(saved as Record<string, any>)) {
          if (this.rooms[roomId]) {
            this.rooms[roomId].furniture = room.furniture || this.rooms[roomId].furniture;
            this.rooms[roomId].tiles = room.tiles || this.rooms[roomId].tiles;
            this.rooms[roomId].wallColor = room.wallColor || this.rooms[roomId].wallColor;
          } else {
            this.rooms[roomId] = room;
          }
        }
      }

      // Ensure all NPCs across all rooms are proper NPC class instances
      for (const room of Object.values(this.rooms)) {
        room.npcs = (room.npcs || []).map((n: any) => {
          if (n instanceof NPC) return n;
          const npc = new NPC(n.id, n.name, n.role, n.gx, n.gy, n.customization, n.dialogueTreeId);
          npc.gz = n.gz || 0;
          npc.direction = n.direction || 0;
          return npc;
        });
      }
    } catch (e) {
      console.warn('Failed loading rooms from storage:', e);
    }
  }

  public exportRoomsJSON(): string {
    return JSON.stringify(this.rooms, null, 2);
  }

  public importRoomsJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.rooms = { ...this.rooms, ...parsed };
        this.saveRoomsToStorage();
        if (this.rooms[this.currentRoomId]) {
          this.currentRoom = this.rooms[this.currentRoomId];
        }
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  }
}
