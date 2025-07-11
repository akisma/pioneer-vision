import { Provider } from 'react-redux';
import { store } from './store';
import { useMIDI } from './hooks/useMIDI';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import MIDIMonitor from './components/MIDIMonitor';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';

const MIDIApp = () => {
  try {
    useMIDI(); // Initialize MIDI connection
    
    return (
      <div className="h-screen bg-gray-900 text-white font-mono flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ControlPanel />
          <MIDIMonitor />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in MIDIApp:', error);
    return (
      <div className="h-screen bg-gray-900 text-white font-mono flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">App Error</h1>
        <p className="text-red-400">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-orange-600 rounded"
        >
          Reload App
        </button>
      </div>
    );
  }
};

const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <MIDIApp />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;