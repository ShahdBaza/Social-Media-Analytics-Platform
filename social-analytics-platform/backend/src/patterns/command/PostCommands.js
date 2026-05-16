// patterns/command/PostCommands.js
// Command Pattern: Encapsulates operations as objects; supports undo/redo
// SRP: Each command handles one operation

class ICommand {
  execute() { throw new Error('execute() not implemented'); }
  undo() { throw new Error('undo() not implemented'); }
  getDescription() { throw new Error('getDescription() not implemented'); }
}

// Command: Create Post
class CreatePostCommand extends ICommand {
  constructor(postRepository, postData) {
    super();
    this._repo = postRepository;
    this._data = postData;
    this._created = null;
  }

  execute() {
    this._created = this._repo.createPost(this._data);
    console.log(`[Command] CreatePost executed: ${this._created.id}`);
    return this._created;
  }

  undo() {
    if (this._created) {
      this._repo.delete(this._created.id);
      console.log(`[Command] CreatePost undone: ${this._created.id}`);
    }
  }

  getDescription() {
    return `Create ${this._data.platform} post`;
  }
}

// Command: Update Post
class UpdatePostCommand extends ICommand {
  constructor(postRepository, postId, updates) {
    super();
    this._repo = postRepository;
    this._postId = postId;
    this._updates = updates;
    this._original = null;
  }

  execute() {
    this._original = { ...this._repo.findById(this._postId) };
    const result = this._repo.update(this._postId, this._updates);
    console.log(`[Command] UpdatePost executed: ${this._postId}`);
    return result;
  }

  undo() {
    if (this._original) {
      this._repo.update(this._postId, this._original);
      console.log(`[Command] UpdatePost undone: ${this._postId}`);
    }
  }

  getDescription() {
    return `Update post ${this._postId}`;
  }
}

// Command: Delete Post
class DeletePostCommand extends ICommand {
  constructor(postRepository, postId) {
    super();
    this._repo = postRepository;
    this._postId = postId;
    this._deleted = null;
  }

  execute() {
    this._deleted = this._repo.findById(this._postId);
    const result = this._repo.delete(this._postId);
    console.log(`[Command] DeletePost executed: ${this._postId}`);
    return result;
  }

  undo() {
    if (this._deleted) {
      this._repo.save(this._deleted);
      console.log(`[Command] DeletePost undone: ${this._postId}`);
    }
  }

  getDescription() {
    return `Delete post ${this._postId}`;
  }
}

// Command: Publish Post (status transition)
class PublishPostCommand extends ICommand {
  constructor(postRepository, postId) {
    super();
    this._repo = postRepository;
    this._postId = postId;
    this._prevStatus = null;
  }

  execute() {
    const post = this._repo.findById(this._postId);
    if (!post) throw new Error('Post not found');
    this._prevStatus = post.status;
    const result = this._repo.update(this._postId, {
      status: 'published',
      publishedAt: new Date().toISOString()
    });
    console.log(`[Command] PublishPost executed: ${this._postId}`);
    return result;
  }

  undo() {
    if (this._prevStatus) {
      this._repo.update(this._postId, { status: this._prevStatus, publishedAt: null });
      console.log(`[Command] PublishPost undone: ${this._postId}`);
    }
  }

  getDescription() {
    return `Publish post ${this._postId}`;
  }
}

// Command Invoker: executes commands and maintains history
class CommandInvoker {
  constructor() {
    this._history = [];
    this._redoStack = [];
  }

  execute(command) {
    const result = command.execute();
    this._history.push(command);
    this._redoStack = []; // clear redo on new command
    return result;
  }

  undo() {
    const command = this._history.pop();
    if (!command) return null;
    command.undo();
    this._redoStack.push(command);
    return command.getDescription();
  }

  redo() {
    const command = this._redoStack.pop();
    if (!command) return null;
    const result = command.execute();
    this._history.push(command);
    return result;
  }

  getHistory() {
    return this._history.map(c => c.getDescription());
  }
}

// Singleton invoker
const invoker = new CommandInvoker();

module.exports = {
  invoker,
  CreatePostCommand,
  UpdatePostCommand,
  DeletePostCommand,
  PublishPostCommand,
  CommandInvoker
};
