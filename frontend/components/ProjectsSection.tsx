"use client";

import { useEffect, useState } from "react";
import SectionCard from "./SectionCard";

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  completion_percentage: number;
  next_milestone: string;
  compliance_status: string;
  budget_allocated: number;
  budget_spent: number;
  start_date: string;
  end_date: string;
  created_at: string;
  svp_name: string;
  svp_department: string;
  vp_name: string;
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5050/api/projects");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        } else if (Array.isArray(data.data)) {
          setProjects(data.data);
        } else {
          console.error("Unexpected projects API response:", data);
          setProjects([]);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <SectionCard title="Live Projects">
        <div className="text-center py-4">Loading projects...</div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Live Projects">
        <div className="text-center py-4 text-red-600">Error: {error}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Live Projects">
      {projects.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No projects found</div>
      ) : (
        <div className="space-y-4">
          {projects.map((project: Project) => (
            <div key={project.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{project.name}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  project.status === 'Active' ? 'bg-green-100 text-green-800' :
                  project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
              
              {project.description && (
                <p className="text-gray-600 text-sm mb-2">{project.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Progress:</span> {project.completion_percentage}%
                </div>
                <div>
                  <span className="font-medium">SVP:</span> {project.svp_name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Next Milestone:</span> {project.next_milestone || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Compliance:</span> 
                  <span className={`ml-1 ${
                    project.compliance_status === 'Compliant' ? 'text-green-600' :
                    project.compliance_status === 'Non-Compliant' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {project.compliance_status}
                  </span>
                </div>
              </div>
              
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.completion_percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
