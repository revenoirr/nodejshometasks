const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const result = await authService.register(email, password, name);
    
    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    if (error.message === 'Password must be at least 6 characters long') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to login' });
  }
};


const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to get user' });
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout
};