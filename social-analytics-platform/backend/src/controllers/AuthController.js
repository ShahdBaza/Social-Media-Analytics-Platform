// controllers/AuthController.js
// SRP: Handles only HTTP request/response for auth routes
const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.json({ success: true, data: user });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await AuthService.updateProfile(req.user.id, req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AuthController();
