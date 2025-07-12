"use client";

import { useEffect, useState } from "react";
import SectionCard from "./SectionCard";

interface Activity {
  id: number;
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  created_at: string;
  svp_name: string;
  svp_department: string;
  project_name: string;
}

export default function ActivitiesSection() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5050/api/activities");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (Array.isArray(data)) {
          setActivities(data);
        } else if (Array.isArray(data.data)) {
          setActivities(data.data);
        } else {
          console.error("Unexpected activities API response:", data);
          setActivities([]);
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch activities");
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <SectionCard title="Activity Feed">
        <div className="text-center py-4">Loading activities...</div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Activity Feed">
        <div className="text-center py-4 text-red-600">Error: {error}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Activity Feed">
      {activities.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No activities found</div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: Activity) => (
            <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                      {activity.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {activity.description}
                  </p>
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  {formatDate(activity.created_at)}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {activity.svp_name && (
                  <div>
                    <span className="font-medium">SVP:</span> {activity.svp_name}
                    {activity.svp_department && ` (${activity.svp_department})`}
                  </div>
                )}
                {activity.project_name && (
                  <div>
                    <span className="font-medium">Project:</span> {activity.project_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
