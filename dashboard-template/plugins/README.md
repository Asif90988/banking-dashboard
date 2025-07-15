# Industry Plugins

This directory contains industry-specific extensions that customize the core dashboard template for different sectors.

## Available Plugins

### Banking Plugin (Reference Implementation)
- **Location**: `plugins/banking/`
- **Status**: ✅ Complete (based on original Citi dashboard)
- **Components**: Risk analytics, compliance monitoring, budget tracking
- **Data Sources**: PostgreSQL, Kafka streams, regulatory APIs

### Healthcare Plugin
- **Location**: `plugins/healthcare/`
- **Status**: 🚧 In Development
- **Components**: Patient flow, bed occupancy, staff utilization
- **Data Sources**: Hospital information systems, HL7/FHIR APIs

### Template Plugin
- **Location**: `plugins/template/`
- **Status**: 📋 Template for new industries
- **Purpose**: Starting point for creating new industry plugins

## Plugin Structure

```
plugins/[industry]/
├── index.ts           # Plugin registration and exports
├── components/        # Industry-specific React components
├── services/          # Business logic and calculations
├── config/           # Default configurations
├── types/            # TypeScript interfaces
├── utils/            # Utility functions
└── README.md         # Plugin documentation
```

## Creating a New Plugin

1. **Copy Template**
   ```bash
   cp -r plugins/template plugins/my-industry
   ```

2. **Update Plugin Metadata**
   ```typescript
   // plugins/my-industry/index.ts
   export const MyIndustryPlugin: IndustryPlugin = {
     name: 'my-industry',
     version: '1.0.0',
     components: { ... },
     services: { ... }
   };
   ```

3. **Create Industry Components**
   ```typescript
   // plugins/my-industry/components/MyMetrics.tsx
   export const MyMetrics: React.FC = ({ data, config }) => {
     // Industry-specific component logic
   };
   ```

4. **Implement Business Logic**
   ```typescript
   // plugins/my-industry/services/MyCalculator.ts
   export class MyCalculator implements MetricCalculator {
     calculate(data: any[], config: any): any {
       // Industry-specific calculations
     }
   }
   ```

5. **Register Plugin**
   ```typescript
   // Register components and services
   PluginManager.register(MyIndustryPlugin);
   ```

## Plugin Interface

```typescript
interface IndustryPlugin {
  name: string;
  version: string;
  description?: string;
  
  components: {
    [componentName: string]: React.ComponentType<any>;
  };
  
  services: {
    [serviceName: string]: any;
  };
  
  dataTransformers?: {
    [transformerName: string]: DataTransformer;
  };
  
  businessRules?: {
    calculations: CalculationRule[];
    validations: ValidationRule[];
    alerts: AlertRule[];
  };
  
  theme?: Partial<ThemeConfig>;
}
```

## Best Practices

1. **Naming Convention**: Use kebab-case for plugin names (e.g., `healthcare`, `manufacturing`)
2. **Component Prefix**: Prefix components with industry name (e.g., `HealthcarePatientFlow`)
3. **Type Safety**: Use TypeScript interfaces for all data structures
4. **Configuration**: Make components configurable through props and config files
5. **Testing**: Include unit tests for business logic and components
6. **Documentation**: Document all components and their usage

## Plugin Dependencies

Plugins can depend on:
- Core template components
- Shared utilities and types
- External libraries (declare in plugin package.json)
- Other plugins (with careful dependency management)

## Plugin Lifecycle

1. **Registration**: Plugin registers components and services
2. **Configuration**: System loads industry config and applies plugin settings
3. **Initialization**: Components are instantiated with configuration
4. **Runtime**: Components receive data and render industry-specific UI
5. **Cleanup**: Plugin resources are cleaned up on unmount

## Examples

### Simple Metric Component
```typescript
// plugins/retail/components/SalesMetrics.tsx
import { MetricCard } from '../../../core/frontend/components';

export const SalesMetrics: React.FC<SalesMetricsProps> = ({ data }) => {
  const todaySales = calculateTodaySales(data);
  
  return (
    <MetricCard
      title="Today's Sales"
      value={todaySales}
      format="currency"
      trend="up"
    />
  );
};
```

### Business Logic Service
```typescript
// plugins/retail/services/SalesCalculator.ts
export class SalesCalculator implements MetricCalculator {
  calculate(salesData: SalesData[]): SalesMetrics {
    return {
      todaySales: this.calculateDailySales(salesData),
      conversionRate: this.calculateConversionRate(salesData),
      averageOrderValue: this.calculateAOV(salesData)
    };
  }
}
```

## Contributing

To contribute a new industry plugin:

1. Follow the plugin creation guide above
2. Ensure comprehensive testing
3. Document all components and APIs
4. Submit pull request with plugin code and documentation
5. Include example configuration and sample data

---

**Need help creating a plugin?** Check the [White Paper](../DASHBOARD_TEMPLATE_WHITEPAPER.md) for detailed implementation guidance.
