import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import HomePage from './pages/HomePage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import WatchPage from './pages/WatchPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import MoviesPage from './pages/MoviesPage.tsx';
import SeriesPage from './pages/SeriesPage.tsx';
import AnimePage from './pages/AnimePage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import TermsPage from './pages/TermsPage.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import DmcaPage from './pages/DmcaPage.tsx';
import Footer from './components/Footer.tsx';
import { Helmet } from 'react-helmet';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
          <Helmet>
            <title>StreamFlix - Streaming de films, séries et animés</title>
            <meta name="description" content="StreamFlix est la meilleure plateforme de streaming en ligne pour films, séries et animés. Regardez des milliers de contenus gratuitement." />
            <meta name="keywords" content="streaming, films, séries, animés, regarder en ligne, gratuit" />
            <meta property="og:title" content="StreamFlix - Streaming de films, séries et animés" />
            <meta property="og:description" content="StreamFlix est la meilleure plateforme de streaming en ligne pour films, séries et animés." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://streamflix.com" />
            <meta property="og:image" content="https://streamflix.com/og-image.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <meta name="theme-color" content="#E50914" />
          </Helmet>
          
          <Navbar />
          
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/series" element={<SeriesPage />} />
              <Route path="/animes" element={<AnimePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/watch/:contentId" element={<WatchPage />} />
              <Route path="/watch/:contentId/season/:seasonId/episode/:episodeId" element={<WatchPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/cgu" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/dmca" element={<DmcaPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
