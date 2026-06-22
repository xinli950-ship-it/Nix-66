export interface Character {
  id: string;
  name: string;
  universe: string;
  category: 'Anime' | 'Cartoon' | 'WWE' | 'AEW' | 'Toku';
  imageUrl: string;
  powers: string[];
}

export const characters: Character[] = [
  { id: '1', name: 'Goku', universe: 'Dragon Ball', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Goku', powers: ['Kamehameha', 'Super Saiyan'] },
  { id: '2', name: 'Batman', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Batman', powers: ['Intelligence', 'Gadgets'] },
  { id: '3', name: 'Roman Reigns', universe: 'WWE', category: 'WWE', imageUrl: '/references/roman_reigns.png', powers: ['Spear', 'Superman Punch'] },
  { id: '4', name: 'Kenny Omega', universe: 'AEW', category: 'AEW', imageUrl: '/references/kenny_omega.png', powers: ['One Winged Angel', 'V-Trigger'] },
  { id: '5', name: 'Jey Uso', universe: 'WWE', category: 'WWE', imageUrl: '/references/jey_uso.jpg', powers: ['Uso Splash', 'Superkick'] },
  { id: '6', name: 'Jimmy Uso', universe: 'WWE', category: 'WWE', imageUrl: '/references/jimmy_uso.png', powers: ['Uso Splash', 'Superkick'] },
  { id: '7', name: 'Matt Jackson', universe: 'AEW', category: 'AEW', imageUrl: '/references/matt_jackson.png', powers: ['Meltzer Driver', 'Superkick'] },
  { id: '8', name: 'Nick Jackson', universe: 'AEW', category: 'AEW', imageUrl: '/references/nick_jackson.png', powers: ['Meltzer Driver', 'Superkick'] },
  { id: '9', name: 'Solo Sikoa', universe: 'WWE', category: 'WWE', imageUrl: '/references/solo_sikoa.png', powers: ['Samoan Spike', 'Spinning Solo'] },
  { id: '10', name: 'Godzilla', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Godzilla', powers: ['Atomic Breath', 'Tail Whip'] },
  { id: '11', name: 'Ben 10', universe: 'Cartoon Network', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Ben+10', powers: ['Omnitrix', 'Alien Transformation'] },
];
