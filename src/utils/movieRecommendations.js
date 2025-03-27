// Local movie recommendations to use as fallback when API hits rate limits

export const movieRecommendationsByMood = {
  "happy": [
    { title: "La La Land", year: 2016, description: "A joyful musical about dreamers in Los Angeles" },
    { title: "The Secret Life of Walter Mitty", year: 2013, description: "An uplifting adventure about finding meaning in life" },
    { title: "Chef", year: 2014, description: "A delightful journey of culinary passion and family" }
  ],
  "sad": [
    { title: "The Pursuit of Happyness", year: 2006, description: "An inspiring story of perseverance in tough times" },
    { title: "Good Will Hunting", year: 1997, description: "A profound journey of self-discovery and healing" },
    { title: "Inside Out", year: 2015, description: "A beautiful exploration of emotions and growing up" }
  ],
  "excited": [
    { title: "Mad Max: Fury Road", year: 2015, description: "An adrenaline-pumping post-apocalyptic chase" },
    { title: "Everything Everywhere All At Once", year: 2022, description: "A mind-bending multiverse adventure" },
    { title: "Top Gun: Maverick", year: 2022, description: "High-flying action with breathtaking aerial sequences" }
  ],
  "relaxed": [
    { title: "The Grand Budapest Hotel", year: 2014, description: "A charming, visually stunning comedy" },
    { title: "About Time", year: 2013, description: "A gentle romance with a time travel twist" },
    { title: "The Secret Garden", year: 2020, description: "A calming adaptation of the classic novel" }
  ],
  "bored": [
    { title: "Inception", year: 2010, description: "A mind-bending heist in the world of dreams" },
    { title: "The Matrix", year: 1999, description: "A revolutionary sci-fi that challenges reality" },
    { title: "Knives Out", year: 2019, description: "An engaging, twisty murder mystery" }
  ]
};

export const movieRecommendationsByGenre = {
  "action": [
    { title: "John Wick", year: 2014, description: "Stylish revenge thriller with incredible fight choreography" },
    { title: "Die Hard", year: 1988, description: "The definitive action classic in a skyscraper" },
    { title: "Mission: Impossible - Fallout", year: 2018, description: "Stunning practical stunts and espionage" }
  ],
  "comedy": [
    { title: "Superbad", year: 2007, description: "Hilarious coming-of-age story about friendship" },
    { title: "The Big Lebowski", year: 1998, description: "A quirky cult classic about mistaken identity" },
    { title: "Booksmart", year: 2019, description: "Smart comedy about high school overachievers" }
  ],
  "horror": [
    { title: "Hereditary", year: 2018, description: "Deeply unsettling family horror with psychological depth" },
    { title: "The Conjuring", year: 2013, description: "Terrifying supernatural investigation based on real cases" },
    { title: "Get Out", year: 2017, description: "Brilliant social horror with unexpected twists" }
  ],
  "drama": [
    { title: "The Shawshank Redemption", year: 1994, description: "A powerful story of hope and redemption" },
    { title: "Parasite", year: 2019, description: "Masterful social commentary on class disparity" },
    { title: "Marriage Story", year: 2019, description: "A heart-wrenching portrait of divorce" }
  ],
  "sci-fi": [
    { title: "Blade Runner 2049", year: 2017, description: "Visually stunning exploration of humanity" },
    { title: "Arrival", year: 2016, description: "Thoughtful first contact story about language and time" },
    { title: "Dune", year: 2021, description: "Epic adaptation of the classic sci-fi novel" }
  ],
  "romance": [
    { title: "Before Sunrise", year: 1995, description: "A chance encounter leads to a night of connection in Vienna" },
    { title: "Eternal Sunshine of the Spotless Mind", year: 2004, description: "Surreal journey through memories of love" },
    { title: "The Notebook", year: 2004, description: "Classic romantic drama spanning decades" }
  ]
};

// Function to get a response based on keyword matching
export const getLocalMovieRecommendation = (query) => {
  query = query.toLowerCase();
  
  // Check for mood keywords
  for (const [mood, movies] of Object.entries(movieRecommendationsByMood)) {
    if (query.includes(mood)) {
      return formatLocalResponse(mood, 'mood', movies);
    }
  }
  
  // Check for genre keywords
  for (const [genre, movies] of Object.entries(movieRecommendationsByGenre)) {
    if (query.includes(genre)) {
      return formatLocalResponse(genre, 'genre', movies);
    }
  }
  
  // If no specific matches, provide general recommendations
  return `I'm currently using my offline database due to API limits. Here are some great movies to watch:

• The Godfather (1972) - The definitive crime drama about family and power
• Everything Everywhere All at Once (2022) - Mind-bending multiverse adventure with heart
• Spirited Away (2001) - Enchanting animated masterpiece about identity and courage

Feel free to ask about specific genres like "action", "comedy", or "romance" for more targeted recommendations!`;
};

// Format response in a consistent way
const formatLocalResponse = (keyword, type, movies) => {
  let response = `I'm currently using my offline database due to API limits. Based on your interest in ${keyword} ${type === 'mood' ? 'movies' : 'films'}, here are some recommendations:\n\n`;
  
  movies.forEach(movie => {
    response += `• ${movie.title} (${movie.year}) - ${movie.description}\n`;
  });
  
  response += `\nThese are from my local database. When the API limit resets, I'll be able to provide more personalized recommendations!`;
  
  return response;
};
