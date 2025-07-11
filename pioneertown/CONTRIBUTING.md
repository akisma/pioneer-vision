# Contributing to PioneerTown

Thank you for your interest in contributing to PioneerTown! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- A MIDI controller for testing (recommended)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/pioneertown.git
   cd pioneertown
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm run lint
   npm run build  # Verify build works
   ```

## 🎯 Development Guidelines

### **Code Style**
- Use ES6+ features and modern JavaScript
- Follow React Hooks patterns (no class components)
- Use Redux Toolkit for state management
- Follow existing naming conventions
- Add proper error handling and null checks

### **Performance Considerations**
- Always consider MIDI data frequency and volume
- Use throttling and debouncing for high-frequency operations
- Implement proper cleanup in useEffect hooks
- Avoid unnecessary re-renders with React.memo and useMemo

### **MIDI Development**
- Test with real MIDI hardware when possible
- Handle edge cases like device disconnection
- Implement proper error recovery
- Consider different MIDI message types and channels

### **File Organization**
```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── store/         # Redux store and slices
├── utils/         # Utility functions
└── styles/        # Global styles
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Browser version and type
   - Operating system
   - MIDI device details
   - App version

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Console Output**
   - Browser console errors
   - Performance warnings
   - MIDI-related messages

## 💡 Feature Requests

Before submitting a feature request:

1. Check existing issues and pull requests
2. Consider the scope and complexity
3. Think about MIDI compatibility
4. Consider performance implications

Include in your request:
- Clear description of the feature
- Use cases and benefits
- Mockups or examples if applicable
- Technical considerations

## 🔧 Pull Request Process

### **Before Submitting**
1. Ensure your code follows the style guidelines
2. Add error handling for all MIDI operations
3. Test with various MIDI devices if possible
4. Update documentation if needed
5. Verify the build process works

### **Pull Request Checklist**
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm run lint`, `npm run build`)
- [ ] Changes are documented in comments
- [ ] Performance impact considered
- [ ] Error handling implemented
- [ ] MIDI compatibility tested

### **Review Process**
1. Automated checks must pass
2. Code review by maintainers
3. Testing with MIDI hardware
4. Performance evaluation
5. Documentation review

## 🎵 MIDI Development Tips

### **Testing Without Hardware**
- Use virtual MIDI devices (like LoopMIDI)
- Browser developer tools for Web MIDI API
- MIDI file playback tools
- Software synthesizers

### **Common MIDI Patterns**
- Always handle device connection/disconnection
- Implement proper message throttling
- Support multiple MIDI channels
- Handle different message types gracefully
- Consider high-resolution controllers (14-bit)

### **Performance Best Practices**
- Batch MIDI message processing
- Use requestIdleCallback for non-critical operations
- Limit message history and display
- Implement adaptive throttling
- Monitor memory usage

## 📚 Resources

### **MIDI References**
- [Web MIDI API Specification](https://www.w3.org/TR/webmidi/)
- [MIDI 1.0 Specification](https://www.midi.org/specifications-old/item/table-1-summary-of-midi-message)
- [MDN Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)

### **React/Redux Resources**
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Community

### **Communication**
- Be respectful and constructive
- Help others when possible
- Share knowledge and best practices
- Report issues clearly and thoroughly

### **Code of Conduct**
- Be inclusive and welcoming
- Respect different perspectives and experiences
- Focus on what's best for the community
- Show empathy towards others

## 📝 License

By contributing to PioneerTown, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to PioneerTown! 🎛️🎵
