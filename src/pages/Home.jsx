import { useEffect, useState } from "react"
import { useDebounce } from "react-use";
import Search from "../components/Search"
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import { getTrending, updateSearchCount } from "../appwrite";
import ChatbotButton from "../components/ChatbotButton";
import Chatbot from "../components/Chatbot";
import Footer from "../components/common/Footer";
import Pagination from "../components/common/Pagination";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://trendingmoviebackend-1.onrender.com/api";
// Get TMDB credentials from environment variables
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [useDirectApi, setUseDirectApi] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useDebounce(() => setdebouncedSearchTerm(searchTerm), 800, [searchTerm])

  // Function to fetch data directly from TMDB using API key
  const fetchFromTMDB = async (endpoint, query = "", page = 1) => {
    let url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`;
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }
    
    console.log(`Fetching from TMDB: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status}`);
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  };

  // Alternative function using Authorization header method
  const fetchFromTMDBWithToken = async (endpoint, query = "", page = 1) => {
    let url = `${TMDB_BASE_URL}${endpoint}?page=${page}`;
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }
    
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
      }
    };
    
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  };

  const fetchMovies = async (query = "", page = 1) => {
    setIsLoading(true);
    setErrorMessage("");
  
    try {
      let data;
      
      if (useDirectApi) {
        // Use TMDB API directly as fallback
        try {
          if (query) {
            data = await fetchFromTMDB('/search/movie', query, page);
          } else {
            data = await fetchFromTMDB('/discover/movie', 'sort_by=popularity.desc', page);
          }
        } catch (err) {
          console.log("API key method failed, trying token method:", err);
          
          if (query) {
            data = await fetchFromTMDBWithToken('/search/movie', query, page);
          } else {
            data = await fetchFromTMDBWithToken('/discover/movie', '', page);
          }
        }
      } else {
        // Use our backend
        const endpoint = `${API_BASE_URL}/movies?query=${encodeURIComponent(query)}&page=${page}`;
        const response = await fetch(endpoint);
    
        if (!response.ok) {
          console.log("Backend API failed, switching to direct TMDB API");
          setUseDirectApi(true);
          // Retry with direct API
          return fetchMovies(query, page);
        }
    
        data = await response.json();
      }
      
      if (data.Response === "False") {
        setMovieList([]);
        return;
      }
  
      setMovieList(data.results || []);
      setTotalPages(data.total_pages || 0);
  
      if (query && data.results && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Failed to fetch movies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadTrendingMovies = async() => {
    try{
      const movies = await getTrending();
      setTrendingMovies(movies);
    }catch(error){
      console.error(error);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]);

  useEffect(() => {
    loadTrendingMovies()
  }, [])

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <main>
      <div className="pattern"/>
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="hero banner"></img>
          <h1>Find <span className="text-gradient">Movies</span> You'll Love Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                  <Link to={`/movie/${movie.movie_id}`} key={movie.$id}>
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title}></img>
                </li>
                </Link>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies {currentPage > 1 && <span className="text-sm font-normal text-gray-400">(Page {currentPage})</span>}</h2>

          {isLoading ? (
            <Spinner/>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="flex justify-center mt-10 pb-6">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <h3 className="text-center text-white text-lg mb-3">Browse More Movies</h3>
                <Pagination 
                  currentPage={currentPage}
                  totalPages={Math.min(totalPages, 10)} // Limit to 10 pages
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </section>
      </div>
      
      <ChatbotButton toggleChatbot={toggleChatbot} />
      {isChatbotOpen && <Chatbot closeChatbot={() => setIsChatbotOpen(false)} />}
      
      <Footer/>
    </main>
  )
}

export default Home
