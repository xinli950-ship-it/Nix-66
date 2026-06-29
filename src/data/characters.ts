export interface Character {
  id: string;
  name: string;
  universe: string;
  category: 'Anime' | 'Cartoon' | 'WWE' | 'AEW' | 'Toku';
  imageUrl: string;
  powers: string[];
}

export const characters: Character[] = [
  { id: '1', name: 'Goku', universe: 'Dragon Ball', category: 'Anime', imageUrl: '/references/goku.png', powers: ['Kamehameha', 'Super Saiyan'] },
  { id: '2', name: 'Batman', universe: 'DC Comics', category: 'Cartoon', imageUrl: '/references/batman.jpg', powers: ['Intelligence', 'Gadgets'] },
  { id: '3', name: 'Roman Reigns', universe: 'WWE', category: 'WWE', imageUrl: '/references/roman_reigns.png', powers: ['Spear', 'Superman Punch'] },
  { id: '4', name: 'Kenny Omega', universe: 'AEW', category: 'AEW', imageUrl: '/references/kenny_omega.png', powers: ['One Winged Angel', 'V-Trigger'] },
  { id: '5', name: 'Jey Uso', universe: 'WWE', category: 'WWE', imageUrl: '/references/jey_uso.jpg', powers: ['Uso Splash', 'Superkick'] },
  { id: '6', name: 'Jimmy Uso', universe: 'WWE', category: 'WWE', imageUrl: '/references/jimmy_uso.png', powers: ['Uso Splash', 'Superkick'] },
  { id: '7', name: 'Matt Jackson', universe: 'AEW', category: 'AEW', imageUrl: '/references/matt_jackson.png', powers: ['Meltzer Driver', 'Superkick'] },
  { id: '8', name: 'Nick Jackson', universe: 'AEW', category: 'AEW', imageUrl: '/references/nick_jackson.png', powers: ['Meltzer Driver', 'Superkick'] },
  { id: '9', name: 'Solo Sikoa', universe: 'WWE', category: 'WWE', imageUrl: '/references/solo_sikoa.png', powers: ['Samoan Spike', 'Spinning Solo'] },
  { id: '10', name: 'Godzilla', universe: 'Toho', category: 'Toku', imageUrl: '/references/godzilla.jpg', powers: ['Atomic Breath', 'Tail Whip'] },
  { id: '11', name: 'Ben 10', universe: 'Cartoon Network', category: 'Cartoon', imageUrl: '/references/ben10.png', powers: ['Omnitrix', 'Alien Transformation'] },
  // FEMALE WRESTLERS
  { id: '12', name: 'Rhea Ripley', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Rhea+Ripley', powers: ['Riptide', 'Powerbomb'] },
  { id: '13', name: 'Becky Lynch', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Becky+Lynch', powers: ['Manhandle Slam', 'Dis-arm-her'] },
  { id: '14', name: 'Bianca Belair', universe: 'WWE', category: 'WWE', imageUrl: 'https://placehold.co/400x600?text=Bianca+Belair', powers: ['KOD', 'Hair Whip'] },
  { id: '15', name: 'Britt Baker', universe: 'AEW', category: 'AEW', imageUrl: 'https://placehold.co/400x600?text=Britt+Baker', powers: ['Lockjaw', 'Slam'] },
  { id: '16', name: 'Jade Cargill', universe: 'AEW', category: 'AEW', imageUrl: 'https://placehold.co/400x600?text=Jade+Cargill', powers: ['Jaded', 'Storm'] },
  // FEMALE CARTOON
  { id: '17', name: 'Kim Possible', universe: 'Disney', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Kim+Possible', powers: ['Martial Arts', 'Gadgets'] },
  { id: '18', name: 'Raven', universe: 'Teen Titans', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Raven', powers: ['Dark Magic', 'Telekinesis'] },
  { id: '19', name: 'Wonder Woman', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Wonder+Woman', powers: ['Lasso of Truth', 'Super Strength'] },
  // FEMALE ANIME
  { id: '20', name: 'Sailor Moon', universe: 'Sailor Moon', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Sailor+Moon', powers: ['Moon Tiara Magic', 'Silver Crystal'] },
  { id: '21', name: 'Chun-Li', universe: 'Street Fighter', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Chun-Li', powers: ['Spinning Bird Kick', 'Lightning Kick'] },
  // VILLAINS
  { id: '22', name: 'Harley Quinn', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Harley+Quinn', powers: ['Acrobatics', 'Hammer'] },
  { id: '23', name: 'Poison Ivy', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Poison+Ivy', powers: ['Plant Control', 'Toxin'] },
  // MORE TOKU
  { id: '24', name: 'Kamen Rider', universe: 'Kamen Rider', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Kamen+Rider', powers: ['Rider Kick', 'Transformation'] },
  { id: '25', name: 'Power Rangers', universe: 'Power Rangers', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Power+Rangers', powers: ['Morphin', 'Megazord'] },
  { id: '26', name: 'King Ghidorah', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=King+Ghidorah', powers: ['Gravity Beams', 'Flight'] },
];
