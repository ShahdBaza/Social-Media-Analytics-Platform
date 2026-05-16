// models/User.js
// SRP: Responsible ONLY for user data structure and validation
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
  constructor({ id, name, email, password, role = 'analyst', createdAt, updatedAt }) {
    this.id = id || uuidv4();
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
    // Runtime attribute injection - dynamic properties added at runtime
    this._dynamicAttributes = {};
  }

  // Runtime attribute injection (DIP + flexibility)
  inject(key, value) {
    this._dynamicAttributes[key] = value;
    return this;
  }

  getAttribute(key) {
    return this._dynamicAttributes[key];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this._dynamicAttributes
    };
  }

  static validate({ name, email, password }) {
    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email required');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
    return errors;
  }

  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(plain) {
    return bcrypt.compare(plain, this.password);
  }
}

module.exports = User;
