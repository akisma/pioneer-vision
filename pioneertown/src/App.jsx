import { MIDIProvider } from './context/MIDIContext';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import MIDIMonitor from './components/MIDIMonitor';
import './styles/globals.css';

const App = () => {
  return (
    <MIDIProvider>
      <div className="h-screen bg-gray-900 text-white font-mono flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col min-h-0">
          <ControlPanel />
          <MIDIMonitor />
        </div>
      </div>
    </MIDIProvider>
  );
};

export default App;