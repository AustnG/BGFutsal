import React from 'react';
import { ProcessedGame } from '../../types';
import BracketMatchup from './BracketMatchup';

interface PlayoffDisplayProps {
  playoffGames: ProcessedGame[];
}

const getWinner = (game?: ProcessedGame): string | null => {
  if (!game || isNaN(game.homeScore) || isNaN(game.awayScore)) return null;
  
  if (game.homeScore > game.awayScore) return game.homeTeam;
  if (game.awayScore > game.homeScore) return game.awayTeam;
  
  // If regulation scores are tied, check PKs
  if (game.homeScore === game.awayScore) {
    if (game.homePKs !== undefined && game.awayPKs !== undefined && !isNaN(game.homePKs) && !isNaN(game.awayPKs)) {
      if (game.homePKs > game.awayPKs) return game.homeTeam;
      if (game.awayPKs > game.homePKs) return game.awayTeam;
    }
  }
  return null; // No winner if scores tied and PKs don't decide or are missing
};

const PlayoffDisplay: React.FC<PlayoffDisplayProps> = ({ playoffGames }) => {
  if (playoffGames.length === 0) {
    return (
      <section aria-labelledby="playoffs-title" className="my-8 py-4">
        <h3 id="playoffs-title" className="font-display text-2xl font-semibold text-light-text mb-3">Playoffs</h3>
        <p className="text-secondary-text p-4 bg-dark-bg/50 rounded-md border border-dark-border">Playoffs have not started or results are not yet available for this division.</p>
      </section>
    );
  }

  const qfGames = playoffGames.filter(g => g.gameType === 'Quarter Finals').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sfGames = playoffGames.filter(g => g.gameType === 'Semi Finals').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finalGame = playoffGames.find(g => g.gameType === 'Finals');

  const qf1 = qfGames[0];
  const qf2 = qfGames[1];
  const qf3 = qfGames[2];
  const qf4 = qfGames[3];

  const winnerQF1 = getWinner(qf1);
  const winnerQF2 = getWinner(qf2);
  const winnerQF3 = getWinner(qf3);
  const winnerQF4 = getWinner(qf4);

  const sf1 = sfGames[0];
  const sf2 = sfGames[1];
  
  const teamForSF1Home = sf1?.homeTeam || winnerQF1 || 'TBD QF1';
  const teamForSF1Away = sf1?.awayTeam || winnerQF2 || 'TBD QF2';
  const teamForSF2Home = sf2?.homeTeam || winnerQF3 || 'TBD QF3';
  const teamForSF2Away = sf2?.awayTeam || winnerQF4 || 'TBD QF4';

  const winnerSF1 = getWinner(sf1);
  const winnerSF2 = getWinner(sf2);

  const teamForFinalHome = finalGame?.homeTeam || winnerSF1 || 'TBD SF1';
  const teamForFinalAway = finalGame?.awayTeam || winnerSF2 || 'TBD SF2';

  const RoundTitle: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="font-display text-2xl sm:text-3xl font-bold text-light-text my-6 sm:my-8 text-center relative pb-3">
      {title}
      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-highlight-gold rounded-full"></span>
    </h4>
  );

  return (
    <section aria-labelledby="playoffs-title" className="mt-10 mb-8 p-4 sm:p-6 md:p-8 bg-dark-bg/30 rounded-2xl shadow-2xl border-2 border-dark-border/50">
      <h3 id="playoffs-title" className="font-display text-3xl sm:text-4xl font-extrabold text-light-text mb-6 sm:mb-8 text-center tracking-tight">
        Playoff Bracket
      </h3>
      <div className="space-y-8 md:space-y-12">
        
        {/* Final Section */}
        {(finalGame || teamForFinalHome !== 'TBD SF1' || teamForFinalAway !== 'TBD SF2') && (
          <div>
            <RoundTitle title="Final" />
            <div className="w-full flex justify-center">
              <BracketMatchup 
                game={finalGame} 
                team1NameOverride={teamForFinalHome} 
                team2NameOverride={teamForFinalAway} 
                gameTitle={finalGame ? undefined : "Championship Final"}
              />
            </div>
          </div>
        )}

        {/* Semi Finals Section */}
        {(sfGames.length > 0 || winnerQF1 || winnerQF2 || winnerQF3 || winnerQF4) && (
           <div>
            <RoundTitle title="Semi Finals" />
            <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 md:gap-4">
              <BracketMatchup 
                game={sf1} 
                team1NameOverride={teamForSF1Home} 
                team2NameOverride={teamForSF1Away} 
                gameTitle={sf1 ? undefined : "Semi Final 1"}
              />
              <BracketMatchup 
                game={sf2} 
                team1NameOverride={teamForSF2Home} 
                team2NameOverride={teamForSF2Away}
                gameTitle={sf2 ? undefined : "Semi Final 2"}
              />
            </div>
          </div>
        )}

        {/* Quarter Finals Section */}
        {qfGames.length > 0 && (
          <div>
            <RoundTitle title="Quarter Finals" />
            <div className="flex flex-wrap justify-center gap-5 items-stretch">
              {qfGames.slice(0,4).map((qfGame, index) => (
                <BracketMatchup 
                  key={qfGame?.id || `qf-ph-${index}`} 
                  game={qfGame} 
                  gameTitle={qfGame ? undefined : `Quarter Final ${index + 1}`} 
                />
              ))}
              {/* Placeholder for TBD QFs if SFs are expecting them and QF games are not fully populated */}
              {qfGames.length < 4 && Array.from({ length: 4 - qfGames.length }).map((_, idx) => {
                  const qfIndex = qfGames.length + idx + 1;
                  let showTBD = false;
                  if (qfIndex === 1 && teamForSF1Home === 'TBD QF1' && !qfGames.find(g => g === qf1)) showTBD = true;
                  if (qfIndex === 2 && teamForSF1Away === 'TBD QF2' && !qfGames.find(g => g === qf2)) showTBD = true;
                  if (qfIndex === 3 && teamForSF2Home === 'TBD QF3' && !qfGames.find(g => g === qf3)) showTBD = true;
                  if (qfIndex === 4 && teamForSF2Away === 'TBD QF4' && !qfGames.find(g => g === qf4)) showTBD = true;
                  
                  if (showTBD) { 
                    return <BracketMatchup key={`qf-ph-explicit-${qfIndex}`} gameTitle={`Quarter Final ${qfIndex}`} team1NameOverride="Team" team2NameOverride="Team" />;
                  }
                  return null;
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayoffDisplay;