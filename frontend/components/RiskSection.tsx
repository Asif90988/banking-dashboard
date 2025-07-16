"use client";

import { useEffect, useState } from "react";
import SectionCard from "./SectionCard";

interface Risk {
  risk_area: string;
  description: string;
}

export default function RiskSection() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRisks() {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
        const res = await fetch(`${API_BASE}/risk`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (Array.isArray(data)) {
          setRisks(data);
        } else if (Array.isArray(data.data)) {
          setRisks(data.data);
        } else {
          console.error("Unexpected risk API response:", data);
          setRisks([]);
        }
      } catch (err) {
        console.error("Failed to fetch risks:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch risks");
      } finally {
        setLoading(false);
      }
    }

    fetchRisks();
  }, []);

  const getRiskAreaColor = (riskArea: string): string => {
    switch (riskArea.toLowerCase()) {
      case 'cybersecurity':
        return 'bg-red-50 border-red-300 text-red-700';
      case 'regulatory compliance':
        return 'bg-yellow-50 border-yellow-300 text-yellow-700';
      case 'data governance':
        return 'bg-blue-50 border-blue-300 text-blue-700';
      case 'operational':
        return 'bg-orange-50 border-orange-300 text-orange-700';
      case 'financial':
        return 'bg-green-50 border-green-300 text-green-700';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  };

  const getRiskIcon = (riskArea: string): string => {
    switch (riskArea.toLowerCase()) {
      case 'cybersecurity':
        return '🔒';
      case 'regulatory compliance':
        return '📋';
      case 'data governance':
        return '📊';
      case 'operational':
        return '⚙️';
      case 'financial':
        return '💰';
      default:
        return '⚠️';
    }
  };

  if (loading) {
    return (
      <SectionCard title="Operational Risks">
        <div className="text-center py-4">Loading risks...</div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Operational Risks">
        <div className="text-center py-4 text-red-600">Error: {error}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Operational Risks">
      {risks.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No risks found</div>
      ) : (
        <ul className="space-y-3">
          {risks.map((risk: Risk, index: number) => (
            <li
              key={`${risk.risk_area}-${index}`}
              className={`p-4 border rounded-lg ${getRiskAreaColor(risk.risk_area)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">
                  {getRiskIcon(risk.risk_area)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{risk.risk_area}</div>
                  <div className="text-sm leading-relaxed">{risk.description}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
