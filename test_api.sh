#!/bin/bash

echo "🔍 Testing Citi Dashboard API Endpoints..."
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
echo "curl http://localhost:5050/api/health"
response=$(curl -s http://localhost:5050/api/health)
if [ $? -eq 0 ]; then
    echo "✅ Health endpoint working!"
    echo "Response: $response"
else
    echo "❌ Health endpoint failed!"
    echo "Backend server may not be running on port 5050"
fi
echo ""

# Test 2: Database Connection Check
echo "2️⃣ Testing Database Connection..."
db_exists=$(psql -l | grep citi_dashboard)
if [ -n "$db_exists" ]; then
    echo "✅ Database 'citi_dashboard' exists"
else
    echo "❌ Database 'citi_dashboard' does not exist"
    echo "Need to run: createdb citi_dashboard"
fi
echo ""

# Test 3: Database Tables Check
echo "3️⃣ Testing Database Tables..."
if psql -d citi_dashboard -c "\dt" > /dev/null 2>&1; then
    echo "✅ Database tables exist:"
    psql -d citi_dashboard -c "\dt" | grep -E "(activities|svps|projects|compliance_metrics|risk_issues)"
else
    echo "❌ Database tables do not exist or database not accessible"
    echo "Need to run: psql -d citi_dashboard -f database/schema.sql"
fi
echo ""

# Test 4: Data Check
echo "4️⃣ Testing Database Data..."
if psql -d citi_dashboard -c "SELECT COUNT(*) FROM activities;" > /dev/null 2>&1; then
    echo "✅ Activities table has data:"
    psql -d citi_dashboard -c "SELECT COUNT(*) FROM activities;"
    echo "✅ SVPs table has data:"
    psql -d citi_dashboard -c "SELECT COUNT(*) FROM svps;"
    echo "✅ Projects table has data:"
    psql -d citi_dashboard -c "SELECT COUNT(*) FROM projects;"
else
    echo "❌ Database tables have no data"
    echo "Need to run: psql -d citi_dashboard -f database/seed.sql"
fi
echo ""

# Test 5: API Endpoints
echo "5️⃣ Testing API Endpoints..."

echo "📊 Testing Budget API..."
budget_response=$(curl -s http://localhost:5050/api/budget/overview)
if [ $? -eq 0 ] && [ "$budget_response" != "" ]; then
    echo "✅ Budget API working!"
    echo "Response: $budget_response"
else
    echo "❌ Budget API failed!"
fi
echo ""

echo "📋 Testing Projects API..."
projects_response=$(curl -s http://localhost:5050/api/projects)
if [ $? -eq 0 ] && [ "$projects_response" != "" ]; then
    echo "✅ Projects API working!"
    echo "Response: $projects_response"
else
    echo "❌ Projects API failed!"
fi
echo ""

echo "🏃 Testing Activities API..."
activities_response=$(curl -s http://localhost:5050/api/activities)
if [ $? -eq 0 ] && [ "$activities_response" != "" ]; then
    echo "✅ Activities API working!"
    echo "Response: $activities_response"
else
    echo "❌ Activities API failed!"
fi
echo ""

echo "📋 Testing Compliance API..."
compliance_response=$(curl -s http://localhost:5050/api/compliance)
if [ $? -eq 0 ] && [ "$compliance_response" != "" ]; then
    echo "✅ Compliance API working!"
    echo "Response: $compliance_response"
else
    echo "❌ Compliance API failed!"
fi
echo ""

echo "⚠️  Testing Risk API..."
risk_response=$(curl -s http://localhost:5050/api/risk)
if [ $? -eq 0 ] && [ "$risk_response" != "" ]; then
    echo "✅ Risk API working!"
    echo "Response: $risk_response"
else
    echo "❌ Risk API failed!"
fi
echo ""

echo "🎯 SUMMARY:"
echo "If you see ❌ errors above, you need to:"
echo "1. Make sure backend server is running: cd backend && npm start"
echo "2. Set up database: ./setup_database.sh"
echo "3. If still failing, check server logs for database connection errors"
echo ""
echo "✨ If all tests pass, your dashboard should show real data!"
