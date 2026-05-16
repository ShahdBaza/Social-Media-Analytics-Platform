// controllers/PostController.js
// SRP: HTTP layer for posts only
const PostService = require('../services/PostService');

class PostController {
  async create(req, res) {
    try {
      const post = await PostService.createPost(req.user.id, req.body);
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      const status = err.code || 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  getAll(req, res) {
    try {
      const posts = PostService.getPosts(req.user.id, req.query);
      res.json({ success: true, data: posts, count: posts.length });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  getById(req, res) {
    try {
      const post = PostService.getPostById(req.params.id, req.user.id);
      res.json({ success: true, data: post });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const post = await PostService.updatePost(req.params.id, req.user.id, req.body);
      res.json({ success: true, data: post });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  delete(req, res) {
    try {
      PostService.deletePost(req.params.id, req.user.id);
      res.json({ success: true, message: 'Post deleted' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  publish(req, res) {
    try {
      const post = PostService.publishPost(req.params.id, req.user.id);
      res.json({ success: true, data: post });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  undo(req, res) {
    const description = PostService.undoLastAction();
    res.json({ success: true, message: description || 'Nothing to undo' });
  }

  getHistory(req, res) {
    res.json({ success: true, data: PostService.getCommandHistory() });
  }

  getStats(req, res) {
    res.json({ success: true, data: PostService.getStats() });
  }
}

module.exports = new PostController();
