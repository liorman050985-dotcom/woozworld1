import './styles/main.css';
import { Camera } from './engine/Camera';
import { IsometricGrid } from './engine/IsometricGrid';
import { Pathfinding } from './engine/Pathfinding';
import { Player } from './entities/Player';
import { UnitzManager } from './world/UnitzManager';
import { RetroHUD } from './ui/RetroHUD';
import { WardrobeModal } from './ui/WardrobeModal';
import { ShopModal } from './ui/ShopModal';
import { UnitzBuilderUI } from './ui/UnitzBuilderUI';
import { WorldNavigator } from './ui/WorldNavigator';
import { ChatBubbleManager } from './ui/ChatBubble';
import { EmoteWheel } from './ui/EmoteWheel';
import { DialogueBox } from './ui/DialogueBox';
import { FashionMinigame } from './ui/FashionMinigame';
import { TriviaMinigame } from './ui/TriviaMinigame';
import { ProfileModal } from './ui/ProfileModal';
import { AvatarContextMenu } from './ui/AvatarContextMenu';
import { MultiplayerEngine } from './engine/MultiplayerEngine';
import { audioEngine } from './engine/AudioEngine';
import { FURNITURE_CATALOG } from './data/FurnitureItems';

class WoozOfflineGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private player: Player;
  private unitzManager: UnitzManager;
  private multiplayer: MultiplayerEngine;
  private hud: RetroHUD;
  private wardrobeModal: WardrobeModal;
  private shopModal: ShopModal;
  private builderUI: UnitzBuilderUI;
  private navigatorModal: WorldNavigator;
  private chatBubbleManager: ChatBubbleManager;
  private emoteWheel: EmoteWheel;
  private dialogueBox: DialogueBox;
  private fashionMinigame: FashionMinigame;
  private triviaMinigame: TriviaMinigame;
  private profileModal: ProfileModal;
  private contextMenu: AvatarContextMenu;

  private lastTime: number = 0;

  constructor() {
    const canvasContainer = document.getElementById('game-canvas-container')!;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game-canvas';
    canvasContainer.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.camera = new Camera();
    this.player = new Player();
    this.unitzManager = new UnitzManager();
    this.chatBubbleManager = new ChatBubbleManager();
    this.multiplayer = new MultiplayerEngine(this.player);

    // Modals & UI
    this.wardrobeModal = new WardrobeModal(this.player, () => {
      this.hud.updatePortrait();
      this.multiplayer.broadcast({
        type: 'outfit',
        senderId: this.multiplayer.myId,
        roomId: this.unitzManager.currentRoomId,
        customization: this.player.customization
      });
    });
    this.shopModal = new ShopModal(this.player);
    this.builderUI = new UnitzBuilderUI(this.unitzManager);
    this.navigatorModal = new WorldNavigator(this.unitzManager, this.player, () => {
      this.hud.updateRoomTitle(this.unitzManager.currentRoom.name);
      this.multiplayer.changeRoom(this.unitzManager.currentRoomId);
    });
    this.emoteWheel = new EmoteWheel(this.player, (anim) => {
      this.chatBubbleManager.addBubble(this.player.id, this.player.name, `*${anim.toUpperCase()}*`, this.player.screenPos.x, this.player.screenPos.y, '#ffd54f', true);
      this.multiplayer.broadcast({
        type: 'emote',
        senderId: this.multiplayer.myId,
        roomId: this.unitzManager.currentRoomId,
        animation: anim
      });
    });
    this.dialogueBox = new DialogueBox();
    this.fashionMinigame = new FashionMinigame(this.player);
    this.triviaMinigame = new TriviaMinigame(this.player);
    this.profileModal = new ProfileModal(this.player, (newName) => {
      const nameEl = document.querySelector('.player-name-text');
      if (nameEl) nameEl.textContent = newName;
      this.multiplayer.broadcast({
        type: 'join',
        senderId: this.multiplayer.myId,
        roomId: this.unitzManager.currentRoomId,
        name: this.player.name,
        level: this.player.level,
        gx: this.player.gx,
        gy: this.player.gy,
        gz: this.player.gz,
        direction: this.player.direction,
        customization: this.player.customization
      });
    });
    this.contextMenu = new AvatarContextMenu();

    this.hud = new RetroHUD(this.player, this.unitzManager);
    const hudContainer = document.getElementById('hud-overlay-container')!;
    this.hud.render(hudContainer);

    this.bindHUDCallbacks();
    this.bindCanvasInput();
    this.bindKeyboardShortcuts();

    // Start multiplayer immediately on page load
    this.multiplayer.init(this.unitzManager.currentRoomId);

    // Start background music on first interaction
    document.addEventListener('click', () => {
      audioEngine.startBackgroundMusic(this.unitzManager.currentRoom.defaultMusicTrack);
    }, { once: true });

    this.multiplayer.onPlayerChat = (senderId, name, text, worldX, worldY) => {
      this.chatBubbleManager.addBubble(senderId, name, text, worldX, worldY, undefined, false);
    };

    this.multiplayer.onConnectionCountChange = (count) => {
      const roomTitle = this.unitzManager.currentRoom.name;
      this.hud.updateRoomTitle(`${roomTitle} (🟢 ${count} Online)`);
    };

    // Initial camera position centered on player
    this.camera.follow(this.player.screenPos.x, this.player.screenPos.y, false);

    // Start Game Loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private bindHUDCallbacks() {
    this.hud.onOpenWardrobe = () => this.wardrobeModal.open();
    this.hud.onOpenColorWheel = () => this.wardrobeModal.open();
    this.hud.onOpenProfile = () => this.profileModal.open();
    this.hud.onOpenShop = () => this.shopModal.open();
    this.hud.onOpenNavigator = () => this.navigatorModal.open();
    this.hud.onToggleBuildMode = () => this.builderUI.toggle();
    this.hud.onToggleEmotes = () => this.emoteWheel.toggle();

    this.hud.onSendChatMessage = (text) => {
      this.chatBubbleManager.addBubble(this.player.id, this.player.name, text, this.player.screenPos.x, this.player.screenPos.y, undefined, true);
      this.multiplayer.broadcast({
        type: 'chat',
        senderId: this.multiplayer.myId,
        roomId: this.unitzManager.currentRoomId,
        name: this.player.name,
        text
      });

      // Check if nearby NPCs should react
      for (const npc of this.unitzManager.currentRoom.npcs) {
        const dist = Math.hypot(npc.gx - this.player.gx, npc.gy - this.player.gy);
        if (dist <= 3 && Math.random() > 0.4) {
          window.setTimeout(() => {
            npc.speak(`@${this.player.name} Love it! ✨`);
            this.chatBubbleManager.addBubble(npc.id, npc.name, `@${this.player.name} Love it! ✨`, npc.screenPos.x, npc.screenPos.y, '#f8bbd0');
          }, 1000);
        }
      }
    };
  }

  private bindCanvasInput() {
    this.canvas.addEventListener('mousemove', (e) => {
      const world = this.camera.screenToWorld(e.clientX, e.clientY, this.canvas.width, this.canvas.height);
      const grid = IsometricGrid.screenToGrid(world.x, world.y);
      if (
        grid.gx >= 0 &&
        grid.gx < this.unitzManager.currentRoom.width &&
        grid.gy >= 0 &&
        grid.gy < this.unitzManager.currentRoom.height
      ) {
        this.unitzManager.hoveredTile = grid;
      } else {
        this.unitzManager.hoveredTile = null;
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const world = this.camera.screenToWorld(e.clientX, e.clientY, this.canvas.width, this.canvas.height);
      const grid = IsometricGrid.screenToGrid(world.x, world.y);

      if (
        grid.gx < 0 ||
        grid.gx >= this.unitzManager.currentRoom.width ||
        grid.gy < 0 ||
        grid.gy >= this.unitzManager.currentRoom.height
      ) {
        return;
      }

      // BUILD MODE LOGIC
      if (this.unitzManager.isBuildMode) {
        if (this.unitzManager.selectedBuildDefId) {
          // Place furniture
          const placed = this.unitzManager.placeFurniture(this.unitzManager.selectedBuildDefId, grid.gx, grid.gy);
          if (placed) {
            audioEngine.playFurnitureSnap();
            this.builderUI.render();
          }
        } else if (this.unitzManager.paintTileType) {
          // Paint floor tile
          audioEngine.playPop();
          this.unitzManager.paintTile(grid.gx, grid.gy, this.unitzManager.paintTileType);
        } else {
          // Select placed furniture to rotate / delete / elevate
          const clickedF = this.unitzManager.getFurnitureAt(grid.gx, grid.gy);
          this.unitzManager.selectedPlacedFurniture = clickedF;
          this.builderUI.render();
        }
        return;
      }

      // REGULAR GAMEPLAY MODE LOGIC
      // 1. Check if clicked an NPC
      const clickedNPC = this.unitzManager.getNPCAt(grid.gx, grid.gy);
      if (clickedNPC) {
        audioEngine.playClick();
        this.contextMenu.openFor(
          { name: clickedNPC.name, role: clickedNPC.role },
          e.clientX,
          e.clientY,
          (action, name) => {
            if (action === 'profile' || action === 'trade') {
              if (clickedNPC.dialogueTreeId) {
                this.dialogueBox.openDialogue(clickedNPC.dialogueTreeId, (act) => {
                  if (act === 'startFashion') this.fashionMinigame.start(() => {});
                  else if (act === 'startTrivia') this.triviaMinigame.start(() => {});
                  else if (act === 'changeMusic') {
                    const tName = audioEngine.nextTrack();
                    this.hud.updateRoomTitle(`${this.unitzManager.currentRoom.name} [♫ ${tName.split(' ')[0]}]`);
                  }
                });
              } else {
                clickedNPC.speak(`Hey! Nice to meet you! ✨`);
              }
            } else if (action === 'whisper') {
              clickedNPC.speak(`*whispers to ${this.player.name}* You rock! 💖`);
            } else if (action === 'wave') {
              this.player.setAnimation('wave');
              clickedNPC.speak(`*waves back happily* 👋`);
            } else if (action === 'friend') {
              audioEngine.playEmoteChime();
              clickedNPC.speak(`Added to your Besties list! ⭐`);
            }
          }
        );
        return;
      }

      // 2. Check if clicked interactive furniture
      const clickedFurn = this.unitzManager.getFurnitureAt(grid.gx, grid.gy);
      if (clickedFurn) {
        const def = FURNITURE_CATALOG.find(d => d.id === clickedFurn.defId);
        if (def && def.isSeat) {
          // Walk to chair and sit down
          const path = Pathfinding.findPath(
            this.player.gx,
            this.player.gy,
            grid.gx,
            grid.gy,
            (x, y) => this.unitzManager.isTileWalkable(x, y),
            this.unitzManager.currentRoom.width,
            this.unitzManager.currentRoom.height
          );
          if (path.length > 0) {
            this.player.setPath(path);
            this.multiplayer.broadcast({
              type: 'move',
              senderId: this.multiplayer.myId,
              roomId: this.unitzManager.currentRoomId,
              gx: grid.gx,
              gy: grid.gy,
              path,
              direction: this.player.direction
            });
          } else {
            this.player.sit(clickedFurn.instanceId, { x: grid.gx, y: grid.gy }, def.seatOffset?.z || 8);
          }
          return;
        } else if (def && def.interactionType === 'toggleLight') {
          clickedFurn.isLit = clickedFurn.isLit === false ? true : false;
          audioEngine.playClick();
          return;
        } else if (def && def.interactionType === 'playMusic') {
          const name = audioEngine.nextTrack();
          audioEngine.playPop();
          this.chatBubbleManager.addBubble(this.player.id, this.player.name, `♫ Now Playing: ${name}`, this.player.screenPos.x, this.player.screenPos.y, undefined, true);
          return;
        } else if (def && def.interactionType === 'arcade') {
          this.triviaMinigame.start(() => {});
          return;
        } else if (def && def.interactionType === 'runway') {
          this.fashionMinigame.start(() => {});
          return;
        }
      }

      // 3. Normal Walk Pathfinding
      const path = Pathfinding.findPath(
        this.player.gx,
        this.player.gy,
        grid.gx,
        grid.gy,
        (x, y) => this.unitzManager.isTileWalkable(x, y),
        this.unitzManager.currentRoom.width,
        this.unitzManager.currentRoom.height
      );

      if (path.length > 0) {
        this.player.setPath(path);
        this.multiplayer.broadcast({
          type: 'move',
          senderId: this.multiplayer.myId,
          roomId: this.unitzManager.currentRoomId,
          gx: grid.gx,
          gy: grid.gy,
          path,
          direction: this.player.direction
        });
      }
    });

    // Zoom wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
      this.camera.setZoom(this.camera.targetZoom + zoomDelta);
    }, { passive: false });
  }

  private bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (this.unitzManager.isBuildMode && this.unitzManager.selectedPlacedFurniture) {
        if (e.key === 'r' || e.key === 'R') {
          this.unitzManager.rotateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId);
          audioEngine.playClick();
        } else if (e.key === 'q' || e.key === 'Q') {
          this.unitzManager.elevateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId, -4);
          audioEngine.playClick();
        } else if (e.key === 'e' || e.key === 'E') {
          this.unitzManager.elevateFurniture(this.unitzManager.selectedPlacedFurniture.instanceId, 4);
          audioEngine.playClick();
        } else if (e.key === 'Delete' || e.key === 'x' || e.key === 'X') {
          this.unitzManager.removeFurniture(this.unitzManager.selectedPlacedFurniture.instanceId);
          audioEngine.playPop();
          this.builderUI.render();
        }
      }

      if (e.key === 'Escape') {
        this.wardrobeModal.close();
        this.shopModal.close();
        this.navigatorModal.close();
        this.dialogueBox.close();
        this.emoteWheel.hide();
        this.contextMenu.close();
      }
    });
  }

  private gameLoop(currentTime: number) {
    if (!this.lastTime) this.lastTime = currentTime;
    const deltaTime = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // 1. Update entities & mechanics
    this.player.update(deltaTime, () => audioEngine.playStep());
    this.multiplayer.update(deltaTime);

    // Update NPCs
    for (const npc of this.unitzManager.currentRoom.npcs) {
      npc.update(
        deltaTime,
        () => {
          const rx = Math.floor(Math.random() * this.unitzManager.currentRoom.width);
          const ry = Math.floor(Math.random() * this.unitzManager.currentRoom.height);
          return this.unitzManager.isTileWalkable(rx, ry) ? { x: rx, y: ry } : null;
        },
        (sx, sy, tx, ty) => Pathfinding.findPath(
          sx, sy, tx, ty,
          (x, y) => this.unitzManager.isTileWalkable(x, y),
          this.unitzManager.currentRoom.width,
          this.unitzManager.currentRoom.height
        )
      );

      // Sync NPC speech bubbles
      if (npc.activeSpeechBubble) {
        this.chatBubbleManager.updateSenderPos(npc.id, npc.screenPos.x, npc.screenPos.y);
      }
    }

    // Sync remote player speech bubble positions
    for (const rPlayer of this.multiplayer.remotePlayers.values()) {
      this.chatBubbleManager.updateSenderPos(rPlayer.id, rPlayer.screenPos.x, rPlayer.screenPos.y);
    }

    // Sync player speech bubble position
    this.chatBubbleManager.updateSenderPos(this.player.id, this.player.screenPos.x, this.player.screenPos.y);
    this.chatBubbleManager.update(deltaTime);

    // Follow player with camera
    this.camera.follow(this.player.screenPos.x, this.player.screenPos.y);
    this.camera.update(deltaTime);

    // 2. Render Frame
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.camera.applyTransform(this.ctx, this.canvas.width, this.canvas.height);

    // Render Room & Entities (including Remote Players)
    this.unitzManager.render(this.ctx, this.player, this.multiplayer.remotePlayers);

    // Render Floating Comic Speech Bubbles
    this.chatBubbleManager.render(this.ctx);

    this.ctx.restore();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Boot the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new WoozOfflineGame();
});
