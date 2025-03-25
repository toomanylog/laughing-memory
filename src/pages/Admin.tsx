import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { ref, get, set, remove } from 'firebase/database';
import { database } from '../config/firebase';

interface Episode {
  id: string;
  title: string;
  videoUrl: string;
}

interface Content {
  id: string;
  title: string;
  type: 'movie' | 'series';
  posterUrl: string;
  description: string;
  year: number;
  videoUrl: string;
  episodes?: Episode[];
}

const Admin = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie' as 'movie' | 'series',
    posterUrl: '',
    description: '',
    year: '',
    videoUrl: '',
    episodes: [{ title: '', videoUrl: '' }],
  });

  useEffect(() => {
    fetchContent();
  }, []);

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

  const handleOpenDialog = (item?: Content) => {
    if (item) {
      setEditingContent(item);
      setFormData({
        title: item.title,
        type: item.type,
        posterUrl: item.posterUrl,
        description: item.description,
        year: item.year.toString(),
        videoUrl: item.videoUrl,
        episodes: item.episodes || [{ title: '', videoUrl: '' }],
      });
    } else {
      setEditingContent(null);
      setFormData({
        title: '',
        type: 'movie',
        posterUrl: '',
        description: '',
        year: '',
        videoUrl: '',
        episodes: [{ title: '', videoUrl: '' }],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContent(null);
  };

  const handleSubmit = async () => {
    try {
      const contentData = {
        title: formData.title,
        type: formData.type,
        posterUrl: formData.posterUrl,
        description: formData.description,
        year: parseInt(formData.year),
        videoUrl: formData.videoUrl,
        ...(formData.type === 'series' && {
          episodes: formData.episodes.map((episode, index) => ({
            id: `episode-${index + 1}`,
            title: episode.title,
            videoUrl: episode.videoUrl,
          })),
        }),
      };

      if (editingContent) {
        await set(ref(database, `content/${editingContent.id}`), contentData);
      } else {
        const newContentRef = ref(database, 'content');
        await set(ref(database, `content/${Date.now()}`), contentData);
      }

      handleCloseDialog();
      fetchContent();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      try {
        await remove(ref(database, `content/${id}`));
        fetchContent();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleAddEpisode = () => {
    setFormData((prev) => ({
      ...prev,
      episodes: [...prev.episodes, { title: '', videoUrl: '' }],
    }));
  };

  const handleEpisodeChange = (index: number, field: 'title' | 'videoUrl', value: string) => {
    setFormData((prev) => ({
      ...prev,
      episodes: prev.episodes.map((episode, i) =>
        i === index ? { ...episode, [field]: value } : episode
      ),
    }));
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Administration</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Ajouter du contenu
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Année</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.type === 'movie' ? 'Film' : 'Série'}</TableCell>
                <TableCell>{item.year}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingContent ? 'Modifier le contenu' : 'Ajouter du contenu'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Titre"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'movie' | 'series' })}
              >
                <MenuItem value="movie">Film</MenuItem>
                <MenuItem value="series">Série</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="URL de l'affiche"
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="Année"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              fullWidth
            />
            <TextField
              label="URL de la vidéo"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              fullWidth
            />

            {formData.type === 'series' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Épisodes</Typography>
                  <Button startIcon={<AddIcon />} onClick={handleAddEpisode}>
                    Ajouter un épisode
                  </Button>
                </Box>
                <List>
                  {formData.episodes.map((episode, index) => (
                    <ListItem key={index}>
                      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                        <TextField
                          label={`Titre de l'épisode ${index + 1}`}
                          value={episode.title}
                          onChange={(e) => handleEpisodeChange(index, 'title', e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label={`URL de l'épisode ${index + 1}`}
                          value={episode.videoUrl}
                          onChange={(e) => handleEpisodeChange(index, 'videoUrl', e.target.value)}
                          fullWidth
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingContent ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin; 