export interface Character {
  id: string;
  name: string;
  universe: string;
  category: 'Anime' | 'Cartoon' | 'WWE' | 'AEW' | 'Toku';
  imageUrl: string;
  powers: string[];
}

export const characters: Character[] = [
  // ===== ANIME =====
  { id: '1', name: 'Goku', universe: 'Dragon Ball', category: 'Anime', imageUrl: '/references/goku.png', powers: ['Kamehameha', 'Super Saiyan'] },
  { id: '2', name: 'Vegeta', universe: 'Dragon Ball', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Vegeta', powers: ['Final Flash', 'Galick Gun'] },
  { id: '3', name: 'Naruto', universe: 'Naruto', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Naruto', powers: ['Rasengan', 'Shadow Clone'] },
  { id: '4', name: 'Luffy', universe: 'One Piece', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Luffy', powers: ['Gomu Gomu', 'Gear 5'] },
  { id: '5', name: 'Ichigo', universe: 'Bleach', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Ichigo', powers: ['Bankai', 'Getsuga Tensho'] },
  { id: '6', name: 'Saitama', universe: 'One Punch Man', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Saitama', powers: ['Serious Punch', 'Normal Consecutive Punches'] },
  { id: '7', name: 'Sailor Moon', universe: 'Sailor Moon', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Sailor+Moon', powers: ['Moon Tiara Magic', 'Silver Crystal'] },
  { id: '8', name: 'Chun-Li', universe: 'Street Fighter', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Chun-Li', powers: ['Spinning Bird Kick', 'Lightning Kick'] },
  { id: '9', name: 'Frieza', universe: 'Dragon Ball', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Frieza', powers: ['Death Ball', 'Supernova'] },

  // ===== CARTOONS =====
  { id: '10', name: 'Batman', universe: 'DC Comics', category: 'Cartoon', imageUrl: '/references/batman.jpg', powers: ['Intelligence', 'Gadgets'] },
  { id: '11', name: 'Ben 10', universe: 'Cartoon Network', category: 'Cartoon', imageUrl: '/references/ben10.png', powers: ['Omnitrix', 'Alien Transformation'] },
  { id: '12', name: 'SpongeBob', universe: 'SpongeBob', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=SpongeBob', powers: ['Sponge Regeneration', 'Bubble Blowing'] },
  { id: '13', name: 'Finn the Human', universe: 'Adventure Time', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Finn', powers: ['Sword Fighting', 'Adventure Skills'] },
  { id: '14', name: 'Rick Sanchez', universe: 'Rick and Morty', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Rick', powers: ['Portal Gun', 'Genius Intellect'] },
  { id: '15', name: 'Spider-Man', universe: 'Marvel', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Spider-Man', powers: ['Web Shooting', 'Spider Sense'] },
  { id: '16', name: 'Kim Possible', universe: 'Disney', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Kim+Possible', powers: ['Martial Arts', 'Gadgets'] },
  { id: '17', name: 'Raven', universe: 'Teen Titans', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Raven', powers: ['Dark Magic', 'Telekinesis'] },
  { id: '18', name: 'Wonder Woman', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Wonder+Woman', powers: ['Lasso of Truth', 'Super Strength'] },

  // ===== WWE =====
  { id: '19', name: 'Roman Reigns', universe: 'WWE', category: 'WWE', imageUrl: '/references/roman_reigns.png', powers: ['Spear', 'Superman Punch'] },
  { id: '20', name: 'John Cena', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=John+Cena', powers: ['AA', 'Five Knuckle Shuffle'] },
  { id: '21', name: 'The Rock', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=The+Rock', powers: ['Rock Bottom', 'People\'s Elbow'] },
  { id: '22', name: 'Cody Rhodes', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Cody+Rhodes', powers: ['Cross Rhodes', 'Cutter'] },
  { id: '23', name: 'Seth Rollins', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Seth+Rollins', powers: ['Curb Stomp', 'Pedigree'] },
  { id: '24', name: 'Stone Cold', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Stone+Cold', powers: ['Stunner', 'Austin 3:16'] },
  { id: '25', name: 'Jey Uso', universe: 'WWE', category: 'WWE', imageUrl: '/references/jey_uso.jpg', powers: ['Uso Splash', 'Superkick'] },
  { id: '26', name: 'Jimmy Uso', universe: 'WWE', category: 'WWE', imageUrl: '/references/jimmy_uso.png', powers: ['Uso Splash', 'Superkick'] },
  { id: '27', name: 'Solo Sikoa', universe: 'WWE', category: 'WWE', imageUrl: '/references/solo_sikoa.png', powers: ['Samoan Spike', 'Spinning Solo'] },
  { id: '28', name: 'Rhea Ripley', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Rhea+Ripley', powers: ['Riptide', 'Powerbomb'] },
  { id: '29', name: 'Becky Lynch', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Becky+Lynch', powers: ['Manhandle Slam', 'Dis-arm-her'] },
  { id: '30', name: 'Bianca Belair', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Bianca+Belair', powers: ['KOD', 'Hair Whip'] },

  // ===== AEW =====
  { id: '31', name: 'Kenny Omega', universe: 'AEW', category: 'AEW', imageUrl: '/references/kenny_omega.png', powers: ['One Winged Angel', 'V-Trigger'] },
  { id: '32', name: 'MJF', universe: 'AEW', category: 'AEW', imageUrl: 'https://placehold.co/400x600?text=MJF', powers: ['Salt Throw', 'Heat Seeker'] },
  { id: '33', name: 'Will Ospreay', universe: 'AEW', category: 'AEW', imageUrl: 'https://placehold.co/400x600?text=Will+Ospreay', powers: ['Hidden Blade', 'Storm Breaker'] },
  { id: '34', name: 'Hangman Page', universe: 'AEW', category: 'AEW', imageUrl: 'https://placehold.co/400x600?text=Hangman+Page', powers: ['Buckshot Lariat', 'Deadeye'] },
  { id: '35', name: 'Matt Jackson', universe: 'AEW', category: 'AEW', imageUrl: '/references/matt_jackson.png', powers: ['Meltzer Driver', 'Superkick'] },
  { id: '36', name: 'Nick Jackson', universe: 'AEW', category: 'AEW', imageUrl: '/references/nick_jackson.png', powers: ['Meltzer Driver', 'Superkick'] },
  { id: '37', name: 'Britt Baker', universe: 'AEW', category: 'AEW', imageUrl: 'https://placehold.co/400x600?text=Britt+Baker', powers: ['Lockjaw', 'Slam'] },
  { id: '38', name: 'Jade Cargill', universe: 'AEW', category: 'AEW', imageUrl: 'https://placehold.co/400x600?text=Jade+Cargill', powers: ['Jaded', 'Storm'] },

  // ===== TOKU — HEROES =====
  { id: '39', name: 'Ultraman', universe: 'Ultraman', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Ultraman', powers: ['Specium Ray', 'Ultra Slash'] },
  { id: '40', name: 'Kamen Rider Ichigo', universe: 'Kamen Rider', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Kamen+Rider+1', powers: ['Rider Kick', 'Typhoon'] },
  { id: '41', name: 'Kamen Rider Black', universe: 'Kamen Rider', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Kamen+Black', powers: ['Rider Punch', 'Kingstone Flash'] },
  { id: '42', name: 'Kamen Rider Decade', universe: 'Kamen Rider', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Kamen+Decade', powers: ['Decade Slash', 'Dimension Kick'] },
  { id: '43', name: 'Super Sentai Red', universe: 'Super Sentai', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Red+Ranger', powers: ['Morphin', 'Team Attack'] },
  { id: '44', name: 'Power Rangers', universe: 'Power Rangers', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Power+Rangers', powers: ['Morphin', 'Megazord'] },
  { id: '45', name: 'Gridman', universe: 'Gridman', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Gridman', powers: ['Grid Beam', 'Plastic Sword'] },
  { id: '46', name: 'Zone Fighter', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Zone+Fighter', powers: ['Meteor Missile', 'Zone Beam'] },
  { id: '47', name: 'Garo', universe: 'Garo', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Garo', powers: ['Garoken Sword', 'Flame of Purgatory'] },
  // ===== TOKU — FEMALE HEROES =====
  { id: '48', name: 'Ultrawoman', universe: 'Ultraman', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Ultrawoman', powers: ['Specium Ray', 'Ultra Barrier'] },
  { id: '49', name: 'Kamen Rider Femme', universe: 'Kamen Rider', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Rider+Femme', powers: ['Blade Slash', 'Rider Kick'] },
  { id: '50', name: 'Pink Ranger', universe: 'Power Rangers', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Pink+Ranger', powers: ['Ptera Arrow', 'Morphin'] },

  // ===== TOKU — VILLAINS & MONSTERS =====
  { id: '51', name: 'Godzilla', universe: 'Toho', category: 'Toku', imageUrl: '/references/godzilla.jpg', powers: ['Atomic Breath', 'Tail Whip'] },
  { id: '52', name: 'King Ghidorah', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=King+Ghidorah', powers: ['Gravity Beams', 'Flight'] },
  { id: '53', name: 'Mechagodzilla', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Mechagodzilla', powers: ['Absolute Zero Cannon', 'Missiles'] },
  { id: '54', name: 'Destoroyah', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Destoroyah', powers: ['Micro Oxygen', 'Katana Horn'] },
  { id: '55', name: 'Gigan', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Gigan', powers: ['Buzzsaw Claw', 'Laser Beam'] },
  { id: '56', name: 'Mothra', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Mothra', powers: ['Poison Scales', 'Light Beam'] },
  { id: '57', name: 'SpaceGodzilla', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=SpaceGodzilla', powers: ['Corona Beam', 'Crystal Shield'] },
  { id: '58', name: 'Alien Baltan', universe: 'Ultraman', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Alien+Baltan', powers: ['Claw Attack', 'Teleportation'] },
  { id: '59', name: 'Zetton', universe: 'Ultraman', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Zetton', powers: ['One Trillion Degree Fireball', 'Barrier'] },
  { id: '60', name: 'Gomora', universe: 'Ultraman', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Gomora', powers: ['Super Oscillatory Wave', 'Tail Attack'] },
  { id: '61', name: 'Red King', universe: 'Ultraman', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Red+King', powers: ['Rock Throw', 'Brute Force'] },
  { id: '62', name: 'Shadow Moon', universe: 'Kamen Rider', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Shadow+Moon', powers: ['Shadow Kick', 'Satan Saber'] },
  { id: '63', name: 'Jashin-14', universe: 'Kamen Rider', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Jashin-14', powers: ['Darkness Manipulation', 'Mind Control'] },

  // ===== VILLAINS (Cartoon) =====
  { id: '64', name: 'Harley Quinn', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Harley+Quinn', powers: ['Acrobatics', 'Hammer'] },
  { id: '65', name: 'Poison Ivy', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Poison+Ivy', powers: ['Plant Control', 'Toxin'] },
  { id: '66', name: 'Joker', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Joker', powers: ['Joker Venom', 'Chaos'] },
];
