// controllers/AnalyticsController.js
const AnalyticsService = require('../services/AnalyticsService');
const { registry } = require('../patterns/adapter/PlatformAdapter');

class AnalyticsController {
  getOverview(req, res) {
    try {
      const data = AnalyticsService.getOverview(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  getPlatformAnalytics(req, res) {
    try {
      const { platform } = req.params;
      const { period } = req.query;
      const data = AnalyticsService.getPlatformAnalytics(req.user.id, platform, period);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  getTopPosts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const data = AnalyticsService.getTopPosts(req.user.id, limit);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  getEngagementTrend(req, res) {
    try {
      const data = AnalyticsService.getEngagementTrend(req.user.id, req.query.platform);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  getEventLog(req, res) {
    try {
      const data = AnalyticsService.getEventLog();
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Adapter demo: normalize raw platform data
  normalizePlatformData(req, res) {
    try {
      const { platform } = req.params;
      const normalized = registry.normalizePost(platform, req.body);
      res.json({ success: true, data: normalized, supportedPlatforms: registry.getSupportedPlatforms() });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AnalyticsController();
