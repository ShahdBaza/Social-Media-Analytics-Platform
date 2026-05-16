// repositories/UserRepository.js
// SRP: Data access for users only
const { InMemoryStore } = require('./InMemoryStore');
const User = require('../models/User');

class UserRepository extends InMemoryStore {
  findByEmail(email) {
    return this.findBy(u => u.email === email)[0] || null;
  }

  findByRole(role) {
    return this.findBy(u => u.role === role);
  }

  async createUser(data) {
    const errors = User.validate(data);
    if (errors.length > 0) throw new Error(errors.join(', '));

    const existing = this.findByEmail(data.email);
    if (existing) throw new Error('Email already in use');

    const hashedPassword = await User.hashPassword(data.password);
    const user = new User({ ...data, password: hashedPassword });
    return this.save(user);
  }
}

// Singleton instance
const userRepository = new UserRepository();

// Seed default admin
(async () => {
  await userRepository.createUser({
    name: 'Admin User',
    email: 'admin@analytics.com',
    password: 'admin123',
    role: 'admin'
  });
  await userRepository.createUser({
    name: 'Jane Analyst',
    email: 'jane@analytics.com',
    password: 'jane123',
    role: 'analyst'
  });
})();

module.exports = userRepository;
