# Core Template Components

This directory contains the industry-agnostic foundation components that are shared across all dashboard implementations.

## Structure

```
core/
├── frontend/          # Generic React components
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # Frontend services
│   └── utils/         # Utility functions
├── backend/           # Abstract backend services
│   ├── routes/        # Generic API routes
│   ├── services/      # Abstract services
│   ├── middleware/    # Common middleware
│   └── utils/         # Backend utilities
└── shared/            # Shared code
    ├── types/         # TypeScript interfaces
    ├── schemas/       # Data validation schemas
    └── constants/     # Shared constants
```

## Key Components

- **MetricCard**: Generic metric display component
- **DataTable**: Configurable data table with filtering/sorting
- **AnalyticsChart**: Multi-type chart component (line, bar, pie, etc.)
- **AlertsPanel**: Real-time alerts and notifications
- **StatusIndicator**: Status display with color coding

## Usage

These components are designed to be industry-agnostic and configured through props and configuration files. Industry-specific plugins extend these base components.
