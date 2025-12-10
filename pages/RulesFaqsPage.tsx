import React, { useState } from 'react';
import PageTitle from '../components/PageTitle';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { LEAGUE_NAME } from '../constants';
import { Link } from 'react-router-dom';

interface FaqItemProps {
  question: string;
  answer: React.ReactNode;
  idSuffix: string; 
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, idSuffix }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `faq-panel-${idSuffix}`;
  const buttonId = `faq-button-${idSuffix}`;

  return (
    <div className="border-b border-dark-border">
      <h3 className="m-0">
        <button
          id={buttonId}
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full text-left p-5 hover:bg-main-green/10 transition-colors duration-200 group"
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <span className="text-lg font-semibold text-light-text group-hover:text-highlight-gold">{question}</span>
          <ChevronDownIcon className={`w-6 h-6 text-secondary-text transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="prose prose-lg max-w-none p-5 pt-0 text-secondary-text">
                {answer}
            </div>
        </div>
      </div>
    </div>
  );
};

const RulesFaqsPage: React.FC = () => {
  const faqs = [
    { 
      question: "When are the games?", 
      answer: (
        <>
          <p>Teams will generally have one (x1) game a weekend with start times typically ranging from:</p>
          <ul>
            <li>Fridays: 7:30 PM - 9:30 PM</li>
            <li>Saturdays: 5:00 PM - 9:00 PM</li>
            <li>Sundays: 3:00 PM - 7:00 PM</li>
          </ul>
          <p>*Game schedules will be posted on the Home and Matches pages.</p>
        </>
      )
    },
    { 
      question: "How do I register a team or as an individual?", 
      answer: (
        <p>
          Team registration periods are announced before each season on our{" "}
          <Link to='/'>Home page</Link>{" "}
          and social media. Individual players looking for a team can sign up for a free agent list (if available), 
          and we'll try to connect you with teams needing players.
        </p>
      ) 
    },
    { 
      question: "How many players can be on a roster?", 
      answer: <p>Teams may roster up to 12 players.</p> 
    },
    { 
      question: "Are there age restrictions?", 
      answer: <p>Our adult league is generally for players 16+.</p> 
    },
    { 
      question: "Is the league co-ed?", 
      answer: <p>Yes, teams can be co-ed.</p> 
    },
    { 
      question: "What are the fees?", 
      answer: <p>League fees vary per season and are announced during registration. Fees cover facility rental, referee payments, and league administration.</p> 
    },
    { 
      question: "What equipment do I need?", 
      answer: (
        <ul>
          <li><strong>Shirts/Jerseys:</strong> It's recommended that teams have matching colored shirts, or better yet jerseys. If team colors are too similar, pennies (bibs) will be provided by the league.</li>
          <li><strong>Footwear:</strong> Indoor/flat-soled soccer shoes or athletic shoes suitable for wooden courts are recommended. No cleats or spikes are allowed.</li>
          <li><strong>Shin Guards:</strong> Shin guards are not required, but are allowed for player safety.</li>
        </ul>
      )
    },
    { 
      question: "Can players switch teams?", 
      answer: (
        <p>
          Players can switch teams one time (1x) within the first four (4) games of a season.
          <br />
          <em>Note:</em> Once you leave a team, you may not rejoin that team's roster within the same season.
        </p>
      )
    },
    { 
      question: "What if we don't have enough players to start/play a game?", 
      answer: (
        <>
          <p>If a team does not have a minimum of 5 players by the team's scheduled game time:</p>
          <ul>
            <li>Game clock starts, and the shorthanded team immediately concedes one (x1) goal.</li>
            <li>Teams have a maximum of ten (10) minutes from the game start to have their players arrive.</li>
            <li>If at the ten (10) minute mark the shorthanded team cannot field the minimum number of players, another goal is conceded and that team will forfeit the match with a 0-2 loss.</li>
          </ul>
        </>
      )
    }
  ];

  const SectionTitle: React.FC<{id?: string, children: React.ReactNode}> = ({ id, children }) => (
    <h2 id={id} className="font-display text-3xl lg:text-4xl font-bold text-light-text mb-6 border-b-2 border-dark-border pb-4 pt-2">
      {children}
    </h2>
  );
  
  const SubSectionTitle: React.FC<{id?: string, children: React.ReactNode}> = ({ id, children }) => (
     <h3 id={id} className="font-display text-2xl font-semibold text-highlight-gold mt-8 mb-4 border-b border-dark-border pb-2">
       {children}
     </h3>
  );

  return (
    <div className="bg-dark-card p-6 md:p-8 rounded-xl shadow-lg border border-dark-border">
      <PageTitle title="League Rules & FAQs" subtitle="Find important information about how our league operates." />
      
      <div className="space-y-12 md:space-y-16 mt-8">
        <section aria-labelledby="league-rules-heading">
          <SectionTitle id="league-rules-heading">League Rules</SectionTitle>
          <div className="prose prose-lg lg:prose-xl max-w-5xl text-secondary-text space-y-4">
            <p className="mt-0">
              {LEAGUE_NAME} adheres to general Futsal Laws of the Game with specific modifications tailored for our league environment. Key principles include fair play, sportsmanship, and respect for opponents, officials, and facilities. Detailed rules specific to substitutions, fouls, and game conduct are outlined below.
            </p>
            
            <SubSectionTitle id="overview-heading">OVERVIEW</SubSectionTitle>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>6v6 including the goalie.</strong>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>A minimum of 5 players are required to start a game.</li>
                  </ul>
                </li>
              <li><strong>2x20 minute halves + 5 minute halftime</strong> (45 minutes total).</li>
              <li><strong>Jewelry is not permitted</strong> during play.</li>
              <li><strong>Unlimited substitutions.</strong></li>
              <li><strong>Restarts are kick-ins</strong> and must be taken within 5 seconds of placing the ball.</li>
              <li><strong>Balls that hit the ceiling</strong> or any hanging objects are restarted as kick-ins for the opposing team from the nearest point on the sideline.</li>
              <li><strong>Goalies may only handle the ball within the designated goal box.</strong></li>
              <li><strong>Goalies cannot pick up deliberate back passes.</strong></li>
              <li><strong>Goalies can only hold the ball for 5 seconds.</strong></li>            
              <li><strong>No slide tackling!</strong></li>
              <li><strong>Foul accumulation rules are in effect:</strong>
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>Five (x5) accumulated team fouls results in a penalty kick for the opposing team.</li>
                      <li>Every additional three (x3) fouls after the initial five (x5) will also result in a penalty kick for the opposing team.</li>
                  </ul>
                </li>
                <li><strong>Players do not have to leave the court for yellow card offenses</strong> (cautions).</li>
                <li><strong>Accumulating two (x2) yellow cards</strong> in the same match will result in a red card (ejection) and suspension from that match. The team plays short-handed as per red card rules.</li>
                <li><strong>Red carded offenses (ejections)</strong> will result in the player being suspended from the current match, and the team plays short-handed for 2 minutes or until the opposing team scores, whichever comes first (player cannot re-enter). Additionally, a red card results in a minimum 1-3 game suspension for the player, depending on the severity of the offense. Fighting, either individually or as a team, can result in suspension from the league for up to 2 years for individuals or the entire team.</li>
                <li><strong>Team captains are responsible</strong> for their team's conduct.</li>
                <li><strong>Every player on a team needs to sign the league's insurance waiver form</strong> before he/she starts playing in any league match. No exceptions.</li>
            </ul>

            <section aria-labelledby="arena-equipment-heading">
              <SubSectionTitle id="arena-equipment-heading">ARENA & EQUIPMENT</SubSectionTitle>
              <ul className="list-disc list-inside space-y-2">
                <li>The court consists of two (x2) side-by-side wooden basketball courts, creating a larger playing area.</li>
                <li>The ball is a size 4 futsal ball, which is slightly weighted to reduce excessive bouncing on hard courts.</li>
                <li>Goals are approximately 6.5 feet high x 12 feet wide.</li>
              </ul>
            </section>
          </div>
        </section>

        <section aria-labelledby="faq-heading">
          <SectionTitle id="faq-heading">Frequently Asked Questions</SectionTitle>
          <div className="bg-dark-bg/50 rounded-lg border border-dark-border shadow-inner">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} idSuffix={index.toString()} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RulesFaqsPage;