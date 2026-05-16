// models/Analytics.js
// SRP: Responsible ONLY for analytics aggregation data structure
const { v4: uuidv4 } = require('uuid');

class Analytics {
  constructor({ id, userId, platform, period, totalPosts = 0, totalLikes = 0,
    totalShares = 0, totalComments = 0, totalReach = 0, totalImpressions = 0,
    avgEngagementRate = 0, topPost = null, generatedAt }) {
    this.id = id || uuidv4();
    this.userId = userId;
    this.platform = platform; // null = all platforms
    this.period = period; // 'day' | 'week' | 'month'
    this.totalPosts = totalPosts;
    this.totalLikes = totalLikes;
    this.totalShares = totalShares;
    this.totalComments = totalComments;
    this.totalReach = totalReach;
    this.totalImpressions = totalImpressions;
    this.avgEngagementRate = avgEngagementRate;
    this.topPost = topPost;
    this.generatedAt = generatedAt || new Date().toISOString();
  }

  static fromPosts(posts, { userId, platform, period }) {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
    const totalShares = posts.reduce((s, p) => s + p.shares, 0);
    const totalComments = posts.reduce((s, p) => s + p.comments, 0);
    const totalReach = posts.reduce((s, p) => s + p.reach, 0);
    const totalImpressions = posts.reduce((s, p) => s + p.impressions, 0);
    const avgEngagementRate = totalPosts > 0
      ? (posts.reduce((s, p) => s + parseFloat(p.computeEngagement()), 0) / totalPosts).toFixed(2)
      : 0;
    const topPost = posts.sort((a, b) =>
      parseFloat(b.computeEngagement()) - parseFloat(a.computeEngagement()))[0] || null;

    return new Analytics({
      userId, platform, period,
      totalPosts, totalLikes, totalShares, totalComments,
      totalReach, totalImpressions, avgEngagementRate,
      topPost: topPost ? topPost.toJSON() : null
    });
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      platform: this.platform,
      period: this.period,
      totalPosts: this.totalPosts,
      totalLikes: this.totalLikes,
      totalShares: this.totalShares,
      totalComments: this.totalComments,
      totalReach: this.totalReach,
      totalImpressions: this.totalImpressions,
      avgEngagementRate: this.avgEngagementRate,
      topPost: this.topPost,
      generatedAt: this.generatedAt
    };
  }
}

module.exports = Analytics;
