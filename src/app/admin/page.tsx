'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [movies, setMovies] = useState<MediaContent[]>([]);
  const [series, setSeries] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contentRef = ref(db, 'content');
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const contentArray = Object.values(data) as MediaContent[];
          
          setMovies(contentArray.filter(item => item.type === 'movie'));
          setSeries(contentArray.filter(item => item.type === 'series'));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Vérifier si l'utilisateur est admin
  if (status === 'loading') {
    return <div>Chargement...</div>;
  }

  if (!session || !session.user.isAdmin) {
    redirect('/');
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      try {
        await remove(ref(db, `content/${id}`));
        setMovies(movies.filter(movie => movie.id !== id));
        setSeries(series.filter(serie => serie.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Administration</h1>
        <Link href="/admin/add">
          <Button className="flex items-center gap-2">
            <FaPlus />
            <span>Ajouter un contenu</span>
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Films ({movies.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-3 text-left">Titre</th>
                    <th className="p-3 text-left">Année</th>
                    <th className="p-3 text-left">Genres</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(movie => (
                    <tr key={movie.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-3">{movie.title}</td>
                      <td className="p-3">{movie.releaseYear}</td>
                      <td className="p-3">{movie.genres.join(', ')}</td>
                      <td className="p-3 flex space-x-2">
                        <Link href={`/admin/edit/${movie.id}`}>
                          <Button variant="outline" size="sm">
                            <FaEdit />
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(movie.id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Séries ({series.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="p-3 text-left">Titre</th>
                    <th className="p-3 text-left">Année</th>
                    <th className="p-3 text-left">Saisons</th>
                    <th className="p-3 text-left">Genres</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map(serie => (
                    <tr key={serie.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-3">{serie.title}</td>
                      <td className="p-3">{serie.releaseYear}</td>
                      <td className="p-3">{(serie as any).seasons?.length || 0}</td>
                      <td className="p-3">{serie.genres.join(', ')}</td>
                      <td className="p-3 flex space-x-2">
                        <Link href={`/admin/edit/${serie.id}`}>
                          <Button variant="outline" size="sm">
                            <FaEdit />
                          </Button>
                        </Link>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(serie.id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 