# 📊 Multi-Industry Dashboard Template

A reusable, configurable dashboard template based on the proven Citi LATAM RegInsight Dashboard architecture. Transform your single-purpose dashboard into a multi-industry platform that can serve banking, healthcare, manufacturing, retail, and any other industry through configuration and plugins.

## 🎯 Quick Start

### 1. Choose Your Industry
```bash
# Set your target industry
export INDUSTRY_CONFIG=healthcare  # or banking, manufacturing, retail, etc.
```

### 2. Configure Your Dashboard
```bash
# Copy and customize industry configuration
cp config/industries/template.yaml config/industries/my-industry.yaml
# Edit the configuration file to match your needs
```

### 3. Deploy
```bash
# Build and run with your configuration
npm run build:industry $INDUSTRY_CONFIG
npm start
```

## 📁 Directory Structure

```
dashboard-template/
├── core/                          # Industry-agnostic foundation
│   ├── frontend/                  # Generic React components
│   ├── backend/                   # Abstract services and APIs
│   └── shared/                    # Common types and utilities
├── plugins/                       # Industry-specific extensions
│   ├── banking/                   # Banking industry plugin
│   ├── healthcare/                # Healthcare industry plugin
│   └── template/                  # Template for new industries
├── config/                        # Configuration system
│   ├── industries/                # Industry-specific configs
│   ├── schemas/                   # Validation schemas
│   └── examples/                  # Example configurations
├── docs/                          # Documentation
└── examples/                      # Working examples
```

## 🔧 Core Features

### ✅ **Preserved from Original**
- Real-time analytics and streaming data
- AI-powered insights and predictions
- Advanced data visualization
- WebSocket integration
- ETL pipelines
- Comprehensive testing suite
- Production-ready deployment

### ✅ **New Template Features**
- **Plugin Architecture**: Industry-specific extensions
- **Configuration-Driven**: JSON/YAML-based setup
- **Data Agnostic**: Support for any data source
- **Theme System**: Customizable branding
- **Multi-Tenant**: Run multiple industries simultaneously

## 🚀 Supported Industries

| Industry | Status | Components | Data Sources |
|----------|--------|------------|--------------|
| Banking | ✅ Complete | Risk, Compliance, Budget | PostgreSQL, Kafka |
| Healthcare | 🚧 In Progress | Patient Flow, Occupancy | HL7, FHIR APIs |
| Manufacturing | 📋 Planned | OEE, Quality, Inventory | IoT, MQTT, ERP |
| Retail | 📋 Planned | Sales, Inventory, Customer | POS, Analytics APIs |

## 📖 Documentation

- **[White Paper](./DASHBOARD_TEMPLATE_WHITEPAPER.md)**: Complete architecture guide
- **[API Reference](./docs/api-reference.md)**: Backend API documentation
- **[Component Library](./docs/components.md)**: Frontend component guide
- **[Plugin Development](./docs/plugin-development.md)**: Creating new industry plugins

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis (optional, for caching)

### Setup
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Initialize database
npm run db:setup

# Start development server
npm run dev
```

### Creating a New Industry Plugin

1. **Generate Plugin Structure**
   ```bash
   npm run create:plugin my-industry
   ```

2. **Configure Industry Settings**
   ```bash
   # Edit config/industries/my-industry.yaml
   # Define dashboard layout, data sources, business rules
   ```

3. **Develop Custom Components**
   ```bash
   # Create components in plugins/my-industry/components/
   # Implement industry-specific logic
   ```

4. **Test and Deploy**
   ```bash
   npm run test:plugin my-industry
   npm run build:industry my-industry
   ```

## 🎨 Customization

### Themes
```yaml
# In your industry config
theme:
  colors:
    primary: "#your-brand-color"
    secondary: "#your-accent-color"
  typography:
    fontFamily: "Your Brand Font"
```

### Data Sources
```yaml
dataSources:
  my-data:
    type: "database"  # or "api", "kafka", "file"
    connection: "${DATABASE_URL}"
    query: "SELECT * FROM my_table"
```

### Business Rules
```yaml
businessRules:
  calculations:
    - name: "my-metric"
      formula: "field1 / field2 * 100"
  alerts:
    - name: "threshold-alert"
      condition: "my_metric > 90"
      severity: "warning"
```

## 🔄 Migration from Original

Your original Citi LATAM RegInsight Dashboard remains completely untouched. This template is a separate, abstracted version that preserves all functionality while adding configurability.

### Key Differences
- **Original**: Banking-specific, hard-coded
- **Template**: Industry-agnostic, configurable
- **Migration**: Zero impact on existing application

## 📊 Performance

- **Build Time**: ~2-3 minutes per industry
- **Bundle Size**: ~500KB core + ~100KB per plugin
- **Memory Usage**: ~256MB base + ~64MB per industry
- **Startup Time**: ~5-10 seconds

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [White Paper](./DASHBOARD_TEMPLATE_WHITEPAPER.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Built with ❤️ based on the proven Citi LATAM RegInsight Dashboard**
