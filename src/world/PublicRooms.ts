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

// 1. Central Plaza
function createCentralPlaza(): RoomDefinition {
  const width = 14;
  const height = 14;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      // Pathways vs Grass
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

  const npcs: NPC[] = [
    new NPC('npc_mya', 'MyaWooz ★', 'woozband', 5, 4, {
      skinColor: '#ffe0b2',
      hair: { id: 'hair_glam_waves', style: 'glam_waves', primaryColor: '#ffd54f', secondaryColor: '#ffb300' },
      face: { id: 'face_sparkle_eyes', style: 'sparkle', eyeColor: '#ff4081', expression: 'sparkle' },
      top: { id: 'top_glam_corset', style: 'corset_glam', primaryColor: '#ff4081', secondaryColor: '#f8bbd0', detailColor: '#ffd700' },
      bottom: { id: 'bottom_glitter_tutu', style: 'glitter_tutu', primaryColor: '#f06292', secondaryColor: '#ffd54f' },
      shoes: { id: 'shoes_glam_heels', style: 'glam_heels', primaryColor: '#ff4081', secondaryColor: '#ffd700' },
      headAccessory: { id: 'head_star_crown', style: 'gold_crown', primaryColor: '#ffd700', secondaryColor: '#ff1744' },
      backAccessory: { id: 'back_fairy_wings', style: 'fairy_wings', primaryColor: '#80deea', secondaryColor: '#f48fb1' }
    }, 'mya_intro'),

    new NPC('npc_jenny', 'JennyWooz ♥', 'woozband', 8, 4, {
      skinColor: '#ffcc80',
      hair: { id: 'hair_ponytail_chic', style: 'high_ponytail', primaryColor: '#6d4c41', secondaryColor: '#8d6e63' },
      face: { id: 'face_sparkle_eyes', style: 'sparkle', eyeColor: '#4caf50', expression: 'sparkle' },
      top: { id: 'top_cozy_sweater', style: 'cozy_sweater', primaryColor: '#ce93d8', secondaryColor: '#f48fb1' },
      bottom: { id: 'bottom_pleated_skirt', style: 'skirt_pleated', primaryColor: '#e91e63', secondaryColor: '#ffffff' },
      shoes: { id: 'shoes_hi_tops', style: 'hi_tops', primaryColor: '#ce93d8', secondaryColor: '#ffffff' },
      headAccessory: { id: 'head_flower_halo', style: 'flower_halo', primaryColor: '#f8bbd0', secondaryColor: '#e91e63' }
    }, 'jenny_intro'),

    new NPC('bot_glitter', 'GlitterStar99', 'bot', 2, 7, {
      skinColor: '#ffd8b3',
      hair: { id: 'hair_bob_bangs', style: 'bob_bangs', primaryColor: '#00e5ff', secondaryColor: '#ff007f' },
      face: { id: 'face_sparkle_eyes', style: 'sparkle', eyeColor: '#00bcd4', expression: 'sparkle' },
      top: { id: 'top_crop_graphic', style: 'crop_graphic', primaryColor: '#ffeb3b', secondaryColor: '#e91e63' },
      bottom: { id: 'bottom_denim_shorts', style: 'denim_shorts', primaryColor: '#42a5f5', secondaryColor: '#bbdefb' },
      shoes: { id: 'shoes_neon_rollers', style: 'roller_skates', primaryColor: '#76ff03', secondaryColor: '#ff007f' },
      headAccessory: { id: 'head_kitty_headphones', style: 'kitty_headphones', primaryColor: '#ff4081', secondaryColor: '#00e5ff' }
    }),

    new NPC('bot_skater', 'SkaterDude2012', 'bot', 11, 7, {
      skinColor: '#d7ccc8',
      hair: { id: 'hair_dreads_fade', style: 'dreads_fade', primaryColor: '#212121', secondaryColor: '#424242' },
      face: { id: 'face_cool_smirk', style: 'smirk', eyeColor: '#ff9800', expression: 'smirk' },
      top: { id: 'top_tank_tribal', style: 'tank_tribal', primaryColor: '#ff7043', secondaryColor: '#26c6da' },
      bottom: { id: 'bottom_baggy_skater', style: 'baggy_skater', primaryColor: '#546e7a', secondaryColor: '#263238' },
      shoes: { id: 'shoes_skater_slipons', style: 'checker_kicks', primaryColor: '#ffffff', secondaryColor: '#000000' },
      headAccessory: { id: 'head_snapback_cap', style: 'snapback', primaryColor: '#263238', secondaryColor: '#ffd600' }
    })
  ];

  return {
    id: 'central_plaza',
    name: 'Woozworld Central Plaza',
    category: 'public',
    width,
    height,
    wallColor: '#1b3a4b',
    defaultMusicTrack: 0,
    tiles,
    furniture,
    npcs
  };
}

// 2. Club Wooz
function createClubWooz(): RoomDefinition {
  const width = 12;
  const height = 12;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      const isDanceFloor = x >= 4 && x <= 7 && y >= 4 && y <= 7;
      tiles[x][y] = {
        type: isDanceFloor ? 'disco' : 'marble',
        elevation: isDanceFloor ? 2 : 0
      };
    }
  }

  const furniture: PlacedFurniture[] = [
    { instanceId: 'f_dj', defId: 'dj_booth_deluxe', gx: 5, gy: 2, gz: 0, rotation: 0 },
    { instanceId: 'f_speaker1', defId: 'speaker_stack_huge', gx: 3, gy: 2, gz: 0, rotation: 0 },
    { instanceId: 'f_speaker2', defId: 'speaker_stack_huge', gx: 8, gy: 2, gz: 0, rotation: 0 },
    { instanceId: 'f_disco', defId: 'disco_ball_sparkle', gx: 5, gy: 5, gz: 0, rotation: 0 },
    { instanceId: 'f_bar', defId: 'bar_counter_neon', gx: 1, gy: 6, gz: 0, rotation: 0 },
    { instanceId: 'f_stool1', defId: 'chair_bar_stool', gx: 3, gy: 6, gz: 0, rotation: 0 },
    { instanceId: 'f_stool2', defId: 'chair_bar_stool', gx: 3, gy: 7, gz: 0, rotation: 0 },
    { instanceId: 'f_sofa1', defId: 'sofa_modern_lounge', gx: 9, gy: 7, gz: 0, rotation: 1 },
    { instanceId: 'f_table1', defId: 'table_glass_coffee', gx: 8, gy: 8, gz: 0, rotation: 0 },
    { instanceId: 'f_arcade', defId: 'arcade_cabinet_retro', gx: 10, gy: 2, gz: 0, rotation: 0 }
  ];

  const npcs: NPC[] = [
    new NPC('npc_jay', 'JayWooz (DJ) 🎧', 'woozband', 5, 3, {
      skinColor: '#d7ccc8',
      hair: { id: 'hair_undercut_slick', style: 'undercut_slick', primaryColor: '#3e2723', secondaryColor: '#5d4037' },
      face: { id: 'face_cool_smirk', style: 'smirk', eyeColor: '#00e5ff', expression: 'smirk' },
      top: { id: 'top_leather_jacket', style: 'leather_jacket', primaryColor: '#212121', secondaryColor: '#e53935', detailColor: '#cfd8dc' },
      bottom: { id: 'bottom_skinny_ripped', style: 'jeans_ripped', primaryColor: '#1565c0', secondaryColor: '#90caf9' },
      shoes: { id: 'shoes_combat_boots', style: 'combat_boots', primaryColor: '#212121', secondaryColor: '#9e9e9e' },
      headAccessory: { id: 'head_kitty_headphones', style: 'kitty_headphones', primaryColor: '#00e5ff', secondaryColor: '#ff4081' }
    }, 'jay_intro'),

    new NPC('bot_raver', 'RaveMaster2000', 'bot', 5, 6, {
      skinColor: '#ffd8b3',
      hair: { id: 'hair_spiky_cool', style: 'spiky_rebel', primaryColor: '#76ff03', secondaryColor: '#00bcd4' },
      face: { id: 'face_cool_smirk', style: 'smirk', eyeColor: '#76ff03', expression: 'smirk' },
      top: { id: 'top_dj_jersey', style: 'dj_jersey', primaryColor: '#18ffff', secondaryColor: '#76ff03' },
      bottom: { id: 'bottom_cargo_pants', style: 'cargo_joggers', primaryColor: '#263238', secondaryColor: '#00e676' },
      shoes: { id: 'shoes_hi_tops', style: 'hi_tops', primaryColor: '#76ff03', secondaryColor: '#18ffff' }
    })
  ];

  return {
    id: 'club_wooz',
    name: 'Club Wooz (Neon Electro)',
    category: 'public',
    width,
    height,
    wallColor: '#100b20',
    defaultMusicTrack: 1,
    tiles,
    furniture,
    npcs
  };
}

// 3. Fashion Runway Studio
function createFashionRunway(): RoomDefinition {
  const width = 12;
  const height = 12;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      // Runway down the middle
      const isRunway = x >= 5 && x <= 6 && y >= 2 && y <= 9;
      tiles[x][y] = {
        type: isRunway ? 'carpet_red' : 'checker',
        elevation: isRunway ? 4 : 0
      };
    }
  }

  const furniture: PlacedFurniture[] = [
    { instanceId: 'f_runway_star', defId: 'runway_podium_stage', gx: 5, gy: 9, gz: 4, rotation: 0 },
    { instanceId: 'f_spotlight1', defId: 'spotlight_stage_dual', gx: 3, gy: 9, gz: 0, rotation: 0 },
    { instanceId: 'f_spotlight2', defId: 'spotlight_stage_dual', gx: 8, gy: 9, gz: 0, rotation: 0 },
    { instanceId: 'f_throne', defId: 'throne_golden_vip', gx: 5, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'f_judge_table', defId: 'table_dining_party', gx: 5, gy: 2, gz: 0, rotation: 0 },
    { instanceId: 'f_trophy_stage', defId: 'trophy_fashion_grand', gx: 8, gy: 2, gz: 0, rotation: 0 },
    { instanceId: 'f_tv', defId: 'tv_flat_screen', gx: 2, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'f_sofa_aud1', defId: 'sofa_modern_lounge', gx: 2, gy: 5, gz: 0, rotation: 0 },
    { instanceId: 'f_sofa_aud2', defId: 'sofa_modern_lounge', gx: 9, gy: 5, gz: 0, rotation: 1 }
  ];

  const npcs: NPC[] = [
    new NPC('npc_mya_runway', 'MyaWooz (Head Judge)', 'woozband', 5, 2, {
      skinColor: '#ffe0b2',
      hair: { id: 'hair_glam_waves', style: 'glam_waves', primaryColor: '#ffd54f', secondaryColor: '#ffb300' },
      face: { id: 'face_sparkle_eyes', style: 'sparkle', eyeColor: '#ff4081', expression: 'sparkle' },
      top: { id: 'top_formal_blazer', style: 'formal_blazer', primaryColor: '#ffd54f', secondaryColor: '#212121' },
      bottom: { id: 'bottom_glitter_tutu', style: 'glitter_tutu', primaryColor: '#f06292', secondaryColor: '#ffd54f' },
      shoes: { id: 'shoes_glam_heels', style: 'glam_heels', primaryColor: '#ff4081', secondaryColor: '#ffd700' },
      headAccessory: { id: 'head_star_crown', style: 'gold_crown', primaryColor: '#ffd700', secondaryColor: '#ff1744' }
    }, 'mya_intro')
  ];

  return {
    id: 'fashion_runway',
    name: 'Woozworld Runway Studio',
    category: 'public',
    width,
    height,
    wallColor: '#2b092b',
    defaultMusicTrack: 2,
    tiles,
    furniture,
    npcs
  };
}

// 4. VIP Beach Resort
function createVIPBeach(): RoomDefinition {
  const width = 12;
  const height = 12;
  const tiles: TileData[][] = [];

  for (let x = 0; x < width; x++) {
    tiles[x] = [];
    for (let y = 0; y < height; y++) {
      const isWater = x <= 2 || y <= 2;
      tiles[x][y] = {
        type: isWater ? 'water' : 'sand',
        elevation: 0
      };
    }
  }

  const furniture: PlacedFurniture[] = [
    { instanceId: 'f_palm1', defId: 'palm_tree_tropical', gx: 4, gy: 3, gz: 0, rotation: 0 },
    { instanceId: 'f_palm2', defId: 'palm_tree_tropical', gx: 10, gy: 10, gz: 0, rotation: 0 },
    { instanceId: 'f_sunbed1', defId: 'beach_sunbed', gx: 6, gy: 5, gz: 0, rotation: 0 },
    { instanceId: 'f_sunbed2', defId: 'beach_sunbed', gx: 6, gy: 8, gz: 0, rotation: 0 },
    { instanceId: 'f_table_beach', defId: 'table_glass_coffee', gx: 7, gy: 6, gz: 0, rotation: 0 }
  ];

  const npcs: NPC[] = [
    new NPC('npc_max', 'MaxWooz 🎮', 'woozband', 8, 8, {
      skinColor: '#ffcc80',
      hair: { id: 'hair_spiky_cool', style: 'spiky_rebel', primaryColor: '#424242', secondaryColor: '#00bcd4' },
      face: { id: 'face_cool_smirk', style: 'smirk', eyeColor: '#4caf50', expression: 'smirk' },
      top: { id: 'top_tank_tribal', style: 'tank_tribal', primaryColor: '#ff7043', secondaryColor: '#26c6da' },
      bottom: { id: 'bottom_cargo_pants', style: 'cargo_joggers', primaryColor: '#263238', secondaryColor: '#00e676' },
      shoes: { id: 'shoes_skater_slipons', style: 'checker_kicks', primaryColor: '#ffffff', secondaryColor: '#000000' },
      headAccessory: { id: 'head_aviator_shades', style: 'aviator_shades', primaryColor: '#00bcd4', secondaryColor: '#212121' }
    }, 'max_intro')
  ];

  return {
    id: 'vip_beach',
    name: 'VIP Tropical Beach Resort',
    category: 'public',
    width,
    height,
    wallColor: '#023e8a',
    defaultMusicTrack: 3,
    tiles,
    furniture,
    npcs
  };
}

// 5. Personal Penthouse Starter Sandbox
function createPersonalPenthouse(): RoomDefinition {
  const width = 10;
  const height = 10;
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
    { instanceId: 'p_sofa', defId: 'sofa_modern_lounge', gx: 4, gy: 3, gz: 0, rotation: 0 },
    { instanceId: 'p_rug', defId: 'rug_zebra_plush', gx: 4, gy: 5, gz: 0, rotation: 0 },
    { instanceId: 'p_table', defId: 'table_glass_coffee', gx: 4, gy: 5, gz: 0, rotation: 0 },
    { instanceId: 'p_tv', defId: 'tv_flat_screen', gx: 4, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'p_lamp', defId: 'lamp_lava_modern', gx: 1, gy: 1, gz: 0, rotation: 0 },
    { instanceId: 'p_egg', defId: 'chair_retro_pod', gx: 7, gy: 4, gz: 0, rotation: 1 }
  ];

  return {
    id: 'personal_penthouse',
    name: 'My VIP Penthouse Unitz',
    category: 'personal',
    width,
    height,
    wallColor: '#1d2d44',
    defaultMusicTrack: 0,
    tiles,
    furniture,
    npcs: []
  };
}
