const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const workspaceController = require('../controllers/workspaceController');


const validateWorkspace = [
  body('name').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('color').optional().trim().isLength({ max: 50 }),
  body('icon').optional().trim().isLength({ max: 50 })
];

const validateId = [
  param('id').notEmpty().trim().isUUID()
];

const validateSlug = [
  param('slug').notEmpty().trim()
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', workspaceController.getAllWorkspaces);
router.get('/:id', validateId, checkValidation, workspaceController.getWorkspaceById);
router.get('/slug/:slug', validateSlug, checkValidation, workspaceController.getWorkspaceBySlug);
router.post('/', validateWorkspace, checkValidation, workspaceController.createWorkspace);
router.put('/:id', [...validateId, ...validateWorkspace], checkValidation, workspaceController.updateWorkspace);
router.delete('/:id', validateId, checkValidation, workspaceController.deleteWorkspace);

module.exports = router;