import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import MIDIMonitor from './components/MIDIMonitor';
import './styles/globals.css';

// Main App component that provides Redux store
function App() {
  return (
    <Provider store={store}>
      <div className="h-screen bg-gray-900 text-white font-mono flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ControlPanel />
          <MIDIMonitor />
        </div>
      </div>
    </Provider>
  );
}

export default App;