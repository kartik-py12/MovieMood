import { useNavigate } from 'react-router-dom';

const MovieCard = ({movie:
    {id, title, poster_path, vote_average, release_date, original_language}
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/movie/${id}`);
  };
  
  return (
    <div className="movie-card cursor-pointer" onClick={handleClick}>
        <img src={poster_path ?
            `https://image.tmdb.org/t/p/w500/${poster_path}`:'/no-movie.png'}
            alt={title} 
        />
    <div className="mt-4">
        <h3>{title}</h3>
    </div>

    <div className="content">
        <div className="rating">
            <img src="/star.svg" alt="Star icon" />
            <p>{vote_average ? vote_average.toFixed(1):"N/A"}</p>
        </div>

        <span>•</span>
        <p className="lang">{original_language}</p>
        <span>•</span>
        <p className="year">{release_date ? release_date.split('-')[0]:'N/A'}</p>
    </div>
</div>
  )
}

export default MovieCard