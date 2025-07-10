#!/bin/bash

echo "🔧 Fixing all API endpoints to use localhost:5050..."

# Fix all remaining component files
sed -i '' 's/192\.168\.4\.25:5050/localhost:5050/g' frontend/components/ProjectsSection.tsx
sed -i '' 's/192\.168\.4\.25:5050/localhost:5050/g' frontend/components/ComplianceSection.tsx
sed -i '' 's/192\.168\.4\.25:5050/localhost:5050/g' frontend/components/ActivitiesSection.tsx
sed -i '' 's/192\.168\.4\.25:5050/localhost:5050/g' frontend/components/RiskSection.tsx
sed -i '' 's/192\.168\.4\.25:5050/localhost:5050/g' frontend/components/RiskAnalytics.tsx
sed -i '' 's/192\.168\.4\.25:5050/localhost:5050/g' frontend/components/ChatbotSection.tsx
sed -i '' 's/192\.168\.4\.25:5050/localhost:5050/g' frontend/components/ComplianceAnalytics.tsx
sed -i '' 's/192\.168\.4\.25:5050/localhost:5050/g' frontend/components/ProjectsAnalytics.tsx

echo "✅ All API endpoints updated to use localhost:5050"
echo "🔄 Please refresh your browser to see the changes!"
