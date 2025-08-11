# 🎛️ PioneerTown - MIDI Controller Interface

A modern, web-based MIDI controller interface built with React, Redux, and the Web MIDI API. PioneerTown provides real-time MIDI control with a responsive, crash-resistant architecture optimized for high-frequency MIDI data.

![MIDI Controller Interface](https://img.shields.io/badge/MIDI-Controller-orange) ![React](https://img.shields.io/badge/React-19.1.0-blue) ![Redux](https://img.shields.io/badge/Redux-Toolkit-purple) ![Vite](https://img.shields.io/badge/Vite-7.0.2-green)

## ✨ Features

### 🎚️ **MIDI Controls**
- **Vertical Sliders**: L Volume, R Volume with real-time value display
- **Horizontal Crossfader**: X-Fader with smooth operation
- **FX Buttons**: FX1, FX2 with press/release states
- **MIDI Learning**: Click-to-learn mapping for any MIDI controller
- **Channel Support**: Full 16-channel MIDI support

### 📊 **MIDI Monitor**
- **Real-time Message Display**: Live MIDI message logging with timestamps
- **Message Types**: Support for CC, Note On/Off, Pitch Bend, and more
- **Performance Optimized**: Limited display (20 messages) for smooth operation
- **Auto-scroll**: Automatic scrolling to latest messages

### 🛡️ **Crash Prevention**
- **Performance Monitoring**: Real-time FPS and message rate tracking
- **Adaptive Throttling**: Automatic performance adjustment under load
- **Error Boundaries**: Graceful error recovery with state reset
- **Memory Management**: Efficient message queuing and cleanup

### 🎨 **Modern UI**
- **Responsive Design**: Clean, modern interface built with Tailwind CSS
- **Real-time Updates**: Instant visual feedback for all controls
- **Dark Theme**: Professional dark interface with orange accents
- **Touch Friendly**: Optimized for both mouse and touch interactions

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **MIDI Controller** (optional for testing)
- **Modern Browser** with Web MIDI API support (Chrome, Edge, Opera)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pioneertown

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

### 🐳 Docker Deployment

PioneerTown includes comprehensive Docker support for production deployment:

```bash
# Build and run with cache busting
./build.sh --cache-bust

# Run the container
docker run -d -p 8080:8080 --name pioneertown-app pioneertown:latest

# Or use docker-compose
docker-compose up -d
```

**Build Options:**
- `./build.sh --cache-bust`: Fast iterative builds with selective cache invalidation
- `./build.sh --no-cache`: Complete rebuild for configuration changes
- `./build.sh --clean`: Clean build environment and rebuild

See [DOCKER.md](DOCKER.md) for detailed Docker setup and deployment guide.

## 🎛️ Using the Interface

### 1. **MIDI Device Connection**
- Connect your MIDI controller to your computer
- Open the app in a supported browser
- Grant MIDI access when prompted
- Your device should auto-connect and appear in the interface

### 2. **MIDI Learning**
- Click the "Learn" button on any control
- Move the corresponding control on your MIDI device
- The mapping will be automatically created
- The control will now respond to your MIDI input

### 3. **Manual Mapping**
- Use the mapping controls to manually assign CC numbers
- Set specific MIDI channels for each control
- Choose between CC and Note message types

### 4. **Monitoring MIDI**
- View real-time MIDI messages in the monitor panel
- See message types, values, and timestamps
- Use for debugging and understanding your controller's output

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React 19.1.0 with Hooks
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS with custom components
- **Build Tool**: Vite 7.0.2
- **MIDI**: Web MIDI API with custom hooks
- **Icons**: Lucide React
- **Deployment**: Docker with multi-stage builds and Nginx

### **Key Components**

```
src/
├── components/           # React components
│   ├── ControlPanel.jsx  # Main control interface
│   ├── MIDIMonitor.jsx   # MIDI message display
│   ├── VerticalSlider.jsx # Slider controls
│   ├── HorizontalSlider.jsx
│   ├── FXButton.jsx      # Button controls
│   └── Header.jsx        # App header
├── hooks/               # Custom React hooks
│   └── useMIDI.js       # MIDI connection & handling
├── store/               # Redux store
│   ├── index.js         # Store configuration
│   └── slices/
│       └── midiSlice.js # MIDI state management
├── utils/               # Utility functions
│   └── PerformanceMonitor.js # Performance tracking
└── styles/              # Global styles
    └── globals.css
```

### **State Management**

The app uses Redux Toolkit for predictable state management:

```javascript
// MIDI State Structure
{
  midiAccess: null,           // Web MIDI API access
  midiInputs: [],             // Available MIDI devices
  selectedInput: null,        // Currently connected device
  isConnected: false,         // Connection status
  midiMessages: [],           // Message history (limited)
  sliders: {},                // Slider states
  buttons: {},                // Button states
  mappings: {},               // MIDI mappings
  learningState: {},          // Learning mode state
  calibrationData: {}         // Calibration settings
}
```

## 🔧 Configuration

### **Performance Tuning**

The app includes several performance controls in `src/hooks/useMIDI.js`:

```javascript
const THROTTLE_DELAY = 100;      // Control update rate (ms)
const MESSAGE_THROTTLE = 200;    // Message logging rate (ms)
const MAX_QUEUE_SIZE = 10;       // Maximum queued messages
```

### **MIDI Settings**

Customize MIDI behavior in `src/store/slices/midiSlice.js`:

```javascript
const MESSAGE_LIMIT = 25;        // Max stored messages
const DISPLAY_LIMIT = 20;        // Max displayed messages
```

## 🐛 Troubleshooting

### **MIDI Device Not Connecting**
- Ensure your browser supports Web MIDI API
- Check that your MIDI device is properly connected
- Try refreshing the page and granting MIDI permissions again
- Check browser console for MIDI-related errors

### **Performance Issues**
- The app automatically throttles under heavy MIDI load
- Check the browser console for performance warnings
- Consider reducing message display limits for older devices
- Ensure no other MIDI applications are interfering

### **App Crashes**
- The app includes comprehensive crash prevention
- Error boundaries will catch and display any issues
- Use the "Reset Interface" button to recover from errors
- Check browser console for detailed error information

## 📚 MIDI Message Support

### **Supported Message Types**
- **Control Change (CC)**: Standard 7-bit controllers
- **Note On/Off**: For button and trigger controls
- **Program Change**: Program selection
- **Pitch Bend**: Pitch wheel controls
- **Channel Pressure**: Aftertouch
- **Poly Aftertouch**: Per-note aftertouch

> **Note**: High Resolution CC (HRCC) support has been removed in v0.2.0 to simplify the interface and improve performance. Standard 7-bit CC messages provide sufficient resolution for most MIDI controllers.

### **MIDI Channels**
- Full 16-channel support (channels 1-16)
- Per-control channel assignment
- Channel-specific learning and mapping

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build test
npm run build

# Test Docker build
./build.sh --cache-bust
```

### **Manual Testing**
1. Start the development server (`npm run dev`) or Docker container
2. Connect a MIDI controller
3. Test all controls with MIDI learning
4. Verify real-time response and monitoring
5. Test performance with rapid controller movement

### **Docker Testing**
1. Build the Docker image: `./build.sh --cache-bust`
2. Run the container: `docker run -d -p 8080:8080 --name pioneertown-test pioneertown:latest`
3. Access the app at `http://localhost:8080`
4. Test all functionality in the containerized environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow the existing code style and patterns
- Add error handling for all MIDI operations
- Test performance with high-frequency MIDI data
- Update documentation for new features
- Ensure mobile/touch compatibility
- Test Docker builds with cache busting for deployment changes
- Use `./build.sh --cache-bust` for iterative Docker development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Web MIDI API** for enabling browser-based MIDI communication
- **Redux Toolkit** for excellent state management
- **Tailwind CSS** for rapid UI development
- **Vite** for fast development and building
- **Lucide React** for beautiful icons
- **Docker** for containerized deployment and development consistency

## 📞 Support

If you encounter issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the browser console for error messages
3. Ensure your MIDI device is compatible with Web MIDI API
4. Test with the latest version of Chrome, Edge, or Opera

---

**Built with ❤️ for the MIDI community**
