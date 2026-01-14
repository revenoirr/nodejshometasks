const db = require('../models');
const { User } = db;

const getAllUsers = async () => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'role', 'created_at', 'updated_at']
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

const updateUserRole = async (userId, newRole, adminUserId) => {
  try {
    if (!['user', 'admin'].includes(newRole)) {
      throw new Error('Invalid role. Must be "user" or "admin"');
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (userId === adminUserId) {
      throw new Error('Cannot change your own role');
    }

    user.role = newRole;
    await user.save();

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      updated_at: user.updated_at
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

const getUserStats = async () => {
  try {
    const totalUsers = await User.count();
    const adminCount = await User.count({ where: { role: 'admin' } });
    const regularUserCount = await User.count({ where: { role: 'user' } });

    return {
      total: totalUsers,
      admins: adminCount,
      regularUsers: regularUserCount
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  getUserStats
};