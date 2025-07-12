"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the RealTimeAnalytics component for better performance
const RealTimeAnalytics = dynamic(
  () => import("../../components/analytics/RealTimeAnalytics"),
  { ssr: false }
);

const InsightsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 p-6">
    <RealTimeAnalytics />
  </div>
);

export default InsightsPage;
