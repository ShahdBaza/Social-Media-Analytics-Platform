// patterns/adapter/PlatformAdapter.js
// Adapter Pattern: Converts incompatible platform API formats to unified format
// OCP: New adapters added without changing existing code
// ISP: Each adapter implements only what's relevant to its platform

// Common interface all adapters must conform to
class IPlatformAdapter {
  normalize(rawData) { throw new Error('normalize() not implemented'); }
  denormalize(unifiedData) { throw new Error('denormalize() not implemented'); }
  getPlatformName() { throw new Error('getPlatformName() not implemented'); }
}

// Twitter Adapter: converts Twitter API v2 format
class TwitterAdapter extends IPlatformAdapter {
  getPlatformName() { return 'twitter'; }

  normalize(rawData) {
    // Twitter uses: public_metrics, non_public_metrics
    return {
      platform: 'twitter',
      content: rawData.text,
      likes: rawData.public_metrics?.like_count || 0,
      shares: rawData.public_metrics?.retweet_count || 0,
      comments: rawData.public_metrics?.reply_count || 0,
      reach: rawData.non_public_metrics?.impression_count || 0,
      impressions: rawData.non_public_metrics?.impression_count || 0,
      status: rawData.possibly_sensitive ? 'flagged' : 'published',
      publishedAt: rawData.created_at,
      externalId: rawData.id
    };
  }

  denormalize(unifiedData) {
    return {
      text: unifiedData.content,
      reply_settings: 'mentionedUsers'
    };
  }
}

// Instagram Adapter: converts Facebook Graph API format
class InstagramAdapter extends IPlatformAdapter {
  getPlatformName() { return 'instagram'; }

  normalize(rawData) {
    // Instagram uses: like_count, comments_count, insights
    return {
      platform: 'instagram',
      content: rawData.caption || '',
      likes: rawData.like_count || 0,
      shares: 0, // Instagram doesn't expose shares
      comments: rawData.comments_count || 0,
      reach: rawData.insights?.reach || 0,
      impressions: rawData.insights?.impressions || 0,
      status: rawData.is_published ? 'published' : 'draft',
      publishedAt: rawData.timestamp,
      externalId: rawData.id
    };
  }

  denormalize(unifiedData) {
    return {
      caption: unifiedData.content,
      media_type: 'IMAGE'
    };
  }
}

// LinkedIn Adapter: converts LinkedIn API format
class LinkedInAdapter extends IPlatformAdapter {
  getPlatformName() { return 'linkedin'; }

  normalize(rawData) {
    // LinkedIn uses: totalShareStatistics
    const stats = rawData.totalShareStatistics || {};
    return {
      platform: 'linkedin',
      content: rawData.specificContent?.['com.linkedin.ugc.ShareContent']
        ?.shareCommentary?.text || '',
      likes: stats.likeCount || 0,
      shares: stats.shareCount || 0,
      comments: stats.commentCount || 0,
      reach: stats.impressionCount || 0,
      impressions: stats.impressionCount || 0,
      status: rawData.lifecycleState === 'PUBLISHED' ? 'published' : 'draft',
      publishedAt: rawData.created?.time
        ? new Date(rawData.created.time).toISOString()
        : null,
      externalId: rawData.id
    };
  }

  denormalize(unifiedData) {
    return {
      author: 'urn:li:person:placeholder',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: unifiedData.content },
          shareMediaCategory: 'NONE'
        }
      }
    };
  }
}

// Facebook Adapter
class FacebookAdapter extends IPlatformAdapter {
  getPlatformName() { return 'facebook'; }

  normalize(rawData) {
    return {
      platform: 'facebook',
      content: rawData.message || rawData.story || '',
      likes: rawData.reactions?.summary?.total_count || 0,
      shares: rawData.shares?.count || 0,
      comments: rawData.comments?.summary?.total_count || 0,
      reach: rawData.insights?.data?.find(d => d.name === 'post_reach')?.values?.[0]?.value || 0,
      impressions: rawData.insights?.data?.find(d => d.name === 'post_impressions')?.values?.[0]?.value || 0,
      status: rawData.is_published ? 'published' : 'draft',
      publishedAt: rawData.created_time,
      externalId: rawData.id
    };
  }

  denormalize(unifiedData) {
    return {
      message: unifiedData.content,
      published: true
    };
  }
}

// Adapter Registry (OCP: Add new adapters without modifying this)
class PlatformAdapterRegistry {
  constructor() {
    this._adapters = new Map();
  }

  register(adapter) {
    this._adapters.set(adapter.getPlatformName(), adapter);
    return this;
  }

  getAdapter(platform) {
    const adapter = this._adapters.get(platform);
    if (!adapter) throw new Error(`No adapter registered for platform: ${platform}`);
    return adapter;
  }

  getSupportedPlatforms() {
    return Array.from(this._adapters.keys());
  }

  normalizePost(platform, rawData) {
    return this.getAdapter(platform).normalize(rawData);
  }
}

// Build default registry
const registry = new PlatformAdapterRegistry();
registry
  .register(new TwitterAdapter())
  .register(new InstagramAdapter())
  .register(new LinkedInAdapter())
  .register(new FacebookAdapter());

module.exports = { registry, PlatformAdapterRegistry, TwitterAdapter, InstagramAdapter };
