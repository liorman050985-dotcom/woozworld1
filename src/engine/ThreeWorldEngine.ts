import * as THREE from 'three';
import { Player } from '../entities/Player';
import { UnitzManager } from '../world/UnitzManager';
import { MultiplayerEngine, RemotePlayer } from './MultiplayerEngine';
import { FURNITURE_CATALOG, FurnitureItemDef } from '../data/FurnitureItems';
import { AvatarCustomization } from '../entities/AvatarRenderer';

export class ThreeWorldEngine {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private player: Player;
  private unitzManager: UnitzManager;
  private multiplayer: MultiplayerEngine;

  // 3D Avatar Meshes
  private localAvatarGroup: THREE.Group = new THREE.Group();
  private remoteAvatarGroups: Map<string, THREE.Group> = new Map();
  private tileMeshes: THREE.Mesh[] = [];
  private furnitureMeshes: THREE.Group[] = [];
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouseVec: THREE.Vector2 = new THREE.Vector2();

  // Camera Orbit & Controls
  public cameraDistance: number = 22;
  public cameraAngleY: number = Math.PI / 4; // 45 degree isometric angle
  public cameraAngleX: number = Math.PI / 5.5; // ~32 degree elevation
  private isDraggingCamera: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };

  // Lighting
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  // Callbacks
  public onTileClicked: (gx: number, gy: number) => void = () => {};
  public onPlayerClicked: (remotePlayer: RemotePlayer, clientX: number, clientY: number) => void = () => {};
  public onFurnitureClicked: (gx: number, gy: number) => void = () => {};

  constructor(container: HTMLElement, player: Player, unitzManager: UnitzManager, multiplayer: MultiplayerEngine) {
    this.container = container;
    this.player = player;
    this.unitzManager = unitzManager;
    this.multiplayer = multiplayer;

    // 1. Setup Three.js Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.018);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.rebuildRoom3D();
    this.bindInputs();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.sunLight.position.set(25, 45, 30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 150;
    this.sunLight.shadow.camera.left = -30;
    this.sunLight.shadow.camera.right = 30;
    this.sunLight.shadow.camera.top = 30;
    this.sunLight.shadow.camera.bottom = -30;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Subtle colored rim lights for classic flash party ambiance
    const rimLight = new THREE.PointLight(0x00e5ff, 1.5, 50);
    rimLight.position.set(-15, 10, -15);
    this.scene.add(rimLight);

    const partyLight = new THREE.PointLight(0xff007f, 1.2, 50);
    partyLight.position.set(15, 8, 15);
    this.scene.add(partyLight);
  }

  public rebuildRoom3D() {
    // Clear old room tiles and furniture
    for (const mesh of this.tileMeshes) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    }
    this.tileMeshes = [];

    for (const grp of this.furnitureMeshes) {
      this.scene.remove(grp);
    }
    this.furnitureMeshes = [];

    const room = this.unitzManager.currentRoom;
    const tileGeo = new THREE.BoxGeometry(1.9, 0.4, 1.9);

    // Build Floor Tiles
    for (let x = 0; x < room.width; x++) {
      for (let y = 0; y < room.height; y++) {
        const tileData = room.tiles[x][y];
        const mat = this.getTileMaterial(tileData.type);
        const tileMesh = new THREE.Mesh(tileGeo, mat);
        tileMesh.receiveShadow = true;

        // Center room around 0,0
        const posX = (x - room.width / 2) * 2;
        const posZ = (y - room.height / 2) * 2;
        const posY = tileData.elevation * 0.8;

        tileMesh.position.set(posX, posY, posZ);
        tileMesh.userData = { gx: x, gy: y, isTile: true };

        this.scene.add(tileMesh);
        this.tileMeshes.push(tileMesh);
      }
    }

    // Build 3D Walls
    this.buildWalls3D(room.width, room.height, room.wallColor);

    // Build 3D Furniture
    for (const f of room.furniture) {
      const def = FURNITURE_CATALOG.find(d => d.id === f.defId);
      if (!def) continue;

      const fGroup = this.createFurniture3D(def, f.rotation);
      const posX = (f.gx - room.width / 2) * 2;
      const posZ = (f.gy - room.height / 2) * 2;
      const posY = 0.2 + (f.gz || 0) * 0.05;

      fGroup.position.set(posX, posY, posZ);
      fGroup.userData = { gx: f.gx, gy: f.gy, isFurniture: true, instanceId: f.instanceId };

      this.scene.add(fGroup);
      this.furnitureMeshes.push(fGroup);
    }

    // Rebuild Local Avatar
    this.scene.remove(this.localAvatarGroup);
    this.localAvatarGroup = this.createAvatar3D(this.player.customization, this.player.name, true);
    this.scene.add(this.localAvatarGroup);
  }

  private getTileMaterial(type: string): THREE.Material {
    switch (type) {
      case 'grass':
        return new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.8, metalness: 0.1 });
      case 'pavement':
        return new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.6, metalness: 0.2 });
      case 'wood':
        return new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.5, metalness: 0.1 });
      case 'marble':
        return new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.2, metalness: 0.3 });
      case 'checker':
        return new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.3, metalness: 0.4 });
      case 'disco':
        return new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.1, metalness: 0.8, emissive: 0x006064 });
      case 'sand':
        return new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.9, metalness: 0.0 });
      case 'water':
        return new THREE.MeshStandardMaterial({ color: 0x00bcd4, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.85 });
      case 'carpet_red':
        return new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.9, metalness: 0.0 });
      default:
        return new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.7 });
    }
  }

  private buildWalls3D(width: number, height: number, colorHex: string) {
    const wallColor = new THREE.Color(colorHex || 0x1b263b);
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.6, metalness: 0.1 });
    const wallHeight = 5.5;

    // Back-Left Wall
    const leftWallGeo = new THREE.BoxGeometry(width * 2, wallHeight, 0.4);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(0, wallHeight / 2, -(height / 2) * 2 - 0.2);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);
    this.tileMeshes.push(leftWall);

    // Back-Right Wall
    const rightWallGeo = new THREE.BoxGeometry(0.4, wallHeight, height * 2);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(-(width / 2) * 2 - 0.2, wallHeight / 2, 0);
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);
    this.tileMeshes.push(rightWall);
  }

  private createFurniture3D(def: FurnitureItemDef, rotation: number): THREE.Group {
    const group = new THREE.Group();
    const primColor = new THREE.Color(def.colorPalette.primary);
    const secColor = new THREE.Color(def.colorPalette.secondary);

    const primMat = new THREE.MeshStandardMaterial({ color: primColor, roughness: 0.4, metalness: 0.2 });
    const secMat = new THREE.MeshStandardMaterial({ color: secColor, roughness: 0.3, metalness: 0.3 });

    if (def.id.includes('sofa') || def.id.includes('bench')) {
      // 3D Sofa Couch
      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.8), primMat);
      baseMesh.position.y = 0.2;
      baseMesh.castShadow = true;
      group.add(baseMesh);

      const backMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.3), secMat);
      backMesh.position.set(0, 0.6, -0.3);
      backMesh.castShadow = true;
      group.add(backMesh);

      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.8), secMat);
      armL.position.set(-0.85, 0.45, 0);
      group.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.8), secMat);
      armR.position.set(0.85, 0.45, 0);
      group.add(armR);
    } else if (def.id.includes('fountain')) {
      // 3D Water Fountain
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.2, 0.5, 16), secMat);
      basin.position.y = 0.25;
      basin.castShadow = true;
      group.add(basin);

      const water = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.1, transparent: true, opacity: 0.85 }));
      water.position.y = 0.5;
      group.add(water);

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.2, 12), secMat);
      pillar.position.y = 0.9;
      group.add(pillar);

      const topBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 0.3, 12), primMat);
      topBasin.position.y = 1.4;
      group.add(topBasin);
    } else if (def.id.includes('tree') || def.id.includes('palm')) {
      // 3D Palm Tree
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x795548 }));
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      group.add(trunk);

      const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x4caf50 }));
      leaves.position.y = 3.6;
      leaves.castShadow = true;
      group.add(leaves);
    } else if (def.id.includes('dj_booth') || def.id.includes('speakers')) {
      // 3D DJ Booth / Speaker
      const booth = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.9), primMat);
      booth.position.y = 0.55;
      booth.castShadow = true;
      group.add(booth);

      const neonScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.6), new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00bcd4 }));
      neonScreen.position.set(0, 0.55, 0.46);
      group.add(neonScreen);
    } else {
      // Generic Stylized 3D Prop
      const prop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), primMat);
      prop.position.y = 0.5;
      prop.castShadow = true;
      group.add(prop);
    }

    group.rotation.y = (rotation * Math.PI) / 2;
    return group;
  }

  public createAvatar3D(cust: AvatarCustomization, name: string, isSelf: boolean = false): THREE.Group {
    const avatar = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: cust.skinColor || 0xffd8b3, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: cust.hair.primaryColor || 0x212121, roughness: 0.4 });
    const topMat = new THREE.MeshStandardMaterial({ color: cust.top.primaryColor || 0x00bcd4, roughness: 0.5 });
    const bottomMat = new THREE.MeshStandardMaterial({ color: cust.bottom.primaryColor || 0x1565c0, roughness: 0.6 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: cust.shoes.primaryColor || 0xffffff, roughness: 0.4 });

    // 1. Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), skinMat);
    head.position.y = 1.95;
    head.castShadow = true;
    avatar.add(head);

    // 2. Hair Mesh
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 14), hairMat);
    hair.position.set(0, 2.05, -0.04);
    hair.castShadow = true;
    avatar.add(hair);

    // 3. Eyes / Face details
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
    eyeL.position.set(0.12, 1.95, 0.34);
    avatar.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), eyeMat);
    eyeR.position.set(-0.12, 1.95, 0.34);
    avatar.add(eyeR);

    // 4. Torso Body
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.35), topMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    avatar.add(torso);

    // Star badge on chest
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const star = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), starMat);
    star.position.set(0, 1.42, 0.185);
    avatar.add(star);

    // 5. Left & Right Arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    const armL = new THREE.Mesh(armGeo, topMat);
    armL.position.set(0.42, 1.3, 0);
    armL.castShadow = true;
    armL.name = 'armL';
    avatar.add(armL);

    const armR = new THREE.Mesh(armGeo, topMat);
    armR.position.set(-0.42, 1.3, 0);
    armR.castShadow = true;
    armR.name = 'armR';
    avatar.add(armR);

    // 6. Left & Right Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    const legL = new THREE.Mesh(legGeo, bottomMat);
    legL.position.set(0.16, 0.58, 0);
    legL.castShadow = true;
    legL.name = 'legL';
    avatar.add(legL);

    const legR = new THREE.Mesh(legGeo, bottomMat);
    legR.position.set(-0.16, 0.58, 0);
    legR.castShadow = true;
    legR.name = 'legR';
    avatar.add(legR);

    // 7. Shoes
    const shoeGeo = new THREE.BoxGeometry(0.26, 0.22, 0.36);
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(0.16, 0.12, 0.05);
    shoeL.castShadow = true;
    avatar.add(shoeL);

    const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
    shoeR.position.set(-0.16, 0.12, 0.05);
    shoeR.castShadow = true;
    avatar.add(shoeR);

    // 8. Wings (if back accessory equipped)
    if (cust.backAccessory?.style.includes('wings')) {
      const wingMat = new THREE.MeshStandardMaterial({
        color: cust.backAccessory.primaryColor || 0x00e5ff,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.8), wingMat);
      wingL.position.set(0.45, 1.5, -0.22);
      wingL.rotation.y = Math.PI / 6;
      avatar.add(wingL);

      const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.8), wingMat);
      wingR.position.set(-0.45, 1.5, -0.22);
      wingR.rotation.y = -Math.PI / 6;
      avatar.add(wingR);
    }

    // 9. Floating 3D Name Tag
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 256;
    nameCanvas.height = 64;
    const nCtx = nameCanvas.getContext('2d')!;
    nCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    nCtx.beginPath();
    nCtx.roundRect(10, 10, 236, 44, 18);
    nCtx.fill();
    nCtx.strokeStyle = isSelf ? '#ffd700' : '#00e5ff';
    nCtx.lineWidth = 4;
    nCtx.stroke();

    nCtx.fillStyle = '#ffffff';
    nCtx.font = 'bold 22px sans-serif';
    nCtx.textAlign = 'center';
    nCtx.fillText((isSelf ? '👑 ' : '★ ') + name, 128, 40);

    const nameTexture = new THREE.CanvasTexture(nameCanvas);
    const spriteMat = new THREE.SpriteMaterial({ map: nameTexture, transparent: true });
    const nameSprite = new THREE.Sprite(spriteMat);
    nameSprite.position.set(0, 2.7, 0);
    nameSprite.scale.set(2.2, 0.55, 1);
    avatar.add(nameSprite);

    avatar.userData = { isAvatar: true, name, isSelf };
    return avatar;
  }

  public showSpeechBubble3D(senderId: string, text: string) {
    let targetAvatar: THREE.Group | undefined;
    if (senderId === this.multiplayer.myId || senderId === this.player.id) {
      targetAvatar = this.localAvatarGroup;
    } else {
      targetAvatar = this.remoteAvatarGroups.get(senderId);
    }

    if (!targetAvatar) return;

    // Remove existing bubble if any
    const oldBubble = targetAvatar.getObjectByName('speechBubble');
    if (oldBubble) targetAvatar.remove(oldBubble);

    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.roundRect(14, 14, 356, 84, 22);
    ctx.fill();

    // Bubble body (glossy white gradient)
    const grad = ctx.createLinearGradient(0, 10, 0, 94);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f0fcfc');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(10, 10, 356, 84, 22);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Tail
    ctx.fillStyle = '#f0fcfc';
    ctx.beginPath();
    ctx.moveTo(180, 94);
    ctx.lineTo(192, 114);
    ctx.lineTo(204, 94);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';

    let displayTxt = text;
    if (displayTxt.length > 28) displayTxt = displayTxt.substring(0, 26) + '...';
    ctx.fillText(displayTxt, 192, 58);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.name = 'speechBubble';
    sprite.position.set(0, 3.6, 0);
    sprite.scale.set(3.4, 1.15, 1);
    targetAvatar.add(sprite);

    // Auto remove after 5.5s
    setTimeout(() => {
      if (targetAvatar) {
        targetAvatar.remove(sprite);
      }
    }, 5500);
  }

  public update(deltaTime: number) {
    const room = this.unitzManager.currentRoom;

    // 1. Update Local Player 3D Position, Crouch & Sprint Animation
    const targetX = (this.player.gx - room.width / 2) * 2;
    const targetZ = (this.player.gy - room.height / 2) * 2;
    const targetY = 0.2 + (this.player.gz || 0) * 0.05;

    this.localAvatarGroup.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), Math.min(1, deltaTime * 14));

    // Crouch Scaling
    if (this.player.isCrouching) {
      this.localAvatarGroup.scale.set(1.0, 0.65, 1.0);
    } else {
      this.localAvatarGroup.scale.set(1.0, 1.0, 1.0);
    }

    // Calculate heading angle
    const dirAngles = [
      Math.PI / 4,
      Math.PI / 2,
      (3 * Math.PI) / 4,
      Math.PI,
      -(3 * Math.PI) / 4,
      -Math.PI / 2,
      -Math.PI / 4,
      0
    ];
    this.localAvatarGroup.rotation.y = dirAngles[this.player.direction] || 0;

    // Walking / Sprinting leg/arm swing
    const isMoving = this.player.isMoving;
    const speedMultiplier = this.player.isSprinting ? 2.2 : 1.0;
    const animPhase = this.player.animFrame * 0.25 * speedMultiplier;
    const armL = this.localAvatarGroup.getObjectByName('armL');
    const armR = this.localAvatarGroup.getObjectByName('armR');
    const legL = this.localAvatarGroup.getObjectByName('legL');
    const legR = this.localAvatarGroup.getObjectByName('legR');

    if (isMoving) {
      const swingAmp = this.player.isSprinting ? 0.9 : 0.6;
      if (armL) armL.rotation.x = Math.sin(animPhase) * swingAmp;
      if (armR) armR.rotation.x = -Math.sin(animPhase) * swingAmp;
      if (legL) legL.rotation.x = -Math.sin(animPhase) * swingAmp;
      if (legR) legR.rotation.x = Math.sin(animPhase) * swingAmp;
    } else {
      if (armL) armL.rotation.x = 0;
      if (armR) armR.rotation.x = 0;
      if (legL) legL.rotation.x = 0;
      if (legR) legR.rotation.x = 0;
    }

    // 2. Synchronize Remote Players in 3D
    const activeRemoteIds = new Set(this.multiplayer.remotePlayers.keys());

    // Remove disconnected remote avatars
    for (const [id, grp] of this.remoteAvatarGroups.entries()) {
      if (!activeRemoteIds.has(id)) {
        this.scene.remove(grp);
        this.remoteAvatarGroups.delete(id);
      }
    }

    // Update / Spawn remote avatars
    for (const [id, rPlayer] of this.multiplayer.remotePlayers.entries()) {
      let grp = this.remoteAvatarGroups.get(id);
      if (!grp) {
        grp = this.createAvatar3D(rPlayer.customization, rPlayer.name, false);
        grp.userData = { isAvatar: true, isRemote: true, remotePlayer: rPlayer };
        this.scene.add(grp);
        this.remoteAvatarGroups.set(id, grp);
      }

      const rX = (rPlayer.gx - room.width / 2) * 2;
      const rZ = (rPlayer.gy - room.height / 2) * 2;
      grp.position.lerp(new THREE.Vector3(rX, 0.2, rZ), Math.min(1, deltaTime * 12));
      grp.rotation.y = dirAngles[rPlayer.direction] || 0;
    }

    // 3. Smooth Camera Tracking
    const camTarget = this.localAvatarGroup.position.clone();
    const camOffsetX = Math.sin(this.cameraAngleY) * Math.cos(this.cameraAngleX) * this.cameraDistance;
    const camOffsetY = Math.sin(this.cameraAngleX) * this.cameraDistance;
    const camOffsetZ = Math.cos(this.cameraAngleY) * Math.cos(this.cameraAngleX) * this.cameraDistance;

    this.camera.position.set(
      camTarget.x + camOffsetX,
      camTarget.y + camOffsetY,
      camTarget.z + camOffsetZ
    );
    this.camera.lookAt(camTarget.x, camTarget.y + 1.2, camTarget.z);

    // 4. Render 3D Frame
    this.renderer.render(this.scene, this.camera);
  }

  private bindInputs() {
    const dom = this.renderer.domElement;

    // Right-Click Drag for 3D Camera Orbit
    dom.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isDraggingCamera = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingCamera) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.cameraAngleY -= deltaX * 0.008;
        this.cameraAngleX = Math.max(0.15, Math.min(Math.PI / 2.3, this.cameraAngleX + deltaY * 0.008));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isDraggingCamera = false;
      }
    });

    // Disable context menu on canvas so right click orbit works smoothly
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mouse Wheel Zoom
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraDistance = Math.max(10, Math.min(45, this.cameraDistance + e.deltaY * 0.02));
    }, { passive: false });

    // Left-Click for 3D Raycasting (Walk to Tile / Click Player)
    dom.addEventListener('click', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseVec, this.camera);

      // Check click on Remote Avatars first
      const avatarIntersects = this.raycaster.intersectObjects(Array.from(this.remoteAvatarGroups.values()), true);
      if (avatarIntersects.length > 0) {
        let hitObj: THREE.Object3D | null = avatarIntersects[0].object;
        while (hitObj && !hitObj.userData.remotePlayer) {
          hitObj = hitObj.parent;
        }
        if (hitObj && hitObj.userData.remotePlayer) {
          this.onPlayerClicked(hitObj.userData.remotePlayer, e.clientX, e.clientY);
          return;
        }
      }

      // Check click on Floor Tiles for walking
      const tileIntersects = this.raycaster.intersectObjects(this.tileMeshes, false);
      if (tileIntersects.length > 0) {
        const hitTile = tileIntersects[0].object;
        if (hitTile.userData && hitTile.userData.isTile) {
          this.onTileClicked(hitTile.userData.gx, hitTile.userData.gy);
        }
      }
    });
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
