import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('Starting SignBot app...');

try {
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
    console.log('Render successful');
} catch (error) {
    console.error('React render error:', error);
    document.getElementById('root').innerHTML = `<div class="text-red-500 text-center p-4">Error loading SignBot: ${error.message}. Check console for details.</div>`;
}
