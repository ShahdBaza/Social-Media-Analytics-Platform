// services/PostService.js
// SRP: Post business logic only
// OCP: Extended via commands/events without modification
// DIP: Depends on abstractions (repository, command invoker, event bus)

const postRepository = require('../repositories/PostRepository');
const { invoker, CreatePostCommand, UpdatePostCommand, DeletePostCommand, PublishPostCommand } = require('../patterns/command/PostCommands');
const { eventBus } = require('../patterns/observer/EventBus');
const { buildPostQueryPipeline } = require('../utils/processingPipeline');
const { buildRequestChain } = require('../patterns/chain/RequestChain');

const requestChain = buildRequestChain();

class PostService {
  async createPost(userId, postData) {
    // Run through Chain of Responsibility
    const chainResult = requestChain.handle({
      userId,
      type: 'post',
      data: postData
    });
    if (!chainResult.success) {
      const err = new Error(chainResult.error);
      err.code = chainResult.code;
      throw err;
    }

    // Execute via Command pattern
    const command = new CreatePostCommand(postRepository, { ...postData, userId });
    const post = invoker.execute(command);

    // Notify observers
    eventBus.emit('post:created', { post: post.toJSON(), userId });
    return post.toJSON();
  }

  getPosts(userId, filters = {}) {
    const raw = userId
      ? postRepository.findByUserAndPlatform(userId, filters.platform)
      : postRepository.findAll();

    // Apply HOF pipeline
    const pipeline = buildPostQueryPipeline(filters);
    return pipeline(raw);
  }

  getPostById(postId, userId) {
    const post = postRepository.findById(postId);
    if (!post) throw new Error('Post not found');
    if (userId && post.userId !== userId) throw new Error('Access denied');
    return post.toJSON();
  }

  async updatePost(postId, userId, updates) {
    const post = postRepository.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) throw new Error('Access denied');

    const command = new UpdatePostCommand(postRepository, postId, updates);
    const updated = invoker.execute(command);
    eventBus.emit('post:updated', { postId, userId });
    return updated.toJSON ? updated.toJSON() : updated;
  }

  deletePost(postId, userId) {
    const post = postRepository.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) throw new Error('Access denied');

    const command = new DeletePostCommand(postRepository, postId);
    invoker.execute(command);
    eventBus.emit('post:deleted', { postId, userId });
    return true;
  }

  publishPost(postId, userId) {
    const post = postRepository.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) throw new Error('Access denied');

    const command = new PublishPostCommand(postRepository, postId);
    const published = invoker.execute(command);
    eventBus.emit('post:published', { post: published, userId });
    return published.toJSON ? published.toJSON() : published;
  }

  undoLastAction() {
    return invoker.undo();
  }

  getCommandHistory() {
    return invoker.getHistory();
  }

  getStats() {
    return postRepository.getStats();
  }
}

module.exports = new PostService();
