// utils/processingPipeline.js
// Higher-Order Functions for flexible, composable data processing workflows

// ── Core HOF Utilities ─────────────────────────────────────────────

// pipe: compose functions left-to-right (data flows through each step)
const pipe = (...fns) => (data) => fns.reduce((acc, fn) => fn(acc), data);

// compose: compose functions right-to-left
const compose = (...fns) => (data) => fns.reduceRight((acc, fn) => fn(acc), data);

// withLogging: wraps a function and logs input/output
const withLogging = (fn, label = fn.name) => (data) => {
  console.log(`[Pipeline:${label}] Input:`, typeof data === 'object' ? `[${Array.isArray(data) ? data.length + ' items' : 'object'}]` : data);
  const result = fn(data);
  console.log(`[Pipeline:${label}] Output:`, typeof result === 'object' ? `[${Array.isArray(result) ? result.length + ' items' : 'object'}]` : result);
  return result;
};

// withTiming: wraps a function and logs execution time
const withTiming = (fn, label = fn.name) => (data) => {
  const start = Date.now();
  const result = fn(data);
  console.log(`[Pipeline:${label}] Executed in ${Date.now() - start}ms`);
  return result;
};

// memoize: caches results of pure functions
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// ── Post Processing HOFs ───────────────────────────────────────────

// Filter functions
const filterByPlatform = (platform) => (posts) =>
  platform ? posts.filter(p => p.platform === platform) : posts;

const filterByStatus = (status) => (posts) =>
  status ? posts.filter(p => p.status === status) : posts;

const filterByDateRange = (from, to) => (posts) => {
  if (!from && !to) return posts;
  return posts.filter(p => {
    const date = new Date(p.publishedAt || p.createdAt);
    if (from && date < new Date(from)) return false;
    if (to && date > new Date(to)) return false;
    return true;
  });
};

const filterByMinEngagement = (minRate) => (posts) =>
  posts.filter(p => parseFloat(p.computeEngagement()) >= minRate);

// Transform functions
const sortByEngagement = (posts) =>
  [...posts].sort((a, b) => parseFloat(b.computeEngagement()) - parseFloat(a.computeEngagement()));

const sortByDate = (ascending = false) => (posts) =>
  [...posts].sort((a, b) => {
    const da = new Date(a.publishedAt || a.createdAt);
    const db = new Date(b.publishedAt || b.createdAt);
    return ascending ? da - db : db - da;
  });

const sortByLikes = (posts) =>
  [...posts].sort((a, b) => b.likes - a.likes);

const paginate = (page, limit) => (posts) =>
  posts.slice((page - 1) * limit, page * limit);

const toJSON = (posts) => posts.map(p => p.toJSON());

// Aggregate functions
const aggregateMetrics = (posts) => ({
  count: posts.length,
  totalLikes: posts.reduce((s, p) => s + p.likes, 0),
  totalShares: posts.reduce((s, p) => s + p.shares, 0),
  totalComments: posts.reduce((s, p) => s + p.comments, 0),
  totalReach: posts.reduce((s, p) => s + p.reach, 0),
  totalImpressions: posts.reduce((s, p) => s + p.impressions, 0),
  avgEngagementRate: posts.length > 0
    ? (posts.reduce((s, p) => s + parseFloat(p.computeEngagement()), 0) / posts.length).toFixed(2)
    : 0
});

const groupByPlatform = (posts) =>
  posts.reduce((acc, p) => {
    if (!acc[p.platform]) acc[p.platform] = [];
    acc[p.platform].push(p.toJSON());
    return acc;
  }, {});

// ── Processing Pipeline Builders ───────────────────────────────────

// Build a standard post query pipeline
const buildPostQueryPipeline = ({ platform, status, from, to, page = 1, limit = 20, sortBy = 'date' }) => {
  const sorters = {
    date: sortByDate(false),
    engagement: sortByEngagement,
    likes: sortByLikes
  };

  return pipe(
    withLogging(filterByPlatform(platform), 'filterPlatform'),
    withLogging(filterByStatus(status), 'filterStatus'),
    withLogging(filterByDateRange(from, to), 'filterDate'),
    withLogging(sorters[sortBy] || sortByDate(false), 'sort'),
    withLogging(paginate(page, limit), 'paginate'),
    withLogging(toJSON, 'serialize')
  );
};

// Build an analytics pipeline
const buildAnalyticsPipeline = (platform) => {
  return pipe(
    filterByPlatform(platform),
    filterByStatus('published'),
    withLogging(aggregateMetrics, 'aggregateMetrics')
  );
};

// Memoized version of analytics aggregation
const memoizedAggregate = memoize(aggregateMetrics);

module.exports = {
  pipe, compose, withLogging, withTiming, memoize,
  filterByPlatform, filterByStatus, filterByDateRange, filterByMinEngagement,
  sortByEngagement, sortByDate, sortByLikes,
  paginate, toJSON, aggregateMetrics, groupByPlatform,
  buildPostQueryPipeline, buildAnalyticsPipeline, memoizedAggregate
};
