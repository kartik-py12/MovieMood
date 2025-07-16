// Local movie recommendations for fallback when API is unavailable

// Map moods and preferences to movie recommendations
const moodRecommendations = {
  happy: [
    { title: "La La Land", year: 2016, description: "Uplifting musical romance in LA" },
    { title: "The Intouchables", year: 2011, description: "Heartwarming friendship comedy" },
    { title: "Sing Street", year: 2016, description: "Feel-good musical coming-of-age story" }
  ],
  sad: [
    { title: "Good Will Hunting", year: 1997, description: "Emotional drama about potential and healing" },
    { title: "Inside Out", year: 2015, description: "Animated exploration of emotions" },
    { title: "The Pursuit of Happyness", year: 2006, description: "Inspiring true struggle and perseverance" }
  ],
  excited: [
    { title: "Mad Max: Fury Road", year: 2015, description: "High-octane post-apocalyptic action" },
    { title: "Mission: Impossible - Fallout", year: 2018, description: "Thrilling spy action adventure" },
    { title: "Everything Everywhere All at Once", year: 2022, description: "Mind-bending multiverse adventure" }
  ],
  relaxed: [
    { title: "The Secret Life of Walter Mitty", year: 2013, description: "Gentle adventure about self-discovery" },
    { title: "Chef", year: 2014, description: "Feel-good food road trip" },
    { title: "About Time", year: 2013, description: "Sweet time-travel romance dramedy" }
  ],
  bored: [
    { title: "Knives Out", year: 2019, description: "Entertaining modern whodunit mystery" },
    { title: "The Grand Budapest Hotel", year: 2014, description: "Quirky stylish adventure comedy" },
    { title: "Baby Driver", year: 2017, description: "Fast-paced heist film with rhythm" }
  ],
  romantic: [
    { title: "The Notebook", year: 2004, description: "Classic tearjerker romance" },
    { title: "Crazy Rich Asians", year: 2018, description: "Glamorous cultural romantic comedy" },
    { title: "Before Sunrise", year: 1995, description: "Intimate walking-and-talking romance" }
  ],
  thoughtful: [
    { title: "Arrival", year: 2016, description: "Cerebral sci-fi about language and time" },
    { title: "Eternal Sunshine of the Spotless Mind", year: 2004, description: "Mind-bending relationship drama" },
    { title: "Interstellar", year: 2014, description: "Epic space journey with emotional core" }
  ],
  scared: [
    { title: "Get Out", year: 2017, description: "Smart social horror thriller" },
    { title: "A Quiet Place", year: 2018, description: "Tense monster survival thriller" },
    { title: "The Sixth Sense", year: 1999, description: "Supernatural thriller with famous twist" }
  ]
};

// Generic recommendations when mood isn't specified
const genericRecommendations = [
  { title: "The Shawshank Redemption", year: 1994, description: "Powerful prison drama about hope" },
  { title: "Parasite", year: 2019, description: "Award-winning social class thriller" },
  { title: "Spider-Man: Into the Spider-Verse", year: 2018, description: "Innovative animated superhero adventure" },
  { title: "The Princess Bride", year: 1987, description: "Beloved fairy tale adventure comedy" }
];

// Greeting messages to make the chatbot feel more conversational
const greetings = [
  "Hi there! How are you feeling today? I can recommend some movies based on your mood.",
  "Hello! What kind of movie are you in the mood for today?",
  "Hey! Are you looking for something happy, exciting, thoughtful, or something else?",
  "Hi! Tell me how you're feeling and I'll suggest some movies that might match your mood."
];

/**
 * Get local movie recommendations based on the user's message
 * @param {string} userMessage - The user's input message
 * @param {boolean} conversational - Whether to use a conversational style
 * @param {string} context - Previous conversation context
 * @returns {string} - Movie recommendations as text
 */
export const getLocalMovieRecommendation = (userMessage, conversational = false, context = '') => {
  const message = userMessage.toLowerCase();
  
  // Handle specific character-related queries with context
  if (context.toLowerCase().includes('zoro') || message.toLowerCase().includes('zoro')) {
    if (message.toLowerCase().includes('loyal') || message.toLowerCase().includes('loyalty')) {
      return "Zoro from One Piece shows incredible loyalty to Luffy as his first mate. His unwavering dedication is seen when he took Luffy's pain at Thriller Bark and his promise to never lose again. For similar loyal characters, try John Wick (2014) - unwavering dedication to principles, or Samurai Champloo (2004) - honor-bound warriors on a journey.";
    }
    
    return "Roronoa Zoro is the loyal first mate in One Piece, known for his three-sword style and dream to be the world's greatest swordsman. For similar determined characters, check out Rurouni Kenshin (1996) - wandering samurai with a past, Sword of the Stranger (2007) - masterful sword fighting animation, or Blade of the Immortal (2019) - gritty samurai revenge story.";
  }
  
  // If it's a short message or greeting, ask about mood
  if (message.length < 15 || isGreeting(message)) {
    return getRandomItem(greetings);
  }
  
  // Check if any mood keywords are in the message
  let matchedMood = null;
  const moodKeywords = {
    happy: ['happy', 'joy', 'cheerful', 'upbeat', 'fun', 'comedy', 'laugh'],
    sad: ['sad', 'down', 'blue', 'depressed', 'melancholy', 'cry', 'emotional'],
    excited: ['excited', 'thrill', 'adventure', 'action', 'adrenaline', 'energy'],
    relaxed: ['relaxed', 'chill', 'calm', 'peaceful', 'easy', 'unwind'],
    bored: ['bored', 'nothing to do', 'entertain', 'exciting', 'something different'],
    romantic: ['romantic', 'love', 'romance', 'date', 'relationship'],
    thoughtful: ['thoughtful', 'think', 'deep', 'philosophical', 'mind', 'intelligent'],
    scared: ['scared', 'fear', 'horror', 'frightening', 'spooky', 'terrifying']
  };
  
  // Find matching mood
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      matchedMood = mood;
      break;
    }
  }
  
  // Get recommendations based on mood or use generic ones
  const recommendations = matchedMood ? moodRecommendations[matchedMood] : genericRecommendations;
  
  // Format based on conversation style preference
  if (conversational) {
    // For first-time queries, use a greeting + question about mood
    if (isGreeting(message)) {
      return getRandomItem(greetings);
    }
    
    // Conversational response with matched mood
    if (matchedMood) {
      return `For a ${matchedMood} mood, I'd recommend: ${formatMoviesConversational(recommendations)}. Any of these sound good?`;
    } else {
      return `Here are some great movies you might enjoy: ${formatMoviesConversational(recommendations)}. What kind of movies are you in the mood for?`;
    }
  } else {
    // Standard format
    if (matchedMood) {
      return `Movies for when you're feeling ${matchedMood}:\n\n${formatMovies(recommendations)}`;
    } else {
      return `Recommended movies based on your message:\n\n${formatMovies(recommendations)}`;
    }
  }
};

function formatMoviesConversational(movies) {
  return movies.map(movie => `'${movie.title}' (${movie.year}) - ${movie.description}`).join(', ');
}

function formatMovies(movies) {
  return movies.map(movie => `• ${movie.title} (${movie.year}) - ${movie.description}`).join('\n');
}

function isGreeting(message) {
  const greetingTerms = ['hi', 'hello', 'hey', 'greetings', 'sup', 'yo', 'hola'];
  return greetingTerms.some(term => message.toLowerCase().includes(term));
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}
