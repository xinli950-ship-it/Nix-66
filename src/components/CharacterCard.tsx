import { Character } from '@/data/characters';
import Image from 'next/image';

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
  selected?: boolean;
}

export default function CharacterCard({ character, onSelect, selected }: CharacterCardProps) {
  return (
    <div 
      className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
        selected ? 'border-yellow-400 scale-105 shadow-lg' : 'border-transparent hover:border-gray-400'
      }`}
      onClick={() => onSelect(character)}
    >
      <div className="relative aspect-[2/3] w-full">
        <img 
          src={character.imageUrl} 
          alt={character.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white">
          <h3 className="font-bold text-sm truncate">{character.name}</h3>
          <p className="text-xs opacity-80 truncate">{character.universe}</p>
        </div>
      </div>
    </div>
  );
}
