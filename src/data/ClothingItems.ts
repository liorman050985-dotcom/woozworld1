export interface ClothingItem {
  id: string;
  name: string;
  category: 'hair' | 'top' | 'bottom' | 'shoes' | 'head' | 'face' | 'back' | 'hand';
  style: string;
  defaultColors: {
    primary: string;
    secondary?: string;
    detail?: string;
  };
  gender?: 'all' | 'm' | 'f';
  tags?: string[];
}

export const CLOTHING_CATALOG: ClothingItem[] = [
  // Hairstyles
  { id: 'hair_classic_emo', name: 'Scene Swoop Hair', category: 'hair', style: 'scene_swoop', defaultColors: { primary: '#1a1a1a', secondary: '#ff007f' } },
  { id: 'hair_glam_waves', name: 'Glamour Waves', category: 'hair', style: 'glam_waves', defaultColors: { primary: '#ffd54f', secondary: '#ffb300' } },
  { id: 'hair_spiky_cool', name: 'Spiky Rebel', category: 'hair', style: 'spiky_rebel', defaultColors: { primary: '#424242', secondary: '#00bcd4' } },
  { id: 'hair_ponytail_chic', name: 'High Ponytail', category: 'hair', style: 'high_ponytail', defaultColors: { primary: '#6d4c41', secondary: '#8d6e63' } },
  { id: 'hair_dreads_fade', name: 'Dreadlock Fade', category: 'hair', style: 'dreads_fade', defaultColors: { primary: '#212121', secondary: '#424242' } },
  { id: 'hair_bob_bangs', name: 'Modern Bob & Bangs', category: 'hair', style: 'bob_bangs', defaultColors: { primary: '#e91e63', secondary: '#880e4f' } },
  { id: 'hair_undercut_slick', name: 'Undercut Slick', category: 'hair', style: 'undercut_slick', defaultColors: { primary: '#3e2723', secondary: '#5d4037' } },
  { id: 'hair_afro_puff', name: 'Dual Afro Puffs', category: 'hair', style: 'afro_puffs', defaultColors: { primary: '#263238', secondary: '#ff4081' } },
  { id: 'hair_long_straight', name: 'Silky Long Locks', category: 'hair', style: 'long_straight', defaultColors: { primary: '#ffcc80', secondary: '#ffa726' } },
  { id: 'hair_curly_shag', name: 'Messy Shag Curls', category: 'hair', style: 'curly_shag', defaultColors: { primary: '#795548', secondary: '#4e342e' } },

  // Face / Eyes Expressions
  { id: 'face_sparkle_eyes', name: 'Sparkle Eyes', category: 'face', style: 'sparkle', defaultColors: { primary: '#00bcd4', secondary: '#ff80ab' } },
  { id: 'face_cool_smirk', name: 'Cool Smirk', category: 'face', style: 'smirk', defaultColors: { primary: '#4caf50', secondary: '#2e7d32' } },
  { id: 'face_anime_kawaii', name: 'Kawaii Glance', category: 'face', style: 'kawaii', defaultColors: { primary: '#9c27b0', secondary: '#ba68c8' } },
  { id: 'face_fierce_gaze', name: 'Fierce Runway Gaze', category: 'face', style: 'fierce', defaultColors: { primary: '#3f51b5', secondary: '#7986cb' } },
  { id: 'face_chill_smile', name: 'Chill Smile', category: 'face', style: 'chill', defaultColors: { primary: '#5d4037', secondary: '#8d6e63' } },

  // Tops (Shirts, Hoodies, Jackets, Dresses)
  { id: 'top_wooz_hoodie', name: 'Iconic Street Hoodie', category: 'top', style: 'hoodie_street', defaultColors: { primary: '#00bcd4', secondary: '#ffffff', detail: '#ff4081' } },
  { id: 'top_glam_corset', name: 'Rhinestone Bustier', category: 'top', style: 'corset_glam', defaultColors: { primary: '#ff4081', secondary: '#f8bbd0', detail: '#ffd700' } },
  { id: 'top_leather_jacket', name: 'Biker Rocker Jacket', category: 'top', style: 'leather_jacket', defaultColors: { primary: '#212121', secondary: '#e53935', detail: '#cfd8dc' } },
  { id: 'top_crop_graphic', name: 'Retro Graphic Crop', category: 'top', style: 'crop_graphic', defaultColors: { primary: '#ffeb3b', secondary: '#e91e63', detail: '#212121' } },
  { id: 'top_dj_jersey', name: 'Neon Rave Jersey', category: 'top', style: 'dj_jersey', defaultColors: { primary: '#18ffff', secondary: '#76ff03', detail: '#212121' } },
  { id: 'top_formal_blazer', name: 'VIP Gold Blazer', category: 'top', style: 'formal_blazer', defaultColors: { primary: '#ffd54f', secondary: '#212121', detail: '#ffffff' } },
  { id: 'top_cozy_sweater', name: 'Oversized Pastel Knit', category: 'top', style: 'cozy_sweater', defaultColors: { primary: '#ce93d8', secondary: '#f48fb1', detail: '#ffffff' } },
  { id: 'top_tank_tribal', name: 'Summer Tank Top', category: 'top', style: 'tank_tribal', defaultColors: { primary: '#ff7043', secondary: '#26c6da', detail: '#ffffff' } },
  { id: 'top_punk_vest', name: 'Studded Punk Vest', category: 'top', style: 'punk_vest', defaultColors: { primary: '#37474f', secondary: '#b0bec5', detail: '#d50000' } },

  // Bottoms (Pants, Skirts, Shorts)
  { id: 'bottom_skinny_ripped', name: 'Ripped Skinny Jeans', category: 'bottom', style: 'jeans_ripped', defaultColors: { primary: '#1565c0', secondary: '#90caf9' } },
  { id: 'bottom_pleated_skirt', name: 'Anime Pleated Skirt', category: 'bottom', style: 'skirt_pleated', defaultColors: { primary: '#e91e63', secondary: '#ffffff' } },
  { id: 'bottom_cargo_pants', name: 'Cyber Cargo Joggers', category: 'bottom', style: 'cargo_joggers', defaultColors: { primary: '#263238', secondary: '#00e676' } },
  { id: 'bottom_leather_pants', name: 'Tight Leather Pants', category: 'bottom', style: 'leather_pants', defaultColors: { primary: '#111111', secondary: '#37474f' } },
  { id: 'bottom_denim_shorts', name: 'High-Waist Cutoffs', category: 'bottom', style: 'denim_shorts', defaultColors: { primary: '#42a5f5', secondary: '#bbdefb' } },
  { id: 'bottom_glitter_tutu', name: 'Starlet Glitter Tutu', category: 'bottom', style: 'glitter_tutu', defaultColors: { primary: '#f06292', secondary: '#ffd54f' } },
  { id: 'bottom_baggy_skater', name: '90s Skater Pants', category: 'bottom', style: 'baggy_skater', defaultColors: { primary: '#546e7a', secondary: '#263238' } },

  // Shoes (Sneakers, Boots, Heels)
  { id: 'shoes_hi_tops', name: 'Chunky High-Tops', category: 'shoes', style: 'hi_tops', defaultColors: { primary: '#00bcd4', secondary: '#ffffff' } },
  { id: 'shoes_glam_heels', name: 'Runway Platform Heels', category: 'shoes', style: 'glam_heels', defaultColors: { primary: '#ff4081', secondary: '#ffd700' } },
  { id: 'shoes_combat_boots', name: 'Buckle Combat Boots', category: 'shoes', style: 'combat_boots', defaultColors: { primary: '#212121', secondary: '#9e9e9e' } },
  { id: 'shoes_skater_slipons', name: 'Checkerboard Kicks', category: 'shoes', style: 'checker_kicks', defaultColors: { primary: '#ffffff', secondary: '#000000' } },
  { id: 'shoes_neon_rollers', name: 'Glow Roller Skates', category: 'shoes', style: 'roller_skates', defaultColors: { primary: '#76ff03', secondary: '#ff007f' } },

  // Headwear / Hats & Glasses
  { id: 'head_kitty_headphones', name: 'RGB Kitty Headphones', category: 'head', style: 'kitty_headphones', defaultColors: { primary: '#ff4081', secondary: '#00e5ff' } },
  { id: 'head_snapback_cap', name: 'Fresh Snapback Hat', category: 'head', style: 'snapback', defaultColors: { primary: '#263238', secondary: '#ffd600' } },
  { id: 'head_star_crown', name: 'Golden VIP Crown', category: 'head', style: 'gold_crown', defaultColors: { primary: '#ffd700', secondary: '#ff1744' } },
  { id: 'head_aviator_shades', name: 'Shutter & Aviator Shades', category: 'head', style: 'aviator_shades', defaultColors: { primary: '#00bcd4', secondary: '#212121' } },
  { id: 'head_flower_halo', name: 'Spring Blossom Halo', category: 'head', style: 'flower_halo', defaultColors: { primary: '#f8bbd0', secondary: '#e91e63' } },
  { id: 'head_beanie_slouch', name: 'Slouchy Emo Beanie', category: 'head', style: 'slouch_beanie', defaultColors: { primary: '#37474f', secondary: '#cfd8dc' } },

  // Back Items (Wings, Capes, Guitars)
  { id: 'back_fairy_wings', name: 'Iridescent Fairy Wings', category: 'back', style: 'fairy_wings', defaultColors: { primary: '#80deea', secondary: '#f48fb1' } },
  { id: 'back_demon_wings', name: 'Shadow Dragon Wings', category: 'back', style: 'demon_wings', defaultColors: { primary: '#212121', secondary: '#b71c1c' } },
  { id: 'back_electric_guitar', name: 'Rockstar Flying V Guitar', category: 'back', style: 'electric_guitar', defaultColors: { primary: '#e53935', secondary: '#ffffff' } },
  { id: 'back_cyber_backpack', name: 'Hologram Neon Backpack', category: 'back', style: 'cyber_backpack', defaultColors: { primary: '#00e5ff', secondary: '#d500f9' } },

  // Hand Items
  { id: 'hand_glowstick', name: 'Party Glow Wand', category: 'hand', style: 'glow_wand', defaultColors: { primary: '#76ff03', secondary: '#00e5ff' } },
  { id: 'hand_microphone', name: 'Golden Mic', category: 'hand', style: 'gold_mic', defaultColors: { primary: '#ffd700', secondary: '#212121' } },
  { id: 'hand_bubble_tea', name: 'Boba Bubble Tea', category: 'hand', style: 'boba_tea', defaultColors: { primary: '#8d6e63', secondary: '#f8bbd0' } },
  { id: 'hand_skateboard', name: 'Graffiti Deck', category: 'hand', style: 'skateboard', defaultColors: { primary: '#ff6f00', secondary: '#29b6f6' } }
];

export const PRESET_COLOR_PALETTES = [
  '#00bcd4', '#ff4081', '#ffd700', '#76ff03', '#9c27b0', '#ff5722',
  '#e91e63', '#3f51b5', '#00e676', '#ffeb3b', '#ff9800', '#673ab7',
  '#212121', '#424242', '#78909c', '#ffffff', '#8d6e63', '#3e2723',
  '#f8bbd0', '#c8e6c9', '#bbdefb', '#ffe082', '#e1bee7', '#b2dfdb'
];
