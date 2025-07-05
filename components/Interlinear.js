import { useEffect, useRef } from 'react';

export default function Interlinear({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const headings = containerRef.current.querySelectorAll('h3');
      let verseCount = 1;
      headings.forEach(heading => {
        if (heading.textContent.match(/^Verso\s+\d+/i)) {
          heading.id = `verse-${verseCount}`;
          verseCount++;
        }
      });
    }
  }, [children]);

  return (
    <div className="prose prose-sm" ref={containerRef}>
      {children}
    </div>
  );
}
