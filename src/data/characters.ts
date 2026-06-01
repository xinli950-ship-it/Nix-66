export interface Character {
  id: string;
  name: string;
  universe: string;
  category: 'Anime' | 'Cartoon' | 'WWE' | 'AEW' | 'Toku';
  imageUrl: string;
}

export const characters: Character[] = [
  { id: '1', name: 'Goku', universe: 'Dragon Ball', category: 'Anime', imageUrl: 'https://placehold.co/400x600?text=Goku' },
  { id: '2', name: 'Batman', universe: 'DC Comics', category: 'Cartoon', imageUrl: 'https://placehold.co/400x600?text=Batman' },
  { id: '3', name: 'Roman Reigns', universe: 'WWE', category: 'WWE', imageUrl: '/references/roman_reigns.png' },
  { id: '4', name: 'Kenny Omega', universe: 'AEW', category: 'AEW', imageUrl: '/references/kenny_omega.png' },
  { id: '5', name: 'Jey Uso', universe: 'WWE', category: 'WWE', imageUrl: '/references/jey_uso.jpg' },
  { id: '6', name: 'Jimmy Uso', universe: 'WWE', category: 'WWE', imageUrl: '/references/jimmy_uso.png' },
  { id: '7', name: 'Matt Jackson', universe: 'AEW', category: 'AEW', imageUrl: '/references/matt_jackson.png' },
  { id: '8', name: 'Nick Jackson', universe: 'AEW', category: 'AEW', imageUrl: '/references/nick_jackson.png' },
  { id: '9', name: 'Solo Sikoa', universe: 'WWE', category: 'WWE', imageUrl: '/references/solo_sikoa.png' },
  { id: '10', name: 'Godzilla', universe: 'Toho', category: 'Toku', imageUrl: 'https://placehold.co/400x600?text=Godzilla' },
];
