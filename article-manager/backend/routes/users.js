const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/', userManagementController.getAllUsers);

router.get('/stats', userManagementController.getUserStats);

router.get('/:id', userManagementController.getUserById);

router.put('/:id/role', userManagementController.updateUserRole);

module.exports = router;