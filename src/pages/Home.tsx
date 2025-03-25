import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import LazyImage from '../components/LazyImage';

interface Content {
  id: string;
  title: string;
  type: 'movie' | 'series';
  posterUrl: string;
  description: string;
  year: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contentRef = ref(database, 'content');
        const snapshot = await get(contentRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const contentArray = Object.entries(data).map(([id, item]: [string, any]) => ({
            id,
            ...item,
          }));
          setContent(contentArray);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const filteredContent = content.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Films et Séries
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredContent.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
              onClick={() => navigate(`/watch/${item.id}`)}
            >
              <LazyImage
                src={item.posterUrl}
                alt={item.title}
                height={300}
                objectFit="cover"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.type === 'movie' ? 'Film' : 'Série'} • {item.year}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 