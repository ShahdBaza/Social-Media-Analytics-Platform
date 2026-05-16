// services/AuthService.js
// SRP: Handles ONLY authentication business logic
// DIP: Depends on UserRepository abstraction, not concrete implementation

const { generateToken } = require('../middleware/auth');
const { eventBus } = require('../patterns/observer/EventBus');
const userRepository = require('../repositories/UserRepository');
const User = require('../models/User');

class AuthService {
  async register(userData) {
    const user = await userRepository.createUser(userData);
    const token = generateToken(user);

    // Runtime attribute injection: add token-related info
    user.inject('lastLoginAt', new Date().toISOString());
    user.inject('sessionCount', 1);

    eventBus.emit('user:registered', { userId: user.id, email: user.email });
    return { user: user.toJSON(), token };
  }

  async login(email, password) {
    const user = userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const isValid = await user.comparePassword(password);
    if (!isValid) throw new Error('Invalid credentials');

    // Runtime attribute injection on login
    user.inject('lastLoginAt', new Date().toISOString());

    const token = generateToken(user);
    eventBus.emit('user:login', { userId: user.id, email });
    return { user: user.toJSON(), token };
  }

  async getProfile(userId) {
    const user = userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user.toJSON();
  }

  async updateProfile(userId, updates) {
    const allowed = ['name'];
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    );
    const updated = userRepository.update(userId, filtered);
    if (!updated) throw new Error('User not found');
    return updated.toJSON ? updated.toJSON() : updated;
  }
}

module.exports = new AuthService();
