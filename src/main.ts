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
import { TradeModal } from './ui/TradeModal';
import { MultiplayerEngine } from './engine/MultiplayerEngine';
import { ThreeWorldEngine } from './engine/ThreeWorldEngine';
import { Pathfinding } from './engine/Pathfinding';
import { audioEngine } from './engine/AudioEngine';

class WoozOfflineGame {
  private player: Player;
  private unitzManager: UnitzManager;
  private multiplayer: MultiplayerEngine;
  private threeEngine: ThreeWorldEngine;
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
  private tradeModal: TradeModal;

  private lastTime: number = 0;

  constructor() {
    const canvasContainer = document.getElementById('game-canvas-container')!;
    canvasContainer.innerHTML = ''; // Clear 2D canvas

    this.player = new Player();
    this.unitzManager = new UnitzManager();
    this.chatBubbleManager = new ChatBubbleManager();
    this.multiplayer = new MultiplayerEngine(this.player);

    // Initialize 3D WebGL World Engine
    this.threeEngine = new ThreeWorldEngine(
      canvasContainer,
      this.player,
      this.unitzManager,
      this.multiplayer
    );

    // Modals & UI
    this.wardrobeModal = new WardrobeModal(this.player, () => {
      this.hud.updatePortrait();
      this.threeEngine.rebuildRoom3D();
      this.multiplayer.broadcast({
        type: 'outfit',
        senderId: this.multiplayer.myId,
        roomId: this.unitzManager.currentRoomId,
        customization: this.player.customization
      });
    });

    this.shopModal = new ShopModal(this.player);

    this.builderUI = new UnitzBuilderUI(this.unitzManager);
    this.builderUI.onGoToPersonalUnitz = () => {
      this.unitzManager.switchRoom('personal_penthouse');
      this.hud.updateRoomTitle(this.unitzManager.currentRoom.name);
      this.multiplayer.changeRoom(this.unitzManager.currentRoomId);
      this.threeEngine.rebuildRoom3D();
      this.builderUI.render();
    };

    this.navigatorModal = new WorldNavigator(this.unitzManager, this.player, () => {
      this.hud.updateRoomTitle(this.unitzManager.currentRoom.name);
      this.multiplayer.changeRoom(this.unitzManager.currentRoomId);
      this.threeEngine.rebuildRoom3D();
    });

    this.emoteWheel = new EmoteWheel(this.player, (anim) => {
      this.chatBubbleManager.addBubble(this.player.id, this.player.name, `*${anim.toUpperCase()}*`, 0, 0, '#ffd54f', true);
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
      this.hud.updatePlayerName(newName);
      this.threeEngine.rebuildRoom3D();
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
    this.tradeModal = new TradeModal(this.player);

    this.tradeModal.onSendTradeUpdate = (targetId, offer) => {
      this.multiplayer.broadcast({
        type: 'trade_update',
        senderId: this.multiplayer.myId,
        targetId,
        offer,
        roomId: this.unitzManager.currentRoomId
      });
    };

    this.tradeModal.onSendTradeConfirm = (targetId) => {
      this.multiplayer.broadcast({
        type: 'trade_confirm',
        senderId: this.multiplayer.myId,
        targetId,
        roomId: this.unitzManager.currentRoomId
      });
    };

    this.tradeModal.onSendTradeCancel = (targetId) => {
      this.multiplayer.broadcast({
        type: 'trade_cancel',
        senderId: this.multiplayer.myId,
        targetId,
        roomId: this.unitzManager.currentRoomId
      });
    };

    this.hud = new RetroHUD(this.player, this.unitzManager);
    const hudContainer = document.getElementById('hud-overlay-container')!;
    this.hud.render(hudContainer);

    this.bindHUDCallbacks();
    this.bind3DInputs();
    this.bindKeyboardShortcuts();

    // Start multiplayer immediately on page load
    this.multiplayer.init(this.unitzManager.currentRoomId);

    // Trade Multiplayer Listeners
    this.multiplayer.onTradeRequestReceived = (senderId, senderName) => {
      audioEngine.playEmoteChime();
      const accept = confirm(`🤝 ${senderName} sent you a trade request! Do you want to trade ItemZ, Wooz & Beex?`);
      if (accept) {
        this.multiplayer.broadcast({
          type: 'trade_accept',
          senderId: this.multiplayer.myId,
          targetId: senderId,
          senderName: this.player.name,
          roomId: this.unitzManager.currentRoomId
        });
        this.tradeModal.openTrade(senderId, senderName);
      } else {
        this.multiplayer.broadcast({
          type: 'trade_decline',
          senderId: this.multiplayer.myId,
          targetId: senderId,
          roomId: this.unitzManager.currentRoomId
        });
      }
    };

    this.multiplayer.onTradeAccepted = (senderId, senderName) => {
      audioEngine.playFanfare();
      this.tradeModal.openTrade(senderId, senderName);
    };

    this.multiplayer.onTradeDeclined = () => {
      alert('The trade request was declined.');
    };

    this.multiplayer.onTradeUpdated = (_senderId, offer) => {
      this.tradeModal.updateTheirOffer(offer);
    };

    this.multiplayer.onTradeConfirmed = () => {
      this.tradeModal.handleTheirConfirm();
    };

    this.multiplayer.onTradeCancelled = () => {
      this.tradeModal.close();
      alert('The trade was cancelled by the other player.');
    };

    // Start background music on first interaction
    document.addEventListener('click', () => {
      audioEngine.startBackgroundMusic(this.unitzManager.currentRoom.defaultMusicTrack);
    }, { once: true });

    this.multiplayer.onPlayerChat = (senderId, name, text, worldX, worldY) => {
      this.chatBubbleManager.addBubble(senderId, name, text, worldX, worldY, undefined, false);
    };

    this.multiplayer.onConnectionCountChange = (count) => {
      const roomTitle = this.unitzManager.currentRoom.name;
      this.hud.updateRoomTitle(`${roomTitle} (🟢 ${count} Online in 3D)`);
    };

    // Start Game Loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private bindHUDCallbacks() {
    this.hud.onOpenWardrobe = () => this.wardrobeModal.open();
    this.hud.onOpenShop = () => this.shopModal.open();
    this.hud.onOpenNavigator = () => this.navigatorModal.open();
    this.hud.onToggleBuildMode = () => {
      this.unitzManager.isBuildMode = !this.unitzManager.isBuildMode;
      this.builderUI.toggle();
    };
    this.hud.onToggleEmotes = () => this.emoteWheel.toggle();
    this.hud.onOpenProfile = () => this.profileModal.open();
    this.hud.onOpenColorWheel = () => this.wardrobeModal.open();

    this.hud.onNameChanged = (newName) => {
      this.threeEngine.rebuildRoom3D();
      this.multiplayer.broadcast({
        type: 'join',
        senderId: this.multiplayer.myId,
        roomId: this.unitzManager.currentRoomId,
        name: newName,
        level: this.player.level,
        gx: this.player.gx,
        gy: this.player.gy,
        gz: this.player.gz,
        direction: this.player.direction,
        customization: this.player.customization
      });
    };

    this.hud.onSendChatMessage = (text) => {
      this.chatBubbleManager.addBubble(this.player.id, this.player.name, text, 0, 0, undefined, true);
      this.multiplayer.broadcast({
        type: 'chat',
        senderId: this.multiplayer.myId,
        roomId: this.unitzManager.currentRoomId,
        name: this.player.name,
        text
      });
    };
  }

  private bind3DInputs() {
    // 1. Walking / Tile Interaction
    this.threeEngine.onTileClicked = (gx, gy) => {
      // Build Mode Placement
      if (this.unitzManager.isBuildMode) {
        if (this.unitzManager.selectedBuildDefId) {
          const placed = this.unitzManager.placeFurniture(this.unitzManager.selectedBuildDefId, gx, gy);
          if (placed) {
            audioEngine.playFurnitureSnap();
            this.builderUI.render();
            this.threeEngine.rebuildRoom3D();
          }
        } else if (this.unitzManager.paintTileType) {
          audioEngine.playPop();
          this.unitzManager.paintTile(gx, gy, this.unitzManager.paintTileType);
          this.threeEngine.rebuildRoom3D();
        }
        return;
      }

      // Normal Walking
      const path = Pathfinding.findPath(
        Math.round(this.player.gx),
        Math.round(this.player.gy),
        gx,
        gy,
        (x, y) => this.unitzManager.isTileWalkable(x, y),
        this.unitzManager.currentRoom.width,
        this.unitzManager.currentRoom.height
      );

      if (path.length > 0) {
        this.player.setPath(path);
        audioEngine.playStep();
        this.multiplayer.broadcast({
          type: 'move',
          senderId: this.multiplayer.myId,
          roomId: this.unitzManager.currentRoomId,
          gx,
          gy,
          path,
          direction: this.player.direction
        });
      }
    };

    // 2. Click Real Multiplayer Player in 3D
    this.threeEngine.onPlayerClicked = (rPlayer, clientX, clientY) => {
      audioEngine.playClick();
      this.contextMenu.openFor(
        { name: rPlayer.name, level: rPlayer.level, isPlayer: true },
        clientX,
        clientY,
        (action) => {
          if (action === 'profile') {
            audioEngine.playFanfare();
            this.profileModal.open({
              name: rPlayer.name,
              level: rPlayer.level,
              customization: rPlayer.customization,
              isSelf: false,
              status: "Live Resident in 3D Woozworld! 🌟",
              wooz: 999999,
              beex: 999999
            });
          } else if (action === 'whisper') {
            const msg = prompt(`Send a private whisper message to ${rPlayer.name}:`);
            if (msg && msg.trim()) {
              this.chatBubbleManager.addBubble(this.player.id, this.player.name, `*whispers to ${rPlayer.name}* ${msg.trim()}`, 0, 0, '#e1bee7', true);
              this.multiplayer.broadcast({
                type: 'chat',
                senderId: this.multiplayer.myId,
                roomId: this.unitzManager.currentRoomId,
                name: this.player.name,
                text: `*whispers to ${rPlayer.name}* ${msg.trim()}`
              });
            }
          } else if (action === 'wave') {
            this.player.setAnimation('wave');
            this.chatBubbleManager.addBubble(this.player.id, this.player.name, `👋 Waves at ${rPlayer.name}!`, 0, 0, '#ffd54f', true);
            this.multiplayer.broadcast({
              type: 'emote',
              senderId: this.multiplayer.myId,
              roomId: this.unitzManager.currentRoomId,
              animation: 'wave'
            });
          } else if (action === 'friend') {
            audioEngine.playEmoteChime();
            this.chatBubbleManager.addBubble(this.player.id, this.player.name, `⭐ Added ${rPlayer.name} to Besties list!`, 0, 0, '#b2ebf2', true);
          } else if (action === 'trade') {
            audioEngine.playPop();
            this.chatBubbleManager.addBubble(this.player.id, this.player.name, `🤝 Sent trade request to ${rPlayer.name}!`, 0, 0, '#ffe082', true);
            this.multiplayer.broadcast({
              type: 'trade_req',
              senderId: this.multiplayer.myId,
              targetId: rPlayer.id,
              senderName: this.player.name,
              roomId: this.unitzManager.currentRoomId
            });
          }
        }
      );
    };
  }

  private keysPressed: Set<string> = new Set();

  private bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'INPUT' || activeEl === 'TEXTAREA') return;

      const keyLower = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(keyLower)) {
        e.preventDefault();
        this.keysPressed.add(keyLower);
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        this.wardrobeModal.open();
      } else if (e.key === 'b' || e.key === 'B') {
        this.unitzManager.isBuildMode = !this.unitzManager.isBuildMode;
        this.builderUI.toggle();
      } else if (e.key === 'e' || e.key === 'E') {
        this.emoteWheel.toggle();
      } else if (e.key === 'n' || e.key === 'N') {
        this.navigatorModal.open();
      } else if (e.key === 'm' || e.key === 'M') {
        audioEngine.toggleMute();
      } else if (e.key === 'p' || e.key === 'P') {
        this.profileModal.open();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.key.toLowerCase());
    });
  }

  private handleKeyboardMovement() {
    if (this.keysPressed.size === 0) return;
    if (this.player.isMoving && this.player.path.length > 0) return;

    let dx = 0;
    let dy = 0;

    if (this.keysPressed.has('w') || this.keysPressed.has('arrowup')) dy -= 1;
    if (this.keysPressed.has('s') || this.keysPressed.has('arrowdown')) dy += 1;
    if (this.keysPressed.has('a') || this.keysPressed.has('arrowleft')) dx -= 1;
    if (this.keysPressed.has('d') || this.keysPressed.has('arrowright')) dx += 1;

    if (dx === 0 && dy === 0) return;

    const nextGx = Math.round(this.player.gx) + dx;
    const nextGy = Math.round(this.player.gy) + dy;

    if (this.unitzManager.isTileWalkable(nextGx, nextGy)) {
      this.player.setPath([{ x: nextGx, y: nextGy }]);
      audioEngine.playStep();
      this.multiplayer.broadcast({
        type: 'move',
        senderId: this.multiplayer.myId,
        roomId: this.unitzManager.currentRoomId,
        gx: nextGx,
        gy: nextGy,
        path: [{ x: nextGx, y: nextGy }],
        direction: this.player.direction
      });
    }
  }

  private gameLoop(currentTime: number) {
    if (!this.lastTime) this.lastTime = currentTime;
    const deltaTime = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // 1. Handle Keyboard Movement
    this.handleKeyboardMovement();

    // 2. Update entities & multiplayer mechanics
    this.player.update(deltaTime, () => audioEngine.playStep());
    this.multiplayer.update(deltaTime);
    this.chatBubbleManager.update(deltaTime);

    // 3. Render 3D Three.js WebGL Frame
    this.threeEngine.update(deltaTime);

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Boot the game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new WoozOfflineGame();
});
