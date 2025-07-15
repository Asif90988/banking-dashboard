# 📊 Multi-Industry Dashboard Template: Architecture and Usage Guide

**Version**: 1.0  
**Date**: January 12, 2025  
**Based on**: Citi LATAM RegInsight Dashboard  
**Purpose**: Transform a single-purpose banking dashboard into a reusable template for any industry  

---

## 🎯 Executive Summary

This white paper presents a comprehensive architecture for converting the Citi LATAM RegInsight Dashboard into a **multi-industry dashboard template**. The template preserves all the sophisticated features of the original application (real-time analytics, AI integration, streaming data, compliance monitoring) while making it completely configurable for different industries such as healthcare, manufacturing, retail, logistics, and more.

### **Key Benefits:**
- ✅ **Preserve Investment**: Original banking dashboard remains untouched
- ✅ **Rapid Deployment**: New industry dashboards in days, not months
- ✅ **Consistent Quality**: Leverage proven architecture and components
- ✅ **Scalable**: Support unlimited industries through plugin architecture
- ✅ **Cost Effective**: Reuse 80% of code, customize 20% for industry specifics

---

## 🏗️ Architecture Overview

### **Core Design Principles**

#### **1. Separation of Concerns**
```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD TEMPLATE                       │
├─────────────────────────────────────────────────────────────┤
│  CORE LAYER (Industry Agnostic)                           │
│  • Generic Components (MetricCard, DataTable, Charts)      │
│  • Abstract Services (DataProvider, AnalyticsEngine)       │
│  • Base Infrastructure (Auth, Routing, WebSockets)         │
├─────────────────────────────────────────────────────────────┤
│  PLUGIN LAYER (Industry Specific)                         │
│  • Banking Plugin    • Healthcare Plugin                   │
│  • Manufacturing    • Retail Plugin                        │
│  • Custom Plugins   • Future Industries                    │
├─────────────────────────────────────────────────────────────┤
│  CONFIG LAYER (Declarative)                               │
│  • Industry Schemas • Data Mappings                        │
│  • UI Layouts       • Business Rules                       │
│  • Themes          • API Endpoints                         │
└─────────────────────────────────────────────────────────────┘
```

#### **2. Configuration-Driven Architecture**
Instead of hard-coding industry specifics, everything is driven by JSON/YAML configuration files:

```json
{
  "industry": "healthcare",
  "dashboard": {
    "title": "Hospital Operations Dashboard",
    "sections": [
      {
        "id": "patient-metrics",
        "component": "MetricAnalytics",
        "dataSource": "patient-data",
        "title": "Patient Flow",
        "icon": "users"
      }
    ]
  },
  "dataSources": {
    "patient-data": {
      "type": "database",
      "connection": "postgresql://...",
      "table": "patient_metrics"
    }
  }
}
```

#### **3. Plugin System**
Each industry is implemented as a plugin that extends the core functionality:

```typescript
interface IndustryPlugin {
  name: string;
  version: string;
  components: ComponentRegistry;
  services: ServiceRegistry;
  dataTransformers: TransformerRegistry;
  businessRules: RuleEngine;
}
```

---

## 🔧 Technical Architecture

### **Frontend Architecture**

#### **Core Components (Industry Agnostic)**
```typescript
// Generic metric display component
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  format?: 'currency' | 'percentage' | 'number';
  threshold?: {
    warning: number;
    critical: number;
  };
}

// Generic data table component
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  filters?: FilterConfig[];
  pagination?: PaginationConfig;
  realTime?: boolean;
}

// Generic analytics chart
interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataPoint[];
  config: ChartConfiguration;
  realTime?: boolean;
}
```

#### **Plugin Components (Industry Specific)**
```typescript
// Banking Plugin Components
export const BankingComponents = {
  RiskScoreCard: (props) => <MetricCard {...props} format="percentage" />,
  ComplianceTable: (props) => <DataTable {...props} />,
  BudgetChart: (props) => <AnalyticsChart {...props} type="bar" />
};

// Healthcare Plugin Components
export const HealthcareComponents = {
  PatientFlowCard: (props) => <MetricCard {...props} format="number" />,
  AppointmentTable: (props) => <DataTable {...props} />,
  OccupancyChart: (props) => <AnalyticsChart {...props} type="line" />
};
```

### **Backend Architecture**

#### **Abstract Data Layer**
```typescript
interface DataProvider {
  connect(): Promise<void>;
  query(query: QueryDefinition): Promise<any[]>;
  stream(topic: string): Observable<any>;
  disconnect(): Promise<void>;
}

class DatabaseProvider implements DataProvider {
  // PostgreSQL implementation
}

class APIProvider implements DataProvider {
  // REST API implementation
}

class StreamProvider implements DataProvider {
  // Kafka/WebSocket implementation
}
```

#### **Business Logic Abstraction**
```typescript
interface MetricCalculator {
  calculate(data: any[], config: CalculationConfig): MetricResult;
}

class BankingRiskCalculator implements MetricCalculator {
  calculate(data: TransactionData[], config: RiskConfig): RiskScore {
    // Banking-specific risk calculation
  }
}

class HealthcareUtilizationCalculator implements MetricCalculator {
  calculate(data: PatientData[], config: UtilizationConfig): UtilizationRate {
    // Healthcare-specific utilization calculation
  }
}
```

### **Configuration System**

#### **Industry Configuration Schema**
```typescript
interface IndustryConfig {
  metadata: {
    name: string;
    version: string;
    description: string;
  };
  
  dashboard: {
    layout: LayoutConfig;
    sections: SectionConfig[];
    navigation: NavigationConfig;
  };
  
  dataSources: {
    [key: string]: DataSourceConfig;
  };
  
  businessRules: {
    calculations: CalculationRule[];
    validations: ValidationRule[];
    alerts: AlertRule[];
  };
  
  theme: {
    colors: ColorPalette;
    typography: TypographyConfig;
    spacing: SpacingConfig;
  };
  
  integrations: {
    apis: APIConfig[];
    webhooks: WebhookConfig[];
    exports: ExportConfig[];
  };
}
```

---

## 📋 Step-by-Step Implementation Guide

### **Phase 1: Core Template Setup (Week 1)**

#### **Day 1-2: Project Structure**
```bash
dashboard-template/
├── core/                          # Industry-agnostic code
│   ├── frontend/
│   │   ├── components/            # Generic UI components
│   │   ├── hooks/                 # Reusable React hooks
│   │   ├── services/              # Frontend services
│   │   └── utils/                 # Utility functions
│   ├── backend/
│   │   ├── routes/                # Generic API routes
│   │   ├── services/              # Abstract services
│   │   ├── middleware/            # Common middleware
│   │   └── utils/                 # Backend utilities
│   └── shared/
│       ├── types/                 # TypeScript interfaces
│       ├── schemas/               # Data validation schemas
│       └── constants/             # Shared constants
├── plugins/                       # Industry-specific extensions
│   ├── banking/                   # Banking industry plugin
│   ├── healthcare/                # Healthcare industry plugin
│   └── manufacturing/             # Manufacturing industry plugin
├── config/                        # Configuration templates
│   ├── industries/                # Industry-specific configs
│   ├── schemas/                   # Config validation schemas
│   └── examples/                  # Example configurations
├── docs/                          # Documentation
└── examples/                      # Working examples
```

#### **Day 3-4: Core Component Abstraction**
1. **Extract Generic Components**
   ```typescript
   // From BudgetAnalytics.tsx → MetricAnalytics.tsx
   interface MetricAnalyticsProps {
     metricType: string;
     dataSource: string;
     title: string;
     config: AnalyticsConfig;
   }
   ```

2. **Create Component Registry**
   ```typescript
   class ComponentRegistry {
     private components = new Map<string, React.ComponentType>();
     
     register(name: string, component: React.ComponentType) {
       this.components.set(name, component);
     }
     
     get(name: string): React.ComponentType | undefined {
       return this.components.get(name);
     }
   }
   ```

#### **Day 5-7: Backend Service Abstraction**
1. **Abstract Data Services**
   ```typescript
   // From specific routes → generic metric routes
   router.get('/metrics/:type', async (req, res) => {
     const { type } = req.params;
     const config = await ConfigService.getMetricConfig(type);
     const data = await DataProvider.query(config.query);
     res.json(data);
   });
   ```

2. **Create Plugin Loader**
   ```typescript
   class PluginLoader {
     async loadPlugin(industryName: string): Promise<IndustryPlugin> {
       const pluginPath = `./plugins/${industryName}`;
       return await import(pluginPath);
     }
   }
   ```

### **Phase 2: Configuration System (Week 2)**

#### **Day 1-3: Config Schema Design**
```yaml
# config/industries/healthcare.yaml
metadata:
  name: "Healthcare Operations"
  version: "1.0.0"
  description: "Hospital and clinic management dashboard"

dashboard:
  title: "Healthcare Operations Dashboard"
  sections:
    - id: "patient-flow"
      component: "MetricAnalytics"
      title: "Patient Flow"
      dataSource: "patient-metrics"
      position: { row: 1, col: 1, span: 2 }
      
    - id: "bed-occupancy"
      component: "OccupancyChart"
      title: "Bed Occupancy"
      dataSource: "bed-data"
      position: { row: 1, col: 3, span: 1 }

dataSources:
  patient-metrics:
    type: "database"
    connection: "${DB_CONNECTION}"
    query: "SELECT * FROM patient_flow WHERE date >= NOW() - INTERVAL '24 hours'"
    
  bed-data:
    type: "api"
    endpoint: "${API_BASE}/beds/occupancy"
    refreshInterval: 300000  # 5 minutes

businessRules:
  calculations:
    - name: "occupancy-rate"
      formula: "(occupied_beds / total_beds) * 100"
      
  alerts:
    - name: "high-occupancy"
      condition: "occupancy_rate > 90"
      severity: "warning"
      message: "Hospital approaching capacity"

theme:
  colors:
    primary: "#2563eb"    # Healthcare blue
    secondary: "#059669"  # Medical green
    warning: "#d97706"
    danger: "#dc2626"
```

#### **Day 4-5: Config Validation**
```typescript
import Joi from 'joi';

const IndustryConfigSchema = Joi.object({
  metadata: Joi.object({
    name: Joi.string().required(),
    version: Joi.string().required(),
    description: Joi.string().required()
  }).required(),
  
  dashboard: Joi.object({
    title: Joi.string().required(),
    sections: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        component: Joi.string().required(),
        title: Joi.string().required(),
        dataSource: Joi.string().required()
      })
    )
  }).required()
  
  // ... more validation rules
});
```

#### **Day 6-7: Dynamic Loading System**
```typescript
class ConfigLoader {
  async loadIndustryConfig(industry: string): Promise<IndustryConfig> {
    const configPath = `./config/industries/${industry}.yaml`;
    const rawConfig = await fs.readFile(configPath, 'utf8');
    const config = yaml.parse(rawConfig);
    
    // Validate configuration
    const { error, value } = IndustryConfigSchema.validate(config);
    if (error) throw new Error(`Invalid config: ${error.message}`);
    
    return value;
  }
}
```

### **Phase 3: Plugin Development (Week 3)**

#### **Day 1-3: Banking Plugin (Reference Implementation)**
```typescript
// plugins/banking/index.ts
export const BankingPlugin: IndustryPlugin = {
  name: 'banking',
  version: '1.0.0',
  
  components: {
    'RiskAnalytics': RiskAnalyticsComponent,
    'ComplianceMonitor': ComplianceMonitorComponent,
    'BudgetTracker': BudgetTrackerComponent
  },
  
  services: {
    'risk-calculator': BankingRiskCalculator,
    'compliance-checker': ComplianceChecker
  },
  
  dataTransformers: {
    'transaction-data': TransactionDataTransformer,
    'risk-data': RiskDataTransformer
  },
  
  businessRules: {
    calculations: [
      {
        name: 'risk-score',
        formula: 'calculateBankingRisk(transactions, thresholds)'
      }
    ]
  }
};
```

#### **Day 4-5: Healthcare Plugin (New Implementation)**
```typescript
// plugins/healthcare/index.ts
export const HealthcarePlugin: IndustryPlugin = {
  name: 'healthcare',
  version: '1.0.0',
  
  components: {
    'PatientFlow': PatientFlowComponent,
    'BedOccupancy': BedOccupancyComponent,
    'StaffUtilization': StaffUtilizationComponent
  },
  
  services: {
    'patient-calculator': PatientFlowCalculator,
    'resource-optimizer': ResourceOptimizer
  },
  
  dataTransformers: {
    'patient-data': PatientDataTransformer,
    'staff-data': StaffDataTransformer
  },
  
  businessRules: {
    calculations: [
      {
        name: 'occupancy-rate',
        formula: 'calculateOccupancy(beds, patients)'
      }
    ]
  }
};
```

#### **Day 6-7: Plugin Registration System**
```typescript
class PluginManager {
  private plugins = new Map<string, IndustryPlugin>();
  
  async registerPlugin(plugin: IndustryPlugin) {
    // Validate plugin structure
    this.validatePlugin(plugin);
    
    // Register components
    plugin.components.forEach((component, name) => {
      ComponentRegistry.register(name, component);
    });
    
    // Register services
    plugin.services.forEach((service, name) => {
      ServiceRegistry.register(name, service);
    });
    
    this.plugins.set(plugin.name, plugin);
  }
  
  getPlugin(name: string): IndustryPlugin | undefined {
    return this.plugins.get(name);
  }
}
```

### **Phase 4: Data Abstraction (Week 4)**

#### **Day 1-3: Universal Data Pipeline**
```typescript
interface DataPipeline {
  extract(source: DataSourceConfig): Promise<RawData[]>;
  transform(data: RawData[], rules: TransformationRule[]): Promise<ProcessedData[]>;
  load(data: ProcessedData[], target: DataTargetConfig): Promise<void>;
}

class UniversalETL implements DataPipeline {
  async extract(source: DataSourceConfig): Promise<RawData[]> {
    const extractor = ExtractorFactory.create(source.type);
    return await extractor.extract(source);
  }
  
  async transform(data: RawData[], rules: TransformationRule[]): Promise<ProcessedData[]> {
    let result = data;
    
    for (const rule of rules) {
      const transformer = TransformerFactory.create(rule.type);
      result = await transformer.transform(result, rule.config);
    }
    
    return result;
  }
}
```

#### **Day 4-5: Schema Mapping System**
```typescript
interface SchemaMapper {
  map(data: any[], mapping: FieldMapping[]): any[];
}

class UniversalSchemaMapper implements SchemaMapper {
  map(data: any[], mapping: FieldMapping[]): any[] {
    return data.map(record => {
      const mapped = {};
      
      mapping.forEach(field => {
        mapped[field.target] = this.extractValue(record, field.source);
      });
      
      return mapped;
    });
  }
  
  private extractValue(record: any, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], record);
  }
}
```

#### **Day 6-7: Real-time Data Streaming**
```typescript
class UniversalStreamProcessor {
  private streams = new Map<string, Observable<any>>();
  
  createStream(config: StreamConfig): Observable<any> {
    const provider = StreamProviderFactory.create(config.type);
    const stream = provider.connect(config);
    
    return stream.pipe(
      map(data => this.transformData(data, config.transformations)),
      filter(data => this.validateData(data, config.schema))
    );
  }
  
  subscribeToStream(streamId: string, callback: (data: any) => void) {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.subscribe(callback);
    }
  }
}
```

---

## 🎨 Theming and Customization

### **Dynamic Theme System**
```typescript
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
  spacing: {
    unit: number;
    small: string;
    medium: string;
    large: string;
  };
}

class ThemeManager {
  applyTheme(config: ThemeConfig) {
    // Generate CSS custom properties
    const cssVars = this.generateCSSVariables(config);
    
    // Inject into document
    const style = document.createElement('style');
    style.textContent = `:root { ${cssVars} }`;
    document.head.appendChild(style);
  }
  
  private generateCSSVariables(config: ThemeConfig): string {
    return Object.entries(config.colors)
      .map(([key, value]) => `--color-${key}: ${value};`)
      .join('\n');
  }
}
```

### **Component Styling**
```scss
// Core component styles using CSS variables
.metric-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  
  &--primary {
    border-color: var(--color-primary);
  }
  
  &--warning {
    border-color: var(--color-warning);
  }
}
```

---

## 📊 Industry-Specific Examples

### **Example 1: Healthcare Dashboard**

#### **Configuration**
```yaml
# config/industries/healthcare.yaml
metadata:
  name: "Healthcare Operations"
  industry: "healthcare"

dashboard:
  sections:
    - id: "patient-metrics"
      component: "PatientFlow"
      title: "Patient Flow"
      metrics:
        - "admissions_today"
        - "discharges_today"
        - "current_occupancy"
        
    - id: "staff-utilization"
      component: "StaffMetrics"
      title: "Staff Utilization"
      metrics:
        - "nurses_on_duty"
        - "doctors_available"
        - "utilization_rate"

dataSources:
  patient-data:
    type: "database"
    table: "patient_admissions"
    realTime: true
    
  staff-data:
    type: "api"
    endpoint: "/api/staff/current"
    refreshInterval: 300000

businessRules:
  alerts:
    - name: "high-occupancy"
      condition: "occupancy_rate > 85"
      severity: "warning"
      
    - name: "staff-shortage"
      condition: "nurses_on_duty < minimum_required"
      severity: "critical"

theme:
  colors:
    primary: "#2563eb"    # Medical blue
    secondary: "#059669"  # Health green
    warning: "#f59e0b"
    critical: "#ef4444"
```

#### **Custom Components**
```typescript
// plugins/healthcare/components/PatientFlow.tsx
export const PatientFlow: React.FC<PatientFlowProps> = ({ config, data }) => {
  const metrics = useMetrics(data, config.calculations);
  
  return (
    <div className="patient-flow-container">
      <MetricCard
        title="Current Patients"
        value={metrics.currentPatients}
        trend={metrics.trend}
        threshold={{ warning: 80, critical: 95 }}
      />
      
      <AnalyticsChart
        type="line"
        data={metrics.flowData}
        config={{
          xAxis: 'time',
          yAxis: 'patient_count',
          realTime: true
        }}
      />
    </div>
  );
};
```

### **Example 2: Manufacturing Dashboard**

#### **Configuration**
```yaml
# config/industries/manufacturing.yaml
metadata:
  name: "Manufacturing Operations"
  industry: "manufacturing"

dashboard:
  sections:
    - id: "production-metrics"
      component: "ProductionLine"
      title: "Production Efficiency"
      
    - id: "quality-control"
      component: "QualityMetrics"
      title: "Quality Control"
      
    - id: "inventory-status"
      component: "InventoryTracker"
      title: "Inventory Status"

dataSources:
  production-data:
    type: "iot"
    protocol: "mqtt"
    topics: ["production/line1", "production/line2"]
    
  quality-data:
    type: "database"
    table: "quality_checks"
    
  inventory-data:
    type: "erp"
    system: "sap"
    module: "inventory"

businessRules:
  calculations:
    - name: "oee"
      formula: "availability * performance * quality"
      
  alerts:
    - name: "low-efficiency"
      condition: "oee < 75"
      severity: "warning"
      
    - name: "quality-issue"
      condition: "defect_rate > 2"
      severity: "critical"
```

---

## 🚀 Deployment and Scaling

### **Docker Configuration**
```dockerfile
# Dockerfile.template
FROM node:18-alpine

WORKDIR /app

# Copy core template
COPY dashboard-template/core ./core
COPY dashboard-template/config ./config

# Copy industry-specific plugin (configurable)
ARG INDUSTRY=banking
COPY dashboard-template/plugins/${INDUSTRY} ./plugins/current

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
RUN npm run build

EXPOSE 3000 5000

CMD ["npm", "start"]
```

### **Docker Compose for Multi-Industry**
```yaml
# docker-compose.yml
version: '3.8'

services:
  banking-dashboard:
    build:
      context: .
      dockerfile: Dockerfile.template
      args:
        INDUSTRY: banking
    environment:
      - INDUSTRY_CONFIG=banking
      - DATABASE_URL=postgresql://...
    ports:
      - "3001:3000"
      
  healthcare-dashboard:
    build:
      context: .
      dockerfile: Dockerfile.template
      args:
        INDUSTRY: healthcare
    environment:
      - INDUSTRY_CONFIG=healthcare
      - DATABASE_URL=postgresql://...
    ports:
      - "3002:3000"
      
  manufacturing-dashboard:
    build:
      context: .
      dockerfile: Dockerfile.template
      args:
        INDUSTRY: manufacturing
    environment:
      - INDUSTRY_CONFIG=manufacturing
      - DATABASE_URL=postgresql://...
    ports:
      - "3003:3000"
```

### **Kubernetes Deployment**
```yaml
# k8s/dashboard-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dashboard-template
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dashboard-template
  template:
    metadata:
      labels:
        app: dashboard-template
    spec:
      containers:
      - name: dashboard
        image: dashboard-template:latest
        env:
        - name: INDUSTRY_CONFIG
          valueFrom:
            configMapKeyRef:
              name: dashboard-config
              key: industry
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📋 Step-by-Step Usage Guide: Building a New Dashboard

### **Scenario: Creating a Retail Dashboard**

#### **Step 1: Initialize New Industry Plugin**
```bash
# Create plugin structure
mkdir -p dashboard-template/plugins/retail/{components,services,config}

# Copy template files
cp dashboard-template/plugins/banking/package.json dashboard-template/plugins/retail/
cp dashboard-template/config/industries/banking.yaml dashboard-template/config/industries/retail.yaml
```

#### **Step 2: Configure Industry Settings**
```yaml
# config/industries/retail.yaml
metadata:
  name: "Retail Operations"
  industry: "retail"
  version: "1.0.0"

dashboard:
  title: "Retail Operations Dashboard"
  sections:
    - id: "sales-metrics"
      component: "SalesAnalytics"
      title: "Sales Performance"
      dataSource: "sales-data"
      
    - id: "inventory-status"
      component: "InventoryMetrics"
      title: "Inventory Status"
      dataSource: "inventory-data"
      
    - id: "customer-analytics"
      component: "CustomerMetrics"
      title: "Customer Analytics"
      dataSource: "customer-data"

dataSources:
  sales-data:
    type: "database"
    connection: "${RETAIL_DB_URL}"
    table: "daily_sales"
    
  inventory-data:
    type: "api"
    endpoint: "${INVENTORY_API}/current"
    
  customer-data:
    type: "analytics"
    provider: "google-analytics"
    metrics: ["sessions", "conversions", "revenue"]

businessRules:
  calculations:
    - name: "conversion-rate"
      formula: "(conversions / sessions) * 100"
      
  alerts:
    - name: "low-inventory"
      condition: "stock_level < reorder_point"
      severity: "warning"

theme:
  colors:
    primary: "#7c3aed"    # Retail purple
    secondary: "#059669"  # Success green
    warning: "#f59e0b"
    danger: "#ef4444"
```

#### **Step 3: Create Custom Components**
```typescript
// plugins/retail/components/SalesAnalytics.tsx
import { MetricCard, AnalyticsChart } from '../../../core/frontend/components';

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ data, config }) => {
  const salesMetrics = useSalesCalculations(data);
  
  return (
    <div className="sales-analytics">
      <div className="metrics-grid">
        <MetricCard
          title="Today's Sales"
          value={salesMetrics.todaySales}
          format="currency"
          trend={salesMetrics.salesTrend}
        />
        
        <MetricCard
          title="Conversion Rate"
          value={salesMetrics.conversionRate}
          format="percentage"
          threshold={{ warning: 2, critical: 1 }}
        />
        
        <MetricCard
          title="Average Order Value"
          value={salesMetrics.averageOrderValue}
          format="currency"
          trend={salesMetrics.aovTrend}
        />
      </div>
      
      <AnalyticsChart
        type="line"
        data={salesMetrics.hourlyData}
        config={{
          title: "Hourly Sales Trend",
          xAxis: "hour",
          yAxis: "sales_amount"
        }}
      />
    </div>
  );
};
```

#### **Step 4: Implement Business Logic**
```typescript
// plugins/retail/services/SalesCalculator.ts
export class RetailSalesCalculator implements MetricCalculator {
  calculate(data: SalesData[], config: SalesConfig): SalesMetrics {
    const todaySales = this.calculateDailySales(data);
    const conversionRate = this.calculateConversionRate(data);
    const averageOrderValue = this.calculateAOV(data);
    
    return {
      todaySales,
      conversionRate,
      averageOrderValue,
      trend: this.calculateTrend(data),
      hourlyData: this.groupByHour(data)
    };
  }
  
  private calculateDailySales(data: SalesData[]): number {
    const today = new Date().toDateString();
    return data
      .filter(sale => new Date(sale.timestamp).toDateString() === today)
      .reduce((sum, sale) => sum + sale.amount, 0);
  }
  
  private calculateConversionRate(data: SalesData[]): number {
    const sessions = data.length;
    const conversions = data.filter(sale => sale.converted).length;
    return (conversions / sessions) * 100;
  }
}
```

#### **Step 5: Register Plugin**
```typescript
// plugins/retail/index.ts
import { SalesAnalytics, InventoryMetrics, CustomerMetrics } from './components';
import { RetailSalesCalculator, InventoryOptimizer } from './services';

export const RetailPlugin: IndustryPlugin = {
  name: 'retail',
  version: '1.0.0',
  
  components: {
    'SalesAnalytics': SalesAnalytics,
    'InventoryMetrics': InventoryMetrics,
    'CustomerMetrics': CustomerMetrics
  },
  
  services: {
    'sales-calculator': RetailSalesCalculator,
    'inventory-optimizer': InventoryOptimizer
  },
  
  dataTransformers: {
    'sales-data': SalesDataTransformer,
    'inventory-data': InventoryDataTransformer
  }
};
```

#### **Step 6: Test and Deploy**
```bash
# Set environment for retail
export INDUSTRY_CONFIG=retail
export RETAIL
