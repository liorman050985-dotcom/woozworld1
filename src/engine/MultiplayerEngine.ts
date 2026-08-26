import Peer, { DataConnection } from 'peerjs';
import { Player } from '../entities/Player';
import { AvatarCustomization, Direction, AvatarAnimation } from '../entities/AvatarRenderer';
import { IsometricGrid, Point2D } from './IsometricGrid';

export interface RemotePlayer {
  peerId: string;
  name: string;
  level: number;
  roomId: string;
  gx: number;
  gy: number;
  gz: number;
  screenPos: Point2D;
  direction: Direction;
  animation: AvatarAnimation;
  animFrame: number;
  customization: AvatarCustomization;
  path: { x: number; y: number }[];
  moveSpeed: number;
  subTileProgress: number;
}

export type NetworkPacket =
  | { type: 'join'; roomId: string; name: string; level: number; gx: number; gy: number; gz: number; direction: Direction; customization: AvatarCustomization }
  | { type: 'move'; roomId: string; gx: number; gy: number; path: { x: number; y: number }[]; direction: Direction }
  | { type: 'chat'; roomId: string; text: string }
  | { type: 'emote'; roomId: string; animation: AvatarAnimation }
  | { type: 'outfit'; roomId: string; customization: AvatarCustomization }
  | { type: 'leave'; roomId: string };

export class MultiplayerEngine {
  public peer: Peer | null = null;
  public myPeerId: string = '';
  public isConnected: boolean = false;
  public remotePlayers: Map<string, RemotePlayer> = new Map();
  private connections: Map<string, DataConnection> = new Map();
  private currentRoomId: string = 'central_plaza';
  private player: Player;

  public onPlayerChat: (name: string, text: string, worldX: number, worldY: number) => void = () => {};
  public onConnectionCountChange: (count: number) => void = () => {};

  constructor(player: Player) {
    this.player = player;
  }

  public init(roomId: string = 'central_plaza') {
    this.currentRoomId = roomId;

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    this.myPeerId = `wzw_${this.player.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${randomSuffix}`;

    try {
      // Connect to global PeerJS WebRTC cloud relay (Free, public, zero-setup)
      this.peer = new Peer(this.myPeerId, {
        debug: 1
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        this.isConnected = true;
        this.joinRoomSwarm(this.currentRoomId);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('Multiplayer Peer notice:', err.type);
      });
    } catch (e) {
      console.warn('WebRTC init fallback:', e);
    }
  }

  public changeRoom(newRoomId: string) {
    this.broadcast({ type: 'leave', roomId: this.currentRoomId });
    this.currentRoomId = newRoomId;

    // Filter remote players to only those in current room
    for (const [id, rPlayer] of this.remotePlayers.entries()) {
      if (rPlayer.roomId !== newRoomId) {
        this.remotePlayers.delete(id);
      }
    }
    this.onConnectionCountChange(this.remotePlayers.size + 1);

    this.broadcast({
      type: 'join',
      roomId: this.currentRoomId,
      name: this.player.name,
      level: this.player.level,
      gx: this.player.gx,
      gy: this.player.gy,
      gz: this.player.gz,
      direction: this.player.direction,
      customization: this.player.customization
    });
  }

  private joinRoomSwarm(roomId: string) {
    // Broadcast join to existing peers
    this.broadcast({
      type: 'join',
      roomId,
      name: this.player.name,
      level: this.player.level,
      gx: this.player.gx,
      gy: this.player.gy,
      gz: this.player.gz,
      direction: this.player.direction,
      customization: this.player.customization
    });

    // Auto-discover room peers via lobby broadcast channel if available in same browser/tab
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(`wooz_swarm_${roomId}`);
        bc.postMessage({ type: 'announce', peerId: this.myPeerId });
        bc.onmessage = (e) => {
          if (e.data?.type === 'announce' && e.data.peerId !== this.myPeerId) {
            this.connectToPeer(e.data.peerId);
          }
        };
      }
    } catch (e) {}
  }

  public connectToPeer(peerId: string) {
    if (!this.peer || this.connections.has(peerId) || peerId === this.myPeerId) return;

    const conn = this.peer.connect(peerId, { reliable: true });
    this.setupConnection(conn);
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);

      // Send my state to the new peer
      conn.send({
        type: 'join',
        roomId: this.currentRoomId,
        name: this.player.name,
        level: this.player.level,
        gx: this.player.gx,
        gy: this.player.gy,
        gz: this.player.gz,
        direction: this.player.direction,
        customization: this.player.customization
      } as NetworkPacket);
    });

    conn.on('data', (data) => {
      this.handlePacket(conn.peer, data as NetworkPacket);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.remotePlayers.delete(conn.peer);
      this.onConnectionCountChange(this.remotePlayers.size + 1);
    });
  }

  private handlePacket(senderPeerId: string, packet: NetworkPacket) {
    if (!packet || typeof packet !== 'object') return;

    if (packet.type === 'join') {
      if (packet.roomId === this.currentRoomId) {
        const rPlayer: RemotePlayer = {
          peerId: senderPeerId,
          name: packet.name,
          level: packet.level,
          roomId: packet.roomId,
          gx: packet.gx,
          gy: packet.gy,
          gz: packet.gz,
          screenPos: IsometricGrid.gridToScreen(packet.gx, packet.gy, packet.gz),
          direction: packet.direction,
          animation: 'idle',
          animFrame: 0,
          customization: packet.customization,
          path: [],
          moveSpeed: 3.5,
          subTileProgress: 0
        };
        this.remotePlayers.set(senderPeerId, rPlayer);
        this.onConnectionCountChange(this.remotePlayers.size + 1);
      }
    } else if (packet.type === 'move') {
      const rPlayer = this.remotePlayers.get(senderPeerId);
      if (rPlayer && packet.roomId === this.currentRoomId) {
        rPlayer.path = packet.path;
        rPlayer.direction = packet.direction;
        rPlayer.subTileProgress = 0;
        rPlayer.animation = 'walk';
      }
    } else if (packet.type === 'chat') {
      const rPlayer = this.remotePlayers.get(senderPeerId);
      if (rPlayer && packet.roomId === this.currentRoomId) {
        this.onPlayerChat(rPlayer.name, packet.text, rPlayer.screenPos.x, rPlayer.screenPos.y);
      }
    } else if (packet.type === 'emote') {
      const rPlayer = this.remotePlayers.get(senderPeerId);
      if (rPlayer && packet.roomId === this.currentRoomId) {
        rPlayer.animation = packet.animation;
      }
    } else if (packet.type === 'outfit') {
      const rPlayer = this.remotePlayers.get(senderPeerId);
      if (rPlayer && packet.roomId === this.currentRoomId) {
        rPlayer.customization = packet.customization;
      }
    } else if (packet.type === 'leave') {
      this.remotePlayers.delete(senderPeerId);
      this.onConnectionCountChange(this.remotePlayers.size + 1);
    }
  }

  public broadcast(packet: NetworkPacket) {
    for (const conn of this.connections.values()) {
      if (conn.open) {
        try {
          conn.send(packet);
        } catch (e) {}
      }
    }
  }

  public update(deltaTime: number) {
    for (const rPlayer of this.remotePlayers.values()) {
      rPlayer.animFrame += deltaTime * 60;

      if (rPlayer.path.length > 0) {
        rPlayer.animation = 'walk';
        const target = rPlayer.path[0];
        rPlayer.subTileProgress += rPlayer.moveSpeed * deltaTime;

        if (rPlayer.subTileProgress >= 1.0) {
          rPlayer.gx = target.x;
          rPlayer.gy = target.y;
          rPlayer.path.shift();
          rPlayer.subTileProgress = 0;

          if (rPlayer.path.length === 0) {
            rPlayer.animation = 'idle';
          }
        }

        const currScreen = IsometricGrid.gridToScreen(rPlayer.gx, rPlayer.gy, rPlayer.gz);
        if (rPlayer.path.length > 0) {
          const nextScreen = IsometricGrid.gridToScreen(rPlayer.path[0].x, rPlayer.path[0].y, rPlayer.gz);
          rPlayer.screenPos.x = currScreen.x + (nextScreen.x - currScreen.x) * rPlayer.subTileProgress;
          rPlayer.screenPos.y = currScreen.y + (nextScreen.y - currScreen.y) * rPlayer.subTileProgress;
        } else {
          rPlayer.screenPos = currScreen;
        }
      } else {
        rPlayer.screenPos = IsometricGrid.gridToScreen(rPlayer.gx, rPlayer.gy, rPlayer.gz);
      }
    }
  }
}
