import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 p-4">
      <div className="flex gap-4 mb-8">
        <a
          href="https://vite.dev"
          target="_blank"
          rel="noreferrer"
          className="hover:scale-110 transition-transform"
        >
          <img src={viteLogo} className="w-16 h-16" alt="Vite logo" />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
          rel="noreferrer"
          className="hover:scale-110 transition-transform"
        >
          <img src={reactLogo} className="w-16 h-16 animate-spin-slow" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
        Vite + React + Tailwind CSS
      </h1>
      <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 text-center max-w-sm w-full">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-600">
          Edit{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">src/App.tsx</code> and
          save to test HMR
        </p>
      </div>
      <p className="mt-8 text-gray-500 text-sm">Click on the Vite and React logos to learn more</p>
    </div>
  );
}

export default App;
