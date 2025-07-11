// Performance monitoring and throttling utility
class PerformanceMonitor {
  constructor() {
    this.messageCount = 0;
    this.lastReset = Date.now();
    this.frameDrops = 0;
    this.lastFrameTime = performance.now();
    this.isThrottled = false;
    this.resetInterval = 1000; // Reset counters every second
    this.maxMessagesPerSecond = 100; // Throttle after 100 messages/sec
    this.minFrameTime = 16.67; // 60fps = ~16.67ms per frame
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    // Monitor frame rate
    const checkFrameRate = () => {
      const now = performance.now();
      const frameTime = now - this.lastFrameTime;
      
      if (frameTime > this.minFrameTime * 2) {
        this.frameDrops++;
      }
      
      this.lastFrameTime = now;
      requestAnimationFrame(checkFrameRate);
    };
    
    requestAnimationFrame(checkFrameRate);
    
    // Reset counters periodically
    setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastReset;
      
      if (elapsed >= this.resetInterval) {
        // Check if we should throttle
        const messagesPerSecond = (this.messageCount / elapsed) * 1000;
        const frameDropsPerSecond = (this.frameDrops / elapsed) * 1000;
        
        this.isThrottled = messagesPerSecond > this.maxMessagesPerSecond || frameDropsPerSecond > 10;
        
        if (this.isThrottled) {
          console.warn(`Performance issue detected: ${messagesPerSecond.toFixed(1)} msg/s, ${frameDropsPerSecond.toFixed(1)} frame drops/s`);
        }
        
        // Reset counters
        this.messageCount = 0;
        this.frameDrops = 0;
        this.lastReset = now;
      }
    }, this.resetInterval);
  }
  
  recordMessage() {
    this.messageCount++;
  }
  
  shouldThrottle() {
    return this.isThrottled;
  }
  
  getStats() {
    const now = Date.now();
    const elapsed = now - this.lastReset;
    const messagesPerSecond = elapsed > 0 ? (this.messageCount / elapsed) * 1000 : 0;
    const frameDropsPerSecond = elapsed > 0 ? (this.frameDrops / elapsed) * 1000 : 0;
    
    return {
      messagesPerSecond: messagesPerSecond.toFixed(1),
      frameDropsPerSecond: frameDropsPerSecond.toFixed(1),
      isThrottled: this.isThrottled
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
