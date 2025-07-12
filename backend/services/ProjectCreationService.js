const logger = require('../utils/logger');

class ProjectCreationService {
  constructor() {
    this.projects = new Map();
    this.projectCounter = 1000;
    this.notifications = [];
  }

  /**
   * Create a new project with executive approval workflow
   */
  async createProject(projectData, createdBy = 'Vinod Kumar') {
    try {
      const projectId = `PROJ-${Date.now()}-${this.projectCounter++}`;
      
      const project = {
        id: projectId,
        ...projectData,
        createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Draft - Pending VP Completion',
        stage: 'vp-completion',
        progress: 0,
        spent: 0,
        approvalHistory: [
          {
            stage: 'created',
            approvedBy: createdBy,
            timestamp: new Date().toISOString(),
            action: 'Project Created',
            comments: 'Initial project creation by SVP'
          }
        ],
        vpTasks: this.generateVPTasks(projectData),
        integrationStatus: {
          jira: projectData.sourceType === 'jira' ? 'pending' : 'not-applicable',
          sow: projectData.sourceType === 'sow' ? 'pending' : 'not-applicable',
          financial: 'pending',
          hr: 'pending'
        },
        notifications: [],
        collaborators: [createdBy],
        timeline: this.generateProjectTimeline(projectData),
        riskAssessment: this.generateRiskAssessment(projectData),
        budgetBreakdown: this.generateBudgetBreakdown(projectData)
      };

      // Store project
      this.projects.set(projectId, project);

      // Create VP notification
      await this.createVPNotification(project);

      // Log project creation
      logger.info(`Project created: ${projectId} by ${createdBy}`);

      return {
        success: true,
        project,
        message: 'Project created successfully and assigned to VP for completion'
      };

    } catch (error) {
      logger.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  /**
   * Generate VP-specific tasks for project completion
   */
  generateVPTasks(projectData) {
    const baseTasks = [
      {
        id: 'detailed-timeline',
        title: 'Create Detailed Project Timeline',
        description: 'Break down project into specific milestones and deadlines',
        assignedTo: projectData.assignedVP,
        status: 'pending',
        priority: 'high',
        estimatedHours: 4,
        dueDate: this.addDays(new Date(), 3)
      },
      {
        id: 'team-assignment',
        title: 'Assign Specific Team Members',
        description: 'Select and assign specific team members with roles and responsibilities',
        assignedTo: projectData.assignedVP,
        status: 'pending',
        priority: 'high',
        estimatedHours: 2,
        dueDate: this.addDays(new Date(), 5)
      },
      {
        id: 'resource-planning',
        title: 'Detailed Resource Planning',
        description: 'Define specific resource requirements, tools, and infrastructure needs',
        assignedTo: projectData.assignedVP,
        status: 'pending',
        priority: 'medium',
        estimatedHours: 3,
        dueDate: this.addDays(new Date(), 7)
      },
      {
        id: 'risk-mitigation',
        title: 'Risk Assessment and Mitigation Plan',
        description: 'Identify potential risks and create detailed mitigation strategies',
        assignedTo: projectData.assignedVP,
        status: 'pending',
        priority: 'medium',
        estimatedHours: 3,
        dueDate: this.addDays(new Date(), 7)
      },
      {
        id: 'stakeholder-mapping',
        title: 'Stakeholder Identification and Communication Plan',
        description: 'Map all stakeholders and create communication strategy',
        assignedTo: projectData.assignedVP,
        status: 'pending',
        priority: 'medium',
        estimatedHours: 2,
        dueDate: this.addDays(new Date(), 10)
      }
    ];

    // Add category-specific tasks
    const categoryTasks = this.getCategorySpecificTasks(projectData.category, projectData.assignedVP);
    
    return [...baseTasks, ...categoryTasks];
  }

  /**
   * Get category-specific tasks
   */
  getCategorySpecificTasks(category, assignedVP) {
    const categoryTaskMap = {
      'regulatory': [
        {
          id: 'compliance-checklist',
          title: 'Regulatory Compliance Checklist',
          description: 'Create comprehensive compliance checklist for all applicable regulations',
          assignedTo: assignedVP,
          status: 'pending',
          priority: 'high',
          estimatedHours: 4,
          dueDate: this.addDays(new Date(), 5)
        },
        {
          id: 'regulatory-approval',
          title: 'Regulatory Pre-approval Process',
          description: 'Initiate pre-approval process with relevant regulatory bodies',
          assignedTo: assignedVP,
          status: 'pending',
          priority: 'high',
          estimatedHours: 6,
          dueDate: this.addDays(new Date(), 14)
        }
      ],
      'aml': [
        {
          id: 'aml-testing-plan',
          title: 'AML Testing and Validation Plan',
          description: 'Create comprehensive testing plan for AML systems and processes',
          assignedTo: assignedVP,
          status: 'pending',
          priority: 'high',
          estimatedHours: 5,
          dueDate: this.addDays(new Date(), 7)
        },
        {
          id: 'transaction-monitoring',
          title: 'Transaction Monitoring Configuration',
          description: 'Define transaction monitoring rules and thresholds',
          assignedTo: assignedVP,
          status: 'pending',
          priority: 'medium',
          estimatedHours: 4,
          dueDate: this.addDays(new Date(), 10)
        }
      ],
      'risk': [
        {
          id: 'risk-modeling',
          title: 'Risk Model Development',
          description: 'Develop or update risk models and validation procedures',
          assignedTo: assignedVP,
          status: 'pending',
          priority: 'high',
          estimatedHours: 8,
          dueDate: this.addDays(new Date(), 14)
        }
      ],
      'audit': [
        {
          id: 'audit-procedures',
          title: 'Audit Procedures Documentation',
          description: 'Document detailed audit procedures and testing methodologies',
          assignedTo: assignedVP,
          status: 'pending',
          priority: 'high',
          estimatedHours: 6,
          dueDate: this.addDays(new Date(), 10)
        }
      ]
    };

    return categoryTaskMap[category] || [];
  }

  /**
   * Generate project timeline based on duration and complexity
   */
  generateProjectTimeline(projectData) {
    const startDate = new Date();
    const durationMonths = this.parseDuration(projectData.estimatedDuration);
    const endDate = this.addMonths(startDate, durationMonths);

    const phases = [
      {
        name: 'Planning & Setup',
        startDate: startDate,
        endDate: this.addDays(startDate, 14),
        progress: 0,
        tasks: ['Project kickoff', 'Team formation', 'Resource allocation', 'Initial planning']
      },
      {
        name: 'Execution Phase 1',
        startDate: this.addDays(startDate, 15),
        endDate: this.addMonths(startDate, Math.floor(durationMonths * 0.6)),
        progress: 0,
        tasks: ['Core development', 'Implementation', 'Testing']
      },
      {
        name: 'Execution Phase 2',
        startDate: this.addMonths(startDate, Math.floor(durationMonths * 0.6)),
        endDate: this.addMonths(startDate, Math.floor(durationMonths * 0.9)),
        progress: 0,
        tasks: ['Integration', 'User acceptance testing', 'Documentation']
      },
      {
        name: 'Closure & Deployment',
        startDate: this.addMonths(startDate, Math.floor(durationMonths * 0.9)),
        endDate: endDate,
        progress: 0,
        tasks: ['Final testing', 'Deployment', 'Training', 'Project closure']
      }
    ];

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      phases,
      milestones: this.generateMilestones(projectData, startDate, endDate)
    };
  }

  /**
   * Generate project milestones
   */
  generateMilestones(projectData, startDate, endDate) {
    const durationMonths = this.parseDuration(projectData.estimatedDuration);
    
    return [
      {
        name: 'Project Kickoff',
        date: this.addDays(startDate, 7),
        status: 'pending',
        description: 'Official project launch and team onboarding'
      },
      {
        name: 'Phase 1 Completion',
        date: this.addMonths(startDate, Math.floor(durationMonths * 0.3)),
        status: 'pending',
        description: 'First major phase deliverables completed'
      },
      {
        name: 'Mid-project Review',
        date: this.addMonths(startDate, Math.floor(durationMonths * 0.5)),
        status: 'pending',
        description: 'Executive review and progress assessment'
      },
      {
        name: 'User Acceptance Testing',
        date: this.addMonths(startDate, Math.floor(durationMonths * 0.8)),
        status: 'pending',
        description: 'User acceptance testing and feedback incorporation'
      },
      {
        name: 'Project Completion',
        date: endDate,
        status: 'pending',
        description: 'Final deliverables and project closure'
      }
    ];
  }

  /**
   * Generate risk assessment based on project parameters
   */
  generateRiskAssessment(projectData) {
    const risks = [];

    // Budget-based risks
    if (projectData.budgetRange.preferred > 500000) {
      risks.push({
        category: 'Financial',
        description: 'High budget project requires enhanced financial controls',
        probability: 'Medium',
        impact: 'High',
        mitigation: 'Implement milestone-based budget reviews and approval gates'
      });
    }

    // Timeline-based risks
    const durationMonths = this.parseDuration(projectData.estimatedDuration);
    if (durationMonths >= 6) {
      risks.push({
        category: 'Schedule',
        description: 'Long-duration project susceptible to scope creep and delays',
        probability: 'High',
        impact: 'Medium',
        mitigation: 'Implement agile methodology with regular sprint reviews'
      });
    }

    // Team size risks
    if (projectData.teamSizeEstimate > 10) {
      risks.push({
        category: 'Resource',
        description: 'Large team coordination and communication challenges',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Establish clear communication protocols and team structure'
      });
    }

    // Regional risks
    if (projectData.regions.length > 3) {
      risks.push({
        category: 'Operational',
        description: 'Multi-region implementation complexity',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Phased regional rollout with local champions'
      });
    }

    // Category-specific risks
    const categoryRisks = this.getCategorySpecificRisks(projectData.category);
    risks.push(...categoryRisks);

    return {
      overallRiskLevel: this.calculateOverallRisk(risks),
      risks,
      lastAssessed: new Date().toISOString()
    };
  }

  /**
   * Get category-specific risks
   */
  getCategorySpecificRisks(category) {
    const categoryRiskMap = {
      'regulatory': [
        {
          category: 'Compliance',
          description: 'Regulatory requirements may change during project execution',
          probability: 'Medium',
          impact: 'High',
          mitigation: 'Regular regulatory monitoring and flexible project design'
        }
      ],
      'aml': [
        {
          category: 'Technology',
          description: 'AML system integration complexity with existing infrastructure',
          probability: 'High',
          impact: 'High',
          mitigation: 'Comprehensive integration testing and fallback procedures'
        }
      ],
      'technology': [
        {
          category: 'Technology',
          description: 'Technology obsolescence during development cycle',
          probability: 'Medium',
          impact: 'Medium',
          mitigation: 'Use established, stable technology stack'
        }
      ]
    };

    return categoryRiskMap[category] || [];
  }

  /**
   * Generate budget breakdown
   */
  generateBudgetBreakdown(projectData) {
    const totalBudget = projectData.budgetRange.preferred;
    
    return {
      totalAllocated: totalBudget,
      breakdown: {
        personnel: Math.floor(totalBudget * 0.6),
        technology: Math.floor(totalBudget * 0.2),
        external: Math.floor(totalBudget * 0.1),
        overhead: Math.floor(totalBudget * 0.05),
        contingency: Math.floor(totalBudget * 0.05)
      },
      approvalLimits: {
        vp: Math.floor(totalBudget * 0.1),
        svp: Math.floor(totalBudget * 0.25),
        executive: totalBudget
      }
    };
  }

  /**
   * Create notification for assigned VP
   */
  async createVPNotification(project) {
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'project-assignment',
      title: 'New Project Assignment',
      message: `You have been assigned as lead for project: ${project.name}`,
      projectId: project.id,
      assignedTo: project.assignedVP,
      createdBy: project.createdBy,
      timestamp: new Date().toISOString(),
      status: 'unread',
      priority: 'high',
      actions: [
        {
          label: 'View Project',
          action: 'view-project',
          url: `/projects/${project.id}`
        },
        {
          label: 'Start Planning',
          action: 'start-planning',
          url: `/projects/${project.id}/planning`
        }
      ]
    };

    this.notifications.push(notification);
    
    // In a real implementation, this would send email/Slack notifications
    logger.info(`Notification created for VP ${project.assignedVP}: ${notification.id}`);
    
    return notification;
  }

  /**
   * Get project by ID
   */
  getProject(projectId) {
    return this.projects.get(projectId);
  }

  /**
   * Get all projects
   */
  getAllProjects() {
    return Array.from(this.projects.values());
  }

  /**
   * Get projects by VP
   */
  getProjectsByVP(vpId) {
    return Array.from(this.projects.values()).filter(project => project.assignedVP === vpId);
  }

  /**
   * Update project status
   */
  async updateProjectStatus(projectId, status, updatedBy, comments = '') {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.status = status;
    project.updatedAt = new Date().toISOString();
    
    // Add to approval history
    project.approvalHistory.push({
      stage: status,
      approvedBy: updatedBy,
      timestamp: new Date().toISOString(),
      action: `Status updated to ${status}`,
      comments
    });

    this.projects.set(projectId, project);
    
    logger.info(`Project ${projectId} status updated to ${status} by ${updatedBy}`);
    
    return project;
  }

  /**
   * Complete VP task
   */
  async completeVPTask(projectId, taskId, completedBy, data = {}) {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const task = project.vpTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.status = 'completed';
    task.completedBy = completedBy;
    task.completedAt = new Date().toISOString();
    task.completionData = data;

    // Check if all critical tasks are completed
    const criticalTasks = project.vpTasks.filter(t => t.priority === 'high');
    const completedCriticalTasks = criticalTasks.filter(t => t.status === 'completed');
    
    if (completedCriticalTasks.length === criticalTasks.length) {
      project.stage = 'ready-for-approval';
      project.status = 'Ready for Executive Approval';
      
      // Create notification for SVP
      await this.createExecutiveApprovalNotification(project);
    }

    project.updatedAt = new Date().toISOString();
    this.projects.set(projectId, project);
    
    logger.info(`Task ${taskId} completed for project ${projectId} by ${completedBy}`);
    
    return project;
  }

  /**
   * Create executive approval notification
   */
  async createExecutiveApprovalNotification(project) {
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'executive-approval',
      title: 'Project Ready for Approval',
      message: `Project ${project.name} is ready for your final approval`,
      projectId: project.id,
      assignedTo: project.createdBy, // SVP who created the project
      createdBy: project.assignedVP,
      timestamp: new Date().toISOString(),
      status: 'unread',
      priority: 'high',
      actions: [
        {
          label: 'Review Project',
          action: 'review-project',
          url: `/projects/${project.id}/approval`
        },
        {
          label: 'Approve',
          action: 'approve-project',
          url: `/projects/${project.id}/approve`
        }
      ]
    };

    this.notifications.push(notification);
    
    logger.info(`Executive approval notification created for project ${project.id}`);
    
    return notification;
  }

  /**
   * Approve project for deployment
   */
  async approveProject(projectId, approvedBy, comments = '') {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.status = 'Approved - Active';
    project.stage = 'active';
    project.approvedAt = new Date().toISOString();
    project.approvedBy = approvedBy;
    project.updatedAt = new Date().toISOString();

    // Add to approval history
    project.approvalHistory.push({
      stage: 'approved',
      approvedBy,
      timestamp: new Date().toISOString(),
      action: 'Project Approved for Execution',
      comments
    });

    // Initialize project tracking
    project.actualStartDate = new Date().toISOString();
    project.progress = 5; // Initial progress

    this.projects.set(projectId, project);
    
    // Create deployment notifications
    await this.createDeploymentNotifications(project);
    
    logger.info(`Project ${projectId} approved by ${approvedBy}`);
    
    return project;
  }

  /**
   * Create deployment notifications
   */
  async createDeploymentNotifications(project) {
    // Notify VP
    const vpNotification = {
      id: `notif-${Date.now()}`,
      type: 'project-approved',
      title: 'Project Approved',
      message: `Your project ${project.name} has been approved and is now active`,
      projectId: project.id,
      assignedTo: project.assignedVP,
      createdBy: project.approvedBy,
      timestamp: new Date().toISOString(),
      status: 'unread',
      priority: 'high'
    };

    this.notifications.push(vpNotification);
    
    // In real implementation, integrate with:
    // - Jira (create project and tickets)
    // - Financial systems (allocate budget)
    // - HR systems (assign resources)
    // - Calendar systems (schedule meetings)
    
    logger.info(`Deployment notifications created for project ${project.id}`);
  }

  /**
   * Get notifications for user
   */
  getNotifications(userId) {
    return this.notifications.filter(notif => notif.assignedTo === userId);
  }

  /**
   * Utility functions
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  parseDuration(duration) {
    if (!duration) return 3; // default 3 months
    const match = duration.match(/(\d+)\s*(month|months)/i);
    return match ? parseInt(match[1]) : 3;
  }

  calculateOverallRisk(risks) {
    if (risks.length === 0) return 'Low';
    
    const highRisks = risks.filter(r => r.impact === 'High' || r.probability === 'High');
    if (highRisks.length > 2) return 'High';
    if (highRisks.length > 0) return 'Medium';
    return 'Low';
  }
}

module.exports = new ProjectCreationService();
