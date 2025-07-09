#!/bin/bash

echo "🚀 Setting up Citi Dashboard Database..."
echo ""

# Create the database
echo "📂 Creating database 'citi_dashboard'..."
createdb citi_dashboard

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
else
    echo "❌ Database creation failed. It might already exist."
fi

echo ""

# Initialize the schema
echo "📋 Initializing database schema..."
psql -d citi_dashboard -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema initialized successfully!"
else
    echo "❌ Schema initialization failed."
    exit 1
fi

echo ""

# Insert seed data
echo "🌱 Inserting seed data..."
psql -d citi_dashboard -f database/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data inserted successfully!"
else
    echo "❌ Seed data insertion failed."
    exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo ""

# Test the setup
echo "🧪 Testing database setup..."
echo "Activities count:"
psql -d citi_dashboard -c "SELECT COUNT(*) FROM activities;"
echo ""
echo "SVPs count:"
psql -d citi_dashboard -c "SELECT COUNT(*) FROM svps;"
echo ""
echo "Compliance metrics count:"
psql -d citi_dashboard -c "SELECT COUNT(*) FROM compliance_metrics;"
echo ""
echo "Risk issues count:"
psql -d citi_dashboard -c "SELECT COUNT(*) FROM risk_issues;"
echo ""

echo "🚀 Now test your API endpoints:"
echo "curl http://localhost:5050/api/budget/overview"
echo "curl http://localhost:5050/api/activities"
echo "curl http://localhost:5050/api/compliance"
echo "curl http://localhost:5050/api/risk"
echo ""
echo "✨ Your dashboard should now show real data!"
