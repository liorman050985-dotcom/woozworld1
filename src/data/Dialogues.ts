export interface NPCDialogueNode {
  id: string;
  npcName: string;
  avatarStyle: {
    hairId: string;
    hairColor: string;
    topId: string;
    topColor: string;
    bottomId: string;
    bottomColor: string;
    skinColor: string;
  };
  text: string;
  options: {
    label: string;
    action?: 'close' | 'startFashion' | 'startTrivia' | 'changeMusic' | 'giveItem' | 'next';
    targetNodeId?: string;
  }[];
}

export const WOOZBAND_DIALOGUES: Record<string, NPCDialogueNode> = {
  mya_intro: {
    id: 'mya_intro',
    npcName: 'MyaWooz (Fashion Icon)',
    avatarStyle: {
      hairId: 'hair_glam_waves',
      hairColor: '#ffd54f',
      topId: 'top_glam_corset',
      topColor: '#ff4081',
      bottomId: 'bottom_glitter_tutu',
      bottomColor: '#f06292',
      skinColor: '#ffe0b2'
    },
    text: "OMG hey darling! ✨ Welcome back to the glamorous world of Wooz! I'm Mya, your resident style guru. Are you ready to strut down the runway and show off your fabulous outfit?",
    options: [
      { label: "👠 Let's do a Fashion Show!", action: 'startFashion' },
      { label: "🎨 How do I customize my look?", targetNodeId: 'mya_style_tips' },
      { label: "See you later, Mya!", action: 'close' }
    ]
  },
  mya_style_tips: {
    id: 'mya_style_tips',
    npcName: 'MyaWooz',
    avatarStyle: {
      hairId: 'hair_glam_waves',
      hairColor: '#ffd54f',
      topId: 'top_glam_corset',
      topColor: '#ff4081',
      bottomId: 'bottom_glitter_tutu',
      bottomColor: '#f06292',
      skinColor: '#ffe0b2'
    },
    text: "Click on the **Wardrobe** button in the bottom dock! You have full access to every garment in existence with ZERO price tags. Use the iconic Color Wheel to mix & match any color vibe you desire!",
    options: [
      { label: "💖 Thanks! Let's hit the runway now!", action: 'startFashion' },
      { label: "Awesome, I'm gonna go style myself!", action: 'close' }
    ]
  },
  jenny_intro: {
    id: 'jenny_intro',
    npcName: 'JennyWooz (Social Hostess)',
    avatarStyle: {
      hairId: 'hair_ponytail_chic',
      hairColor: '#6d4c41',
      topId: 'top_cozy_sweater',
      topColor: '#ce93d8',
      bottomId: 'bottom_pleated_skirt',
      bottomColor: '#e91e63',
      skinColor: '#ffcc80'
    },
    text: "Hiiiii bestie! 💕 I'm Jenny! It's so amazing to see you here in our offline hangout. You can design your very own Unitz, invite simulated party bots, or just chill and chat!",
    options: [
      { label: "🏠 How do I build my Unitz?", targetNodeId: 'jenny_unitz_tips' },
      { label: "🎶 Play some groovy music!", action: 'changeMusic' },
      { label: "Just saying hello!", action: 'close' }
    ]
  },
  jenny_unitz_tips: {
    id: 'jenny_unitz_tips',
    npcName: 'JennyWooz',
    avatarStyle: {
      hairId: 'hair_ponytail_chic',
      hairColor: '#6d4c41',
      topId: 'top_cozy_sweater',
      topColor: '#ce93d8',
      bottomId: 'bottom_pleated_skirt',
      bottomColor: '#e91e63',
      skinColor: '#ffcc80'
    },
    text: "Click the **Edit Unitz** button at the bottom! You can place neon couches, DJ decks, marble fountains, and paint any floor or wall tile. Everything in the catalog is 100% free forever!",
    options: [
      { label: "Yay, I'm ready to decorate!", action: 'close' }
    ]
  },
  max_intro: {
    id: 'max_intro',
    npcName: 'MaxWooz (Gamer & Techie)',
    avatarStyle: {
      hairId: 'hair_spiky_cool',
      hairColor: '#424242',
      topId: 'top_wooz_hoodie',
      topColor: '#00bcd4',
      bottomId: 'bottom_cargo_pants',
      bottomColor: '#263238',
      skinColor: '#ffcc80'
    },
    text: "Yo! Max here. 🕹️ I've been hacking on the arcade retro trivia engine. Think you know your classic 2000s/2010s virtual world and Flash game lore?",
    options: [
      { label: "🕹️ Start Retro Trivia Challenge!", action: 'startTrivia' },
      { label: "👾 Tell me about this offline engine!", targetNodeId: 'max_tech_lore' },
      { label: "Catch ya later, Max!", action: 'close' }
    ]
  },
  max_tech_lore: {
    id: 'max_tech_lore',
    npcName: 'MaxWooz',
    avatarStyle: {
      hairId: 'hair_spiky_cool',
      hairColor: '#424242',
      topId: 'top_wooz_hoodie',
      topColor: '#00bcd4',
      bottomId: 'bottom_cargo_pants',
      bottomColor: '#263238',
      skinColor: '#ffcc80'
    },
    text: "This entire world is running locally in your browser using pure HTML5 Canvas isometric rendering and Web Audio synthesis. No servers, no microtransactions, infinite Wooz & Beex!",
    options: [
      { label: "🔥 Let's play the Trivia game!", action: 'startTrivia' },
      { label: "That rocks, see ya!", action: 'close' }
    ]
  },
  jay_intro: {
    id: 'jay_intro',
    npcName: 'JayWooz (Master DJ)',
    avatarStyle: {
      hairId: 'hair_undercut_slick',
      hairColor: '#3e2723',
      topId: 'top_leather_jacket',
      topColor: '#212121',
      bottomId: 'bottom_skinny_ripped',
      bottomColor: '#1565c0',
      skinColor: '#d7ccc8'
    },
    text: "Sup! Jay in the house. 🎧 The bass is pumping and the vibes are immaculate. Ready to drop a new beat or show off some breakdance moves?",
    options: [
      { label: "🎧 Switch the background track!", action: 'changeMusic' },
      { label: "🕺 How do I emote and dance?", targetNodeId: 'jay_emotes_info' },
      { label: "Peace out, Jay!", action: 'close' }
    ]
  },
  jay_emotes_info: {
    id: 'jay_emotes_info',
    npcName: 'JayWooz',
    avatarStyle: {
      hairId: 'hair_undercut_slick',
      hairColor: '#3e2723',
      topId: 'top_leather_jacket',
      topColor: '#212121',
      bottomId: 'bottom_skinny_ripped',
      bottomColor: '#1565c0',
      skinColor: '#d7ccc8'
    },
    text: "Open the **Emotes** wheel in the bottom bar to bust out classic breakdances, model poses, waves, and celebrations anytime!",
    options: [
      { label: "Awesome! Let's party!", action: 'close' }
    ]
  }
};

export const BOT_CHAT_PHRASES = [
  "OMG loving your outfit today! 💖",
  "Woozworld classic vibes are unmatched!",
  "Who wants to come check out my custom Unitz?",
  "The music in this room is such a banger 🎶",
  "Mya is judging the next runway contest!",
  "Infinite Beex and Wooz... living the dream! ✨",
  "Meet me by the central fountain in 5 mins!",
  "Just redesigned my hair colors with the color wheel!"
];

export const TRIVIA_QUESTIONS = [
  {
    question: "What year did Woozworld officially launch its Flash virtual world?",
    options: ["2009", "2012", "2015", "2005"],
    correctIndex: 0
  },
  {
    question: "Who are the four iconic members of the Woozband?",
    options: ["Mya, Jenny, Max, Jay", "Alex, Sam, Clover, Jerry", "Finn, Jake, Marceline, BMO", "Luna, Stella, Bloom, Flora"],
    correctIndex: 0
  },
  {
    question: "What are personal customizable rooms called in Woozworld?",
    options: ["Unitz", "Dens", "Igloos", "Suites"],
    correctIndex: 0
  },
  {
    question: "What are the two main currencies of the classic game?",
    options: ["Wooz & Beex", "Coins & Diamonds", "Gems & Gold", "Credits & Duckets"],
    correctIndex: 0
  },
  {
    question: "Which feature allowed players to recolor virtually any clothing piece?",
    options: ["The Color Wheel", "Dye Pot", "Paint Brush", "Prism Studio"],
    correctIndex: 0
  }
];
