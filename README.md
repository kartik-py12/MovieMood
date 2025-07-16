# MovieMood - AI-Powered Film Recommendation App

![MovieMood Banner](frontend/public/hero.png)

## Overview

MovieMood is an intelligent movie discovery platform that understands your emotions and preferences. Combining the vast TMDB movie database with Google's Gemini AI, MovieMood delivers personalized film recommendations through a conversational interface that adapts to your mood, interests, and viewing history.

Whether you're feeling happy, nostalgic, adventurous, or just looking for something new, MovieMood's AI chatbot assistant will suggest perfect movies tailored to your current state of mind. Beyond recommendations, explore trending films, detailed movie information, trailers, and cast details in a clean, modern interface.

## Features

### 🎬 Movie Discovery
- Browse trending and popular movies
- View detailed information about movies, including casts, trailers, and ratings
- Search for specific movies across a vast database
- Pagination support for browsing large collections

### 🤖 AI-Powered Movie Recommendations
- Conversational chatbot interface for personalized recommendations
- Tell the chatbot your mood or preferences and get tailored suggestions
- Get recommendations based on specific genres, actors, or themes
- Context-aware conversations that remember your preferences

### 📱 Responsive Design
- Fully responsive interface that works on desktops, tablets, and mobile devices
- Clean, modern UI with smooth animations and transitions

### 🔍 Additional Features
- Trending movies analytics based on search patterns
- Movie details including trailers, cast information, and similar movie suggestions
- Fallback recommendation system when API is unavailable

## Technology Stack

- **Frontend**: React, Tailwind CSS
- **AI**: Google Gemini AI API for intelligent chat recommendations
- **APIs**: TMDB (The Movie Database) for movie data
- **Backend**: Express.js proxy server for API communication
- **Database**: Appwrite for storing trending searches

## Getting Started

### Prerequisites

- Node.js (v16+)
- NPM or Yarn
- API keys for TMDB and Google Gemini AI

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_appwrite_database_id
VITE_APPWRITE_COLLECTION_ID=your_appwrite_collection_id
```

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/moviemood.git
   cd moviemood
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Backend Setup (Optional)

The app uses a proxy server to communicate with TMDB API. If you want to run your own proxy:

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with your TMDB API key
   ```
   TMDB_API_KEY=your_tmdb_api_key
   ```

4. Start the server
   ```bash
   npm start
   ```

## Usage

### Movie Browsing

- The home page displays trending and popular movies
- Use the search bar to find specific movies
- Click on any movie card to view detailed information

### Chatbot Recommendations

1. Click the chat icon in the bottom-right corner
2. Tell the chatbot what kind of movie you're in the mood for
   - Example: "I'm feeling happy today"
   - Example: "Recommend me sci-fi movies with time travel"
   - Example: "What are some good movies like Inception?"
3. Follow the conversation to refine recommendations
4. Click on any recommended movie to view more details

## Contributors

- Kartik Sharma (12307285)
- Ayush Kumar (12308893)
- Kanha Mittal (12300558)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [TMDB API](https://www.themoviedb.org/documentation/api) for providing movie data
- [Google Gemini AI](https://ai.google.dev/) for powering the recommendation chatbot
- [Appwrite](https://appwrite.io/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build system

---

Made with ❤️ by the MovieMood team
