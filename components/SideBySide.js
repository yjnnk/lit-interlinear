import React, { useState } from 'react';

export default function SideBySide({ children }) {
  const [activeVerse, setActiveVerse] = useState(null);
  const columns = React.Children.toArray(children);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="overflow-y-auto h-screen-minus-header pr-4">
          {React.cloneElement(columns[0], { activeVerse, setActiveVerse })}
        </div>
        <div className="overflow-y-auto h-screen-minus-header pr-4">
          {React.cloneElement(columns[1], { activeVerse })}
        </div>
      </div>
    </div>
  );
}


