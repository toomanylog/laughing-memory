import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  const { preferences } = useStore();
  const { theme: currentTheme } = preferences;

  return (
    <ThemeProvider theme={theme(currentTheme)}>
      <CssBaseline />
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 