import { FaGithub, FaLinkedin, FaEnvelope, FaHeart, FaFilm, FaCode, FaUserFriends } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-dark-100 border-t border-light-100/5 py-16 w-full overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Top section with logo and description */}
        <div className="flex flex-col items-center mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
              <FaFilm className="text-light-100 mr-3" />
              <span className="text-gradient">TrendingMovies</span>
            </h2>
            <p className="text-light-200 max-w-2xl mx-auto text-base">
              Your ultimate destination for discovering the best in cinema - from blockbuster hits to hidden gems.
              Get personalized recommendations, explore trending films, and dive into the world of movies.
            </p>
          </div>
          
          {/* Divider */}
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-10"></div>
        </div>
        
        {/* Middle section with creators and links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Creators section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <FaUserFriends className="text-light-100 mr-2" />
              <h3 className="text-xl font-semibold text-white">Created By</h3>
            </div>
            <ul className="space-y-3">
              <li className="text-light-100 hover:text-gradient transition-colors flex items-center justify-center md:justify-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Kartik Sharma - 12307285
              </li>
              <li className="text-light-100 hover:text-gradient transition-colors flex items-center justify-center md:justify-start">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Ayush Kumar - 12308893
              </li>
              <li className="text-light-100 hover:text-gradient transition-colors flex items-center justify-center md:justify-start">
                <span className="inline-block w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                Kanha Mittal - 12300558
              </li>
            </ul>
          </div>
          
          {/* Quick links */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center">
              <FaCode className="mr-2 text-light-100" />
              Technologies
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-light-200 hover:text-light-100 transition-colors">React</span>
              </li>
              <li>
                <span className="text-light-200 hover:text-light-100 transition-colors">Tailwind CSS</span>
              </li>
              <li>
                <span className="text-light-200 hover:text-light-100 transition-colors">TMDB API</span>
              </li>
              <li>
                <span className="text-light-200 hover:text-light-100 transition-colors">Google Gemini AI</span>
              </li>
            </ul>
          </div>
          
          {/* Connect section */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center md:justify-end">
              Connect With Us
              <FaEnvelope className="ml-2 text-light-100" />
            </h3>
            <div className="flex justify-center md:justify-end space-x-5">
              <a 
                href="https://github.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-full text-light-200 hover:text-white hover:bg-gray-700 transition-all transform hover:scale-110"
                aria-label="GitHub"
              >
                <FaGithub size={20} />
              </a>
              <a 
                href="https://linkedin.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-full text-light-200 hover:text-white hover:bg-gray-700 transition-all transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
              <a 
                href="mailto:contact@trendingmovies.com" 
                className="bg-gray-800 p-3 rounded-full text-light-200 hover:text-white hover:bg-gray-700 transition-all transform hover:scale-110"
                aria-label="Email"
              >
                <FaEnvelope size={20} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom copyright section */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-light-100 text-sm flex items-center justify-center">
            Made with <FaHeart className="text-red-500 mx-1.5 animate-pulse" /> by the team
          </p>
          <p className="text-gray-500 text-xs mt-3">
            © {new Date().getFullYear()} TrendingMovies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
