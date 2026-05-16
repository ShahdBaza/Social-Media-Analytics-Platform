// models/Post.js
// SRP: Responsible ONLY for post/analytics data structure
const { v4: uuidv4 } = require('uuid');

class Post {
  constructor({ id, userId, platform, content, likes = 0, shares = 0, comments = 0,
    reach = 0, impressions = 0, engagementRate = 0, scheduledAt, publishedAt,
    status = 'draft', tags = [], createdAt, updatedAt }) {
    this.id = id || uuidv4();
    this.userId = userId;
    this.platform = platform; // 'twitter' | 'instagram' | 'facebook' | 'linkedin'
    this.content = content;
    this.likes = likes;
    this.shares = shares;
    this.comments = comments;
    this.reach = reach;
    this.impressions = impressions;
    this.engagementRate = engagementRate;
    this.scheduledAt = scheduledAt || null;
    this.publishedAt = publishedAt || null;
    this.status = status; // 'draft' | 'scheduled' | 'published' | 'archived'
    this.tags = tags;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
    this._metadata = {};
  }

  // Runtime attribute injection
  injectMetadata(key, value) {
    this._metadata[key] = value;
    return this;
  }

  computeEngagement() {
    if (this.reach === 0) return 0;
    return (((this.likes + this.shares + this.comments) / this.reach) * 100).toFixed(2);
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      platform: this.platform,
      content: this.content,
      likes: this.likes,
      shares: this.shares,
      comments: this.comments,
      reach: this.reach,
      impressions: this.impressions,
      engagementRate: this.computeEngagement(),
      scheduledAt: this.scheduledAt,
      publishedAt: this.publishedAt,
      status: this.status,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this._metadata
    };
  }

  static validate({ platform, content }) {
    const errors = [];
    const validPlatforms = ['twitter', 'instagram', 'facebook', 'linkedin'];
    if (!platform || !validPlatforms.includes(platform)) {
      errors.push(`Platform must be one of: ${validPlatforms.join(', ')}`);
    }
    if (!content || content.trim().length === 0) errors.push('Content is required');
    if (platform === 'twitter' && content && content.length > 280) {
      errors.push('Twitter posts cannot exceed 280 characters');
    }
    return errors;
  }
}

module.exports = Post;
