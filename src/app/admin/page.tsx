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
  const [animes, setAnimes] = useState<MediaContent[]>([]);
  const [mangas, setMangas] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contentRef = ref(db, 'content');
        const snapshot = await get(contentRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const contentArray = Object.values(data) as MediaContent[];
          
          setAnimes(contentArray.filter(item => item.type === 'movie'));
          setMangas(contentArray.filter(item => item.type === 'series'));
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
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!session || !session.user.isAdmin) {
    redirect('/');
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      try {
        await remove(ref(db, `content/${id}`));
        setAnimes(animes.filter(anime => anime.id !== id));
        setMangas(mangas.filter(manga => manga.id !== id));
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
          <button className="btn btn-primary flex items-center gap-2">
            <FaPlus />
            <span>Ajouter un contenu</span>
          </button>
        </Link>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Animés ({animes.length})</h2>
            <div className="overflow-x-auto bg-dark-card-color rounded-lg shadow-lg border border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-4 text-left">Titre</th>
                    <th className="p-4 text-left">Année</th>
                    <th className="p-4 text-left">Genres</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {animes.map(anime => (
                    <tr key={anime.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-4">{anime.title}</td>
                      <td className="p-4">{anime.releaseYear}</td>
                      <td className="p-4">{anime.genres.join(', ')}</td>
                      <td className="p-4 flex space-x-2">
                        <Link href={`/admin/edit/${anime.id}`}>
                          <button className="btn btn-outline btn-sm">
                            <FaEdit />
                          </button>
                        </Link>
                        <button 
                          className="btn btn-sm bg-red-600 hover:bg-red-700" 
                          onClick={() => handleDelete(anime.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {animes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">Aucun animé disponible</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Mangas ({mangas.length})</h2>
            <div className="overflow-x-auto bg-dark-card-color rounded-lg shadow-lg border border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-4 text-left">Titre</th>
                    <th className="p-4 text-left">Année</th>
                    <th className="p-4 text-left">Saisons</th>
                    <th className="p-4 text-left">Genres</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mangas.map(manga => (
                    <tr key={manga.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-4">{manga.title}</td>
                      <td className="p-4">{manga.releaseYear}</td>
                      <td className="p-4">{(manga as any).seasons?.length || 0}</td>
                      <td className="p-4">{manga.genres.join(', ')}</td>
                      <td className="p-4 flex space-x-2">
                        <Link href={`/admin/edit/${manga.id}`}>
                          <button className="btn btn-outline btn-sm">
                            <FaEdit />
                          </button>
                        </Link>
                        <button 
                          className="btn btn-sm bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(manga.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {mangas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400">Aucun manga disponible</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 