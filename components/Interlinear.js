import { useEffect, useRef } from 'react';

export default function Interlinear({ children, activeVerse }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const headings = containerRef.current.querySelectorAll('h3');
      let verseCount = 1;
      headings.forEach(heading => {
        if (heading.textContent.match(/^Verso\s+\d+/i)) {
          const verseNumber = verseCount;
          heading.id = `verse-${verseNumber}`;
          
          const parentWrapper = heading.parentElement;
          if (activeVerse === verseNumber) {
            parentWrapper.style.backgroundColor = 'rgba(0, 100, 255, 0.05)';
          } else {
            parentWrapper.style.backgroundColor = 'transparent';
          }
          verseCount++;
        }
      });
    }
  }, [children, activeVerse]);

  return (
    <div className="prose prose-sm" ref={containerRef}>
      {children}
    </div>
  );
}
