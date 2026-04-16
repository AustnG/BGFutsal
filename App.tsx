import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import MatchesPage from './pages/ResultsPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import StaffPage from './pages/StaffPage.tsx';
import RulesFaqsPage from './pages/RulesFaqsPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import SponsorsPage from './pages/SponsorsPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/rules-faqs" element={<RulesFaqsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;