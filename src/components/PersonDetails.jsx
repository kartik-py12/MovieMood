import { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import { tmdbApi } from '../utils/tmdbApi';
import MovieGrid from './MovieGrid';
import Loader from './common/Loader';
import ErrorMessage from './common/ErrorMessage';
import './PersonDetails.css';

const PersonDetails = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('movies');

  useEffect(() => {
    const fetchPersonDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching person details for ID: ${id} (using proxy)`);
        const data = await tmdbApi.getPersonDetails(id);
        setPerson(data);
        
        // Extract movie credits
        if (data.movie_credits && data.movie_credits.cast) {
          // Sort by popularity descending
          const sortedMovies = [...data.movie_credits.cast].sort(
            (a, b) => b.popularity - a.popularity
          );
          setMovies(sortedMovies);
        }
      } catch (err) {
        console.error('Error fetching person details:', err);
        setError(`Failed to load person details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPersonDetails();
    }
    
    return () => {
      setPerson(null);
      setMovies([]);
    };
  }, [id]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const calculateAge = (birthdate, deathdate) => {
    if (!birthdate) return null;
    
    const birth = new Date(birthdate);
    const end = deathdate ? new Date(deathdate) : new Date();
    
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) return <Loader message="Loading person details..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!person) return <ErrorMessage message="Person not found" />;
  
  const age = calculateAge(person.birthday, person.deathday);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-shrink-0 w-64 mx-auto md:mx-0">
          {person.profile_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
              alt={person.name}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gray-800 rounded-lg text-gray-400">
              <span>No image available</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4 text-white">{person.name}</h1>
          
          <div className="space-y-3 mb-6 text-gray-300">
            {person.birthday && (
              <div>
                <strong className="text-white">Born:</strong> {formatDate(person.birthday)}
                {age !== null && !person.deathday && <span> (Age: {age})</span>}
              </div>
            )}
            
            {person.deathday && (
              <div>
                <strong className="text-white">Died:</strong> {formatDate(person.deathday)}
                {age !== null && <span> (Age: {age})</span>}
              </div>
            )}
            
            {person.place_of_birth && (
              <div>
                <strong className="text-white">Place of Birth:</strong> {person.place_of_birth}
              </div>
            )}
            
            {person.known_for_department && (
              <div>
                <strong className="text-white">Known For:</strong> {person.known_for_department}
              </div>
            )}
          </div>
          
          {person.biography && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">Biography</h3>
              <p className="text-gray-300 leading-relaxed">{person.biography}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-10">
        <div className="border-b border-gray-700 mb-6">
          <button 
            className={`px-4 py-2 font-medium text-lg transition-colors border-b-2 ${
              activeTab === 'movies' 
                ? 'border-red-600 text-white' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('movies')}
          >
            Movies
          </button>
        </div>
        
        <div>
          {activeTab === 'movies' && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-white">Movies</h2>
              {movies.length > 0 ? (
                <MovieGrid movies={movies} />
              ) : (
                <p className="text-gray-400 text-center py-10">No movie credits found.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;
