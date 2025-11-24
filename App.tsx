import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import AboutPage from './pages/AboutPage';
import StaffPage from './pages/StaffPage';
import RulesFaqsPage from './pages/RulesFaqsPage';
import ContactPage from './pages/ContactPage';
import SponsorsPage from './pages/SponsorsPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
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