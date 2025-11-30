const workspaceService = require('../services/workspaceService');
const { 
  notifyWorkspaceCreated,
  notifyWorkspaceUpdated,
  notifyWorkspaceDeleted
} = require('../websocket/websocketServer');

const getAllWorkspaces = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const workspaces = await workspaceService.getAllWorkspaces(includeInactive);
    res.json(workspaces);
  } catch (err) {
    console.error('Error fetching workspaces:', err);
    res.status(500).json({ error: 'Failed to retrieve workspaces' });
  }
};

const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.id);
    res.json(workspace);
  } catch (err) {
    console.error('Error fetching workspace:', err);
    if (err.message === 'Workspace not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to retrieve workspace' });
  }
};

const getWorkspaceBySlug = async (req, res) => {
  try {
    const workspace = await workspaceService.getWorkspaceBySlug(req.params.slug);
    res.json(workspace);
  } catch (err) {
    console.error('Error fetching workspace:', err);
    if (err.message === 'Workspace not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to retrieve workspace' });
  }
};

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const result = await workspaceService.createWorkspace(name, description, color, icon);
    res.status(201).json(result);
    notifyWorkspaceCreated(result);
  } catch (err) {
    console.error('Error creating workspace:', err);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { name, description, color, icon, isActive } = req.body;
    const result = await workspaceService.updateWorkspace(
      req.params.id,
      name,
      description,
      color,
      icon,
      isActive
    );
    res.json(result);
    notifyWorkspaceUpdated(result);
  } catch (err) {
    console.error('Error updating workspace:', err);
    if (err.message === 'Workspace not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update workspace' });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const result = await workspaceService.deleteWorkspace(req.params.id);  
    res.json({ message: 'Workspace deleted successfully' });
    notifyWorkspaceDeleted(result.name);
  } catch (err) {
    console.error('Error deleting workspace:', err);
    if (err.message === 'Workspace not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
};

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  getWorkspaceBySlug,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};