const db = require('../models');
const { Workspace, Article } = db;

const getAllWorkspaces = async (includeInactive = false) => {
  const where = includeInactive ? {} : { isActive: true };
  
  const workspaces = await Workspace.findAll({
    where,
    include: [{
      model: Article,
      as: 'articles',
      attributes: ['id'],
      required: false
    }],
    order: [['createdAt', 'ASC']]
  });

  return workspaces.map(workspace => ({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    slug: workspace.slug,
    color: workspace.color,
    icon: workspace.icon,
    isActive: workspace.isActive,
    articleCount: workspace.articles.length,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt
  }));
};

const getWorkspaceById = async (id) => {
  const workspace = await Workspace.findByPk(id, {
    include: [{
      model: Article,
      as: 'articles',
      attributes: ['id', 'title', 'slug', 'createdAt'],
      order: [['createdAt', 'DESC']]
    }]
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    slug: workspace.slug,
    color: workspace.color,
    icon: workspace.icon,
    isActive: workspace.isActive,
    articles: workspace.articles,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt
  };
};

// Get workspace by slug
const getWorkspaceBySlug = async (slug) => {
  const workspace = await Workspace.findOne({
    where: { slug },
    include: [{
      model: Article,
      as: 'articles',
      attributes: ['id', 'title', 'slug', 'createdAt'],
      order: [['createdAt', 'DESC']]
    }]
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    slug: workspace.slug,
    color: workspace.color,
    icon: workspace.icon,
    isActive: workspace.isActive,
    articles: workspace.articles,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt
  };
};

const createWorkspace = async (name, description, color, icon) => {
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;

  while (await Workspace.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const workspace = await Workspace.create({
    name,
    description,
    slug,
    color: color || '#667eea',
    icon: icon || '📁',
    isActive: true
  });

  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    slug: workspace.slug,
    color: workspace.color,
    icon: workspace.icon,
    message: 'Workspace created successfully'
  };
};

const updateWorkspace = async (id, name, description, color, icon, isActive) => {
  const workspace = await Workspace.findByPk(id);

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  let slug = workspace.slug;
  if (name && name !== workspace.name) {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    slug = baseSlug;
    let counter = 1;

    while (await Workspace.findOne({ 
      where: { 
        slug, 
        id: { [db.Sequelize.Op.ne]: id } 
      } 
    })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  await workspace.update({
    name: name || workspace.name,
    description: description !== undefined ? description : workspace.description,
    slug,
    color: color || workspace.color,
    icon: icon || workspace.icon,
    isActive: isActive !== undefined ? isActive : workspace.isActive
  });

  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    message: 'Workspace updated successfully'
  };
};

const deleteWorkspace = async (id) => {
  const workspace = await Workspace.findByPk(id);

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  const name = workspace.name;
  await workspace.destroy();

  return { name };
};

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  getWorkspaceBySlug,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};