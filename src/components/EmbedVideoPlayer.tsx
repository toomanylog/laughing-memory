import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Button, Select, MenuItem, FormControl, InputLabel, Modal, TextField, SelectChangeEvent } from '@mui/material';
import { VideoSource, Content, Episode } from '../types';
import { reportVideoSource } from '../services/reportService';
import { useWatchProgress } from '../hooks/useWatchProgress';
import { useAuth } from '../hooks/useAuth';

interface EmbedVideoPlayerProps {
  content: Content;
  episode?: Episode;
  seasonId?: string;
  episodeId?: string;
}

const EmbedVideoPlayer: React.FC<EmbedVideoPlayerProps> = ({ 
  content, 
  episode, 
  seasonId, 
  episodeId 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Lien vidéo ne fonctionne pas");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Utiliser le hook useWatchProgress pour suivre la progression
  const { saveProgress } = useWatchProgress(
    content?.id || "", 
    seasonId, 
    episodeId
  );

  // Fonction pour déterminer les sources vidéo à utiliser (épisode ou contenu)
  const determineVideoSources = useCallback(() => {
    let sources: VideoSource[] = [];

    if (episode && episode.videoSources) {
      sources = episode.videoSources.filter(source => source.isWorking !== false);
    } else if (content && content.videoSources) {
      sources = content.videoSources.filter(source => source.isWorking !== false);
    }

    // Si aucune source n'est trouvée et que l'URL vidéo traditionnelle existe, créer une source
    if (sources.length === 0) {
      if (episode && episode.videoUrl) {
        sources = [{
          id: "default",
          provider: "Default",
          embedUrl: episode.videoUrl,
          isWorking: true
        }];
      } else if (content && content.videoUrl) {
        sources = [{
          id: "default",
          provider: "Default",
          embedUrl: content.videoUrl,
          isWorking: true
        }];
      }
    }

    // Trier les sources par fournisseur pour regrouper les sources similaires
    sources.sort((a, b) => a.provider.localeCompare(b.provider));
    
    return sources;
  }, [content, episode]);

  // Initialiser les sources vidéo et sélectionner la première source disponible
  useEffect(() => {
    setLoading(true);
    const sources = determineVideoSources();
    setVideoSources(sources);

    if (sources.length > 0) {
      setSelectedSource(sources[0]);
      setError(null);
    } else {
      setError("Aucune source vidéo disponible. Veuillez réessayer plus tard ou signaler ce problème.");
    }
    
    setLoading(false);
  }, [content, episode, determineVideoSources]);

  // Gérer le changement de source vidéo
  const handleSourceChange = (event: SelectChangeEvent<string>) => {
    const sourceId = event.target.value;
    const newSource = videoSources.find(source => source.id === sourceId) || null;
    setSelectedSource(newSource);
  };

  // Ouvrir la modal de signalement
  const handleReportClick = () => {
    setReportModalOpen(true);
  };

  // Fermer la modal de signalement
  const handleReportClose = () => {
    setReportModalOpen(false);
    setReportReason("Lien vidéo ne fonctionne pas");
    setReportSubmitting(false);
  };

  // Soumettre le signalement
  const handleReportSubmit = async () => {
    if (!selectedSource || !user) return;
    
    setReportSubmitting(true);
    
    try {
      await reportVideoSource(
        content.id,
        selectedSource.id,
        user.uid,
        reportReason
      );
      
      // Marquer la source actuelle comme non fonctionnelle localement
      const updatedSources = videoSources.map(source => {
        if (source.id === selectedSource.id) {
          return { ...source, isWorking: false };
        }
        return source;
      });
      
      // Filtrer les sources qui fonctionnent encore
      const workingSources = updatedSources.filter(source => source.isWorking !== false);
      setVideoSources(workingSources);
      
      // Si d'autres sources sont disponibles, passer à la suivante
      if (workingSources.length > 0 && workingSources[0].id !== selectedSource.id) {
        setSelectedSource(workingSources[0]);
      } else if (workingSources.length === 0) {
        setError("Toutes les sources ont été signalées. Veuillez réessayer plus tard.");
        setSelectedSource(null);
      }
      
      handleReportClose();
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      setError("Une erreur s'est produite lors du signalement.");
    } finally {
      setReportSubmitting(false);
    }
  };

  // Si on est en train de charger, afficher un spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Si une erreur s'est produite, afficher un message d'erreur
  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  // Si aucune source n'est sélectionnée, afficher un message
  if (!selectedSource) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" gutterBottom>
          Aucune source vidéo disponible
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', mx: 'auto', mb: 4 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        {/* Sélecteur de source vidéo */}
        {videoSources.length > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="video-source-select-label">Source vidéo</InputLabel>
              <Select
                labelId="video-source-select-label"
                value={selectedSource.id}
                onChange={handleSourceChange}
                label="Source vidéo"
              >
                {videoSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.provider} {source.quality ? `- ${source.quality}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined" 
              color="warning" 
              onClick={handleReportClick}
              size="small"
            >
              Signaler un problème
            </Button>
          </Box>
        )}
        
        {/* Lecteur vidéo iframe */}
        <Box 
          sx={{ 
            position: 'relative', 
            paddingBottom: '56.25%', // Ratio 16:9
            height: 0, 
            overflow: 'hidden',
            maxWidth: '100%',
            mb: 2
          }}
        >
          <iframe
            src={selectedSource.embedUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allowFullScreen
            title={`${content.title} player`}
            onLoad={() => saveProgress(0)}
            frameBorder="0"
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            loading="lazy"
          ></iframe>
        </Box>
      </Paper>

      {/* Informations sur l'épisode ou le contenu */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          {episode ? `${content.title} - S${seasonId} E${episodeId}: ${episode.title}` : content.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {episode ? episode.description : content.description}
        </Typography>
      </Paper>

      {/* Modal de signalement */}
      <Modal
        open={reportModalOpen}
        onClose={handleReportClose}
        aria-labelledby="report-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography id="report-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Signaler un problème
          </Typography>
          <TextField
            fullWidth
            label="Raison du signalement"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleReportClose} disabled={reportSubmitting}>
              Annuler
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleReportSubmit}
              disabled={reportSubmitting}
            >
              {reportSubmitting ? <CircularProgress size={24} /> : 'Envoyer'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EmbedVideoPlayer; 