# 🚀 Quick Start Guide - Dashboard Template

Get your industry-specific dashboard up and running in minutes!

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ running
- Basic understanding of YAML configuration
- Your industry data sources ready

## ⚡ 5-Minute Setup

### Step 1: Choose Your Industry Template
```bash
# Available templates:
ls dashboard-template/config/industries/

# Copy template for your industry
cp dashboard-template/config/industries/template.yaml dashboard-template/config/industries/my-industry.yaml
```

### Step 2: Configure Your Data Sources
Edit `dashboard-template/config/industries/my-industry.yaml`:

```yaml
# Update metadata
metadata:
  name: "My Industry Dashboard"
  industry: "my-industry"

# Configure your data sources
dataSources:
  primary-data:
    type: "database"
    connection: "postgresql://user:pass@localhost:5432/mydb"
    table: "my_metrics"
    
# Customize dashboard sections
dashboard:
  title: "My Industry Operations"
  sections:
    - id: "key-metrics"
      component: "MetricCards"
      title: "Key Performance Indicators"
      dataSource: "primary-data"
```

### Step 3: Set Environment Variables
```bash
# Create environment file
cp dashboard-template/.env.example dashboard-template/.env

# Edit with your values
export DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
export API_BASE="https://api.mycompany.com"
export INDUSTRY_CONFIG="my-industry"
```

### Step 4: Launch Your Dashboard
```bash
cd dashboard-template
npm install
npm run dev
```

🎉 **Your dashboard is now running at http://localhost:3000**

## 🎨 Customization Examples

### Change Theme Colors
```yaml
theme:
  colors:
    primary: "#your-brand-color"
    secondary: "#your-accent-color"
```

### Add Custom Metrics
```yaml
businessRules:
  calculations:
    - name: "my-custom-metric"
      formula: "field1 / field2 * 100"
      format: "percentage"
```

### Configure Alerts
```yaml
businessRules:
  alerts:
    - name: "threshold-alert"
      condition: "my_metric > 90"
      severity: "warning"
      message: "Metric exceeding threshold"
```

## 📊 Industry Examples

### Healthcare Dashboard
```bash
# Use healthcare template
export INDUSTRY_CONFIG="healthcare"
npm run dev
```
Features: Patient flow, bed occupancy, staff utilization, quality metrics

### Banking Dashboard (Reference)
```bash
# Use banking template (based on original)
export INDUSTRY_CONFIG="banking"
npm run dev
```
Features: Risk analytics, compliance monitoring, budget tracking

## 🔧 Advanced Configuration

### Custom Components
1. Create component in `plugins/my-industry/components/`
2. Register in plugin index
3. Reference in config YAML

### Data Source Types
- `database`: PostgreSQL, MySQL, etc.
- `api`: REST APIs
- `websocket`: Real-time streams
- `kafka`: Message queues
- `file`: CSV, JSON files

### Real-time Features
```yaml
dataSources:
  live-data:
    type: "websocket"
    url: "ws://localhost:8080/live"
    realTime: true
```

## 🚨 Troubleshooting

### Common Issues

**Dashboard not loading?**
- Check database connection
- Verify environment variables
- Check console for errors

**Data not showing?**
- Verify data source configuration
- Check API endpoints
- Review query syntax

**Styling issues?**
- Clear browser cache
- Check theme configuration
- Verify CSS variables

### Getting Help

1. **Documentation**: [White Paper](./DASHBOARD_TEMPLATE_WHITEPAPER.md)
2. **Examples**: Check `examples/` directory
3. **Issues**: Create GitHub issue with config file

## 📈 Next Steps

1. **Add More Data Sources**: Connect additional APIs/databases
2. **Create Custom Components**: Build industry-specific widgets
3. **Set Up Alerts**: Configure business rule notifications
4. **Deploy to Production**: Use Docker/Kubernetes configs
5. **Add Team Members**: Configure user roles and permissions

## 🔄 Migration from Existing Dashboard

If you have an existing dashboard:

1. **Export Data Schema**: Document your current data structure
2. **Map to Template**: Create field mappings in config
3. **Test with Sample Data**: Verify functionality
4. **Gradual Migration**: Move sections one by one
5. **Go Live**: Switch traffic to new dashboard

---

**Need help?** Check the [White Paper](./DASHBOARD_TEMPLATE_WHITEPAPER.md) for detailed architecture and implementation guidance.
