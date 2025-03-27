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
import Footer from './components/Footer.tsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <Navbar />
          <main className="flex-grow">
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
