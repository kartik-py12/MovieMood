import React from 'react';

/**
 * Component for rendering formatted content with styling for movie recommendations
 */
const MarkdownFormatter = ({ content }) => {
  // Process the content to convert markdown-style formatting to HTML
  const processContent = () => {
    if (!content) return '';
    
    // Handle different formatting cases
    let processed = content
      // Convert ** bold text ** to HTML
      .replace(/\*\*([^*]+)\*\*/g, '<span class="text-yellow-300 font-bold">$1</span>')
      // Convert * italic text * to HTML (single asterisks)
      .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')
      // Handle bullet points
      .replace(/^\s*\*\s+(.+)$/gm, '<li>$1</li>')
      // Handle newlines
      .split('\n').map(line => {
        // Skip lines that are already wrapped in HTML tags
        if (line.trim().startsWith('<') && line.trim().endsWith('>')) {
          return line;
        }
        // Wrap other non-empty lines in paragraph tags
        if (line.trim()) {
          return `<p>${line}</p>`;
        }
        return '';
      }).join('');
    
    // Wrap lists in ul tags
    processed = processed.replace(/<li>(.+?)<\/li>(\s*<li>.+?<\/li>)*/g, '<ul class="list-disc pl-5 my-2">$&</ul>');
    
    return processed;
  };

  // Split response into sections based on heading pattern
  const splitIntoSections = () => {
    if (!content) return [{ title: '', content: '' }];

    // Extract sections with headings if they exist
    const sectionPattern = /\*\*([^*:]+)(:|\*\*)/g;
    let match;
    const sections = [];
    let lastIndex = 0;
    let hasHeadings = false;
    
    // Find all heading-like sections
    while ((match = sectionPattern.exec(content)) !== null) {
      hasHeadings = true;
      
      // If this isn't the first match, add the previous section
      if (lastIndex > 0) {
        const sectionContent = content.substring(lastIndex, match.index);
        if (sectionContent.trim()) {
          sections.push({
            content: sectionContent
          });
        }
      } else if (match.index > 0) {
        // Add content before the first heading
        const intro = content.substring(0, match.index);
        if (intro.trim()) {
          sections.push({
            content: intro
          });
        }
      }
      
      lastIndex = match.index;
    }
    
    // Add the last section or the entire content if no headings
    if (hasHeadings && lastIndex < content.length) {
      sections.push({
        content: content.substring(lastIndex)
      });
    } else if (!hasHeadings) {
      sections.push({
        content: content
      });
    }
    
    return sections;
  };

  // Get sections from the content
  const sections = splitIntoSections();

  return (
    <div className="markdown-content text-white">
      {sections.map((section, index) => (
        <div key={index} className="mb-3">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: processContent(section.content) }}
          />
        </div>
      ))}
    </div>
  );
};

export default MarkdownFormatter;
