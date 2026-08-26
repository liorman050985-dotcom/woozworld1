import { TileData } from '../engine/IsometricGrid';
import { PlacedFurniture } from '../entities/Furniture';
import { NPC } from '../entities/NPC';

export interface RoomDefinition {
  id: string;
  name: string;
  category: 'public' | 'personal';
  width: number;
  height: number;
  wallColor: string;
  defaultMusicTrack: number;
  tiles: TileData[][];
  furniture: PlacedFurniture[];
  npcs: NPC[];
}

export function createPublicRooms(): Record<string, RoomDefinition> {
  return {
    central_plaza: createCentralPlaza(),
    club_wooz: createClubWooz(),
    fashion_runway: createFashionRunway(),
    vip_beach: createVIPBeach(),
    personal_penthouse: createPersonalPenthouse()
  };
}

// 1. Central Plaza (Pure Multiplayer Hub)
function createCentralPlaza(): RoomDefinition {
  const width = 14;
  const height = 14;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      const isPath = x === 6 || x === 7 || y === 6 || y === 7 || (x >= 4 && x <= 9 && y >= 4 && y <= 9);
      tiles[x][y] = {
        type: isPath ? 'pavement' : 'grass',
        elevation: 0
      };
    }
  }

  const furniture: PlacedFurniture[] = [
    { instanceId: 'f_fountain', defId: 'fountain_plaza_water', gx: 6, gy: 6, gz: 0, rotation: 0 },
    { instanceId: 'f_bench1', defId: 'bench_park_wood', gx: 3, gy: 5, gz: 0, rotation: 0 },
    { instanceId: 'f_bench2', defId: 'bench_park_wood', gx: 10, gy: 5, gz: 0, rotation: 1 },
    { instanceId: 'f_flowers1', defId: 'flower_bed_tulips', gx: 2, gy: 2, gz: 0, rotation: 0 },
    { instanceId: 'f_flowers2', defId: 'flower_bed_tulips', gx: 11, gy: 2, gz: 0, rotation: 0 },
    { instanceId: 'f_flowers3', defId: 'flower_bed_tulips', gx: 2, gy: 11, gz: 0, rotation: 0 },
    { instanceId: 'f_flowers4', defId: 'flower_bed_tulips', gx: 11, gy: 11, gz: 0, rotation: 0 },
    { instanceId: 'f_trophy1', defId: 'trophy_fashion_grand', gx: 6, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'f_lamp1', defId: 'lamp_lava_modern', gx: 4, gy: 4, gz: 0, rotation: 0 },
    { instanceId: 'f_lamp2', defId: 'lamp_lava_modern', gx: 9, gy: 4, gz: 0, rotation: 0 }
  ];

  // No NPCs - Pure real multiplayer users
  return {
    id: 'central_plaza',
    name: 'Central Plaza',
    category: 'public',
    width,
    height,
    wallColor: '#1c3144',
    defaultMusicTrack: 0,
    tiles,
    furniture,
    npcs: []
  };
}

// 2. Club Wooz
function createClubWooz(): RoomDefinition {
  const width = 14;
  const height = 14;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      const isDanceFloor = x >= 4 && x <= 9 && y >= 4 && y <= 9;
      tiles[x][y] = {
        type: isDanceFloor ? 'disco' : 'wood',
        elevation: 0
      };
    }
  }

  const furniture: PlacedFurniture[] = [
    { instanceId: 'f_dj', defId: 'dj_booth_neon', gx: 6, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'f_speakers1', defId: 'speakers_subwoofer_stack', gx: 3, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'f_speakers2', defId: 'speakers_subwoofer_stack', gx: 9, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'f_disco', defId: 'disco_ball_ceiling', gx: 6, gy: 6, gz: 40, rotation: 0 },
    { instanceId: 'f_sofa_l1', defId: 'sofa_retro_modern', gx: 1, gy: 5, gz: 0, rotation: 1 },
    { instanceId: 'f_sofa_l2', defId: 'sofa_retro_modern', gx: 1, gy: 8, gz: 0, rotation: 1 },
    { instanceId: 'f_sofa_r1', defId: 'sofa_retro_modern', gx: 11, gy: 5, gz: 0, rotation: 3 },
    { instanceId: 'f_sofa_r2', defId: 'sofa_retro_modern', gx: 11, gy: 8, gz: 0, rotation: 3 },
    { instanceId: 'f_arcade1', defId: 'arcade_cabinet_retro', gx: 1, gy: 11, gz: 0, rotation: 0 },
    { instanceId: 'f_arcade2', defId: 'arcade_cabinet_retro', gx: 3, gy: 11, gz: 0, rotation: 0 }
  ];

  return {
    id: 'club_wooz',
    name: 'Club Wooz & Dance Lounge',
    category: 'public',
    width,
    height,
    wallColor: '#120d24',
    defaultMusicTrack: 1,
    tiles,
    furniture,
    npcs: []
  };
}

// 3. Fashion Runway
function createFashionRunway(): RoomDefinition {
  const width = 14;
  const height = 16;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      const isRunway = (x === 6 || x === 7) && y >= 2 && y <= 13;
      const isStage = y >= 12 && x >= 4 && x <= 9;
      tiles[x][y] = {
        type: isRunway || isStage ? 'marble' : 'carpet_red',
        elevation: isRunway || isStage ? 1 : 0
      };
    }
  }

  const furniture: PlacedFurniture[] = [
    { instanceId: 'f_cam1', defId: 'camera_studio_tripod', gx: 6, gy: 0, gz: 0, rotation: 0 },
    { instanceId: 'f_chair_l1', defId: 'chair_plush_lounge', gx: 4, gy: 4, gz: 0, rotation: 1 },
    { instanceId: 'f_chair_l2', defId: 'chair_plush_lounge', gx: 4, gy: 7, gz: 0, rotation: 1 },
    { instanceId: 'f_chair_l3', defId: 'chair_plush_lounge', gx: 4, gy: 10, gz: 0, rotation: 1 },
    { instanceId: 'f_chair_r1', defId: 'chair_plush_lounge', gx: 9, gy: 4, gz: 0, rotation: 3 },
    { instanceId: 'f_chair_r2', defId: 'chair_plush_lounge', gx: 9, gy: 7, gz: 0, rotation: 3 },
    { instanceId: 'f_chair_r3', defId: 'chair_plush_lounge', gx: 9, gy: 10, gz: 0, rotation: 3 },
    { instanceId: 'f_spot1', defId: 'spotlight_stage_dual', gx: 2, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'f_spot2', defId: 'spotlight_stage_dual', gx: 11, gy: 1, gz: 0, rotation: 0 }
  ];

  return {
    id: 'fashion_runway',
    name: 'Woozworld VIP Fashion Runway',
    category: 'public',
    width,
    height,
    wallColor: '#2b0b2e',
    defaultMusicTrack: 2,
    tiles,
    furniture,
    npcs: []
  };
}

// 4. VIP Beach Resort
function createVIPBeach(): RoomDefinition {
  const width = 16;
  const height = 14;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      const isWater = y <= 3;
      tiles[x][y] = {
        type: isWater ? 'water' : 'sand',
        elevation: 0
      };
    }
  }

  const furniture: PlacedFurniture[] = [
    { instanceId: 'f_palm1', defId: 'tree_palm_tropical', gx: 2, gy: 5, gz: 0, rotation: 0 },
    { instanceId: 'f_palm2', defId: 'tree_palm_tropical', gx: 13, gy: 5, gz: 0, rotation: 0 },
    { instanceId: 'f_palm3', defId: 'tree_palm_tropical', gx: 7, gy: 11, gz: 0, rotation: 0 },
    { instanceId: 'f_lounger1', defId: 'beach_lounger_sun', gx: 4, gy: 7, gz: 0, rotation: 0 },
    { instanceId: 'f_lounger2', defId: 'beach_lounger_sun', gx: 7, gy: 7, gz: 0, rotation: 0 },
    { instanceId: 'f_lounger3', defId: 'beach_lounger_sun', gx: 10, gy: 7, gz: 0, rotation: 0 },
    { instanceId: 'f_umbrella1', defId: 'beach_umbrella_tiki', gx: 3, gy: 7, gz: 0, rotation: 0 },
    { instanceId: 'f_umbrella2', defId: 'beach_umbrella_tiki', gx: 11, gy: 7, gz: 0, rotation: 0 }
  ];

  return {
    id: 'vip_beach',
    name: 'Sunny VIP Beach Resort',
    category: 'public',
    width,
    height,
    wallColor: '#0a3d62',
    defaultMusicTrack: 3,
    tiles,
    furniture,
    npcs: []
  };
}

// 5. Personal Penthouse Unitz
function createPersonalPenthouse(): RoomDefinition {
  const width = 12;
  const height = 12;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      tiles[x][y] = {
        type: 'wood',
        elevation: 0
      };
    }
  }

  const furniture: PlacedFurniture[] = [
    { instanceId: 'f_sofa', defId: 'sofa_retro_modern', gx: 4, gy: 3, gz: 0, rotation: 0 },
    { instanceId: 'f_tv', defId: 'hdtv_flatscreen_wall', gx: 4, gy: 1, gz: 20, rotation: 0 },
    { instanceId: 'f_bed', defId: 'bed_canopy_luxury', gx: 1, gy: 8, gz: 0, rotation: 0 },
    { instanceId: 'f_plant', defId: 'plant_monstera_pot', gx: 10, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'f_rug', defId: 'rug_wooz_star', gx: 4, gy: 5, gz: 0, rotation: 0 }
  ];

  return {
    id: 'personal_penthouse',
    name: 'My VIP Penthouse Unitz',
    category: 'personal',
    width,
    height,
    wallColor: '#1b263b',
    defaultMusicTrack: 4,
    tiles,
    furniture,
    npcs: []
  };
}
