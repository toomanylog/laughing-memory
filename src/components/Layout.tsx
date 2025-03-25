import { useState, useEffect } from 'react';
import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import Navigation from './Navigation';
import { theme } from '../theme';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isStylesLoaded, setIsStylesLoaded] = useState(false);

  useEffect(() => {
    // Vérifie si tous les styles sont chargés
    const styleSheets = document.styleSheets;
    if (styleSheets.length > 0) {
      setIsStylesLoaded(true);
    } else {
      const checkStyles = setInterval(() => {
        if (document.styleSheets.length > 0) {
          setIsStylesLoaded(true);
          clearInterval(checkStyles);
        }
      }, 100);

      return () => clearInterval(checkStyles);
    }
  }, []);

  if (!isStylesLoaded) {
    return null; // Ne rend rien tant que les styles ne sont pas chargés
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Navigation />
        <Container component="main" sx={{ flex: 1, py: 4 }}>
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Layout; 