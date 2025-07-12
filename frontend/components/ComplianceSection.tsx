"use client";

import { useEffect, useState } from "react";
import SectionCard from "./SectionCard";

interface ComplianceMetric {
  metric: string;
  value: string;
}

export default function ComplianceSection() {
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompliance() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5050/api/compliance");
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (Array.isArray(data.data)) {
          setComplianceMetrics(data.data);
        } else {
          console.error("Unexpected compliance API response:", data);
          setComplianceMetrics([]);
        }
      } catch (err) {
        console.error("Failed to fetch compliance metrics:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch compliance metrics");
      } finally {
        setLoading(false);
      }
    }

    fetchCompliance();
  }, []);

  const getMetricStatusColor = (value: string): string => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('compliant') || lowerValue === 'yes') {
      return 'bg-green-50 border-green-300 text-green-700';
    } else if (lowerValue.includes('pending') || lowerValue.includes('review')) {
      return 'bg-yellow-50 border-yellow-300 text-yellow-700';
    } else if (lowerValue.includes('non-compliant') || lowerValue === 'no') {
      return 'bg-red-50 border-red-300 text-red-700';
    }
    return 'bg-gray-50 border-gray-300 text-gray-700';
  };

  const getMetricIcon = (metric: string): string => {
    const lowerMetric = metric.toLowerCase();
    if (lowerMetric.includes('audit')) {
      return '📋';
    } else if (lowerMetric.includes('kyc')) {
      return '🔍';
    } else if (lowerMetric.includes('aml')) {
      return '🛡️';
    } else if (lowerMetric.includes('compliance')) {
      return '✅';
    }
    return '📊';
  };

  const getStatusIcon = (value: string): string => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('compliant') || lowerValue === 'yes') {
      return '✅';
    } else if (lowerValue.includes('pending') || lowerValue.includes('review')) {
      return '⏳';
    } else if (lowerValue.includes('non-compliant') || lowerValue === 'no') {
      return '❌';
    }
    return '❓';
  };

  if (loading) {
    return (
      <SectionCard title="Compliance Status">
        <div className="text-center py-4">Loading compliance data...</div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Compliance Status">
        <div className="text-center py-4 text-red-600">Error: {error}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Compliance Status">
      {complianceMetrics.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No compliance data available</div>
      ) : (
        <div className="space-y-3">
          {complianceMetrics.map((metric, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getMetricStatusColor(metric.value)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getMetricIcon(metric.metric)}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{metric.metric}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getStatusIcon(metric.value)}</span>
                  <span className="font-medium">{metric.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
