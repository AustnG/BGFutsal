import React from 'react';
import { ProcessedSeason } from '../../types';
import { MaterialEmojiEventsIcon } from '../icons/MaterialEmojiEventsIcon';
import AwardInfo from '../AwardInfo'; 

interface ChampionAwardsDisplayProps {
  seasonData: ProcessedSeason;
}

const ChampionAwardsDisplay: React.FC<ChampionAwardsDisplayProps> = ({ seasonData }) => {
  if (!seasonData.seasonWinner) {
    return null; 
  }

  return (
    <section 
      aria-labelledby={`champion-awards-title-${seasonData.id}`} 
      className="mb-8 p-4 md:p-6 bg-dark-bg/30 rounded-lg border border-dark-border shadow-lg"
    >
      <h3 
        id={`champion-awards-title-${seasonData.id}`} 
        className="font-display text-2xl md:text-3xl font-bold text-light-text mb-6 text-center border-b-2 border-dark-border pb-3"
      >
        Champions & Awards
      </h3>
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch">

        {/* Champion's Display */}
        <div className="lg:w-2/3 flex flex-col items-center p-4 bg-dark-card/50 rounded-lg shadow-inner border border-dark-border">
          <div className="flex flex-col items-center w-full">
            <p className="text-sm font-semibold uppercase text-secondary-text tracking-wider mb-2">
              League Champions
            </p>
            <h4 className="font-display text-4xl lg:text-5xl font-extrabold text-highlight-gold my-1 flex items-center justify-center text-center">
              <MaterialEmojiEventsIcon className="w-10 h-10 lg:w-12 lg:h-12 mr-3" />
              {seasonData.seasonWinner}
            </h4>
          </div>
          {seasonData.seasonWinnerImg ? (
            <div className="w-full mt-4 bg-black/20 rounded-lg p-1 shadow-md">
              <img
                src={seasonData.seasonWinnerImg}
                alt={`${seasonData.seasonWinner} team photo`}
                className="w-full h-auto max-h-[500px] object-contain rounded-md shadow-lg border-4 border-highlight-gold"
              />
            </div>
          ) : (
            <div className="w-full h-80 mt-4 bg-dark-bg/50 flex items-center justify-center text-secondary-text rounded-lg shadow-inner border-2 border-dark-border p-4">
              <p className="text-lg text-center">Team Photo Coming Soon</p>
            </div>
          )}
        </div>

        {/* Individual Awards */}
        <div className="lg:w-1/3 p-4 bg-dark-card/50 rounded-lg shadow-inner border border-dark-border flex flex-col">
          <h5 className="font-display text-xl lg:text-2xl font-semibold text-light-text mb-4 text-center border-b border-dark-border pb-2">
            Individual Honors
          </h5>
          <p className="text-xs text-secondary-text mb-4 text-center">(Regular Season Stats)</p>
          <div className="space-y-4 flex-grow">
            <AwardInfo 
              type="Golden Boot" 
              player={seasonData.goldenBootPlayer} 
              team={seasonData.goldenBootTeam} 
              stat={!isNaN(Number(seasonData.goldenBootGoals)) ? `${seasonData.goldenBootGoals} Goals` : undefined}
              imageUrl={seasonData.goldenBootImg}
            />
            <AwardInfo 
              type="Golden Glove" 
              player={seasonData.goldenGlovePlayer} 
              team={seasonData.goldenGloveTeam} 
              stat={!isNaN(Number(seasonData.goldenGloveGoalsAgainst)) ? `${seasonData.goldenGloveGoalsAgainst} Goals Allowed` : undefined}
              imageUrl={seasonData.goldenGloveImg}
            />
            {!(seasonData.goldenBootPlayer || seasonData.goldenGlovePlayer) && (
                <div className="flex-grow flex items-center justify-center">
                  <p className="text-sm text-secondary-text p-3 bg-dark-bg/50 rounded-md border border-dark-border text-center">
                    No individual awards recorded for this season.
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChampionAwardsDisplay;