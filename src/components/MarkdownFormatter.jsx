import React, { useEffect, useState } from 'react';

/**
 * Component for rendering formatted content with styling for movie recommendations
 */
export const MarkdownFormatter = ({ content }) => {
  const [formattedContent, setFormattedContent] = useState('');
  
  useEffect(() => {
    // Process the content when it changes
    if (content) {
      setFormattedContent(processContent(content));
    }
  }, [content]);

  // Process the content to convert markdown-style formatting to HTML
  const processContent = (text) => {
    if (!text) return '';
    
    // Handle different formatting cases
    let processed = text
      // Convert ** bold text ** to HTML with class for styling
      .replace(/\*\*([^*]+)\*\*/g, '<span class="text-yellow-300 font-bold">$1</span>')
      // Convert * italic text * to HTML
      .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')
      // Handle numbered lists (1. Item, 2. Item)
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Handle bullet points (* Item, - Item)
      .replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');

    // Wrap lists in appropriate tags
    // First find all sequences of <li> tags
    const listPattern = /(<li>.*?<\/li>[\s\n]*)+/gs;
    processed = processed.replace(listPattern, (match) => {
      // If the list starts with a number, it's an ordered list
      if (/^\d+\./.test(match)) {
        return `<ol class="list-decimal pl-5 my-2">${match}</ol>`;
      }
      return `<ul class="list-disc pl-5 my-2">${match}</ul>`;
    });

    // Handle paragraphs (split by newlines and wrap non-tag lines)
    const lines = processed.split('\n');
    processed = lines.map(line => {
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
    
    return processed;
  };

  // Render the processed HTML
  return (
    <div className="markdown-content">
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    </div>
  );
};

export default MarkdownFormatter;
