import { useEffect, useState } from "react"
import { useDebounce } from "react-use";
import Search from "../components/Search"
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import { getTrending, updateSearchCount } from "../appwrite";
import ChatbotButton from "../components/ChatbotButton";
import Chatbot from "../components/Chatbot";

const API_BASE_URL = "https://trendingmoviebackend-1.onrender.com/api";
// Update with your actual TMDB credentials
const TMDB_API_KEY = "7337f37bbac265f1941b84dbf6976edc";
const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MzM3ZjM3YmJhYzI2NWYxOTQxYjg0ZGJmNjk3NmVkYyIsIm5iZiI6MTczODE3NTc2NS43NDQsInN1YiI6IjY3OWE3NTE1ZDA0YjAzYmQ5ZjM0M2ZhMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A4XPEm7gW3a3ajC1Wo52gXG-QpdSWXtvcmTrrA2vDkY";
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

  useDebounce(() => setdebouncedSearchTerm(searchTerm), 800, [searchTerm])

  // Function to fetch data directly from TMDB using API key
  const fetchFromTMDB = async (endpoint, query = "") => {
    let url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`;
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
  const fetchFromTMDBWithToken = async (endpoint, query = "") => {
    let url = `${TMDB_BASE_URL}${endpoint}`;
    if (query) {
      url += `?query=${encodeURIComponent(query)}`;
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

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
  
    try {
      let data;
      
      if (useDirectApi) {
        // Use TMDB API directly as fallback
        try {
          if (query) {
            data = await fetchFromTMDB('/search/movie', query);
          } else {
            data = await fetchFromTMDB('/discover/movie', 'sort_by=popularity.desc');
          }
        } catch (err) {
          console.log("API key method failed, trying token method:", err);
          
          if (query) {
            data = await fetchFromTMDBWithToken('/search/movie', query);
          } else {
            data = await fetchFromTMDBWithToken('/discover/movie?sort_by=popularity.desc');
          }
        }
      } else {
        // Use our backend
        const endpoint = `${API_BASE_URL}/movies?query=${encodeURIComponent(query)}`;
        const response = await fetch(endpoint);
    
        if (!response.ok) {
          console.log("Backend API failed, switching to direct TMDB API");
          setUseDirectApi(true);
          // Retry with direct API
          return fetchMovies(query);
        }
    
        data = await response.json();
      }
      
      if (data.Response === "False") {
        setMovieList([]);
        return;
      }
  
      setMovieList(data.results || []);
  
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
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies()
  }, [])

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
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
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title}></img>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

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
        </section>
      </div>
      
      <ChatbotButton toggleChatbot={toggleChatbot} />
      {isChatbotOpen && <Chatbot closeChatbot={() => setIsChatbotOpen(false)} />}
    </main>
  )
}

export default Home
