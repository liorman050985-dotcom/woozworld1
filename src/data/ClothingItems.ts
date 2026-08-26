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
  // ================= HAIRSTYLES =================
  // Boys / Unisex Hairstyles
  { id: 'hair_jaywooz_rebel', name: 'JayWooz Skater Shag', category: 'hair', style: 'scene_swoop', defaultColors: { primary: '#37474f', secondary: '#00e5ff' }, gender: 'm' },
  { id: 'hair_maxwooz_slick', name: 'MaxWooz Tech Side-Part', category: 'hair', style: 'undercut_slick', defaultColors: { primary: '#212121', secondary: '#ffb300' }, gender: 'm' },
  { id: 'hair_manga_spikes', name: 'Shonen Anime Spikes', category: 'hair', style: 'spiky_rebel', defaultColors: { primary: '#ffd54f', secondary: '#ff6f00' }, gender: 'm' },
  { id: 'hair_surfer_messy', name: 'Messy Surfer Flow', category: 'hair', style: 'curly_shag', defaultColors: { primary: '#8d6e63', secondary: '#ffd54f' }, gender: 'm' },
  { id: 'hair_dreads_fade', name: 'Dreadlock High Fade', category: 'hair', style: 'dreads_fade', defaultColors: { primary: '#212121', secondary: '#424242' }, gender: 'm' },
  { id: 'hair_punk_mohawk', name: 'Neon Punk Mohawk', category: 'hair', style: 'spiky_rebel', defaultColors: { primary: '#e91e63', secondary: '#18ffff' }, gender: 'm' },
  { id: 'hair_classic_emo', name: 'Scene Swoop Hair', category: 'hair', style: 'scene_swoop', defaultColors: { primary: '#1a1a1a', secondary: '#ff007f' }, gender: 'all' },
  { id: 'hair_spiky_cool', name: 'Spiky Rebel', category: 'hair', style: 'spiky_rebel', defaultColors: { primary: '#424242', secondary: '#00bcd4' }, gender: 'all' },
  { id: 'hair_undercut_slick', name: 'Undercut Slick', category: 'hair', style: 'undercut_slick', defaultColors: { primary: '#3e2723', secondary: '#5d4037' }, gender: 'all' },
  { id: 'hair_curly_shag', name: 'Messy Shag Curls', category: 'hair', style: 'curly_shag', defaultColors: { primary: '#795548', secondary: '#4e342e' }, gender: 'all' },

  // Girls / Chic Hairstyles
  { id: 'hair_glam_waves', name: 'Glamour Waves', category: 'hair', style: 'glam_waves', defaultColors: { primary: '#ffd54f', secondary: '#ffb300' }, gender: 'f' },
  { id: 'hair_ponytail_chic', name: 'High Ponytail', category: 'hair', style: 'high_ponytail', defaultColors: { primary: '#6d4c41', secondary: '#8d6e63' }, gender: 'f' },
  { id: 'hair_bob_bangs', name: 'Modern Bob & Bangs', category: 'hair', style: 'bob_bangs', defaultColors: { primary: '#e91e63', secondary: '#880e4f' }, gender: 'f' },
  { id: 'hair_afro_puff', name: 'Dual Afro Puffs', category: 'hair', style: 'afro_puffs', defaultColors: { primary: '#263238', secondary: '#ff4081' }, gender: 'f' },
  { id: 'hair_long_straight', name: 'Silky Long Locks', category: 'hair', style: 'long_straight', defaultColors: { primary: '#ffcc80', secondary: '#ffa726' }, gender: 'f' },

  // ================= FACES / EXPRESSIONS =================
  { id: 'face_cool_smirk', name: 'Cool Boy Smirk', category: 'face', style: 'smirk', defaultColors: { primary: '#00bcd4', secondary: '#00838f' }, gender: 'm' },
  { id: 'face_fierce_gaze', name: 'Fierce Street Gaze', category: 'face', style: 'fierce', defaultColors: { primary: '#ff5722', secondary: '#e64a19' }, gender: 'm' },
  { id: 'face_chill_smile', name: 'Chill Smile', category: 'face', style: 'chill', defaultColors: { primary: '#4caf50', secondary: '#2e7d32' }, gender: 'all' },
  { id: 'face_sparkle_eyes', name: 'Sparkle Eyes', category: 'face', style: 'sparkle', defaultColors: { primary: '#00bcd4', secondary: '#ff80ab' }, gender: 'f' },
  { id: 'face_anime_kawaii', name: 'Kawaii Glance', category: 'face', style: 'kawaii', defaultColors: { primary: '#9c27b0', secondary: '#ba68c8' }, gender: 'f' },

  // ================= TOPS =================
  // Boys Tops
  { id: 'top_varsity_jacket', name: 'Wooz High Letterman Bomber', category: 'top', style: 'formal_blazer', defaultColors: { primary: '#1565c0', secondary: '#ffffff', detail: '#ffd700' }, gender: 'm' },
  { id: 'top_skater_flannel', name: 'Grunge Flannel Over Hoodie', category: 'top', style: 'hoodie_street', defaultColors: { primary: '#b71c1c', secondary: '#212121', detail: '#ffffff' }, gender: 'm' },
  { id: 'top_graphic_skull_tee', name: 'Graffiti Skull Skate Tee', category: 'top', style: 'crop_graphic', defaultColors: { primary: '#212121', secondary: '#00e5ff', detail: '#ffffff' }, gender: 'm' },
  { id: 'top_tuxedo_suit', name: 'VIP Gentleman Tuxedo', category: 'top', style: 'formal_blazer', defaultColors: { primary: '#111111', secondary: '#ffffff', detail: '#ffd700' }, gender: 'm' },
  { id: 'top_leather_jacket', name: 'Biker Rocker Leather', category: 'top', style: 'leather_jacket', defaultColors: { primary: '#212121', secondary: '#e53935', detail: '#cfd8dc' }, gender: 'm' },
  { id: 'top_wooz_hoodie', name: 'Iconic Street Hoodie', category: 'top', style: 'hoodie_street', defaultColors: { primary: '#00bcd4', secondary: '#ffffff', detail: '#ff4081' }, gender: 'all' },
  { id: 'top_dj_jersey', name: 'Neon Rave DJ Jersey', category: 'top', style: 'dj_jersey', defaultColors: { primary: '#18ffff', secondary: '#76ff03', detail: '#212121' }, gender: 'all' },
  { id: 'top_punk_vest', name: 'Studded Punk Vest', category: 'top', style: 'punk_vest', defaultColors: { primary: '#37474f', secondary: '#b0bec5', detail: '#d50000' }, gender: 'all' },
  { id: 'top_tank_tribal', name: 'Summer Muscle Tank', category: 'top', style: 'tank_tribal', defaultColors: { primary: '#ff7043', secondary: '#26c6da', detail: '#ffffff' }, gender: 'm' },

  // Girls Tops
  { id: 'top_glam_corset', name: 'Rhinestone Bustier', category: 'top', style: 'corset_glam', defaultColors: { primary: '#ff4081', secondary: '#f8bbd0', detail: '#ffd700' }, gender: 'f' },
  { id: 'top_crop_graphic', name: 'Retro Graphic Crop', category: 'top', style: 'crop_graphic', defaultColors: { primary: '#ffeb3b', secondary: '#e91e63', detail: '#212121' }, gender: 'f' },
  { id: 'top_cozy_sweater', name: 'Oversized Pastel Knit', category: 'top', style: 'cozy_sweater', defaultColors: { primary: '#ce93d8', secondary: '#f48fb1', detail: '#ffffff' }, gender: 'f' },
  { id: 'top_formal_blazer', name: 'VIP Gold Blazer', category: 'top', style: 'formal_blazer', defaultColors: { primary: '#ffd54f', secondary: '#212121', detail: '#ffffff' }, gender: 'f' },

  // ================= BOTTOMS =================
  // Boys Bottoms
  { id: 'bottom_ripped_baggies', name: 'Distressed Baggy Denim', category: 'bottom', style: 'jeans_ripped', defaultColors: { primary: '#1976d2', secondary: '#bbdefb' }, gender: 'm' },
  { id: 'bottom_cargo_pants', name: 'Cyber Cargo Joggers', category: 'bottom', style: 'cargo_joggers', defaultColors: { primary: '#263238', secondary: '#00e676' }, gender: 'm' },
  { id: 'bottom_baggy_skater', name: '90s Skater Chino Pants', category: 'bottom', style: 'baggy_skater', defaultColors: { primary: '#546e7a', secondary: '#263238' }, gender: 'm' },
  { id: 'bottom_tux_trousers', name: 'Tailored Tuxedo Slacks', category: 'bottom', style: 'leather_pants', defaultColors: { primary: '#111111', secondary: '#263238' }, gender: 'm' },
  { id: 'bottom_skinny_ripped', name: 'Ripped Skinny Jeans', category: 'bottom', style: 'jeans_ripped', defaultColors: { primary: '#1565c0', secondary: '#90caf9' }, gender: 'all' },
  { id: 'bottom_leather_pants', name: 'Tight Leather Pants', category: 'bottom', style: 'leather_pants', defaultColors: { primary: '#111111', secondary: '#37474f' }, gender: 'all' },

  // Girls Bottoms
  { id: 'bottom_pleated_skirt', name: 'Anime Pleated Skirt', category: 'bottom', style: 'skirt_pleated', defaultColors: { primary: '#e91e63', secondary: '#ffffff' }, gender: 'f' },
  { id: 'bottom_denim_shorts', name: 'High-Waist Cutoffs', category: 'bottom', style: 'denim_shorts', defaultColors: { primary: '#42a5f5', secondary: '#bbdefb' }, gender: 'f' },
  { id: 'bottom_glitter_tutu', name: 'Starlet Glitter Tutu', category: 'bottom', style: 'glitter_tutu', defaultColors: { primary: '#f06292', secondary: '#ffd54f' }, gender: 'f' },

  // ================= SHOES =================
  // Boys Shoes
  { id: 'shoes_court_jordans', name: 'Retro Court Hi-Tops', category: 'shoes', style: 'hi_tops', defaultColors: { primary: '#d32f2f', secondary: '#ffffff' }, gender: 'm' },
  { id: 'shoes_combat_boots', name: 'Buckle Combat Boots', category: 'shoes', style: 'combat_boots', defaultColors: { primary: '#212121', secondary: '#9e9e9e' }, gender: 'm' },
  { id: 'shoes_skater_slipons', name: 'Checkerboard Kicks', category: 'shoes', style: 'checker_kicks', defaultColors: { primary: '#ffffff', secondary: '#000000' }, gender: 'm' },
  { id: 'shoes_hi_tops', name: 'Chunky High-Tops', category: 'shoes', style: 'hi_tops', defaultColors: { primary: '#00bcd4', secondary: '#ffffff' }, gender: 'all' },
  { id: 'shoes_neon_rollers', name: 'Glow Roller Skates', category: 'shoes', style: 'roller_skates', defaultColors: { primary: '#76ff03', secondary: '#ff007f' }, gender: 'all' },
  { id: 'shoes_glam_heels', name: 'Runway Platform Heels', category: 'shoes', style: 'glam_heels', defaultColors: { primary: '#ff4081', secondary: '#ffd700' }, gender: 'f' },

  // ================= HEADWEAR / HATS =================
  { id: 'head_snapback_cap', name: 'Fresh Snapback Hat', category: 'head', style: 'snapback', defaultColors: { primary: '#263238', secondary: '#ffd600' }, gender: 'm' },
  { id: 'head_backward_cap', name: 'Backward Skater Cap', category: 'head', style: 'snapback', defaultColors: { primary: '#d32f2f', secondary: '#ffffff' }, gender: 'm' },
  { id: 'head_beanie_slouch', name: 'Slouchy Emo Beanie', category: 'head', style: 'slouch_beanie', defaultColors: { primary: '#37474f', secondary: '#cfd8dc' }, gender: 'm' },
  { id: 'head_aviator_shades', name: 'Dark Aviator Shades', category: 'head', style: 'aviator_shades', defaultColors: { primary: '#00bcd4', secondary: '#212121' }, gender: 'all' },
  { id: 'head_star_crown', name: 'Golden VIP Crown', category: 'head', style: 'gold_crown', defaultColors: { primary: '#ffd700', secondary: '#ff1744' }, gender: 'all' },
  { id: 'head_kitty_headphones', name: 'RGB Kitty Headphones', category: 'head', style: 'kitty_headphones', defaultColors: { primary: '#ff4081', secondary: '#00e5ff' }, gender: 'f' },
  { id: 'head_flower_halo', name: 'Spring Blossom Halo', category: 'head', style: 'flower_halo', defaultColors: { primary: '#f8bbd0', secondary: '#e91e63' }, gender: 'f' },

  // ================= BACK ITEMS =================
  { id: 'back_electric_guitar', name: 'Rockstar Flying V Guitar', category: 'back', style: 'electric_guitar', defaultColors: { primary: '#e53935', secondary: '#ffffff' }, gender: 'all' },
  { id: 'back_demon_wings', name: 'Shadow Dragon Wings', category: 'back', style: 'demon_wings', defaultColors: { primary: '#212121', secondary: '#b71c1c' }, gender: 'all' },
  { id: 'back_cyber_backpack', name: 'Hologram Neon Backpack', category: 'back', style: 'cyber_backpack', defaultColors: { primary: '#00e5ff', secondary: '#d500f9' }, gender: 'all' },
  { id: 'back_fairy_wings', name: 'Iridescent Fairy Wings', category: 'back', style: 'fairy_wings', defaultColors: { primary: '#80deea', secondary: '#f48fb1' }, gender: 'f' },

  // ================= HAND ITEMS =================
  { id: 'hand_skateboard', name: 'Graffiti Pro Skateboard', category: 'hand', style: 'skateboard', defaultColors: { primary: '#ff6f00', secondary: '#29b6f6' }, gender: 'all' },
  { id: 'hand_microphone', name: 'Golden Beatbox Mic', category: 'hand', style: 'gold_mic', defaultColors: { primary: '#ffd700', secondary: '#212121' }, gender: 'all' },
  { id: 'hand_glowstick', name: 'Party Glow Wand', category: 'hand', style: 'glow_wand', defaultColors: { primary: '#76ff03', secondary: '#00e5ff' }, gender: 'all' },
  { id: 'hand_bubble_tea', name: 'Boba Bubble Tea', category: 'hand', style: 'boba_tea', defaultColors: { primary: '#8d6e63', secondary: '#f8bbd0' }, gender: 'all' }
];

export const PRESET_COLOR_PALETTES = [
  '#00bcd4', '#ff4081', '#ffd700', '#76ff03', '#9c27b0', '#ff5722',
  '#e91e63', '#3f51b5', '#00e676', '#ffeb3b', '#ff9800', '#673ab7',
  '#212121', '#424242', '#78909c', '#ffffff', '#8d6e63', '#3e2723',
  '#f8bbd0', '#c8e6c9', '#bbdefb', '#ffe082', '#e1bee7', '#b2dfdb'
];
