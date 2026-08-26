import mqtt from 'mqtt';
import { Player } from '../entities/Player';
import { AvatarCustomization, Direction, AvatarAnimation } from '../entities/AvatarRenderer';
import { IsometricGrid, Point2D } from './IsometricGrid';

export interface RemotePlayer {
  id: string;
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
  lastSeen: number;
}

export type NetworkPacket =
  | { type: 'join'; senderId: string; roomId: string; name: string; level: number; gx: number; gy: number; gz: number; direction: Direction; customization: AvatarCustomization }
  | { type: 'heartbeat'; senderId: string; roomId: string; name: string; level: number; gx: number; gy: number; gz: number; direction: Direction; customization: AvatarCustomization; animation: AvatarAnimation }
  | { type: 'move'; senderId: string; roomId: string; gx: number; gy: number; path: { x: number; y: number }[]; direction: Direction }
  | { type: 'chat'; senderId: string; roomId: string; name: string; text: string }
  | { type: 'emote'; senderId: string; roomId: string; animation: AvatarAnimation }
  | { type: 'outfit'; senderId: string; roomId: string; customization: AvatarCustomization }
  | { type: 'leave'; senderId: string; roomId: string }
  | { type: 'trade_req'; senderId: string; targetId: string; senderName: string; roomId: string }
  | { type: 'trade_accept'; senderId: string; targetId: string; senderName: string; roomId: string }
  | { type: 'trade_decline'; senderId: string; targetId: string; roomId: string }
  | { type: 'trade_update'; senderId: string; targetId: string; offer: any; roomId: string }
  | { type: 'trade_confirm'; senderId: string; targetId: string; roomId: string }
  | { type: 'trade_cancel'; senderId: string; targetId: string; roomId: string };

export class MultiplayerEngine {
  public myId: string = '';
  public isConnected: boolean = false;
  public remotePlayers: Map<string, RemotePlayer> = new Map();
  private currentRoomId: string = 'central_plaza';
  private player: Player;
  private mqttClient: mqtt.MqttClient | null = null;
  private localChannel: BroadcastChannel | null = null;
  private heartbeatInterval: number | null = null;

  public onPlayerChat: (senderId: string, name: string, text: string, worldX: number, worldY: number) => void = () => {};
  public onConnectionCountChange: (count: number) => void = () => {};

  public onTradeRequestReceived: (senderId: string, senderName: string) => void = () => {};
  public onTradeAccepted: (senderId: string, senderName: string) => void = () => {};
  public onTradeDeclined: (senderId: string) => void = () => {};
  public onTradeUpdated: (senderId: string, offer: any) => void = () => {};
  public onTradeConfirmed: (senderId: string) => void = () => {};
  public onTradeCancelled: (senderId: string) => void = () => {};

  constructor(player: Player) {
    this.player = player;
    this.myId = 'wzw_' + Math.random().toString(36).substring(2, 9);
  }

  public init(roomId: string = 'central_plaza') {
    this.currentRoomId = roomId;

    // 1. Local BroadcastChannel for instant local multi-tab sync
    try {
      if ('BroadcastChannel' in window) {
        this.localChannel = new BroadcastChannel('woozworld_global_mesh');
        this.localChannel.onmessage = (event) => {
          this.handlePacket(event.data);
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel unavailable:', e);
    }

    // 2. Global Public Cloud WebSocket Broker (EMQX Public WSS)
    try {
      const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: this.myId,
        clean: true,
        reconnectPeriod: 3000
      });

      this.mqttClient.on('connect', () => {
        this.isConnected = true;
        this.subscribeToRoom(this.currentRoomId);
        this.sendJoin();
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const packet: NetworkPacket = JSON.parse(message.toString());
          this.handlePacket(packet);
        } catch (e) {}
      });

      this.mqttClient.on('error', (err) => {
        console.warn('MQTT Connection Notice:', err);
      });
    } catch (e) {
      console.warn('MQTT Init fallback:', e);
    }

    // 3. Heartbeat loop every 2 seconds
    if (this.heartbeatInterval) window.clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat();
      this.cleanupStalePlayers();
    }, 2000);

    // Send initial join
    this.sendJoin();
  }

  private subscribeToRoom(roomId: string) {
    if (this.mqttClient && this.mqttClient.connected) {
      const topic = `woozworld/rooms/${roomId}`;
      this.mqttClient.subscribe(topic, { qos: 0 });
    }
  }

  private unsubscribeFromRoom(roomId: string) {
    if (this.mqttClient && this.mqttClient.connected) {
      const topic = `woozworld/rooms/${roomId}`;
      this.mqttClient.unsubscribe(topic);
    }
  }

  public changeRoom(newRoomId: string) {
    this.broadcast({ type: 'leave', senderId: this.myId, roomId: this.currentRoomId });
    this.unsubscribeFromRoom(this.currentRoomId);

    this.currentRoomId = newRoomId;
    this.remotePlayers.clear();
    this.onConnectionCountChange(1);

    this.subscribeToRoom(this.currentRoomId);
    this.sendJoin();
  }

  private sendJoin() {
    this.broadcast({
      type: 'join',
      senderId: this.myId,
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

  private sendHeartbeat() {
    this.broadcast({
      type: 'heartbeat',
      senderId: this.myId,
      roomId: this.currentRoomId,
      name: this.player.name,
      level: this.player.level,
      gx: this.player.gx,
      gy: this.player.gy,
      gz: this.player.gz,
      direction: this.player.direction,
      customization: this.player.customization,
      animation: this.player.animation
    });
  }

  public broadcast(packet: NetworkPacket) {
    // 1. Broadcast locally
    if (this.localChannel) {
      try {
        this.localChannel.postMessage(packet);
      } catch (e) {}
    }

    // 2. Broadcast via MQTT Cloud WebSocket
    if (this.mqttClient && this.mqttClient.connected) {
      const topic = `woozworld/rooms/${packet.roomId}`;
      try {
        this.mqttClient.publish(topic, JSON.stringify(packet), { qos: 0 });
      } catch (e) {}
    }
  }

  private handlePacket(packet: NetworkPacket) {
    if (!packet || typeof packet !== 'object' || packet.senderId === this.myId) return;
    if (packet.roomId !== this.currentRoomId) return;

    const now = Date.now();

    if (packet.type === 'join' || packet.type === 'heartbeat') {
      let rPlayer = this.remotePlayers.get(packet.senderId);
      if (!rPlayer) {
        rPlayer = {
          id: packet.senderId,
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
          subTileProgress: 0,
          lastSeen: now
        };
        this.remotePlayers.set(packet.senderId, rPlayer);
        this.onConnectionCountChange(this.remotePlayers.size + 1);

        // If it was a join, respond with our heartbeat so they register us immediately
        if (packet.type === 'join') {
          this.sendHeartbeat();
        }
      } else {
        rPlayer.name = packet.name;
        rPlayer.level = packet.level;
        rPlayer.customization = packet.customization;
        rPlayer.lastSeen = now;
        if (packet.type === 'heartbeat' && rPlayer.path.length === 0) {
          rPlayer.animation = packet.animation;
        }
      }
    } else if (packet.type === 'move') {
      const rPlayer = this.remotePlayers.get(packet.senderId);
      if (rPlayer) {
        rPlayer.path = packet.path;
        rPlayer.direction = packet.direction;
        rPlayer.subTileProgress = 0;
        rPlayer.animation = 'walk';
        rPlayer.lastSeen = now;
      }
    } else if (packet.type === 'chat') {
      const rPlayer = this.remotePlayers.get(packet.senderId);
      const worldPos = rPlayer ? rPlayer.screenPos : IsometricGrid.gridToScreen(5, 5);
      this.onPlayerChat(packet.senderId, packet.name, packet.text, worldPos.x, worldPos.y);
      if (rPlayer) rPlayer.lastSeen = now;
    } else if (packet.type === 'emote') {
      const rPlayer = this.remotePlayers.get(packet.senderId);
      if (rPlayer) {
        rPlayer.animation = packet.animation;
        rPlayer.lastSeen = now;
      }
    } else if (packet.type === 'outfit') {
      const rPlayer = this.remotePlayers.get(packet.senderId);
      if (rPlayer) {
        rPlayer.customization = packet.customization;
        rPlayer.lastSeen = now;
      }
    } else if (packet.type === 'leave') {
      this.remotePlayers.delete(packet.senderId);
      this.onConnectionCountChange(this.remotePlayers.size + 1);
    } else if (packet.type === 'trade_req') {
      if (packet.targetId === this.myId) {
        this.onTradeRequestReceived(packet.senderId, packet.senderName);
      }
    } else if (packet.type === 'trade_accept') {
      if (packet.targetId === this.myId) {
        this.onTradeAccepted(packet.senderId, packet.senderName);
      }
    } else if (packet.type === 'trade_decline') {
      if (packet.targetId === this.myId) {
        this.onTradeDeclined(packet.senderId);
      }
    } else if (packet.type === 'trade_update') {
      if (packet.targetId === this.myId) {
        this.onTradeUpdated(packet.senderId, packet.offer);
      }
    } else if (packet.type === 'trade_confirm') {
      if (packet.targetId === this.myId) {
        this.onTradeConfirmed(packet.senderId);
      }
    } else if (packet.type === 'trade_cancel') {
      if (packet.targetId === this.myId) {
        this.onTradeCancelled(packet.senderId);
      }
    }
  }

  private cleanupStalePlayers() {
    const now = Date.now();
    let changed = false;
    for (const [id, rPlayer] of this.remotePlayers.entries()) {
      if (now - rPlayer.lastSeen > 7000) {
        this.remotePlayers.delete(id);
        changed = true;
      }
    }
    if (changed) {
      this.onConnectionCountChange(this.remotePlayers.size + 1);
    }
  }

  public update(deltaTime: number) {
    for (const rPlayer of this.remotePlayers.values()) {
      rPlayer.animFrame += deltaTime * 60;

      if (rPlayer.path.length > 0) {
        rPlayer.animation = 'walk';
        const target = rPlayer.path[0];
        const dx = target.x - rPlayer.gx;
        const dy = target.y - rPlayer.gy;

        if (dx > 0 && dy === 0) rPlayer.direction = 0;
        else if (dx > 0 && dy > 0) rPlayer.direction = 1;
        else if (dx === 0 && dy > 0) rPlayer.direction = 2;
        else if (dx < 0 && dy > 0) rPlayer.direction = 3;
        else if (dx < 0 && dy === 0) rPlayer.direction = 4;
        else if (dx < 0 && dy < 0) rPlayer.direction = 5;
        else if (dx === 0 && dy < 0) rPlayer.direction = 6;
        else if (dx > 0 && dy < 0) rPlayer.direction = 7;

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
