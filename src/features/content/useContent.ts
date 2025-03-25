import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getAllContent,
  getContentById,
  saveContent,
  deleteContent,
  searchContent,
  observeAllContent,
  observeContentById
} from './contentService';
import { Content } from '../../types';

// Clés de requête
const CONTENT_LIST_KEY = 'content-list';
const CONTENT_DETAIL_KEY = 'content-detail';
const CONTENT_SEARCH_KEY = 'content-search';

// Hook pour récupérer tout le contenu en temps réel
export const useContentList = () => {
  const queryClient = useQueryClient();

  // Utiliser useQuery pour la récupération initiale et le cache
  const query = useQuery({
    queryKey: [CONTENT_LIST_KEY],
    queryFn: getAllContent,
  });

  // Configurer l'observateur temps réel
  useEffect(() => {
    const unsubscribe = observeAllContent((content) => {
      queryClient.setQueryData([CONTENT_LIST_KEY], content);
    });

    return () => unsubscribe();
  }, [queryClient]);

  return query;
};

// Hook pour récupérer un contenu par ID en temps réel
export const useContentDetail = (id: string) => {
  const queryClient = useQueryClient();

  // Utiliser useQuery pour la récupération initiale et le cache
  const query = useQuery({
    queryKey: [CONTENT_DETAIL_KEY, id],
    queryFn: () => getContentById(id),
    enabled: !!id,
  });

  // Configurer l'observateur temps réel
  useEffect(() => {
    if (!id) return;

    const unsubscribe = observeContentById(id, (content) => {
      queryClient.setQueryData([CONTENT_DETAIL_KEY, id], content);
    });

    return () => unsubscribe();
  }, [id, queryClient]);

  return query;
};

// Hook pour la recherche de contenu
export const useContentSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: [CONTENT_SEARCH_KEY, searchTerm],
    queryFn: () => searchContent(searchTerm),
    enabled: searchTerm.trim().length > 0,
  });
};

// Hook pour créer ou mettre à jour du contenu
export const useContentMutation = () => {
  const queryClient = useQueryClient();

  const createOrUpdateMutation = useMutation({
    mutationFn: ({ content, id }: { content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>, id?: string }) => 
      saveContent(content, id),
    onSuccess: (savedContent) => {
      // Invalider les requêtes pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: [CONTENT_LIST_KEY] });
      if (savedContent.id) {
        queryClient.invalidateQueries({ queryKey: [CONTENT_DETAIL_KEY, savedContent.id] });
      }
      queryClient.invalidateQueries({ queryKey: [CONTENT_SEARCH_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContent(id),
    onSuccess: (_, id) => {
      // Invalider les requêtes pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: [CONTENT_LIST_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_DETAIL_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_SEARCH_KEY] });
    },
  });

  return {
    createOrUpdate: createOrUpdateMutation.mutate,
    remove: deleteMutation.mutate,
    isCreatingOrUpdating: createOrUpdateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createOrUpdateError: createOrUpdateMutation.error,
    deleteError: deleteMutation.error,
  };
}; 