'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

interface ProjectCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
  vpTeams: any[];
}

interface ProjectFormData {
  // Step 1: Basics
  name: string;
  description: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  department: string;
  estimatedDuration: string;
  
  // Step 2: Leadership & Assignment
  assignedVP: string;
  secondaryStakeholders: string[];
  executiveSponsor: string;
  regions: string[];
  
  // Step 3: Budget & Resources
  budgetRange: {
    min: number;
    max: number;
    preferred: number;
  };
  teamSizeEstimate: number;
  skillsRequired: string[];
  costCenter: string;
  
  // Step 4: Integration & Sources
  sourceType: 'manual' | 'jira' | 'sow' | 'template';
  externalProjectId?: string;
  templateId?: string;
  attachments: File[];
}

const initialFormData: ProjectFormData = {
  name: '',
  description: '',
  category: '',
  priority: 'Medium',
  department: '',
  estimatedDuration: '',
  assignedVP: '',
  secondaryStakeholders: [],
  executiveSponsor: '',
  regions: [],
  budgetRange: {
    min: 100000,
    max: 1000000,
    preferred: 500000
  },
  teamSizeEstimate: 5,
  skillsRequired: [],
  costCenter: '',
  sourceType: 'manual',
  attachments: []
};

const projectCategories = [
  { id: 'regulatory', name: 'Regulatory Compliance', icon: '🛡️', description: 'Compliance audits, regulatory updates' },
  { id: 'aml', name: 'AML Operations', icon: '🔍', description: 'Anti-money laundering initiatives' },
  { id: 'risk', name: 'Risk Management', icon: '⚠️', description: 'Risk assessment and mitigation' },
  { id: 'audit', name: 'Internal Audit', icon: '📋', description: 'Internal auditing projects' },
  { id: 'policy', name: 'Policy Management', icon: '📄', description: 'Policy development and updates' },
  { id: 'technology', name: 'RegTech', icon: '💻', description: 'Technology and automation projects' },
  { id: 'operational', name: 'Operational Risk', icon: '⚙️', description: 'Operational improvements' },
  { id: 'strategic', name: 'Strategic Initiative', icon: '🎯', description: 'High-level strategic projects' }
];

const projectTemplates = [
  {
    id: 'blank-custom',
    name: 'Blank Custom Project',
    category: '',
    description: 'Start from scratch with a completely custom project',
    estimatedDuration: '',
    budgetRange: { min: 100000, max: 1000000, preferred: 500000 },
    teamSize: 5,
    skills: []
  },
  {
    id: 'regulatory-audit',
    name: 'Quarterly Regulatory Audit',
    category: 'regulatory',
    description: 'Standard quarterly compliance audit template',
    estimatedDuration: '3 months',
    budgetRange: { min: 300000, max: 600000, preferred: 450000 },
    teamSize: 6,
    skills: ['Regulatory Analysis', 'Audit Management', 'Compliance']
  },
  {
    id: 'aml-enhancement',
    name: 'AML System Enhancement',
    category: 'aml',
    description: 'Technology upgrade for AML detection systems',
    estimatedDuration: '4 months',
    budgetRange: { min: 500000, max: 800000, preferred: 650000 },
    teamSize: 8,
    skills: ['AML Analysis', 'System Integration', 'Testing']
  },
  {
    id: 'policy-update',
    name: 'Policy Documentation Update',
    category: 'policy',
    description: 'Comprehensive policy review and update',
    estimatedDuration: '2 months',
    budgetRange: { min: 100000, max: 200000, preferred: 150000 },
    teamSize: 4,
    skills: ['Policy Development', 'Documentation', 'Training']
  },
  {
    id: 'risk-framework',
    name: 'Risk Assessment Framework',
    category: 'risk',
    description: 'New risk assessment methodology implementation',
    estimatedDuration: '6 months',
    budgetRange: { min: 400000, max: 700000, preferred: 550000 },
    teamSize: 7,
    skills: ['Risk Modeling', 'Framework Design', 'Analytics']
  }
];

const availableSkills = [
  'Regulatory Analysis', 'Policy Development', 'Audit Management', 'Risk Assessment',
  'AML Analysis', 'Transaction Monitoring', 'KYC Procedures', 'Sanctions Screening',
  'System Integration', 'Data Analysis', 'Project Management', 'Training Development',
  'Documentation', 'Compliance Monitoring', 'Framework Design', 'Testing',
  'Business Analysis', 'Process Improvement', 'Stakeholder Management'
];

const regions = [
  { id: 'mexico', name: 'Mexico', flag: '🇲🇽' },
  { id: 'colombia', name: 'Colombia', flag: '🇨🇴' },
  { id: 'peru', name: 'Peru', flag: '🇵🇪' },
  { id: 'honduras', name: 'Honduras', flag: '🇭🇳' },
  { id: 'panama', name: 'Panama', flag: '🇵🇦' }
];

export default function ProjectCreationWizard({ isOpen, onClose, onProjectCreated, vpTeams }: ProjectCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        category: selectedTemplate.category,
        estimatedDuration: selectedTemplate.estimatedDuration,
        budgetRange: selectedTemplate.budgetRange,
        teamSizeEstimate: selectedTemplate.teamSize,
        skillsRequired: selectedTemplate.skills,
        sourceType: 'template',
        templateId: selectedTemplate.id
      }));
    }
  }, [selectedTemplate]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) errors.name = 'Project name is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.department) errors.department = 'Department is required';
        break;
      case 2:
        if (!formData.assignedVP) errors.assignedVP = 'VP assignment is required';
        if (formData.regions.length === 0) errors.regions = 'At least one region is required';
        break;
      case 3:
        if (formData.budgetRange.preferred < formData.budgetRange.min) {
          errors.budget = 'Preferred budget cannot be less than minimum';
        }
        if (!formData.costCenter) errors.costCenter = 'Cost center is required';
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProject = {
        id: `proj-${Date.now()}`,
        ...formData,
        status: 'Draft - Pending VP Completion',
        createdBy: 'Vinod Kumar',
        createdAt: new Date().toISOString(),
        stage: 'vp-completion',
        progress: 0,
        spent: 0
      };

      setCreatedProject(newProject);
      setShowSuccess(true);
      
      // Call the callback after a delay to show success screen
      setTimeout(() => {
        onProjectCreated(newProject);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onClose();
    
    // Reset form
    setFormData(initialFormData);
    setCurrentStep(1);
    setSelectedTemplate(null);
    setCreatedProject(null);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
            step < currentStep ? 'bg-green-500 text-white' :
            step === currentStep ? 'bg-blue-500 text-white' :
            'bg-gray-600 text-gray-400'
          }`}>
            {step < currentStep ? <CheckIcon className="h-5 w-5" /> : step}
          </div>
          {step < totalSteps && (
            <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
              step < currentStep ? 'bg-green-500' : 'bg-gray-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Project Basics</h3>
        <p className="text-gray-400">Define the core project information</p>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Start from Template (Optional)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {projectTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`p-3 rounded-lg border text-left transition-all duration-300 ${
                selectedTemplate?.id === template.id
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/20 bg-white/5 hover:border-white/30'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{projectCategories.find(c => c.id === template.category)?.icon}</span>
                <span className="text-white font-medium text-sm">{template.name}</span>
              </div>
              <p className="text-gray-400 text-xs">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50"
          placeholder="Enter project name"
        />
        {validationErrors.name && (
          <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50"
          placeholder="Describe the project objectives and scope"
        />
        {validationErrors.description && (
          <p className="text-red-400 text-sm mt-1">{validationErrors.description}</p>
        )}
      </div>

      {/* Category and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="">Select category</option>
            {projectCategories.map((category) => (
              <option key={category.id} value={category.id} className="bg-gray-800">
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          {validationErrors.category && (
            <p className="text-red-400 text-sm mt-1">{validationErrors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority *
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="Critical" className="bg-gray-800">🔴 Critical</option>
            <option value="High" className="bg-gray-800">🟠 High</option>
            <option value="Medium" className="bg-gray-800">🟡 Medium</option>
            <option value="Low" className="bg-gray-800">🟢 Low</option>
          </select>
        </div>
      </div>

      {/* Department and Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Department *
          </label>
          <select
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="">Select department</option>
            <option value="Regulatory Affairs" className="bg-gray-800">Regulatory Affairs</option>
            <option value="Risk Management" className="bg-gray-800">Risk Management</option>
            <option value="Internal Audit" className="bg-gray-800">Internal Audit</option>
            <option value="AML Operations" className="bg-gray-800">AML Operations</option>
            <option value="Policy Management" className="bg-gray-800">Policy Management</option>
            <option value="Operational Risk" className="bg-gray-800">Operational Risk</option>
            <option value="RegTech" className="bg-gray-800">RegTech</option>
          </select>
          {validationErrors.department && (
            <p className="text-red-400 text-sm mt-1">{validationErrors.department}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estimated Duration
          </label>
          <select
            value={formData.estimatedDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="">Select duration</option>
            <option value="1 month" className="bg-gray-800">1 month</option>
            <option value="2 months" className="bg-gray-800">2 months</option>
            <option value="3 months" className="bg-gray-800">3 months</option>
            <option value="4 months" className="bg-gray-800">4 months</option>
            <option value="6 months" className="bg-gray-800">6 months</option>
            <option value="12 months" className="bg-gray-800">12 months</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Leadership & Assignment</h3>
        <p className="text-gray-400">Assign project leadership and scope</p>
      </div>

      {/* VP Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Assigned VP Lead *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {vpTeams.map((vp) => (
            <button
              key={vp.id}
              onClick={() => setFormData(prev => ({ ...prev, assignedVP: vp.id }))}
              className={`p-4 rounded-lg border text-left transition-all duration-300 ${
                formData.assignedVP === vp.id
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/20 bg-white/5 hover:border-white/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${vp.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{vp.avatar}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{vp.name}</h4>
                    <p className="text-gray-400 text-sm">{vp.title}</p>
                    <p className="text-gray-500 text-xs">{vp.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{vp.activeProjects}</p>
                  <p className="text-gray-400 text-xs">Active Projects</p>
                  <div className="flex items-center mt-1">
                    <div className="w-16 bg-gray-700 rounded-full h-1 mr-2">
                      <div 
                        className={`h-1 rounded-full ${
                          vp.budgetUtilization > 90 ? 'bg-red-500' :
                          vp.budgetUtilization > 80 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${vp.budgetUtilization}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400">{vp.budgetUtilization.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {validationErrors.assignedVP && (
          <p className="text-red-400 text-sm mt-1">{validationErrors.assignedVP}</p>
        )}
      </div>

      {/* Executive Sponsor */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Executive Sponsor
        </label>
        <select
          value={formData.executiveSponsor}
          onChange={(e) => setFormData(prev => ({ ...prev, executiveSponsor: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
        >
          <option value="">Select executive sponsor</option>
          <option value="Vinod Kumar" className="bg-gray-800">Vinod Kumar (SVP)</option>
          <option value="Board Member" className="bg-gray-800">Board Member</option>
          <option value="CEO Office" className="bg-gray-800">CEO Office</option>
        </select>
      </div>

      {/* Regional Scope */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Regional Scope *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => {
                const isSelected = formData.regions.includes(region.id);
                setFormData(prev => ({
                  ...prev,
                  regions: isSelected 
                    ? prev.regions.filter(r => r !== region.id)
                    : [...prev.regions, region.id]
                }));
              }}
              className={`p-3 rounded-lg border text-center transition-all duration-300 ${
                formData.regions.includes(region.id)
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/20 bg-white/5 hover:border-white/30'
              }`}
            >
              <div className="text-2xl mb-1">{region.flag}</div>
              <div className="text-white text-sm font-medium">{region.name}</div>
            </button>
          ))}
        </div>
        {validationErrors.regions && (
          <p className="text-red-400 text-sm mt-1">{validationErrors.regions}</p>
        )}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Budget & Resources</h3>
        <p className="text-gray-400">Define budget allocation and resource requirements</p>
      </div>

      {/* Budget Range */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Budget Allocation
        </label>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Minimum</label>
              <input
                type="number"
                value={formData.budgetRange.min}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  budgetRange: { ...prev.budgetRange, min: Number(e.target.value) }
                }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Preferred</label>
              <input
                type="number"
                value={formData.budgetRange.preferred}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  budgetRange: { ...prev.budgetRange, preferred: Number(e.target.value) }
                }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Maximum</label>
              <input
                type="number"
                value={formData.budgetRange.max}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  budgetRange: { ...prev.budgetRange, max: Number(e.target.value) }
                }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">
              Preferred Budget: {formatCurrency(formData.budgetRange.preferred)}
            </p>
            <p className="text-gray-400 text-sm">
              Range: {formatCurrency(formData.budgetRange.min)} - {formatCurrency(formData.budgetRange.max)}
            </p>
          </div>
        </div>
        {validationErrors.budget && (
          <p className="text-red-400 text-sm mt-1">{validationErrors.budget}</p>
        )}
      </div>

      {/* Team Size and Skills */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estimated Team Size
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.teamSizeEstimate}
            onChange={(e) => setFormData(prev => ({ ...prev, teamSizeEstimate: Number(e.target.value) }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cost Center *
          </label>
          <select
            value={formData.costCenter}
            onChange={(e) => setFormData(prev => ({ ...prev, costCenter: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500/50"
          >
            <option value="">Select cost center</option>
            <option value="CC-REG-001" className="bg-gray-800">CC-REG-001 (Regulatory)</option>
            <option value="CC-RISK-002" className="bg-gray-800">CC-RISK-002 (Risk Management)</option>
            <option value="CC-AML-003" className="bg-gray-800">CC-AML-003 (AML Operations)</option>
            <option value="CC-AUDIT-004" className="bg-gray-800">CC-AUDIT-004 (Internal Audit)</option>
            <option value="CC-TECH-005" className="bg-gray-800">CC-TECH-005 (RegTech)</option>
          </select>
          {validationErrors.costCenter && (
            <p className="text-red-400 text-sm mt-1">{validationErrors.costCenter}</p>
          )}
        </div>
      </div>

      {/* Skills Required */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Skills Required
        </label>
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {availableSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => {
                const isSelected = formData.skillsRequired.includes(skill);
                setFormData(prev => ({
                  ...prev,
                  skillsRequired: isSelected 
                    ? prev.skillsRequired.filter(s => s !== skill)
                    : [...prev.skillsRequired, skill]
                }));
              }}
              className={`p-2 rounded-lg border text-xs transition-all duration-300 ${
                formData.skillsRequired.includes(skill)
                  ? 'border-green-500 bg-green-500/10 text-green-400'
                  : 'border-white/20 bg-white/5 hover:border-white/30 text-gray-300'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <p className="text-gray-400 text-sm">
            Selected: {formData.skillsRequired.length} skills
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Integration & Sources</h3>
        <p className="text-gray-400">Configure external integrations and data sources</p>
      </div>

      {/* Source Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Project Source
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setFormData(prev => ({ ...prev, sourceType: 'manual' }))}
            className={`p-4 rounded-lg border text-left transition-all duration-300 ${
              formData.sourceType === 'manual'
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">Manual Creation</h4>
                <p className="text-gray-400 text-sm">Create project from scratch</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFormData(prev => ({ ...prev, sourceType: 'jira' }))}
            className={`p-4 rounded-lg border text-left transition-all duration-300 ${
              formData.sourceType === 'jira'
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-400" />
              <div>
                <h4 className="text-white font-medium">Import from Jira</h4>
                <p className="text-gray-400 text-sm">Link existing Jira project</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFormData(prev => ({ ...prev, sourceType: 'sow' }))}
            className={`p-4 rounded-lg border text-left transition-all duration-300 ${
              formData.sourceType === 'sow'
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-6 w-6 text-orange-400" />
              <div>
                <h4 className="text-white font-medium">SOW Integration</h4>
                <p className="text-gray-400 text-sm">Import from Statement of Work</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFormData(prev => ({ ...prev, sourceType: 'template' }))}
            className={`p-4 rounded-lg border text-left transition-all duration-300 ${
              formData.sourceType === 'template'
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-6 w-6 text-green-400" />
              <div>
                <h4 className="text-white font-medium">Template Based</h4>
                <p className="text-gray-400 text-sm">Use predefined template</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* External Project ID */}
      {(formData.sourceType === 'jira' || formData.sourceType === 'sow') && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {formData.sourceType === 'jira' ? 'Jira Project Key' : 'SOW Reference ID'}
          </label>
          <input
            type="text"
            value={formData.externalProjectId || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, externalProjectId: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50"
            placeholder={formData.sourceType === 'jira' ? 'e.g., COMP-2025-001' : 'e.g., SOW-REG-2025-Q1'}
          />
        </div>
      )}

      {/* File Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Supporting Documents
        </label>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">Drag and drop files here, or click to browse</p>
          <p className="text-gray-500 text-sm">Supports: PDF, DOC, XLS, PPT (Max 10MB each)</p>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setFormData(prev => ({ ...prev, attachments: files }));
            }}
          />
        </div>
        {formData.attachments.length > 0 && (
          <div className="mt-3">
            <p className="text-gray-400 text-sm mb-2">Attached files:</p>
            <div className="space-y-1">
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <span className="text-white text-sm">{file.name}</span>
                  <button
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        attachments: prev.attachments.filter((_, i) => i !== index)
                      }));
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Summary */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-white font-medium mb-3">Project Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Project Name</p>
            <p className="text-white font-medium">{formData.name || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-400">Assigned VP</p>
            <p className="text-white font-medium">
              {vpTeams.find(vp => vp.id === formData.assignedVP)?.name || 'Not assigned'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Budget</p>
            <p className="text-white font-medium">{formatCurrency(formData.budgetRange.preferred)}</p>
          </div>
          <div>
            <p className="text-gray-400">Duration</p>
            <p className="text-white font-medium">{formData.estimatedDuration || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-400">Team Size</p>
            <p className="text-white font-medium">{formData.teamSizeEstimate} members</p>
          </div>
          <div>
            <p className="text-gray-400">Regions</p>
            <p className="text-white font-medium">{formData.regions.length} selected</p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSuccessScreen = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckIcon className="h-12 w-12 text-white" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold text-white mb-4"
      >
        Project Created Successfully!
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-gray-400 text-lg mb-8"
      >
        Your project "{createdProject?.name}" has been created and assigned to{' '}
        {vpTeams.find(vp => vp.id === createdProject?.assignedVP)?.name}.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8 max-w-2xl mx-auto"
      >
        <h4 className="text-white font-semibold mb-4">Project Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Project ID</p>
            <p className="text-white font-medium">{createdProject?.id}</p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            <p className="text-yellow-400 font-medium">{createdProject?.status}</p>
          </div>
          <div>
            <p className="text-gray-400">Budget</p>
            <p className="text-white font-medium">{formatCurrency(createdProject?.budgetRange?.preferred || 0)}</p>
          </div>
          <div>
            <p className="text-gray-400">Created By</p>
            <p className="text-white font-medium">{createdProject?.createdBy}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="space-y-4"
      >
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <ClockIcon className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Next Steps</span>
          </div>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• The assigned VP will receive a notification to complete project setup</li>
            <li>• Project will appear in the dashboard once VP completes their section</li>
            <li>• You'll receive updates on project progress via email and dashboard notifications</li>
          </ul>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleCloseSuccess}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium rounded-xl transition-all duration-300 flex items-center space-x-2"
          >
            <CheckIcon className="h-5 w-5" />
            <span>Continue to Dashboard</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-2xl border border-white/20 w-full max-w-5xl my-8 min-h-fit"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {showSuccess ? 'Project Created!' : 'Create New Project'}
              </h2>
              <p className="text-gray-400">
                {showSuccess ? 'Your project has been successfully created' : 'Executive project creation wizard'}
              </p>
            </div>
            <button
              onClick={showSuccess ? handleCloseSuccess : onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
            >
              <XMarkIcon className="h-6 w-6 text-gray-300" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[500px]">
            {showSuccess ? (
              renderSuccessScreen()
            ) : (
              <>
                {renderStepIndicator()}
                
                <AnimatePresence mode="wait">
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Footer - Only show for wizard steps, not success screen */}
          {!showSuccess && (
            <div className="flex items-center justify-between p-6 border-t border-white/10 flex-shrink-0">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-lg text-white font-medium transition-all duration-300"
                >
                  <span>Next</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Project...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Create Project</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
