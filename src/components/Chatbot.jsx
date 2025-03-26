import React, { useState } from 'react';

// Sample movie recommendations based on input
const movieSuggestions = {
  "happy": [
    { title: "La La Land", year: 2016, description: "A feel-good musical about dreamers in Los Angeles" },
    { title: "Toy Story", year: 1995, description: "Animated adventure about toys that come to life" },
    { title: "The Princess Bride", year: 1987, description: "A classic fairy tale adventure with humor and romance" }
  ],
  "sad": [
    { title: "The Pursuit of Happyness", year: 2006, description: "Inspirational story of a struggling salesman" },
    { title: "Good Will Hunting", year: 1997, description: "A janitor with genius-level intelligence finds direction" },
    { title: "Soul", year: 2020, description: "Pixar film about finding your purpose in life" }
  ],
  "action": [
    { title: "Die Hard", year: 1988, description: "Classic action film in a skyscraper under siege" },
    { title: "Mad Max: Fury Road", year: 2015, description: "High-octane post-apocalyptic chase movie" },
    { title: "The Dark Knight", year: 2008, description: "Batman faces his greatest nemesis, the Joker" }
  ],
  "comedy": [
    { title: "Superbad", year: 2007, description: "High school friends trying to party before graduation" },
    { title: "Bridesmaids", year: 2011, description: "Competitive bridesmaids at a wedding" },
    { title: "The Hangover", year: 2009, description: "Friends piece together a wild night in Las Vegas" }
  ],
  "romance": [
    { title: "The Notebook", year: 2004, description: "Epic love story told through flashbacks" },
    { title: "Pride & Prejudice", year: 2005, description: "Classic Jane Austen romance in the English countryside" },
    { title: "Before Sunrise", year: 1995, description: "Two strangers meet on a train and spend a night in Vienna" }
  ],
  "sci-fi": [
    { title: "Blade Runner 2049", year: 2017, description: "Dystopian future where replicants are hunted" },
    { title: "Interstellar", year: 2014, description: "Space exploration to find a new home for humanity" },
    { title: "Arrival", year: 2016, description: "Linguist works to communicate with alien visitors" }
  ],
  "thriller": [
    { title: "Get Out", year: 2017, description: "Unsettling visit to a girlfriend's parents' home" },
    { title: "Parasite", year: 2019, description: "Korean thriller about class warfare" },
    { title: "Gone Girl", year: 2014, description: "Man becomes suspect when his wife goes missing" }
  ]
};

const Chatbot = ({ closeChatbot }) => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hi there! I'm your movie recommendation assistant. Tell me how you're feeling or what genre you're in the mood for (like 'happy', 'action', 'romance', etc)."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate processing time
    setTimeout(() => {
      respondToUser(input.toLowerCase());
      setIsTyping(false);
    }, 1000);
  };

  const respondToUser = (userInput) => {
    // Check if user input contains any of our keywords
    const keywords = Object.keys(movieSuggestions);
    let matchedKeyword = keywords.find(keyword => userInput.includes(keyword));
    
    if (!matchedKeyword) {
      // Check if there are other common words we can match
      if (userInput.includes('excited') || userInput.includes('joy')) matchedKeyword = 'happy';
      else if (userInput.includes('depressed') || userInput.includes('blue')) matchedKeyword = 'sad';
      else if (userInput.includes('love') || userInput.includes('date')) matchedKeyword = 'romance';
      else if (userInput.includes('laugh') || userInput.includes('funny')) matchedKeyword = 'comedy';
      else if (userInput.includes('space') || userInput.includes('future')) matchedKeyword = 'sci-fi';
      else if (userInput.includes('scary') || userInput.includes('suspense')) matchedKeyword = 'thriller';
    }
    
    if (matchedKeyword) {
      const recommendations = movieSuggestions[matchedKeyword];
      
      // Format the response
      let responseText = `Based on your mood for "${matchedKeyword}" movies, here are some recommendations:\n\n`;
      
      recommendations.forEach(movie => {
        responseText += `• ${movie.title} (${movie.year}) - ${movie.description}\n`;
      });
      
      setMessages([...messages, { sender: 'bot', text: responseText }]);
    } else {
      setMessages([...messages, { 
        sender: 'bot', 
        text: "I'm not sure what kind of movies you're looking for. Try telling me a genre (action, comedy, romance, sci-fi, thriller) or how you're feeling (happy, sad)."
      }]);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-dark-100 rounded-lg shadow-lg z-50 flex flex-col max-h-[500px] border border-light-100/20">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-light-100/10">
        <h3 className="font-bold text-white">Movie Recommendations</h3>
        <button 
          onClick={closeChatbot}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : ''}`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-light-100/10 text-white'
              }`}
            >
              <pre className="whitespace-pre-wrap font-dm-sans text-sm">{message.text}</pre>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-4">
            <div className="inline-block p-3 rounded-lg bg-light-100/10 text-white">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSend} className="border-t border-light-100/10 p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what movies you like..."
            className="flex-1 bg-light-100/5 rounded-l-lg py-2 px-4 text-white focus:outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-lg py-2 px-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
