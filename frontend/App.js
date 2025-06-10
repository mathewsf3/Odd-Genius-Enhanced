import React, { useState } from 'react';
import AIChatPanel from './components/AIChatPanel';

function App() {
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <div className="app">
      {/* ...existing code... */}
      <button 
        onClick={() => setShowAIChat(!showAIChat)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
      >
        AI
      </button>
      <div className={`fixed right-0 top-0 h-full w-96 bg-gray-900 shadow-2xl transform transition-transform duration-300 z-40 ${showAIChat ? 'translate-x-0' : 'translate-x-full'}`}>
        <AIChatPanel />
      </div>
      {/* ...existing code... */}
    </div>
  );
}

export default App;