import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Create array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Always show current page
    pages.push(currentPage);
    
    // Add pages before current page
    let before = currentPage - 1;
    while (before > 0 && pages.length < Math.floor(maxPagesToShow / 2)) {
      pages.unshift(before);
      before--;
    }
    
    // Add pages after current page
    let after = currentPage + 1;
    while (after <= totalPages && pages.length < maxPagesToShow) {
      pages.push(after);
      after++;
    }
    
    // If we have room, add more pages before
    before = pages[0] - 1;
    while (before > 0 && pages.length < maxPagesToShow) {
      pages.unshift(before);
      before--;
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center space-x-1">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-md bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        aria-label="Previous page"
      >
        <FaChevronLeft />
      </button>
      
      {/* First page if not in view */}
      {!pageNumbers.includes(1) && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 rounded-md hover:bg-gray-700 text-white transition-colors"
          >
            1
          </button>
          <span className="text-gray-500">...</span>
        </>
      )}
      
      {/* Page numbers */}
      {pageNumbers.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentPage === page
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-700 text-white'
          }`}
        >
          {page}
        </button>
      ))}
      
      {/* Last page if not in view */}
      {!pageNumbers.includes(totalPages) && totalPages > 1 && (
        <>
          <span className="text-gray-500">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 rounded-md hover:bg-gray-700 text-white transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}
      
      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-md bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        aria-label="Next page"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
