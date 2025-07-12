const express = require('express');
const router = express.Router();
const ProjectCreationService = require('../services/ProjectCreationService');
const logger = require('../utils/logger');

/**
 * Create a new project
 * POST /api/project-creation/create
 */
router.post('/create', async (req, res) => {
  try {
    const projectData = req.body;
    const createdBy = req.headers['x-user-id'] || 'Vinod Kumar'; // In real app, get from auth

    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'department', 'assignedVP', 'regions'];
    const missingFields = requiredFields.filter(field => !projectData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }

    // Validate budget range
    if (projectData.budgetRange) {
      const { min, max, preferred } = projectData.budgetRange;
      if (preferred < min || preferred > max) {
        return res.status(400).json({
          success: false,
          error: 'Invalid budget range: preferred budget must be between min and max'
        });
      }
    }

    // Create project
    const result = await ProjectCreationService.createProject(projectData, createdBy);

    logger.info(`Project creation API called: ${result.project.id}`);

    res.status(201).json(result);

  } catch (error) {
    logger.error('Error in project creation API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get all projects
 * GET /api/project-creation/projects
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = ProjectCreationService.getAllProjects();
    
    res.json({
      success: true,
      projects,
      count: projects.length
    });

  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

/**
 * Get project by ID
 * GET /api/project-creation/projects/:id
 */
router.get('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = ProjectCreationService.getProject(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
});

/**
 * Get projects by VP
 * GET /api/project-creation/vp/:vpId/projects
 */
router.get('/vp/:vpId/projects', async (req, res) => {
  try {
    const { vpId } = req.params;
    const projects = ProjectCreationService.getProjectsByVP(vpId);

    res.json({
      success: true,
      projects,
      count: projects.length,
      vpId
    });

  } catch (error) {
    logger.error('Error fetching VP projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch VP projects'
    });
  }
});

/**
 * Update project status
 * PUT /api/project-creation/projects/:id/status
 */
router.put('/projects/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const updatedBy = req.headers['x-user-id'] || 'System';

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const project = await ProjectCreationService.updateProjectStatus(id, status, updatedBy, comments);

    res.json({
      success: true,
      project,
      message: 'Project status updated successfully'
    });

  } catch (error) {
    logger.error('Error updating project status:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update project status'
    });
  }
});

/**
 * Complete VP task
 * PUT /api/project-creation/projects/:id/tasks/:taskId/complete
 */
router.put('/projects/:id/tasks/:taskId/complete', async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { data } = req.body;
    const completedBy = req.headers['x-user-id'] || 'VP User';

    const project = await ProjectCreationService.completeVPTask(id, taskId, completedBy, data);

    res.json({
      success: true,
      project,
      message: 'Task completed successfully'
    });

  } catch (error) {
    logger.error('Error completing VP task:', error);
    
    if (error.message === 'Project not found' || error.message === 'Task not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to complete task'
    });
  }
});

/**
 * Approve project
 * PUT /api/project-creation/projects/:id/approve
 */
router.put('/projects/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const approvedBy = req.headers['x-user-id'] || 'Vinod Kumar';

    const project = await ProjectCreationService.approveProject(id, approvedBy, comments);

    res.json({
      success: true,
      project,
      message: 'Project approved successfully'
    });

  } catch (error) {
    logger.error('Error approving project:', error);
    
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to approve project'
    });
  }
});

/**
 * Get notifications for user
 * GET /api/project-creation/notifications/:userId
 */
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = ProjectCreationService.getNotifications(userId);

    res.json({
      success: true,
      notifications,
      count: notifications.length
    });

  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

/**
 * Get project templates
 * GET /api/project-creation/templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'regulatory-audit',
        name: 'Quarterly Regulatory Audit',
        category: 'regulatory',
        description: 'Standard quarterly compliance audit template',
        estimatedDuration: '3 months',
        budgetRange: { min: 300000, max: 600000, preferred: 450000 },
        teamSize: 6,
        skills: ['Regulatory Analysis', 'Audit Management', 'Compliance'],
        tags: ['Compliance', 'Audit', 'Quarterly']
      },
      {
        id: 'aml-enhancement',
        name: 'AML System Enhancement',
        category: 'aml',
        description: 'Technology upgrade for AML detection systems',
        estimatedDuration: '4 months',
        budgetRange: { min: 500000, max: 800000, preferred: 650000 },
        teamSize: 8,
        skills: ['AML Analysis', 'System Integration', 'Testing'],
        tags: ['AML', 'Technology', 'Enhancement']
      },
      {
        id: 'policy-update',
        name: 'Policy Documentation Update',
        category: 'policy',
        description: 'Comprehensive policy review and update',
        estimatedDuration: '2 months',
        budgetRange: { min: 100000, max: 200000, preferred: 150000 },
        teamSize: 4,
        skills: ['Policy Development', 'Documentation', 'Training'],
        tags: ['Policy', 'Documentation', 'Update']
      },
      {
        id: 'risk-framework',
        name: 'Risk Assessment Framework',
        category: 'risk',
        description: 'New risk assessment methodology implementation',
        estimatedDuration: '6 months',
        budgetRange: { min: 400000, max: 700000, preferred: 550000 },
        teamSize: 7,
        skills: ['Risk Modeling', 'Framework Design', 'Analytics'],
        tags: ['Risk', 'Framework', 'Assessment']
      }
    ];

    res.json({
      success: true,
      templates
    });

  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

/**
 * Get project categories
 * GET /api/project-creation/categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'regulatory', name: 'Regulatory Compliance', icon: '🛡️', description: 'Compliance audits, regulatory updates' },
      { id: 'aml', name: 'AML Operations', icon: '🔍', description: 'Anti-money laundering initiatives' },
      { id: 'risk', name: 'Risk Management', icon: '⚠️', description: 'Risk assessment and mitigation' },
      { id: 'audit', name: 'Internal Audit', icon: '📋', description: 'Internal auditing projects' },
      { id: 'policy', name: 'Policy Management', icon: '📄', description: 'Policy development and updates' },
      { id: 'technology', name: 'RegTech', icon: '💻', description: 'Technology and automation projects' },
      { id: 'operational', name: 'Operational Risk', icon: '⚙️', description: 'Operational improvements' },
      { id: 'strategic', name: 'Strategic Initiative', icon: '🎯', description: 'High-level strategic projects' }
    ];

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * Simulate external integrations
 * POST /api/project-creation/integrations/test
 */
router.post('/integrations/test', async (req, res) => {
  try {
    const { type, projectId, externalId } = req.body;

    // Simulate integration testing
    const integrationResults = {
      jira: {
        status: 'success',
        message: 'Successfully connected to Jira project',
        data: {
          projectKey: externalId,
          issueCount: 15,
          lastSync: new Date().toISOString()
        }
      },
      sow: {
        status: 'success',
        message: 'SOW document retrieved successfully',
        data: {
          sowId: externalId,
          documentVersion: '1.2',
          lastModified: new Date().toISOString()
        }
      },
      financial: {
        status: 'success',
        message: 'Budget allocation verified',
        data: {
          budgetCode: 'CC-REG-001',
          availableFunds: 2500000,
          approvalRequired: false
        }
      }
    };

    const result = integrationResults[type] || {
      status: 'error',
      message: 'Unknown integration type'
    };

    res.json({
      success: result.status === 'success',
      integration: {
        type,
        projectId,
        externalId,
        ...result
      }
    });

  } catch (error) {
    logger.error('Error testing integration:', error);
    res.status(500).json({
      success: false,
      error: 'Integration test failed'
    });
  }
});

/**
 * Get project analytics
 * GET /api/project-creation/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const projects = ProjectCreationService.getAllProjects();
    
    const analytics = {
      totalProjects: projects.length,
      projectsByStatus: projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {}),
      projectsByCategory: projects.reduce((acc, project) => {
        acc[project.category] = (acc[project.category] || 0) + 1;
        return acc;
      }, {}),
      projectsByVP: projects.reduce((acc, project) => {
        acc[project.assignedVP] = (acc[project.assignedVP] || 0) + 1;
        return acc;
      }, {}),
      totalBudgetAllocated: projects.reduce((sum, project) => sum + (project.budgetRange?.preferred || 0), 0),
      averageProjectDuration: projects.length > 0 ? 
        projects.reduce((sum, project) => {
          const duration = project.estimatedDuration?.match(/(\d+)/);
          return sum + (duration ? parseInt(duration[1]) : 3);
        }, 0) / projects.length : 0,
      recentActivity: projects
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          createdAt: project.createdAt,
          createdBy: project.createdBy
        }))
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

module.exports = router;
