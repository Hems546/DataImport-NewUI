# DataVoyager Application Context & Requirements Document

## Overview

DataVoyager is a comprehensive data import and management platform built with React and TypeScript. The application provides a step-by-step wizard for importing, validating, mapping, normalizing, and transforming data, along with an admin dashboard for system configuration and management.

## Application Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript | Component rendering and user interaction |
| Styling | Tailwind CSS + shadcn/ui | Modern responsive design and component library |
| Routing | React Router v6 | SPA navigation and URL management |
| State Management | React Context + useState | Global and local state management |
| Data Fetching | TanStack Query | API communication and data caching |
| Build Tool | Vite | Fast development and build process |
| UI Components | shadcn/ui | Consistent, accessible component library |

### Application Structure

```
src/
├── components/                    # Reusable UI components
│   ├── ui/                       # shadcn/ui components (50+ components)
│   ├── admin/                    # Admin-specific components
│   ├── instructions/             # Developer instruction system
│   ├── Modal/                    # Modal components
│   ├── SidePanel/               # Side panel components
│   ├── StatusDropdown/          # Status filtering components
│   ├── Pager/                   # Pagination components
│   ├── GridGrouping/            # Data grid components
│   ├── icons/                   # Icon components
│   └── markdown/                # Markdown rendering components
├── pages/                       # Page components
├── services/                    # API service layer
├── hooks/                       # Custom React hooks
├── contexts/                    # React context providers
├── constants/                   # Application constants
├── utils/                       # Utility functions
├── lib/                         # Third-party library configurations
├── data/                        # Static data and configurations
├── styles/                      # Global styles and CSS
├── assets/                      # Static assets
└── integrations/                # External service integrations
    └── supabase/                # Database integration
```

## Import Wizard Flow & Page Structure

### Main Application Pages

| Page | Route | Purpose | Component | Key Features |
|------|-------|---------|-----------|--------------|
| Welcome | `/` | Application entry point | `Index.tsx` | Landing page, navigation |
| Import Type Selection | `/import-wizard` | Select import type | `ImportTypeSelection.tsx` | Document type selection |
| Import Upload | `/import-wizard/upload` | File upload | `ImportUpload.tsx` | File upload, validation |
| File Verification | `/import-wizard/verification` | File verification | `FileVerification.tsx` | File structure validation |
| Column Mapping | `/import-wizard/column-mapping` | Field mapping | `ColumnMapping.tsx` | Map file columns to system fields |
| Data Quality | `/import-wizard/data-quality` | Data validation | `DataQuality.tsx` | Error/warning detection |
| Data Normalization | `/import-wizard/normalization` | Data verification | `DataNormalization.tsx` | Name/address/email processing |
| Deduplication | `/import-wizard/deduplication` | Duplicate detection | `Deduplication.tsx` | Duplicate identification/resolution |
| Final Review | `/import-wizard/review` | Final approval | `FinalReview.tsx` | Final validation summary |
| Import Push | `/import-wizard/import` | Data import | `ImportPush.tsx` | Execute data import |
| Step Handler | `/import-step-handler` | Workflow routing | `ImportStepHandler.tsx` | Route between steps based on status |

### Administrative Pages

| Page | Route | Purpose | Component | Key Features |
|------|-------|---------|-----------|--------------|
| Admin Dashboard | `/admin` | System administration | `AdminDashboard.tsx` | Templates, validations, instructions |
| File History | `/file-history` | Import history | `FileHistory.tsx` | View past imports |
| File History Details | `/file-history/:fileId` | Import details | `FileHistoryDetails.tsx` | Detailed import information |
| Context Document | `/context` | Documentation | `ContextDocument.tsx` | Application documentation |
| Not Found | `*` | 404 error page | `NotFound.tsx` | Error handling |

## Import Workflow States & Status Management

### Step Progression Logic

The application uses a sophisticated status-based routing system managed by `ImportStepHandler.tsx`:

```javascript
const SectionSteps = [
  "FileUpload",
  "FieldMapping", 
  "DataPreflight",
  "DataValidation",
  "DataVerification",
  "FinalReview",
  "ImportPush",
];

const OrderOfPreflight = {
  "Not Started": "FileUpload",
  "In Progress": "FieldMapping",
  Error: "DataPreflight",
  Warning: "DataValidation",
  "Verification Pending": "DataVerification",
  "Review Pending": "FinalReview",
  "Ready for Import": "ImportPush",
  Success: "ImportPush",
};
```

### Status Color Coding

```javascript
const enumStatusColor = {
  "Not Started": "darkgray",
  "In Progress": "orange",
  Success: "green",
  Error: "red",
  Warning: "gold",
  "Verification Pending": "#AB5FA6",
};
```

### Step-Specific Status Tracking

Each import maintains individual status for each step:
- `FileUploadStatus`
- `FieldMappingStatus`
- `DataPreflightStatus`
- `DataValidationStatus`
- `DataVerificationStatus`
- `DeduplicationStatus`
- `FinalReviewStatus`
- `ImportPushStatus`

## Core Components & Functionality

### Key Reusable Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `ImportStepHeader` | Step progress display | Shows current step, status, completion |
| `ValidationStatus` | Validation results display | Error/warning summaries |
| `NormalizationEditor` | Data normalization interface | Name/address splitting |
| `MasterDataSelection` | Dropdown data management | Master data validation |
| `FileAnalysisModal` | File analysis interface | Detailed file inspection |
| `TableFilters` | Data filtering controls | Status-based filtering |
| `ResizableTableHeader` | Responsive table headers | Dynamic column sizing |
| `ImportProgress` | Progress indicator | Step-by-step progress |

### Admin Dashboard Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `TemplateCard` | Template management | Create/edit templates |
| `ValidationManager` | Validation rule management | Configure validation rules |
| `EditTemplateDialog` | Template editing interface | Modal template editor |
| `EditValidationDialog` | Validation editing interface | Modal validation editor |
| `ImportTypeManager` | Import type configuration | Manage document types |
| `InstructionManagementTable` | Developer instruction management | Manage help content |
| `AdminHelpCenter` | Help documentation | Comprehensive help system |

## State Management Architecture

### Global State (React Context)

| Context | Purpose | Provider | Key State |
|---------|---------|----------|-----------|
| `InstructionContext` | Developer instruction system | `InstructionProvider` | `isInstructionMode`, `instructions` |
| `ImportContext` | Import workflow state | `ImportProvider` | `currentImport`, `importHistory` |

### Local State Patterns

- **Form State**: Individual form components manage their own input state
- **UI State**: Modal visibility, accordion states, loading states
- **Data State**: API response data, validation results, processing states

### API Layer

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `preflightService` | Main import operations | `saveFile`, `getMappedFields`, `getDataVerificationOptions` |
| `fileValidation` | File validation logic | `validateFile`, `checkFileStructure` |

## Data Processing Pipeline

### 1. File Upload & Validation
- File type validation
- Size and format checks
- Initial structure validation
- Base64 encoding for storage

### 2. Field Mapping
- Automatic field detection
- Manual mapping interface
- Field validation rules
- Template application

### 3. Data Verification & Normalization
- **Name Processing**: Full name splitting (First/Last)
  - "John Doe" → First: "John", Last: "Doe"
  - "John Doe Smith" → First: "John Doe", Last: "Smith"
- **Address Verification**: Full address splitting via Smarty API
  - Address Line 1, City, State, ZIP extraction
- **Email Verification**: Email validation and verification

### 4. Data Quality Checks
- Missing required fields
- Data format validation
- Business rule validation
- Error/warning categorization

### 5. Deduplication
- Duplicate detection algorithms
- Manual review interface
- Merge/ignore options

### 6. Final Review & Import
- Summary of all changes
- Final validation checks
- Data transformation preview
- Import execution

## Developer Instruction System

### Instruction Management Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `InstructionBox` | Draggable help boxes | Positioned help content |
| `InstructionManager` | Instruction creation | Create/edit instructions |
| `InstructionModeToggle` | Toggle instruction mode | Enable/disable editing |

### Features
- Draggable positioning
- Persistent localStorage storage
- Pointer indicators to UI elements
- Rich text content support
- Admin-configurable content

## UI/UX Design System

### Component Library (shadcn/ui)

The application uses 50+ shadcn/ui components including:
- **Forms**: `input`, `textarea`, `select`, `checkbox`, `radio-group`
- **Data Display**: `table`, `card`, `badge`, `avatar`
- **Navigation**: `tabs`, `accordion`, `breadcrumb`, `pagination`
- **Feedback**: `alert`, `toast`, `loading`, `progress`
- **Overlays**: `dialog`, `sheet`, `popover`, `tooltip`
- **Layout**: `separator`, `resizable`, `sidebar`

### Loading States
- Full-screen loading overlays during processing
- Step-specific loading indicators
- Button disabled states during operations
- Skeleton loading for data fetching

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for all screen sizes
- Touch-friendly interface elements
- Optimized table displays for mobile

## Configuration & Customization

### System Templates
- Pre-defined data structures in `systemTemplates.ts`
- Configurable field mappings
- Validation rule associations
- Document type definitions

### Validation Configuration
- Rule-based validation system
- Configurable severity levels
- Custom validation messages
- Business rule enforcement

### Import Type Configuration
- Document type definitions in `importTypeConfigs.ts`
- Field requirement specifications
- Workflow customization options

## Error Handling & Validation

### Validation Levels
- **Critical**: Blocks import progression
- **Warning**: Allows progression with acknowledgment
- **Info**: Informational only

### Error Recovery
- Graceful error handling with user-friendly messages
- Retry mechanisms for failed operations
- State recovery after errors
- Detailed error logging

## Performance Optimizations

### Code Splitting
- Lazy loading of all page components
- Dynamic imports for heavy components
- Route-based code splitting

### Data Management
- TanStack Query for efficient data fetching
- Caching strategies for API responses
- Optimistic updates for better UX

### Bundle Optimization
- Vite for fast development and builds
- Tree shaking for minimal bundle size
- Modern JavaScript targeting

## Development Guidelines

### Code Organization
- TypeScript for type safety
- Functional components with hooks
- Custom hooks for shared logic
- Consistent naming conventions

### Component Design Patterns
- Single responsibility principle
- Props interface definitions
- Error boundary implementations
- Accessibility compliance

### State Management Best Practices
- Minimize prop drilling with context
- Local state for UI interactions
- Global state for shared data
- Immutable state updates

## Testing Strategy

### Component Testing
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for workflows
- E2E tests for critical paths

### Validation Testing
- File format validation tests
- Data quality validation tests
- Error handling scenario tests
- Performance testing for large files

## Deployment & Infrastructure

### Build Configuration
- Vite build system
- Environment-specific configurations
- Asset optimization
- Source map generation

### Routing Configuration
- Base path: `/newui/`
- Hash-based routing for compatibility
- Protected routes for admin features
- Error page fallbacks

## Future Enhancement Roadmap

### Planned Features
- Advanced data transformation rules
- Custom validation rule builder
- Enhanced reporting and analytics
- Real-time collaboration features
- API integration framework
- Advanced deduplication algorithms

### Technical Improvements
- Progressive Web App (PWA) capabilities
- Enhanced offline support
- Performance monitoring
- Advanced caching strategies
- Micro-frontend architecture consideration

## API Integration Points

### Core API Endpoints
- File upload and management
- Field mapping operations
- Data validation services
- Import execution
- History and reporting

### External Integrations
- Smarty API for address verification
- Email verification services
- File storage services
- Analytics and monitoring

## Security Considerations

### Data Protection
- Secure file upload handling
- Data encryption in transit
- User authentication integration
- Role-based access control

### Validation Security
- Input sanitization
- XSS prevention
- CSRF protection
- Secure API communication

This document serves as the definitive requirements and context document for the DataVoyager application. Any updates to functionality, structure, or requirements should be reflected in this document to maintain accuracy and serve as a single source of truth for development activities.
