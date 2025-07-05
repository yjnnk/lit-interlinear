import React from 'react';

export default function Original({ children }) {
  const handleVerseClick = (verseNumber) => {
    const element = document.getElementById(`verse-${verseNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (typeof children !== 'string') {
    return <pre className="prose prose-lg whitespace-pre-wrap">{children}</pre>;
  }

  let verseCounter = 0;
  const lines = children.split('\n');

  return (
    <pre className="prose prose-lg whitespace-pre-wrap">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        const isSpeakerLine = /^[A-Z][a-z]+$/.test(trimmedLine) && !trimmedLine.includes(' ');

        if (trimmedLine && !isSpeakerLine) {
          verseCounter++;
          const currentVerse = verseCounter;
          return (
            <span key={index} onClick={() => handleVerseClick(currentVerse)} style={{ cursor: 'pointer' }} className="block hover:text-blue-600">
              {line + '\n'}
            </span>
          );
        } else {
          return line + '\n';
        }
      })}
    </pre>
  );
}
