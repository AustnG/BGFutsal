import React, { useState, useMemo, useEffect } from 'react';
import { ProcessedGame } from '../../types';
import GameCard from '../GameCard'; 
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface RegularSeasonResultsDisplayProps {
  regularSeasonGames: ProcessedGame[];
}

interface GameWeekSectionProps {
  week: string | number;
  games: ProcessedGame[];
  initiallyOpen?: boolean;
}

const GameWeekSection: React.FC<GameWeekSectionProps> = ({ week, games, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const weekId = `gameweek-${String(week).replace(/\s+/g, '-').toLowerCase()}`;

  useEffect(() => {
    setIsOpen(initiallyOpen);
  }, [initiallyOpen]);

  return (
    <div className="mb-3 py-2 border-b border-dark-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-medium text-light-text hover:bg-main-green/10 p-3 rounded-md transition-colors duration-150"
        aria-expanded={isOpen}
        aria-controls={weekId}
      >
        <span className="font-display">Game Week {week === 'NaN' || week === 'Unspecified' ? 'Unspecified' : week}</span>
        <ChevronDownIcon className={`w-5 h-5 text-secondary-text transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={weekId}
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-2 pl-2 md:pl-4 space-y-3 border-l-2 border-main-green/30 ml-1 py-2">
            {games.length > 0 ? (
              games.map(game => <GameCard key={game.id} game={game} isPlayoff={false} />)
            ) : (
              <p className="text-sm text-secondary-text p-2">No games recorded for this week.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const RegularSeasonResultsDisplay: React.FC<RegularSeasonResultsDisplayProps> = ({ regularSeasonGames }) => {
  if (regularSeasonGames.length === 0) {
    return (
      <section aria-labelledby="regular-season-title" className="my-8 py-4">
        <h3 id="regular-season-title" className="font-display text-2xl font-semibold text-light-text mb-3">Regular Season</h3>
        <p className="text-secondary-text p-4 bg-dark-bg/50 rounded-md border border-dark-border">No regular season games have been recorded yet for this division.</p>
      </section>
    );
  }

  const groupedGamesByWeek = useMemo(() => {
    return regularSeasonGames.reduce((acc, game) => {
      const weekKey = isNaN(game.gameWeek as number) || game.gameWeek === null || game.gameWeek === undefined 
                      ? 'Unspecified' 
                      : String(game.gameWeek);
      if (!acc[weekKey]) {
        acc[weekKey] = [];
      }
      acc[weekKey].push(game);
      return acc;
    }, {} as Record<string, ProcessedGame[]>);
  }, [regularSeasonGames]);

  const sortedWeekKeys = Object.keys(groupedGamesByWeek).sort((a, b) => {
    if (a === 'Unspecified') return 1; 
    if (b === 'Unspecified') return -1;
    const weekA = parseInt(a, 10);
    const weekB = parseInt(b, 10);
    return weekB - weekA; 
  });


  return (
    <section aria-labelledby="regular-season-title" className="my-8">
      <h3 id="regular-season-title" className="font-display text-2xl font-semibold text-light-text mb-4 border-b-2 border-dark-border pb-2">Regular Season Results</h3>
      {sortedWeekKeys.map((weekKey, index) => (
        <GameWeekSection 
          key={weekKey} 
          week={weekKey} 
          games={groupedGamesByWeek[weekKey].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())} 
          initiallyOpen={regularSeasonGames.length > 0 && index === 0} 
        />
      ))}
    </section>
  );
};

export default RegularSeasonResultsDisplay;