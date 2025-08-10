/**
 * MIDI Message Queue Manager
 * 
 * Handles receiving, storing, and managing MIDI messages completely
 * decoupled from UI rendering. Maintains latest state per control
 * and provides efficient access patterns.
 */

class MIDIMessageQueue {
  constructor() {
    // Latest message per unique control (channel + type + data1)
    this.latestMessages = new Map();
    
    // Recent activity log (chronological, limited size)
    this.recentActivity = [];
    this.maxRecentActivity = 50;
    
    // Performance tracking
    this.messageCount = 0;
    this.lastStatsReset = Date.now();
    
    // Subscribers for change notifications
    this.subscribers = new Set();
    
    // Message processing stats
    this.stats = {
      messagesPerSecond: 0,
      totalProcessed: 0,
      duplicatesFiltered: 0,
      lastUpdate: Date.now()
    };
    
    this.startStatsMonitoring();
  }
  
  /**
   * Add a MIDI message to the queue
   * @param {Object} message - Raw MIDI message object
   */
  addMessage(message) {
    const timestamp = performance.now();
    this.messageCount++;
    this.stats.totalProcessed++;
    
    // Create standardized message object
    const standardizedMessage = this.standardizeMessage(message, timestamp);
    
    // Generate unique key for this control
    const controlKey = this.generateControlKey(standardizedMessage);
    
    // Check if this is a duplicate value
    const existing = this.latestMessages.get(controlKey);
    if (existing && existing.value === standardizedMessage.value) {
      this.stats.duplicatesFiltered++;
      return; // Skip duplicate values
    }
    
    // Store as latest for this control
    this.latestMessages.set(controlKey, standardizedMessage);
    
    // Add to recent activity (chronological)
    this.recentActivity.unshift(standardizedMessage);
    if (this.recentActivity.length > this.maxRecentActivity) {
      this.recentActivity = this.recentActivity.slice(0, this.maxRecentActivity);
    }
    
    // Notify subscribers (throttled)
    this.notifySubscribers();
  }
  
  /**
   * Generate unique control key
   */
  generateControlKey(message) {
    const { messageType, channel, data1 } = message;
    return `${messageType}-ch${channel}-${data1}`;
  }
  
  /**
   * Standardize message format
   */
  standardizeMessage(rawMessage, timestamp) {
    const { status, data1, data2 = 0, channel, messageType } = rawMessage;
    
    return {
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      messageType,
      channel,
      status,
      data1, // CC number or note number
      data2, // Value or velocity
      value: data2, // Normalized field for consistent access
      raw: rawMessage.raw || [status, data1, data2]
    };
  }
  
  /**
   * Get latest message for specific control
   */
  getLatestMessage(messageType, channel, data1) {
    const key = `${messageType}-ch${channel}-${data1}`;
    return this.latestMessages.get(key) || null;
  }
  
  /**
   * Get all latest messages as array
   */
  getAllLatestMessages() {
    return Array.from(this.latestMessages.values());
  }
  
  /**
   * Get recent activity
   */
  getRecentActivity(limit = this.maxRecentActivity) {
    return this.recentActivity.slice(0, limit);
  }
  
  /**
   * Get messages by type
   */
  getMessagesByType(messageType) {
    return Array.from(this.latestMessages.values())
      .filter(msg => msg.messageType === messageType);
  }
  
  /**
   * Get messages by channel
   */
  getMessagesByChannel(channel) {
    return Array.from(this.latestMessages.values())
      .filter(msg => msg.channel === channel);
  }
  
  /**
   * Clear all messages
   */
  clear() {
    this.latestMessages.clear();
    this.recentActivity = [];
    this.stats.totalProcessed = 0;
    this.stats.duplicatesFiltered = 0;
    this.notifySubscribers();
  }
  
  /**
   * Subscribe to message updates
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  /**
   * Notify subscribers (throttled)
   */
  notifySubscribers() {
    if (!this.notifyThrottled) {
      this.notifyThrottled = true;
      
      requestAnimationFrame(() => {
        this.subscribers.forEach(callback => {
          try {
            callback({
              latestMessages: this.getAllLatestMessages(),
              recentActivity: this.getRecentActivity(),
              stats: this.getStats()
            });
          } catch (error) {
            console.error('Error in MIDI message subscriber:', error);
          }
        });
        this.notifyThrottled = false;
      });
    }
  }
  
  /**
   * Get performance stats
   */
  getStats() {
    return {
      ...this.stats,
      totalLatestMessages: this.latestMessages.size,
      recentActivityCount: this.recentActivity.length
    };
  }
  
  /**
   * Start stats monitoring
   */
  startStatsMonitoring() {
    setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastStatsReset;
      
      if (elapsed >= 1000) {
        this.stats.messagesPerSecond = (this.messageCount / elapsed) * 1000;
        this.stats.lastUpdate = now;
        this.messageCount = 0;
        this.lastStatsReset = now;
      }
    }, 1000);
  }
}

// Global singleton instance
export const midiMessageQueue = new MIDIMessageQueue();

// Export the class for testing
export { MIDIMessageQueue };