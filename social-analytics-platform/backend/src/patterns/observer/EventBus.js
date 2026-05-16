// patterns/observer/EventBus.js
// Observer Pattern: Publishers emit events; subscribers react
// SRP: Each subscriber has one concern
// OCP: Add new subscribers without changing the publisher

class EventBus {
  constructor() {
    this._subscribers = new Map();
    this._eventLog = [];
  }

  // Subscribe to an event
  subscribe(event, handler, subscriberName = 'anonymous') {
    if (!this._subscribers.has(event)) {
      this._subscribers.set(event, []);
    }
    this._subscribers.get(event).push({ handler, subscriberName });
    console.log(`[Observer] ${subscriberName} subscribed to "${event}"`);
    return () => this.unsubscribe(event, handler); // return unsubscribe fn
  }

  // Unsubscribe
  unsubscribe(event, handler) {
    if (!this._subscribers.has(event)) return;
    const filtered = this._subscribers.get(event).filter(s => s.handler !== handler);
    this._subscribers.set(event, filtered);
  }

  // Emit event
  emit(event, payload) {
    const logEntry = { event, payload, timestamp: new Date().toISOString() };
    this._eventLog.push(logEntry);

    const subscribers = this._subscribers.get(event) || [];
    console.log(`[Observer] Emitting "${event}" to ${subscribers.length} subscriber(s)`);

    subscribers.forEach(({ handler, subscriberName }) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[Observer] Error in ${subscriberName}:`, err.message);
      }
    });

    return subscribers.length;
  }

  getEventLog(limit = 50) {
    return this._eventLog.slice(-limit);
  }

  getSubscriberCount(event) {
    return (this._subscribers.get(event) || []).length;
  }
}

// Global EventBus singleton
const eventBus = new EventBus();

// ── Subscribers ────────────────────────────────────────────────────

// Subscriber 1: Audit Logger
eventBus.subscribe('post:created', ({ post, userId }) => {
  console.log(`[Audit] Post created by user ${userId}: ${post.id} on ${post.platform}`);
}, 'AuditLogger');

eventBus.subscribe('post:deleted', ({ postId, userId }) => {
  console.log(`[Audit] Post ${postId} deleted by user ${userId}`);
}, 'AuditLogger');

eventBus.subscribe('post:published', ({ post, userId }) => {
  console.log(`[Audit] Post ${post.id} published by user ${userId}`);
}, 'AuditLogger');

eventBus.subscribe('user:login', ({ email }) => {
  console.log(`[Audit] User login: ${email}`);
}, 'AuditLogger');

// Subscriber 2: Analytics Tracker (uses HOF: higher-order function pipeline)
const createMetricsTracker = () => {
  const metrics = { postsCreated: 0, postsDeleted: 0, postsPublished: 0, logins: 0 };

  eventBus.subscribe('post:created', () => { metrics.postsCreated++; }, 'MetricsTracker');
  eventBus.subscribe('post:deleted', () => { metrics.postsDeleted++; }, 'MetricsTracker');
  eventBus.subscribe('post:published', () => { metrics.postsPublished++; }, 'MetricsTracker');
  eventBus.subscribe('user:login', () => { metrics.logins++; }, 'MetricsTracker');

  return { getMetrics: () => ({ ...metrics }) };
};

const metricsTracker = createMetricsTracker();

// Subscriber 3: Notification System
eventBus.subscribe('post:published', ({ post }) => {
  console.log(`[Notification] 🎉 Post published on ${post.platform}! Monitoring engagement...`);
}, 'NotificationSystem');

eventBus.subscribe('analytics:generated', ({ userId, platform }) => {
  console.log(`[Notification] 📊 Analytics report ready for user ${userId} (${platform || 'all platforms'})`);
}, 'NotificationSystem');

// Export
module.exports = { eventBus, metricsTracker };
