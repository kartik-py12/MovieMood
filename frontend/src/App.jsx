// import  { useState, useEffect } from "react"; // Make sure React is explicitly imported
// import { useDebounce } from "react-use";
// import Search from "./components/search";
// import Spinner from "./components/Spinner";
// import MovieCard from "./components/MovieCard";
// import { getTrending, updateSearchCount } from "./appwrite";
// import { toast } from 'react-hot-toast';

import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import VisualRecommender from "./pages/VisualRecommender";
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';


const App = () => {
  // const [searchTerm, setSearchTerm] = useState("");
  // const [errorMessage, setErrorMessage] = useState("");
  // const [movieList, setMovieList] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [debouncedSearchTerm, setdebouncedSearchTerm] = useState("");
  // const [trendingMovies, setTrendingMovies] = useState([]);
  // const [isApiAvailable, setIsApiAvailable] = useState(true);

  // useDebounce(() => setdebouncedSearchTerm(searchTerm), 800, [searchTerm]);

  // const fetchMovies = async (query = "") => {
  //   setIsLoading(true);
  //   setErrorMessage("");

  //   try {
  //     const endpoint = `${API_BASE_URL}/movies?query=${encodeURIComponent(query)}`;
  //     const response = await fetch(endpoint);

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch movies");
  //     }

  //     const data = await response.json();
  //     if (data.Response === "False") {
  //       setMovieList([]);
  //       return;
  //     }

  //     setMovieList(data.results || []);

  //     if (query && data.results.length > 0) {
  //       await updateSearchCount(query, data.results[0]);
  //     }
  //   } catch (error) {
  //     console.error(`Error fetching movies: ${error}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const loadTrendingMovies = async () => {
  //   try {
  //     const movies = await getTrending();
  //     setTrendingMovies(movies);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   fetchMovies(debouncedSearchTerm);
  // }, [debouncedSearchTerm]);

  // useEffect(() => {
  //   loadTrendingMovies();
  // }, []);

  // // Check if the API is available
  // useEffect(() => {
  //   const checkApiStatus = async () => {
  //     try {
  //       // First try a simple health check
  //       const healthResponse = await fetch("http://localhost:5000/api/health", {
  //         method: 'GET',
  //         headers: { 'Accept': 'application/json' },
  //         // Set a timeout to prevent long waiting
  //         signal: AbortSignal.timeout(10000)
  //       });
  //       console.log(healthResponse);
        
  //       if (healthResponse.ok) {
  //         setIsApiAvailable(true);
  //         return;
  //       }
        
  //       throw new Error('API unavailable');
  //     } catch (error) {
  //       console.error("API check failed:", error);
        
  //       // Don't set API as unavailable for network errors - might be client-side
  //       if (error.name === 'AbortError') {
  //         console.log("API check timed out - trying direct TMDB access");
  //         // We'll try direct TMDB access instead of showing error
  //         setIsApiAvailable(true);
  //       } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
  //         // Likely CORS or network error, let the app try to use fallback anyway
  //         console.log("API check network error - trying direct TMDB access");
  //         setIsApiAvailable(true);
  //       } else {
  //         setIsApiAvailable(false);
  //       }
  //     }
  //   };

  //   checkApiStatus();
  // }, []);

  // if (!isApiAvailable) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
  //       <div className="text-red-500 mb-4 text-xl">
  //         The movie database backend is currently unavailable.
  //       </div>
  //       <p className="text-light-200 mb-6">
  //         Our backend service might be initializing or experiencing high traffic.
  //       </p>
  //       <button 
  //         onClick={() => window.location.reload()}
  //         className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
  //       >
  //         Retry Connection
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/visual-recommender" element={<VisualRecommender />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
    </AuthProvider>
  );
};

export default App;