import React from 'react';
import { ProcessedGame, Division } from '../types';

interface GameCardProps {
  game: ProcessedGame;
  isPlayoff?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, isPlayoff = false }) => {
  const regulationScoresPresent = !isNaN(game.homeScore) && !isNaN(game.awayScore);
  let scoreDisplay = 'vs';
  let winner = '';

  if (regulationScoresPresent) {
    scoreDisplay = `${game.homeScore} - ${game.awayScore}`;
    if (game.homeScore > game.awayScore) {
      winner = game.homeTeam;
    } else if (game.awayScore > game.homeScore) {
      winner = game.awayTeam;
    } else { // Regulation draw
      winner = 'Draw';
      if (isPlayoff && game.homePKs !== undefined && game.awayPKs !== undefined && !isNaN(game.homePKs) && !isNaN(game.awayPKs)) {
        scoreDisplay += ` (PK ${game.homePKs}-${game.awayPKs})`;
        if (game.homePKs > game.awayPKs) {
          winner = game.homeTeam; // PK winner
        } else if (game.awayPKs > game.homePKs) {
          winner = game.awayTeam; // PK winner
        } else {
           winner = 'Draw (PKs also tied)';
        }
      }
    }
  }
  
  return (
    <div 
      className={`bg-dark-card p-3 md:p-4 shadow-lg rounded-lg border border-dark-border hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-px
                  ${isPlayoff ? 'mb-3 border-l-4 border-highlight-gold' : 'mb-4'}`}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div className="text-xs md:text-sm text-secondary-text">
          {game.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          {game.time && `, ${game.time}`}
        </div>
        {isPlayoff && game.gameType && game.gameType !== "Regular" && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-main-green text-white rounded-full shadow-sm">
            {game.gameType}
          </span>
        )}
      </div>
      
      <div className="flex items-center w-full my-1.5">
        <span 
          className={`flex-1 text-base md:text-lg ${winner === game.homeTeam ? 'font-bold text-highlight-gold' : 'font-semibold text-light-text'} text-right pr-2 md:pr-3 truncate`}
        >
          {game.homeTeam}
        </span>
        <span className="text-xl md:text-2xl font-bold text-secondary-text px-2 md:px-4 text-center tabular-nums">
          {scoreDisplay}
        </span>
        <span 
          className={`flex-1 text-base md:text-lg ${winner === game.awayTeam ? 'font-bold text-highlight-gold' : 'font-semibold text-light-text'} text-left pl-2 md:pl-3 truncate`}
        >
          {game.awayTeam}
        </span>
      </div>

      {winner && winner !== 'Draw' && winner !== 'Draw (PKs also tied)' && isPlayoff && regulationScoresPresent && (
        <p className="text-xs text-center mt-1.5 font-medium text-secondary-text">Winner: <span className="font-bold text-light-text">{winner}</span></p>
      )}
      {game.location && <p className="text-xs text-gray-500 text-center mt-1.5">{game.location}</p>}
    </div>
  );
};

export default GameCard;