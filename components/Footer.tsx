import React from 'react';
import { Link } from 'react-router-dom';
import { LEAGUE_NAME, SHORT_LEAGUE_NAME } from '../constants.ts';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Matches', path: '/matches' },
    { name: 'About', path: '/about' },
    { name: 'Rules & FAQs', path: '/rules-faqs' },
    { name: 'Sponsors', path: '/sponsors' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer className="bg-dark-card text-light-text border-t border-dark-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="font-display text-2xl font-bold text-white hover:text-highlight-gold transition-colors">
              {SHORT_LEAGUE_NAME}
            </Link>
            <p className="text-secondary-text text-sm max-w-xs">
              Promoting futsal within the Bowling Green community, fostering sportsmanship, skill development, and a love for the game.
            </p>
             <p className="text-xs text-secondary-text/70">- Est. 2011 -</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold uppercase tracking-wider text-secondary-text">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-light-text hover:text-highlight-gold transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect/Socials (placeholder) */}
          <div>
            <h3 className="font-display text-lg font-semibold uppercase tracking-wider text-secondary-text">Connect With Us</h3>
            <p className="mt-4 text-sm text-secondary-text">
              Follow us on social media for the latest updates, photos, and live game announcements.
            </p>
            <div className="mt-4 flex space-x-4">
              {/* Placeholder for social icons */}
              <a href="#" className="text-secondary-text hover:text-highlight-gold transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-7.05H8.08V12h2.36V9.78c0-2.34 1.39-3.66 3.53-3.66 1.03 0 2.1.18 2.1.18v2.44h-1.25c-1.16 0-1.52.7-1.52 1.46V12h2.7l-.44 2.83h-2.26v7.05C18.34 21.13 22 16.99 22 12c0-5.52-4.48-10-10-10z" /></svg>
              </a>
              <a href="#" className="text-secondary-text hover:text-highlight-gold transition-colors" aria-label="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8A3.6 3.6 0 0 0 20 16.4V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" /></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-border text-center text-sm text-secondary-text">
          <p>&copy; {currentYear} {LEAGUE_NAME}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;