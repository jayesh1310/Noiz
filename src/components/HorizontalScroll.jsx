import { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const HorizontalScroll = ({ title, children }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="horizontal-scroll-section">
      <div className="scroll-header">
        <h2 className="scroll-title">{title}</h2>
        <div className="scroll-arrows">
          <button
            className="scroll-arrow-btn"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>
          <button
            className="scroll-arrow-btn"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      <div className="scroll-container" ref={scrollRef}>
        {children}
      </div>
    </div>
  );
};

export default HorizontalScroll;
