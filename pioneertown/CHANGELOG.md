# Changelog

All notable changes to PioneerTown MIDI Controller will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-07-11

### Added
- Comprehensive crash prevention system with performance monitoring
- Adaptive throttling for high-frequency MIDI data
- Error boundaries with graceful recovery
- Memory management and message queue limits
- Real-time performance statistics and FPS monitoring
- Defensive state access patterns throughout the app
- Comprehensive README.md documentation

### Changed
- Moved FX buttons above sliders in the control panel
- Removed FX3 and FX4 buttons (now only FX1 and FX2)
- Simplified error handling architecture
- Reduced message display limits for better performance (25 stored, 20 displayed)
- Increased throttling delays for stability (100ms control updates, 200ms logging)

### Fixed
- Critical Redux slice syntax errors that caused app crashes
- Unsafe Redux state access patterns
- MIDI hook error handling and null checks
- App stability issues under high MIDI load
- Memory leaks from excessive message storage

### Technical Improvements
- Enhanced Redux state validation and type checking
- Improved MIDI message batch processing with requestIdleCallback
- Added circuit breaker patterns for cascade failure prevention
- Implemented virtual scrolling concept for message display
- Added comprehensive error logging and recovery mechanisms

## [0.1.0] - 2025-07-09

### Added
- Initial MIDI controller interface with React and Redux
- Real-time MIDI message handling and display
- MIDI learning functionality for automatic control mapping
- Support for CC, HRCC, Note On/Off, and other MIDI message types
- Responsive UI with Tailwind CSS styling
- Performance optimizations for MIDI data processing
- Independent scrolling for MIDI monitor window

### Features
- Vertical sliders for L/R volume control
- Horizontal crossfader (X-Fader)
- FX buttons (FX1, FX2, FX3, FX4) with press/release states
- Real-time MIDI message monitoring with timestamps
- Automatic MIDI device detection and connection
- 16-channel MIDI support
- Calibration and smoothing for MIDI controls

### Technical Foundation
- Redux Toolkit for state management
- Web MIDI API integration
- Custom React hooks for MIDI functionality
- Modular component architecture
- Error handling and logging systems
- Performance monitoring utilities
