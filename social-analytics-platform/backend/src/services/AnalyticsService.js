// services/AnalyticsService.js
// SRP: Analytics computation only
// LSP: Substitutable - can swap real DB without changing this service

const postRepository = require('../repositories/PostRepository');
const Analytics = require('../models/Analytics');
const { eventBus, metricsTracker } = require('../patterns/observer/EventBus');
const { buildAnalyticsPipeline, groupByPlatform, filterByDateRange, pipe } = require('../utils/processingPipeline');

class AnalyticsService {
  getOverview(userId) {
    const posts = userId
      ? postRepository.findByUserId(userId)
      : postRepository.findAll();

    const platforms = ['twitter', 'instagram', 'facebook', 'linkedin'];

    // Use HOF pipeline for each platform
    const byPlatform = platforms.reduce((acc, platform) => {
      const pipeline = buildAnalyticsPipeline(platform);
      acc[platform] = pipeline(posts);
      return acc;
    }, {});

    const allPublished = posts.filter(p => p.status === 'published');
    const overall = buildAnalyticsPipeline(null)(posts);

    eventBus.emit('analytics:generated', { userId, platform: 'all' });

    return {
      overall,
      byPlatform,
      postStats: postRepository.getStats(),
      systemMetrics: metricsTracker.getMetrics()
    };
  }

  getPlatformAnalytics(userId, platform, period = 'month') {
    let posts = userId
      ? postRepository.findByUserAndPlatform(userId, platform)
      : postRepository.findByPlatform(platform);

    // Date range based on period
    const now = new Date();
    const periodMap = {
      day: new Date(now - 24 * 60 * 60 * 1000),
      week: new Date(now - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now - 30 * 24 * 60 * 60 * 1000)
    };
    const from = periodMap[period];

    // HOF pipeline with date filtering
    const pipeline = pipe(
      filterByDateRange(from?.toISOString(), null),
      (filtered) => Analytics.fromPosts(filtered, { userId, platform, period })
    );

    const analytics = pipeline(posts);
    eventBus.emit('analytics:generated', { userId, platform, period });
    return analytics.toJSON();
  }

  getTopPosts(userId, limit = 5) {
    const posts = userId
      ? postRepository.findByUserId(userId)
      : postRepository.findAll();

    return posts
      .filter(p => p.status === 'published')
      .sort((a, b) => parseFloat(b.computeEngagement()) - parseFloat(a.computeEngagement()))
      .slice(0, limit)
      .map(p => p.toJSON());
  }

  getEngagementTrend(userId, platform) {
    let posts = userId
      ? postRepository.findByUserAndPlatform(userId, platform)
      : platform ? postRepository.findByPlatform(platform) : postRepository.findAll();

    posts = posts
      .filter(p => p.status === 'published' && p.publishedAt)
      .sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

    return posts.map(p => ({
      date: p.publishedAt,
      platform: p.platform,
      engagement: parseFloat(p.computeEngagement()),
      likes: p.likes,
      shares: p.shares,
      comments: p.comments,
      reach: p.reach
    }));
  }

  getEventLog() {
    return eventBus.getEventLog(100);
  }
}

module.exports = new AnalyticsService();
