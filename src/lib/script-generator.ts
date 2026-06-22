import { Character } from '@/data/characters';
import { v4 as uuidv4 } from 'uuid';

export interface MatchSegmentData {
  segment_type: 'stills' | 'video' | 'graphics' | 'audio_only';
  title: string;
  prompt?: string;
  commentary_script: string;
  duration: number;
}

export function generateMatchScript(player1: Character, player2: Character): MatchSegmentData[] {
  return [
    {
      segment_type: 'video',
      title: 'Intro: The Convergence',
      prompt: `Cinematic intro showing a portal opening between ${player1.universe} and ${player2.universe}. Dark, epic atmosphere.`,
      commentary_script: "Ladies and gentlemen, welcome to the ultimate crossover! Today, we witness the impossible as worlds collide.",
      duration: 10
    },
    {
      segment_type: 'stills',
      title: `Fighter Profile: ${player1.name}`,
      commentary_script: `${player1.name}, hailing from ${player1.universe}.${player1.powers && player1.powers.length > 0 ? ` Known for ${player1.powers.slice(0, 2).join(' and ')}.` : ''} A true legend in their own right.`,
      duration: 15
    },
    {
      segment_type: 'stills',
      title: `Fighter Profile: ${player2.name}`,
      commentary_script: `And their opponent, ${player2.name} from ${player2.universe}.${player2.powers && player2.powers.length > 0 ? ` Mastering ${player2.powers.slice(0, 2).join(' and ')}.` : ''} They've never faced a challenge like this before.`,
      duration: 15
    },
    {
      segment_type: 'graphics',
      title: 'Tale of the Tape',
      commentary_script: "Let's look at the stats. Both fighters bring incredible power to the arena. It's anyone's game.",
      duration: 10
    },
    {
      segment_type: 'video',
      title: 'Round 1: The Opening Exchange',
      prompt: `Epic battle between ${player1.name} and ${player2.name}. ${player1.powers && player1.powers.length > 0 ? `${player1.name} uses ${player1.powers[0]}.` : ''} Intense action.`,
      commentary_script: "And we're off! Look at that speed! Both fighters are testing the waters, but the intensity is already off the charts.",
      duration: 10
    },
    {
      segment_type: 'video',
      title: 'Round 2: Escalation',
      prompt: `Intense fight scene. ${player2.powers && player2.powers.length > 0 ? `${player2.name} counter-attacks with ${player2.powers[0]}.` : ''} Debris flying everywhere.`,
      commentary_script: "A massive counter by the challenger! The arena is shaking from the sheer force of these blows!",
      duration: 10
    },
    {
      segment_type: 'video',
      title: 'Final Round: Ultimate Techniques',
      prompt: `Final showdown. Both fighters using their ultimate powers. Blinding light, massive explosion, cinematic finish.`,
      commentary_script: "This is it! They're both going for broke! I've never seen anything like this in all my years of commentary!",
      duration: 15
    },
    {
      segment_type: 'video',
      title: 'The Aftermath',
      prompt: `One fighter standing tall amidst the ruins. The other slowly getting up. Respect shown between warriors.`,
      commentary_script: "What a battle. A true display of heart and power. In the end, only one could stand tall, but both have earned our respect.",
      duration: 10
    }
  ];
}
