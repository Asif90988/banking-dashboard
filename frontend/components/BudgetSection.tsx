"use client";

import { useEffect, useState } from "react";
import SectionCard from "./SectionCard";

interface BudgetOverview {
  total_allocated: number;
  total_spent: number;
  remaining: number;
  avg_utilization: number;
}

interface BudgetBySVP {
  id: number;
  name: string;
  department: string;
  budget_allocated: number;
  budget_spent: number;
  remaining: number;
  utilization_percentage: number;
  status: 'normal' | 'warning' | 'danger';
}

export default function BudgetSection() {
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [budgetBySVP, setBudgetBySVP] = useState<BudgetBySVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBudgetData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch budget overview
        const overviewRes = await fetch("http://localhost:5050/api/budget/overview");
        if (!overviewRes.ok) {
          throw new Error(`HTTP error! status: ${overviewRes.status}`);
        }
        const overviewData = await overviewRes.json();
        setBudgetOverview(overviewData);

        // Fetch budget by SVP
        const svpRes = await fetch("http://localhost:5050/api/budget/by-svp");
        if (!svpRes.ok) {
          throw new Error(`HTTP error! status: ${svpRes.status}`);
        }
        const svpData = await svpRes.json();
        
        // Deduplicate SVPs by name and aggregate their budget data
        const deduplicatedSVPs = Array.isArray(svpData) ? 
          svpData.reduce((acc: BudgetBySVP[], current: BudgetBySVP) => {
            const existingIndex = acc.findIndex(svp => svp.name === current.name);
            if (existingIndex >= 0) {
              // Aggregate budget data for duplicate SVPs - convert strings to numbers
              acc[existingIndex].budget_allocated = parseFloat(acc[existingIndex].budget_allocated.toString()) + parseFloat(current.budget_allocated.toString());
              acc[existingIndex].budget_spent = parseFloat(acc[existingIndex].budget_spent.toString()) + parseFloat(current.budget_spent.toString());
              acc[existingIndex].remaining = parseFloat(acc[existingIndex].remaining.toString()) + parseFloat(current.remaining.toString());
              acc[existingIndex].utilization_percentage = Math.round(
                (acc[existingIndex].budget_spent / acc[existingIndex].budget_allocated) * 100
              );
            } else {
              // Convert strings to numbers for new entries
              acc.push({ 
                ...current,
                budget_allocated: parseFloat(current.budget_allocated.toString()),
                budget_spent: parseFloat(current.budget_spent.toString()),
                remaining: parseFloat(current.remaining.toString()),
                utilization_percentage: Math.round(
                  (parseFloat(current.budget_spent.toString()) / parseFloat(current.budget_allocated.toString())) * 100
                )
              });
            }
            return acc;
          }, []) : [];
        
        setBudgetBySVP(deduplicatedSVPs);

      } catch (err) {
        console.error("Failed to fetch budget data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch budget data");
      } finally {
        setLoading(false);
      }
    }

    fetchBudgetData();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <SectionCard title="Budget Allocation">
        <div className="text-center py-4">Loading budget data...</div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Budget Allocation">
        <div className="text-center py-4 text-red-600">Error: {error}</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Budget Allocation">
      {/* Budget Overview */}
      {budgetOverview && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-3">Overall Budget Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(budgetOverview.total_allocated)}
              </div>
              <div className="text-sm text-gray-600">Total Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(budgetOverview.total_spent)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(budgetOverview.remaining)}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {budgetOverview.avg_utilization}%
              </div>
              <div className="text-sm text-gray-600">Avg Utilization</div>
            </div>
          </div>
        </div>
      )}

      {/* Budget by SVP */}
      <div>
        <h3 className="font-medium text-lg mb-3">Budget by SVP</h3>
        {budgetBySVP.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No budget data found</div>
        ) : (
          <div className="space-y-4">
            {budgetBySVP.map((svp: BudgetBySVP) => (
              <div key={svp.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{svp.name}</h4>
                    <p className="text-sm text-gray-600">{svp.department}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    svp.status === 'normal' ? 'bg-green-100 text-green-800' :
                    svp.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {svp.utilization_percentage}% Used
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="font-medium">Allocated:</span>
                    <div className="text-blue-600">{formatCurrency(svp.budget_allocated)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Spent:</span>
                    <div className="text-green-600">{formatCurrency(svp.budget_spent)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Remaining:</span>
                    <div className="text-orange-600">{formatCurrency(svp.remaining)}</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      svp.status === 'normal' ? 'bg-green-500' :
                      svp.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(svp.utilization_percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
