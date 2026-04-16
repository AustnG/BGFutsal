import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SHORT_LEAGUE_NAME } from '../constants.ts';
import { NavItem, NavDropdownItem } from '../types.ts';
import { MaterialMenuIcon } from './icons/MaterialMenuIcon.tsx';
import { MaterialCloseIcon } from './icons/MaterialCloseIcon.tsx';
import { MaterialExpandMoreIcon } from './icons/MaterialExpandMoreIcon.tsx';
import { MaterialHomeIcon } from './icons/MaterialHomeIcon.tsx';
import { MaterialEmojiEventsIcon } from './icons/MaterialEmojiEventsIcon.tsx';
import { MaterialInfoIcon } from './icons/MaterialInfoIcon.tsx';
import { MaterialGroupIcon } from './icons/MaterialGroupIcon.tsx';
import { MaterialHelpIcon } from './icons/MaterialHelpIcon.tsx';
import { MaterialMailIcon } from './icons/MaterialMailIcon.tsx';
import { MaterialStorefrontIcon } from './icons/MaterialStorefrontIcon.tsx';

const FAVICON_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiNRwWE_BLwGLGC1q961MbnXnpEQ3DdwUMMtNvQrThrmTYx4uwvlDzD7IfLy6uz1BNxoiuegW9oLI_3WWgUPHwRczZDI_uHKxchhLtWfL_hn79NEA5Easdt4M4zOzPhzcFZs26w083zFJjzjHMZUJvfn3YAaZUgJFJ26ATSmnU-murkGsyM3yKHIxHeSSA/s320/bgif1100x1100-white.png";

const navItemsList: NavItem[] = [
  { name: 'Home', path: '/', icon: MaterialHomeIcon },
  { name: 'Matches', path: '/matches', icon: MaterialEmojiEventsIcon },
];

const infoDropdownItems: NavDropdownItem = {
  name: 'Info',
  icon: MaterialInfoIcon,
  items: [
    { name: 'About', path: '/about', icon: MaterialInfoIcon },
    { name: 'Rules & FAQs', path: '/rules-faqs', icon: MaterialHelpIcon },
  ],
};

const connectDropdownItems: NavDropdownItem = {
  name: 'Connect',
  icon: MaterialMailIcon,
  items: [
    { name: 'Sponsors', path: '/sponsors', icon: MaterialStorefrontIcon },
    { name: 'Contact', path: '/contact', icon: MaterialMailIcon },
  ],
};

const Dropdown: React.FC<{ dropdownData: NavDropdownItem, closeMobileMenu?: () => void }> = ({ dropdownData, closeMobileMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseClasses = "flex items-center px-4 py-2 text-base font-medium text-light-text rounded-md hover:bg-main-green/80 hover:text-white transition-colors duration-200";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={baseClasses}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {dropdownData.icon && <dropdownData.icon className="w-5 h-5 mr-2" />}
        {dropdownData.name}
        <MaterialExpandMoreIcon className={`w-5 h-5 ml-1 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-2 w-56 origin-top-right rounded-md bg-dark-card shadow-lg ring-1 ring-dark-border ring-opacity-75 focus:outline-none" role="menu">
          <div className="py-1">
            {dropdownData.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => { setIsOpen(false); if(closeMobileMenu) closeMobileMenu(); }}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm ${isActive ? 'bg-main-green text-white' : 'text-light-text hover:bg-main-green/50 hover:text-white'}`
                }
                role="menuitem"
              >
                {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = scrolled
    ? 'bg-dark-bg/95 backdrop-blur-lg border-b border-dark-border shadow-lg'
    : 'bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center group">
            <img 
              src={FAVICON_URL} 
              alt={`${SHORT_LEAGUE_NAME} Logo`} 
              className="h-10 mr-3 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="font-display text-2xl font-bold text-light-text group-hover:text-highlight-gold transition-colors duration-200">
              {SHORT_LEAGUE_NAME}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navItemsList.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive ? 'bg-main-green text-white shadow-inner' : 'text-light-text hover:bg-main-green/80 hover:text-white'
                  }`
                }
              >
                 {item.icon && <item.icon className="w-5 h-5 mr-2" />}
                {item.name}
              </NavLink>
            ))}
            <Dropdown dropdownData={infoDropdownItems} />
            <Dropdown dropdownData={connectDropdownItems} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-light-text hover:text-highlight-gold focus:outline-none focus:text-highlight-gold p-2 rounded-md" 
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <MaterialCloseIcon className="w-7 h-7" /> : <MaterialMenuIcon className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-dark-card border-t border-dark-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItemsList.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 rounded-md text-base font-medium ${
                    isActive ? 'bg-main-green text-white' : 'text-light-text hover:bg-main-green/80'
                  }`
                }
              >
                {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                {item.name}
              </NavLink>
            ))}
             <div className="border-t border-dark-border my-2"></div>
            {infoDropdownItems.items.map(subItem => (
               <NavLink
                key={subItem.name}
                to={subItem.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center pl-4 pr-3 py-3 rounded-md text-base font-medium ${
                    isActive ? 'bg-main-green text-white' : 'text-light-text hover:bg-main-green/80'
                  }`
                }
              >
                {subItem.icon && <subItem.icon className="w-5 h-5 mr-3" />}
                {subItem.name}
              </NavLink>
            ))}
             <div className="border-t border-dark-border my-2"></div>
             {connectDropdownItems.items.map(subItem => (
               <NavLink
                key={subItem.name}
                to={subItem.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center pl-4 pr-3 py-3 rounded-md text-base font-medium ${
                    isActive ? 'bg-main-green text-white' : 'text-light-text hover:bg-main-green/80'
                  }`
                }
              >
                {subItem.icon && <subItem.icon className="w-5 h-5 mr-3" />}
                {subItem.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;