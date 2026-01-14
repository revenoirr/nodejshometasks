const userManagementService = require('../services/userManagementService');

const getAllUsers = async (req, res) => {
  try {
    const users = await userManagementService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userManagementService.getUserById(id);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminUserId = req.user.userId;

    if (!role) {
      return res.status(400).json({ 
        error: 'Role is required',
        message: 'Please provide a role (user or admin)' 
      });
    }

    const updatedUser = await userManagementService.updateUserRole(
      id, 
      role, 
      adminUserId
    );

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Invalid role. Must be "user" or "admin"') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message === 'Cannot change your own role') {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const stats = await userManagementService.getUserStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  getUserStats
};