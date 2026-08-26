export interface FurnitureItemDef {
  id: string;
  name: string;
  category: 'seating' | 'surfaces' | 'lighting' | 'plants' | 'decor' | 'electronics' | 'special';
  width: number; // in tiles
  height: number; // in tiles (grid depth)
  elevation: number; // vertical height in px
  isWalkable: boolean;
  isSeat: boolean;
  seatOffset?: { x: number; y: number; z: number };
  isLightSource?: boolean;
  isInteractive?: boolean;
  interactionType?: 'sit' | 'toggleLight' | 'playMusic' | 'runway' | 'arcade';
  colorPalette: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  spriteType: string;
}

export const FURNITURE_CATALOG: FurnitureItemDef[] = [
  // Seating
  {
    id: 'sofa_modern_lounge',
    name: 'Neon VIP Couch',
    category: 'seating',
    width: 2,
    height: 1,
    elevation: 24,
    isWalkable: false,
    isSeat: true,
    seatOffset: { x: 0, y: -10, z: 8 },
    interactionType: 'sit',
    colorPalette: { primary: '#9c27b0', secondary: '#e1bee7', accent: '#00bcd4' },
    spriteType: 'sofa_lounge'
  },
  {
    id: 'chair_retro_pod',
    name: 'Retro Egg Chair',
    category: 'seating',
    width: 1,
    height: 1,
    elevation: 28,
    isWalkable: false,
    isSeat: true,
    seatOffset: { x: 0, y: -12, z: 10 },
    interactionType: 'sit',
    colorPalette: { primary: '#ff4081', secondary: '#ffffff', accent: '#37474f' },
    spriteType: 'chair_egg'
  },
  {
    id: 'chair_bar_stool',
    name: 'Chrome Barstool',
    category: 'seating',
    width: 1,
    height: 1,
    elevation: 22,
    isWalkable: false,
    isSeat: true,
    seatOffset: { x: 0, y: -14, z: 12 },
    interactionType: 'sit',
    colorPalette: { primary: '#00e5ff', secondary: '#b0bec5', accent: '#263238' },
    spriteType: 'bar_stool'
  },
  {
    id: 'beanbag_fluffy',
    name: 'Fluffy Beanbag',
    category: 'seating',
    width: 1,
    height: 1,
    elevation: 16,
    isWalkable: false,
    isSeat: true,
    seatOffset: { x: 0, y: -6, z: 4 },
    interactionType: 'sit',
    colorPalette: { primary: '#76ff03', secondary: '#33691e', accent: '#ffffff' },
    spriteType: 'beanbag'
  },
  {
    id: 'throne_golden_vip',
    name: 'Woozworld Gold Throne',
    category: 'seating',
    width: 1,
    height: 1,
    elevation: 36,
    isWalkable: false,
    isSeat: true,
    seatOffset: { x: 0, y: -14, z: 10 },
    interactionType: 'sit',
    colorPalette: { primary: '#ffd700', secondary: '#d50000', accent: '#ffecb3' },
    spriteType: 'gold_throne'
  },
  {
    id: 'bench_park_wood',
    name: 'Plaza Park Bench',
    category: 'seating',
    width: 2,
    height: 1,
    elevation: 20,
    isWalkable: false,
    isSeat: true,
    seatOffset: { x: 0, y: -8, z: 6 },
    interactionType: 'sit',
    colorPalette: { primary: '#6d4c41', secondary: '#37474f', accent: '#8d6e63' },
    spriteType: 'park_bench'
  },
  {
    id: 'beach_sunbed',
    name: 'Tropical Sun Lounger',
    category: 'seating',
    width: 2,
    height: 1,
    elevation: 14,
    isWalkable: false,
    isSeat: true,
    seatOffset: { x: 0, y: -6, z: 4 },
    interactionType: 'sit',
    colorPalette: { primary: '#ff9800', secondary: '#ffe082', accent: '#00bcd4' },
    spriteType: 'sun_lounger'
  },

  // Surfaces
  {
    id: 'table_glass_coffee',
    name: 'Neon Glass Table',
    category: 'surfaces',
    width: 1,
    height: 1,
    elevation: 16,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#00bcd4', secondary: '#ffffff', accent: '#18ffff' },
    spriteType: 'glass_table'
  },
  {
    id: 'table_dining_party',
    name: 'Long Buffet Table',
    category: 'surfaces',
    width: 2,
    height: 1,
    elevation: 22,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#37474f', secondary: '#eceff1', accent: '#ff4081' },
    spriteType: 'buffet_table'
  },
  {
    id: 'bar_counter_neon',
    name: 'Club Bar Counter',
    category: 'surfaces',
    width: 2,
    height: 1,
    elevation: 26,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#1e293b', secondary: '#d500f9', accent: '#00e5ff' },
    spriteType: 'bar_counter'
  },

  // Electronics & Music
  {
    id: 'dj_booth_deluxe',
    name: 'Pro DJ Mixing Station',
    category: 'electronics',
    width: 2,
    height: 1,
    elevation: 32,
    isWalkable: false,
    isSeat: false,
    isInteractive: true,
    interactionType: 'playMusic',
    colorPalette: { primary: '#212121', secondary: '#00e5ff', accent: '#76ff03' },
    spriteType: 'dj_booth'
  },
  {
    id: 'speaker_stack_huge',
    name: 'Mega Bass Speaker Stack',
    category: 'electronics',
    width: 1,
    height: 1,
    elevation: 40,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#111111', secondary: '#e53935', accent: '#78909c' },
    spriteType: 'speaker_stack'
  },
  {
    id: 'tv_flat_screen',
    name: 'Ultra HD Plasma Screen',
    category: 'electronics',
    width: 2,
    height: 1,
    elevation: 38,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#0f172a', secondary: '#38bdf8', accent: '#f43f5e' },
    spriteType: 'flat_tv'
  },
  {
    id: 'arcade_cabinet_retro',
    name: 'Arcade Trivia Machine',
    category: 'electronics',
    width: 1,
    height: 1,
    elevation: 44,
    isWalkable: false,
    isSeat: false,
    isInteractive: true,
    interactionType: 'arcade',
    colorPalette: { primary: '#7c3aed', secondary: '#fbbf24', accent: '#ec4899' },
    spriteType: 'arcade_cabinet'
  },

  // Lighting
  {
    id: 'lamp_lava_modern',
    name: 'Glowing Lava Lamp',
    category: 'lighting',
    width: 1,
    height: 1,
    elevation: 28,
    isWalkable: false,
    isSeat: false,
    isLightSource: true,
    isInteractive: true,
    interactionType: 'toggleLight',
    colorPalette: { primary: '#ff007f', secondary: '#ffea00', accent: '#37474f' },
    spriteType: 'lava_lamp'
  },
  {
    id: 'spotlight_stage_dual',
    name: 'Concert Spotlight Beam',
    category: 'lighting',
    width: 1,
    height: 1,
    elevation: 46,
    isWalkable: false,
    isSeat: false,
    isLightSource: true,
    colorPalette: { primary: '#ffeb3b', secondary: '#212121', accent: '#00e5ff' },
    spriteType: 'stage_spotlight'
  },
  {
    id: 'disco_ball_sparkle',
    name: 'Mirror Disco Ball',
    category: 'lighting',
    width: 1,
    height: 1,
    elevation: 50,
    isWalkable: true,
    isSeat: false,
    isLightSource: true,
    colorPalette: { primary: '#e0e0e0', secondary: '#ffffff', accent: '#ff4081' },
    spriteType: 'disco_ball'
  },

  // Plants & Outdoors
  {
    id: 'fountain_plaza_water',
    name: 'Central Marble Fountain',
    category: 'plants',
    width: 2,
    height: 2,
    elevation: 32,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#0288d1', secondary: '#e0e0e0', accent: '#4fc3f7' },
    spriteType: 'water_fountain'
  },
  {
    id: 'palm_tree_tropical',
    name: 'Exotic Palm Tree',
    category: 'plants',
    width: 1,
    height: 1,
    elevation: 55,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#2e7d32', secondary: '#5d4037', accent: '#81c784' },
    spriteType: 'palm_tree'
  },
  {
    id: 'flower_bed_tulips',
    name: 'Vibrant Flowerbed',
    category: 'plants',
    width: 1,
    height: 1,
    elevation: 12,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#e91e63', secondary: '#ffeb3b', accent: '#388e3c' },
    spriteType: 'flower_bed'
  },

  // Special & Runway
  {
    id: 'runway_podium_stage',
    name: 'Fashion Runway Star Tile',
    category: 'special',
    width: 1,
    height: 1,
    elevation: 6,
    isWalkable: true,
    isSeat: false,
    isInteractive: true,
    interactionType: 'runway',
    colorPalette: { primary: '#ff1744', secondary: '#ffd700', accent: '#ffffff' },
    spriteType: 'runway_tile'
  },
  {
    id: 'rug_zebra_plush',
    name: 'Glam Plush Zebra Rug',
    category: 'decor',
    width: 2,
    height: 2,
    elevation: 1,
    isWalkable: true,
    isSeat: false,
    colorPalette: { primary: '#ffffff', secondary: '#212121', accent: '#ff4081' },
    spriteType: 'zebra_rug'
  },
  {
    id: 'trophy_fashion_grand',
    name: 'Woozworld Golden Cup',
    category: 'decor',
    width: 1,
    height: 1,
    elevation: 24,
    isWalkable: false,
    isSeat: false,
    colorPalette: { primary: '#ffd700', secondary: '#ff6f00', accent: '#ffffff' },
    spriteType: 'gold_trophy'
  },
  {
    id: 'dance_floor_neon_tile',
    name: 'Animated Rave Floor Tile',
    category: 'special',
    width: 1,
    height: 1,
    elevation: 2,
    isWalkable: true,
    isSeat: false,
    colorPalette: { primary: '#00e5ff', secondary: '#d500f9', accent: '#76ff03' },
    spriteType: 'rave_tile'
  }
];
