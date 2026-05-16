// repositories/PostRepository.js
// SRP: Data access for posts only
const { InMemoryStore } = require('./InMemoryStore');
const Post = require('../models/Post');

class PostRepository extends InMemoryStore {
  findByUserId(userId) {
    return this.findBy(p => p.userId === userId);
  }

  findByPlatform(platform) {
    return this.findBy(p => p.platform === platform);
  }

  findByStatus(status) {
    return this.findBy(p => p.status === status);
  }

  findByUserAndPlatform(userId, platform) {
    return this.findBy(p => p.userId === userId &&
      (platform ? p.platform === platform : true));
  }

  createPost(data) {
    const errors = Post.validate(data);
    if (errors.length > 0) throw new Error(errors.join(', '));
    const post = new Post(data);
    return this.save(post);
  }

  getStats() {
    const all = this.findAll();
    return {
      total: all.length,
      byPlatform: ['twitter', 'instagram', 'facebook', 'linkedin'].reduce((acc, p) => {
        acc[p] = all.filter(post => post.platform === p).length;
        return acc;
      }, {}),
      byStatus: ['draft', 'scheduled', 'published', 'archived'].reduce((acc, s) => {
        acc[s] = all.filter(post => post.status === s).length;
        return acc;
      }, {})
    };
  }
}

const postRepository = new PostRepository();

// Seed posts with realistic data
const platforms = ['twitter', 'instagram', 'facebook', 'linkedin'];
const statuses = ['published', 'published', 'published', 'scheduled', 'draft'];
const sampleContents = {
  twitter: [
    'Just launched our new feature! Excited to share what we\'ve been building 🚀 #product #startup',
    'Engaging with our community every day. Your feedback shapes our roadmap. DMs open!',
    'Big announcement coming this Friday. Stay tuned! 👀 #comingsoon'
  ],
  instagram: [
    'Behind the scenes of our creative process ✨ Swipe to see the magic happen!',
    'Team lunch vibes 🍕 Building great products with an amazing team.',
    'New collection dropping soon. Which colorway is your favorite? 💫'
  ],
  facebook: [
    'We\'re thrilled to announce our partnership with top industry leaders. Read more on our blog!',
    'Join our upcoming webinar on digital marketing trends for 2025. Link in comments.',
    'Community spotlight: Amazing story from one of our power users!'
  ],
  linkedin: [
    'Excited to share that our team grew by 50% this quarter. We\'re hiring across all departments!',
    'Key insights from Q2: engagement up 34%, reach doubled. Thread 🧵',
    'Proud to be named one of the top analytics platforms of 2025.'
  ]
};

const adminId = 'seed-user-1';
let postIndex = 0;

platforms.forEach(platform => {
  sampleContents[platform].forEach((content, i) => {
    const likes = Math.floor(Math.random() * 5000) + 100;
    const shares = Math.floor(Math.random() * 1000) + 10;
    const comments = Math.floor(Math.random() * 500) + 5;
    const reach = Math.floor(Math.random() * 50000) + 1000;
    postRepository.createPost({
      userId: adminId,
      platform,
      content,
      likes,
      shares,
      comments,
      reach,
      impressions: reach * (Math.random() * 2 + 1),
      status: statuses[postIndex % statuses.length],
      tags: [platform, 'marketing', 'analytics'],
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    postIndex++;
  });
});

module.exports = postRepository;
