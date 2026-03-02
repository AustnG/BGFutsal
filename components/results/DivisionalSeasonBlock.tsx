

import React from 'react';
import { ProcessedSeason, ProcessedGame, TeamStatsData } from '../../types';
import ChampionAwardsDisplay from './ChampionAwardsDisplay';
import PlayoffDisplay from './PlayoffDisplay';
import RegularSeasonResultsDisplay from './RegularSeasonResultsDisplay';
import { MinusIcon } from '../icons/MinusIcon';
import { ChevronUpIcon } from '../icons/ChevronUpIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface DivisionalSeasonBlockProps {
  divisionalSeasonData: ProcessedSeason;
  allGamesForSeason: ProcessedGame[];
  standingsData: TeamStatsData[]; // New prop for standings
  hideTitle?: boolean;
}

const DivisionalSeasonBlock: React.FC<DivisionalSeasonBlockProps> = ({ divisionalSeasonData, allGamesForSeason, standingsData, hideTitle = false }) => {
  const playoffTypes = ['Quarter Finals', 'Semi Finals', 'Finals'];
  
  const playoffGameTypeOrder: Record<string, number> = {
    'Finals': 1,
    'Semi Finals': 2,
    'Quarter Finals': 3,
  };

  const playoffGames = allGamesForSeason
    .filter(game => playoffTypes.includes(game.gameType))
    .sort((a, b) => {
      const orderA = playoffGameTypeOrder[a.gameType] || 99;
      const orderB = playoffGameTypeOrder[b.gameType] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const regularSeasonGames = allGamesForSeason
    .filter(game => !playoffTypes.includes(game.gameType))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getRankChangeIcon = (rankChange?: string) => {
    if (rankChange === 'Up') return <ChevronUpIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Rank up" />;
    if (rankChange === 'Down') return <ChevronDownIcon className="w-5 h-5 text-red-500 mx-auto" aria-label="Rank down" />;
    if (rankChange === 'Same') return <MinusIcon className="w-5 h-5 text-secondary-text mx-auto" aria-label="Rank same" />;
    return <MinusIcon className="w-5 h-5 text-gray-600 mx-auto" aria-label="No change in rank" />;
  };

  const getResultIndicator = (result?: string, isCurrentWeek = false) => {
    if (!result || !['W', 'D', 'L'].includes(result.toUpperCase())) {
        return <span className="text-secondary-text mx-auto">-</span>;
    }

    const upperResult = result.toUpperCase();
    let bgColor = '';
    let label = '';
    switch (upperResult) {
        case 'W':
            bgColor = 'bg-green-500';
            label = 'Win';
            break;
        case 'D':
            bgColor = 'bg-gray-500';
            label = 'Draw';
            break;
        case 'L':
            bgColor = 'bg-red-500';
            label = 'Loss';
            break;
    }

    return (
        <div className="relative flex justify-center">
            <div 
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold text-white ${bgColor}`} 
                aria-label={label + (isCurrentWeek ? ' (Current Week)' : '')}
            >
                {upperResult}
            </div>
            {isCurrentWeek && <div className={`absolute -bottom-1 w-4 h-0.5 ${bgColor} rounded-md`} aria-hidden="true"></div>}
        </div>
    );
  };

  return (
    <div className="mb-12 p-4 md:p-6 bg-dark-card shadow-lg rounded-xl border border-dark-border">
      {!hideTitle && (
        <h2 className="font-display text-3xl font-bold text-light-text mb-6 border-b-2 border-dark-border pb-3">
          {divisionalSeasonData.name}
        </h2>
      )}

      {divisionalSeasonData.seasonWinner && (
        <ChampionAwardsDisplay seasonData={divisionalSeasonData} />
      )}

      {playoffGames.length > 0 && (
        <PlayoffDisplay playoffGames={playoffGames} />
      )}
      
      {standingsData.length > 0 && (
        <div className="my-8 pt-4">
          <h3 className="font-display text-2xl font-semibold text-light-text mb-4 border-b-2 border-dark-border pb-2">
            Regular Season Standings
          </h3>
          <div className="overflow-x-auto shadow-md rounded-lg border border-dark-border">
             <table className="min-w-full divide-y divide-dark-border">
              <thead className="bg-dark-bg/50">
                <tr>
                  <th scope="col" className="pl-4 pr-2 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider" aria-label="Rank Change">Change</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">Team</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">Pts</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GP</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">W</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">D</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">L</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GD</th>
                  <th scope="col" colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">Last 3</th>
                </tr>
              </thead>
              <tbody className="bg-dark-card divide-y divide-dark-border">
                {standingsData.map((row, index) => {
                  const isDropped = row.dropped;
                  const isPlayoffSpot = !isDropped && index < 8; 
                  const rowClass = isDropped 
                    ? `bg-red-900/10 grayscale opacity-60` 
                    : `hover:bg-main-green/10 transition-colors duration-150`;

                  return (
                    <tr key={`${row.teamName}-${row.year}-${row.seasonName}-${row.division}-${index}`} className={rowClass}>
                      <td className="relative pl-4 pr-2 py-3 whitespace-nowrap text-sm font-medium text-light-text">
                        {isPlayoffSpot && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-main-green" aria-hidden="true"></div>
                        )}
                        {isDropped ? '-' : index + 1}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-center">{isDropped ? '-' : getRankChangeIcon(row.rankChange)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-light-text">
                        <div className="flex items-center">
                          {row.teamColor && (
                            <span 
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0 shadow-sm border border-white/10" 
                              style={{ backgroundColor: row.teamColor }}
                              aria-hidden="true"
                            ></span>
                          )}
                          {row.teamName}
                          {isDropped && <span className="ml-2 text-xs text-red-400 font-normal italic">(Dropped)</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-highlight-gold text-center">{row.points}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.played}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.wins}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.draws}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.losses}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.goalDifference}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Two Weeks Ago Result">{getResultIndicator(row.twoWeekResult)}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Last Week Result">{getResultIndicator(row.lastWeekResult)}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Current Week Result">{getResultIndicator(row.currentWeekResult, true)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center space-x-2 text-sm text-secondary-text mt-4 p-2 bg-dark-bg/50 border border-dark-border rounded-md">
            <span className="w-1 h-4 bg-main-green block flex-shrink-0" aria-hidden="true"></span>
            <span>Playoff Qualifying Position</span>
          </div>
        </div>
      )}

      <RegularSeasonResultsDisplay regularSeasonGames={regularSeasonGames} />

    </div>
  );
};

export default DivisionalSeasonBlock;
