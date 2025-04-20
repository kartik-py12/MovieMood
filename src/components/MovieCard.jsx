import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const MovieCard = ({ movie }) => {
  const { id, title, poster_path, vote_average, release_date } = movie;
  const { currentUser } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear();
  };

  // Placeholder for when there's no poster
  const posterPlaceholder = 'https://via.placeholder.com/500x750?text=No+Poster+Available';
  
  return (
    <Link to={`/movie/${id}`} className="flex flex-col w-full h-full bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl text-inherit no-underline">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img 
          src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : posterPlaceholder} 
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center bg-black/70 text-yellow-400 px-2 py-1 rounded font-bold text-sm">
            <FaStar className="mr-1" />
            <span>{vote_average.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="p-3 flex-grow flex flex-col">
        <h3 className="m-0 mb-1 text-base font-semibold leading-tight text-white line-clamp-2">{title}</h3>
        {release_date && (
          <div className="text-gray-400 text-sm mt-auto">{formatDate(release_date)}</div>
        )}
      </div>
      
      {/* We remove the MovieActions and sign-in button, and display nothing here for a cleaner UI */}
    </Link>
  );
};

export default MovieCard;