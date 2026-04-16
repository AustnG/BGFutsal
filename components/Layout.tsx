import React from 'react';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-dark-bg">
      <Navbar />
      <main className="flex-grow w-full pt-20"> {/* Add padding-top to account for fixed navbar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;