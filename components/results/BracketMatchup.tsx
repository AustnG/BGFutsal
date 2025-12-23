

import React from 'react';
import { ProcessedGame } from '../../types';

interface BracketMatchupProps {
  game?: ProcessedGame;
  team1NameOverride?: string;
  team2NameOverride?: string;
  gameTitle?: string;
}

const BracketMatchup: React.FC<BracketMatchupProps> = ({ 
  game, 
  team1NameOverride, 
  team2NameOverride,
  gameTitle,
}) => {
  const team1Name = game?.homeTeam || team1NameOverride || 'TBD';
  const team2Name = game?.awayTeam || team2NameOverride || 'TBD';
  
  const regulationScore1 = !isNaN(game?.homeScore as number) ? game?.homeScore : '-';
  const regulationScore2 = !isNaN(game?.awayScore as number) ? game?.awayScore : '-';

  const pkScore1 = (game?.homePKs !== undefined && !isNaN(game.homePKs)) ? game.homePKs : null;
  const pkScore2 = (game?.awayPKs !== undefined && !isNaN(game.awayPKs)) ? game.awayPKs : null;

  let team1Winner = false;
  let team2Winner = false;
  const hasGameBeenPlayed = game && !isNaN(game.homeScore) && !isNaN(game.awayScore);

  if (game?.homeForfeit) {
    team2Winner = true;
  } else if (game?.awayForfeit) {
    team1Winner = true;
  } else if (hasGameBeenPlayed) {
    if (game.homeScore > game.awayScore) {
      team1Winner = true;
    } else if (game.awayScore > game.homeScore) {
      team2Winner = true;
    } else { // Regulation scores are tied, check PKs
      if (pkScore1 !== null && pkScore2 !== null) {
        if (pkScore1 > pkScore2) team1Winner = true;
        if (pkScore2 > pkScore1) team2Winner = true;
      }
    }
  }
  
  function getWinnerName(g?: ProcessedGame): string | null {
    if (!g) return null;
    if (g.homeForfeit) return g.awayTeam;
    if (g.awayForfeit) return g.homeTeam;
    if (isNaN(g.homeScore) || isNaN(g.awayScore)) return null;

    if (g.homeScore > g.awayScore) return g.homeTeam;
    if (g.awayScore > g.homeScore) return g.awayTeam;
    if (g.homeScore === g.awayScore) {
      if (g.homePKs !== undefined && g.awayPKs !== undefined && !isNaN(g.homePKs) && !isNaN(g.awayPKs)) {
        if (g.homePKs > g.awayPKs) return g.homeTeam;
        if (g.awayPKs > g.homePKs) return g.awayTeam;
      }
    }
    return null;
  }

   if (!team1Winner && !team2Winner && game) {
     const gameWinnerName = getWinnerName(game);
     if (team1NameOverride && gameWinnerName === team1NameOverride) team1Winner = true;
     if (team2NameOverride && gameWinnerName === team2NameOverride) team2Winner = true;
  }

  const baseTeamClass = "py-1.5 px-2.5 text-sm md:text-base truncate transition-colors duration-200";
  const winnerTeamStyling = "font-extrabold text-highlight-gold bg-main-green/10 rounded-md";
  const loserTeamStyling = "text-secondary-text opacity-70";
  const tbdTeamStyling = "italic text-gray-500";
  const defaultTeamStyling = "text-light-text font-semibold";

  const getTeamClass = (teamNameStr: string, isWinner: boolean, isGamePlayed: boolean) => {
    const isEffectivelyTBD = teamNameStr.toLowerCase().startsWith('tbd') || teamNameStr.toLowerCase() === 'team';
    if (!isGamePlayed && !(game?.homeForfeit || game?.awayForfeit)) {
      return isEffectivelyTBD ? `${baseTeamClass} ${tbdTeamStyling}` : `${baseTeamClass} ${defaultTeamStyling}`;
    }
    if (isEffectivelyTBD) return `${baseTeamClass} ${tbdTeamStyling}`;
    return isWinner ? `${baseTeamClass} ${winnerTeamStyling}` : `${baseTeamClass} ${loserTeamStyling}`;
  };
  
  const score1Display = regulationScore1 + 
    (hasGameBeenPlayed && regulationScore1 === regulationScore2 && pkScore1 !== null ? ` (${pkScore1})` : '');
  const score2Display = regulationScore2 + 
    (hasGameBeenPlayed && regulationScore1 === regulationScore2 && pkScore2 !== null ? ` (${pkScore2})` : '');

  const scoreClass = "font-black px-1.5 text-lg sm:text-xl md:text-2xl transition-colors duration-200 tabular-nums";
  const winnerScoreClass = "text-highlight-gold";
  const loserScoreClass = "text-secondary-text opacity-70";
  const defaultScoreClass = "text-light-text";

  const getScoreClass = (isWinner: boolean, isGamePlayed: boolean) => {
    // If scores are displayed, highlight winner. If forfeit, winner is highlighted regardless of score display
    if (!isGamePlayed && !(game?.homeForfeit || game?.awayForfeit)) return `${scoreClass} ${defaultScoreClass}`;
    return isWinner ? `${scoreClass} ${winnerScoreClass}` : `${scoreClass} ${loserScoreClass}`;
  }

  const cardMaxWidth = 'max-w-xs';
  const cardBaseClasses = `bg-dark-card p-3.5 sm:p-4 shadow-xl rounded-xl border-2 w-full ${cardMaxWidth} hover:shadow-2xl transition-all duration-300 ease-in-out`;
  
  let cardSpecificClasses = "border-dark-border";
  if (team1Winner || team2Winner) {
    cardSpecificClasses = "border-main-green shadow-main-green/20";
  } else if (!hasGameBeenPlayed && (team1Name.toLowerCase().startsWith('tbd') || team2Name.toLowerCase().startsWith('tbd') || team1Name.toLowerCase() === 'team' || team2Name.toLowerCase() === 'team') && !game?.homeForfeit && !game?.awayForfeit) {
    cardSpecificClasses = "border-dark-border opacity-75 bg-dark-bg/50";
  }

  return (
    <div className={`${cardBaseClasses} ${cardSpecificClasses}`}>
      {(gameTitle || game?.date) && (
         <div className="text-xs font-bold text-center text-main-green uppercase tracking-wider mb-2 pb-1.5 border-b-2 border-main-green/20">
            {gameTitle}
            {game?.date && (
                <span className="block text-secondary-text font-normal normal-case text-xs">
                    {new Date(game.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {game.time && `, ${game.time}`}
                </span>
            )}
         </div>
      )}
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center overflow-hidden min-w-0 gap-2">
             <span className={getTeamClass(team1Name, team1Winner, hasGameBeenPlayed || !!game?.homeForfeit || !!game?.awayForfeit)} title={team1Name}>{team1Name}</span>
             {game?.homeForfeit && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex-shrink-0">Forfeit</span>}
        </div>
        <span className={getScoreClass(team1Winner, hasGameBeenPlayed || !!game?.homeForfeit || !!game?.awayForfeit)}>
          {score1Display}
        </span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <div className="flex flex-row items-center overflow-hidden min-w-0 gap-2">
            <span className={getTeamClass(team2Name, team2Winner, hasGameBeenPlayed || !!game?.homeForfeit || !!game?.awayForfeit)} title={team2Name}>{team2Name}</span>
            {game?.awayForfeit && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex-shrink-0">Forfeit</span>}
        </div>
        <span className={getScoreClass(team2Winner, hasGameBeenPlayed || !!game?.homeForfeit || !!game?.awayForfeit)}>
          {score2Display}
        </span>
      </div>
      {game?.location && !gameTitle && ( 
         <p className="text-xs text-secondary-text text-center mt-2 pt-2 border-t border-dark-border/50">{game.location}</p>
      )}
    </div>
  );
};

export default BracketMatchup;
