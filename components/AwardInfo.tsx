import React from 'react';
import { MaterialEmojiEventsIcon } from './icons/MaterialEmojiEventsIcon';

interface AwardInfoProps {
  type: string;
  player?: string;
  team?: string;
  stat?: string;
  imageUrl?: string;
}
const AwardInfo: React.FC<AwardInfoProps> = ({ type, player, team, stat, imageUrl }) => {
  if (!player) return null;
  return (
    <div className="p-3 bg-highlight-gold/10 border border-highlight-gold/20 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={player || type} 
          className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-highlight-gold/50 flex-shrink-0" 
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-highlight-gold/20 flex items-center justify-center flex-shrink-0">
          <MaterialEmojiEventsIcon className="w-8 h-8 text-highlight-gold" />
        </div>
      )}
      <div className="flex-grow">
        <p className="font-bold text-light-text text-base">
          {player}
        </p>
        <p className="text-sm text-secondary-text">
          {type} {team && `(${team})`}
        </p>
        {stat && <p className="text-xs text-highlight-gold font-semibold mt-0.5">{stat}</p>}
      </div>
    </div>
  );
};

export default AwardInfo;