import React from 'react';

export default function Original({ children, activeVerse, setActiveVerse }) {
  const handleVerseClick = (verseNumber) => {
    setActiveVerse(verseNumber);
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
    <div className="prose prose-lg" style={{ whiteSpace: 'pre-wrap' }}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        const isSpeakerLine = /^[A-Z][a-z]+$/.test(trimmedLine) && !trimmedLine.includes(' ');

        if (trimmedLine && !isSpeakerLine) {
          verseCounter++;
          const currentVerse = verseCounter;
          const isActive = activeVerse === currentVerse;

          return (
            <div
              key={index}
              onClick={() => handleVerseClick(currentVerse)}
              style={{
                cursor: 'pointer',
                backgroundColor: isActive ? 'rgba(0, 100, 255, 0.05)' : 'transparent',
                display: 'flex',
              }}
            >
              <span
                style={{
                  width: '3em',
                  userSelect: 'none',
                  flexShrink: 0,
                  textAlign: 'right',
                  paddingRight: '1em',
                  color: '#9ca3af',
                  fontSize: '0.8rem',
                }}
              >
                {currentVerse}
              </span>
              <span>{line}</span>
            </div>
          );
        } else {
          return (
            <div key={index} style={{ display: 'flex' }}>
              <span style={{ width: '3em', flexShrink: 0 }}></span>
              <span style={{ fontWeight: 'bold' }}>{line}</span>
            </div>
          );
        }
      })}
    </div>
  );
}
