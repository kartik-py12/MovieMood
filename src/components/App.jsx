import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from '../pages/Home';  // Correct import for the Home page
import MovieDetails from './MovieDetails';
import MovieSearch from './MovieSearch';
import PersonDetails from './PersonDetails';
import GenreMovies from './GenreMovies';
import PageNotFound from './PageNotFound';
import CategoryMovies from './CategoryMovies';
import ChatbotContainer from './ChatbotContainer';
import Footer from './common/Footer';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <Navbar />
        <main className="flex-grow relative overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/search" element={<MovieSearch />} />
            <Route path="/person/:id" element={<PersonDetails />} />
            <Route path="/genre/:id/:name" element={<GenreMovies />} />
            <Route path="/movies/:category" element={<CategoryMovies />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          
          {/* Only show chatbot on search pages - NOT on home or movie details pages as they have their own */}
          <Routes>
            <Route path="/search" element={<ChatbotContainer />} />
            <Route path="/movies/:category" element={<ChatbotContainer />} />
            <Route path="/genre/:id/:name" element={<ChatbotContainer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
