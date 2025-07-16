/**
 * Utility for extracting movie titles and years from AI responses
 */

/**
 * Extract movie titles, years and TMDB IDs from a formatted response
 * Looks for patterns like:
 * - <span class="font-bold" data-id="12345">Movie Title (YYYY)</span>
 * - <span class="font-bold">Movie Title (YYYY)</span>
 * - "Movie Title (YYYY)"
 * 
 * @param {string} text - The response text from the AI
 * @returns {Array<{title: string, year: string, id?: string}>} - Array of extracted movies
 */
export const extractMoviesFromResponse = (text) => {
  if (!text) return [];
  
  const movies = [];
  
  // Pattern 1: Look for HTML formatting with font-bold class and data-id (our preferred format)
  const spanPatternWithId = /<span class="font-bold"\s+data-id="(\d+)">(.*?)\s*\((\d{4})\)<\/span>/g;
  let match;
  
  while ((match = spanPatternWithId.exec(text)) !== null) {
    const id = match[1];
    const title = match[2]?.trim();
    const year = match[3];
    
    if (title) {
      movies.push({ title, year, id });
    }
  }
  
  // Pattern 2: Look for HTML formatting with font-bold class but no ID
  const spanPattern = /<span class="font-bold">(.*?)\s*\((\d{4})\)<\/span>/g;
  
  while ((match = spanPattern.exec(text)) !== null) {
    const title = match[1]?.trim();
    const year = match[2];
    
    if (title) {
      movies.push({ title, year });
    }
  }
  
  // Pattern 3: Look for plain text format "Title (YYYY)"
  if (movies.length === 0) {
    const plainPattern = /(?:^|\s)([^()]+)\s*\((\d{4})\)/g;
    
    while ((match = plainPattern.exec(text)) !== null) {
      const title = match[1]?.trim();
      const year = match[2];
      
      // Skip common false positives
      if (title && !title.match(/^(in|from|by|since|until|before)$/i)) {
        movies.push({ title, year });
      }
    }
  }
  
  // Pattern 4: Look for titles with quotes like "Title" (2020)
  if (movies.length === 0) {
    const quotedPattern = /[""]([^""]+)[""]\s*\((\d{4})\)/g;
    
    while ((match = quotedPattern.exec(text)) !== null) {
      const title = match[1]?.trim();
      const year = match[2];
      
      if (title) {
        movies.push({ title, year });
      }
    }
  }
  
  // Remove duplicates (same title and year)
  const uniqueMovies = [];
  const seen = new Set();
  
  for (const movie of movies) {
    const key = `${movie.title}|${movie.year}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMovies.push(movie);
    }
  }
  
  return uniqueMovies;
};

/**
 * Extract just the titles from a response, used as fallback
 * 
 * @param {string} text - The response text
 * @returns {Array<{title: string}>} - Array of movies with just titles
 */
export const extractTitlesOnly = (text) => {
  if (!text) return [];
  
  // Split by lines and look for bullet points or numbered items
  const lines = text.split('\n');
  const titles = [];
  
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Check for bullet points or numbered list items
    const listItemMatch = line.match(/^(?:[-•*]|\d+\.)\s+(.+)$/);
    
    if (listItemMatch) {
      // Extract title, remove any rating or year info in parentheses
      let title = listItemMatch[1].replace(/\([^)]+\)/g, '').trim();
      
      // Clean up: remove trailing dash or colon and description
      title = title.split(/[-:]/)[0].trim();
      
      if (title) titles.push({ title });
    }
  }
  
  return titles;
};
