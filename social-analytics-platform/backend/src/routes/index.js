// routes/index.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const AuthController = require('../controllers/AuthController');
const PostController = require('../controllers/PostController');
const AnalyticsController = require('../controllers/AnalyticsController');

// ── Auth Routes ─────────────────────────────────────────────────────
router.post('/auth/register', (req, res) => AuthController.register(req, res));
router.post('/auth/login',    (req, res) => AuthController.login(req, res));
router.get ('/auth/profile',  authenticate, (req, res) => AuthController.getProfile(req, res));
router.put ('/auth/profile',  authenticate, (req, res) => AuthController.updateProfile(req, res));

// ── Post Routes (CRUD) ──────────────────────────────────────────────
router.post  ('/posts',              authenticate, (req, res) => PostController.create(req, res));
router.get   ('/posts',              authenticate, (req, res) => PostController.getAll(req, res));
router.get   ('/posts/stats',        authenticate, (req, res) => PostController.getStats(req, res));
router.get   ('/posts/history',      authenticate, (req, res) => PostController.getHistory(req, res));
router.post  ('/posts/undo',         authenticate, (req, res) => PostController.undo(req, res));
router.get   ('/posts/:id',          authenticate, (req, res) => PostController.getById(req, res));
router.put   ('/posts/:id',          authenticate, (req, res) => PostController.update(req, res));
router.delete('/posts/:id',          authenticate, (req, res) => PostController.delete(req, res));
router.post  ('/posts/:id/publish',  authenticate, (req, res) => PostController.publish(req, res));

// ── Analytics Routes ────────────────────────────────────────────────
router.get('/analytics/overview',                  authenticate, (req, res) => AnalyticsController.getOverview(req, res));
router.get('/analytics/platform/:platform',        authenticate, (req, res) => AnalyticsController.getPlatformAnalytics(req, res));
router.get('/analytics/top-posts',                 authenticate, (req, res) => AnalyticsController.getTopPosts(req, res));
router.get('/analytics/engagement-trend',          authenticate, (req, res) => AnalyticsController.getEngagementTrend(req, res));
router.get('/analytics/events',                    authenticate, (req, res) => AnalyticsController.getEventLog(req, res));
router.post('/analytics/normalize/:platform',      authenticate, (req, res) => AnalyticsController.normalizePlatformData(req, res));

// ── Admin Routes ────────────────────────────────────────────────────
router.get('/admin/system-metrics', authenticate, authorize('admin'), (req, res) => {
  const { metricsTracker } = require('../patterns/observer/EventBus');
  res.json({ success: true, data: metricsTracker.getMetrics() });
});

module.exports = router;
