import React from 'react';
import { ProcessedSeason, ProcessedGame, TeamStatsData } from '../../types';
import ChampionAwardsDisplay from './ChampionAwardsDisplay';
import PlayoffDisplay from './PlayoffDisplay';
import RegularSeasonResultsDisplay from './RegularSeasonResultsDisplay';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { MinusIcon } from '../icons/MinusIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { MinusCircleIcon } from '../icons/MinusCircleIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { CheckCircleCurrentWeekIcon } from '../icons/CheckCircleCurrentWeekIcon';
import { MinusCircleCurrentWeekIcon } from '../icons/MinusCircleCurrentWeekIcon';
import { XCircleCurrentWeekIcon } from '../icons/XCircleCurrentWeekIcon';

interface DivisionalSeasonBlockProps {
  divisionalSeasonData: ProcessedSeason;
  allGamesForSeason: ProcessedGame[];
  standingsData: TeamStatsData[]; // New prop for standings
}

const DivisionalSeasonBlock: React.FC<DivisionalSeasonBlockProps> = ({ divisionalSeasonData, allGamesForSeason, standingsData }) => {
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
    if (rankChange === 'Up') return <ArrowUpIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Rank up" />;
    if (rankChange === 'Down') return <ArrowDownIcon className="w-5 h-5 text-red-500 mx-auto" aria-label="Rank down" />;
    if (rankChange === 'Same') return <MinusIcon className="w-5 h-5 text-secondary-text mx-auto" aria-label="Rank same" />;
    return <MinusIcon className="w-5 h-5 text-gray-600 mx-auto" aria-label="No change in rank" />;
  };
  const getResultIcon = (result?: string) => {
    if (result === 'W') return <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Win" />;
    if (result === 'D') return <MinusCircleIcon className="w-5 h-5 text-gray-500 mx-auto" aria-label="Draw" />;
    if (result === 'L') return <XCircleIcon className="w-5 h-5 text-red-500 mx-auto" aria-label="Loss" />;
    return <span className="text-gray-600 mx-auto">-</span>;
  };
  const getCurrentWeekResultIcon = (result?: string) => {
    if (result === 'W') return <CheckCircleCurrentWeekIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Win (Current Week)" />;
    if (result === 'D') return <MinusCircleCurrentWeekIcon className="w-5 h-5 text-gray-500 mx-auto" aria-label="Draw (Current Week)" />;
    if (result === 'L') return <XCircleCurrentWeekIcon className="w-5 h-5 text-red-500 mx-auto" aria-label="Loss (Current Week)" />;
    return null;
  };

  return (
    <div className="mb-12 p-4 md:p-6 bg-dark-card shadow-lg rounded-xl border border-dark-border">
      <h2 className="font-display text-3xl font-bold text-light-text mb-6 border-b-2 border-dark-border pb-3">
        {divisionalSeasonData.name}
      </h2>

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
                  <th scope="col" className="pl-5 pr-3 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-2 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider" aria-label="Rank Change">Change</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-secondary-text uppercase tracking-wider">Team</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GP</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">W</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">D</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">L</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GF</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">GA</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">+/-</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">Pts</th>
                  <th scope="col" colSpan={3} className="px-2 py-3 text-center text-xs font-semibold text-secondary-text uppercase tracking-wider">Last 3</th>
                </tr>
              </thead>
              <tbody className="bg-dark-card divide-y divide-dark-border">
                {standingsData.map((row, index) => {
                  const isPlayoffSpot = index < 8; 
                  const rowClass = `hover:bg-main-green/10 transition-colors duration-150`;
                  const currentWeekIcon = getCurrentWeekResultIcon(row.currentWeekResult);
                  return (
                    <tr key={`${row.teamName}-${row.year}-${row.seasonName}-${row.division}-${index}`} className={rowClass}>
                      <td className="relative pl-5 pr-3 py-3 whitespace-nowrap text-sm font-medium text-light-text">
                        {isPlayoffSpot && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-main-green" aria-hidden="true"></div>
                        )}
                        {index + 1}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-center">{getRankChangeIcon(row.rankChange)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-light-text">{row.teamName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.played}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.wins}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.draws}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.losses}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.goalsFor}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.goalsAgainst}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text text-center">{row.goalDifference}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-highlight-gold text-center">{row.points}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Two Weeks Ago Result">{getResultIcon(row.twoWeekResult)}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Last Week Result">{getResultIcon(row.lastWeekResult)}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-secondary-text text-center" title="Current Week Result">
                        {currentWeekIcon ? currentWeekIcon : (row.currentWeekResult || '-')}
                      </td>
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