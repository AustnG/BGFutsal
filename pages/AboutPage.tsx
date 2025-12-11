import React from 'react';
import { LEAGUE_NAME } from '../constants';

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16">
      <section 
        aria-labelledby="hero-title-about" 
        className="relative rounded-lg shadow-xl overflow-hidden h-64 flex flex-col justify-center items-center text-center text-light-text"
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://blogger.googleusercontent.com/img/a/AVvXsEhbx0ILBCX3eBUQInZnhAinZZ1_tXsnJwYZb6zfrsEOEwJQiQL5a_jHWJ8yniUq2KanklUCuYSePriWVLCInIgcNn9px0hPGeFH0uTN15Y6U5LJGCSug-Mrq5WBbC5IEt3lUf1bLar_XPgPwjRr5ZdR3uQ9Cftfa3EOuUkeMCEhsQ-RaxGgJhmnz_ikSf0)' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/85 via-dark-bg/40 to-transparent"></div>
        <div className="relative z-10 p-4 md:p-8 lg:p-12">
          <h1 id="hero-title-about" className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-3 uppercase tracking-wider [text-shadow:2px_2px_12px_rgba(0,0,0,0.9)]">
            {LEAGUE_NAME}
          </h1>
          <p className="text-xl sm:text-2xl text-secondary-text [text-shadow:1px_1px_8px_rgba(0,0,0,0.9)]">
            Bowling Green's premier destination for competitive and recreational futsal.
          </p>
        </div>
      </section>

      <div className="bg-dark-card p-6 md:p-8 rounded-xl shadow-lg border border-dark-border">
        <div className="prose prose-lg lg:prose-xl max-w-5xl mx-auto">
          <p>
            Welcome to the {LEAGUE_NAME}, your central hub for the beautiful game in its fast-paced indoor format! 
            Founded with a passion for futsal, we strive to provide a well-organized, fun, and inclusive environment for players of all skill levels in the Bowling Green area.
          </p>
          
          <h2 className="mt-12 text-3xl lg:text-4xl">Our Mission</h2>
          <p>
            Our mission is to promote the sport of futsal within the community, fostering sportsmanship, skill development, and a love for the game. We aim to offer a high-quality league experience that caters to both serious competitors and those looking to enjoy a friendly match.
          </p>

          <h2 className="mt-12 text-3xl lg:text-4xl">League Structure</h2>
          <p>
            The league typically runs two main seasons each year: a Spring season and a Winter season. To accommodate varying levels of play, we offer two divisions:
          </p>
          <ul>
            <li><strong>Division A:</strong> For more experienced and competitive teams.</li>
            <li><strong>Division B:</strong> For recreational teams and players newer to futsal.</li>
          </ul>
          <p>
            This structure ensures that games are competitive and enjoyable for everyone involved.
          </p>

          <h2 className="mt-12 text-3xl lg:text-4xl">Community Focus</h2>
          <p>
            Beyond the games, the league is about building a community. We encourage camaraderie among players, teams, and fans. We are proud to be a part of Bowling Green's vibrant sports scene and look forward to growing the futsal family here.
          </p>
          
          <p className="mt-6">
            Whether you're a seasoned futsal player, new to the sport, or a fan looking to catch some exciting local action, we welcome you to {LEAGUE_NAME}!
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
              <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLOPRJ9SBivB1I7kQ2tP2Ugskzxc_56hZmHamPEebZ9sruqdvgau61EQIGhpTVJJ4PRbUqrfcRv7BVnUWTbNBHJBwtvKj0n8bQZOrS1bq_CidnM35W-t3Iw0CUgEICtSoJ3KAbbwFmSKRVvgUR-D4oI7BeT3_Kv-Yhib0F5SawVWjesH5hnCzxvfnv_b8/s320/about01.jpg" alt="Futsal player with ball" className="rounded-lg shadow-lg object-cover w-full h-64 md:h-72 lg:h-80"/>
              <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiA7HFPTaoY3x51OuJFrk_-viNQcHhailWe2i3X0RthbobcVEgwKwc8OGr5hS04Sa0LAESjs9FTCcB9WbIC2tsS31Djln-UI_Erd69ImWU4SY9A-7-w-ktNNnpRaxLwTdgl6Zz317LESkvNQe4FZRjfjOaoEcNmMsnQsch9TjuUAWSUEw0scOqKq6bmduw/s320/about02.jpg" alt="Futsal team posing" className="rounded-lg shadow-lg object-cover w-full h-64 md:h-72 lg:h-80"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;