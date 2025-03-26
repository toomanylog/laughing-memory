'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { MediaContent } from '@/lib/types';
import Link from 'next/link';
import { FaEdit, FaTrash, FaPlus, FaChartBar, FaSearch, FaFilter, FaEye, FaSortAmountDown } from 'react-icons/fa';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [animes, setAnimes] = useState<MediaContent[]>([]);
  const [mangas, setMangas] = useState<MediaContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'animes' | 'mangas'>('animes');
  const [sortBy, setSortBy] = useState<'title' | 'year'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  const filteredAnimes = animes.filter(anime => 
    anime.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'title') {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return sortOrder === 'asc'
        ? a.releaseYear - b.releaseYear
        : b.releaseYear - a.releaseYear;
    }
  });

  const filteredMangas = mangas.filter(manga => 
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'title') {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return sortOrder === 'asc'
        ? a.releaseYear - b.releaseYear
        : b.releaseYear - a.releaseYear;
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-dark-card-color rounded-lg shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FaChartBar className="text-primary" />
              Dashboard d'Administration
            </h1>
            <p className="text-gray-400 mt-2">Gérez votre catalogue d'animés et de mangas</p>
          </div>
          <Link href="/admin/add">
            <button className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-200">
              <FaPlus />
              <span>Ajouter un contenu</span>
            </button>
          </Link>
        </div>
        
        <div className="bg-dark-light-color rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher par titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-color rounded-md border border-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'year')}
                className="py-2 px-3 bg-dark-color rounded-md border border-gray-600 focus:outline-none focus:border-primary"
              >
                <option value="title">Trier par titre</option>
                <option value="year">Trier par année</option>
              </select>
              
              <button 
                onClick={toggleSortOrder}
                className="btn btn-outline btn-sm flex items-center gap-1"
                title={sortOrder === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'}
              >
                <FaSortAmountDown className={sortOrder === 'desc' ? 'rotate-180' : ''} />
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex border-b border-gray-700 mb-4">
            <button 
              className={`py-2 px-4 font-medium text-lg ${activeTab === 'animes' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
              onClick={() => setActiveTab('animes')}
            >
              Animés ({animes.length})
            </button>
            <button 
              className={`py-2 px-4 font-medium text-lg ${activeTab === 'mangas' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
              onClick={() => setActiveTab('mangas')}
            >
              Mangas ({mangas.length})
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="bg-dark-card-color rounded-lg shadow-xl overflow-hidden">
          {activeTab === 'animes' && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark-light-color">
                      <th className="p-4 text-left">Titre</th>
                      <th className="p-4 text-left">Année</th>
                      <th className="p-4 text-left">Genres</th>
                      <th className="p-4 text-center">Aperçu</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnimes.map(anime => (
                      <tr key={anime.id} className="border-t border-gray-700 hover:bg-dark-light-color/30 transition-colors">
                        <td className="p-4 font-medium">{anime.title}</td>
                        <td className="p-4">{anime.releaseYear}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {anime.genres.map((genre, index) => (
                              <span key={index} className="px-2 py-1 bg-dark-light-color rounded-full text-xs">{genre}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            {anime.posterUrl && (
                              <img 
                                src={anime.posterUrl} 
                                alt={anime.title}
                                className="h-16 w-12 object-cover rounded shadow-md" 
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/animes/${anime.id}`} target="_blank">
                              <button className="btn btn-sm bg-blue-600 hover:bg-blue-700" title="Voir">
                                <FaEye />
                              </button>
                            </Link>
                            <Link href={`/admin/edit/${anime.id}`}>
                              <button className="btn btn-sm bg-green-600 hover:bg-green-700" title="Modifier">
                                <FaEdit />
                              </button>
                            </Link>
                            <button 
                              className="btn btn-sm bg-red-600 hover:bg-red-700" 
                              onClick={() => handleDelete(anime.id)}
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAnimes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          Aucun animé trouvé {searchTerm ? `pour "${searchTerm}"` : ''}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'mangas' && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark-light-color">
                      <th className="p-4 text-left">Titre</th>
                      <th className="p-4 text-left">Année</th>
                      <th className="p-4 text-left">Saisons</th>
                      <th className="p-4 text-left">Genres</th>
                      <th className="p-4 text-center">Aperçu</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMangas.map(manga => (
                      <tr key={manga.id} className="border-t border-gray-700 hover:bg-dark-light-color/30 transition-colors">
                        <td className="p-4 font-medium">{manga.title}</td>
                        <td className="p-4">{manga.releaseYear}</td>
                        <td className="p-4">{(manga as any).seasons?.length || 0}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {manga.genres.map((genre, index) => (
                              <span key={index} className="px-2 py-1 bg-dark-light-color rounded-full text-xs">{genre}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            {manga.posterUrl && (
                              <img 
                                src={manga.posterUrl} 
                                alt={manga.title}
                                className="h-16 w-12 object-cover rounded shadow-md" 
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/mangas/${manga.id}`} target="_blank">
                              <button className="btn btn-sm bg-blue-600 hover:bg-blue-700" title="Voir">
                                <FaEye />
                              </button>
                            </Link>
                            <Link href={`/admin/edit/${manga.id}`}>
                              <button className="btn btn-sm bg-green-600 hover:bg-green-700" title="Modifier">
                                <FaEdit />
                              </button>
                            </Link>
                            <button 
                              className="btn btn-sm bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(manga.id)}
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMangas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          Aucun manga trouvé {searchTerm ? `pour "${searchTerm}"` : ''}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 