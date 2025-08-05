import { Provider } from 'react-redux';
import { store } from './store';
import { useMIDI } from './hooks/useMIDI';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import MIDIMonitor from './components/MIDIMonitor';
import './styles/globals.css';

const MIDIApp = () => {
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
};

const App = () => {
  return (
    <Provider store={store}>
      <MIDIApp />
    </Provider>
  );
};

export default App;