
# DataVoyager Application Context

## Overview

DataVoyager is a comprehensive data import and management platform designed to streamline the process of integrating external data into systems. The application provides a step-by-step wizard for importing, validating, mapping, and transforming data, along with an admin dashboard for template and validation configuration.

## Application Architecture

### Core Structure

The application follows a modern React component architecture with TypeScript for type safety. It uses a combination of state management approaches, including React Context for application-wide state and local component state for UI-specific interactions.

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI | React + TypeScript | Component rendering and user interaction |
| Styling | Tailwind CSS + shadcn/ui | Responsive design and component styling |
| Routing | React Router | Page navigation and URL management |
| State Management | React Context, useState | Managing global and local state |
| Data Fetching | TanStack Query | API communication and data caching |

### File Structure

```
src/
├── components/              # Reusable UI components
│   ├── admin/              # Admin-specific components
│   ├── instructions/       # Developer instruction components
│   ├── ui/                 # shadcn/ui component library
│   └── markdown/           # Markdown rendering components
├── contexts/               # React context definitions
├── data/                   # Static data and configuration
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── pages/                  # Page components
├── services/               # Service layer for API interactions
├── utils/                  # Utility functions
```

## Page Structure and Component Relationships

### Main Pages

| Page | Route | Purpose | Key Components |
|------|-------|---------|----------------|
| Welcome | / | Application entry point | `Index.tsx` |
| Import Wizard - Type | /import-wizard | Select import type | `ImportTypeSelection.tsx` |
| Import Wizard - Upload | /import-wizard/upload | File upload | `ImportUpload.tsx` |
| Import Wizard - Verification | /import-wizard/verification | File verification | `FileVerification.tsx` |
| Import Wizard - Mapping | /import-wizard/column-mapping | Column mapping | `ColumnMapping.tsx` |
| Import Wizard - Quality | /import-wizard/data-quality | Data quality | `DataQuality.tsx` |
| Import Wizard - Normalization | /import-wizard/normalization | Data normalization | `DataNormalization.tsx` |
| Import Wizard - Deduplication | /import-wizard/deduplication | Data deduplication | `Deduplication.tsx` |
| Import Wizard - Review | /import-wizard/review | Final review | `FinalReview.tsx` |
| Import Wizard - Push | /import-wizard/import | Data import | `ImportPush.tsx` |
| Admin Dashboard | /admin | Administration | `AdminDashboard.tsx` |
| File History | /file-history | Import history | `FileHistory.tsx` |
| File History Details | /file-history/:fileId | Import details | `FileHistoryDetails.tsx` |
| Context Document | /context | Application documentation | `ContextDocument.tsx` |

### Component Relationships

#### Admin Dashboard

The Admin Dashboard (`AdminDashboard.tsx`) serves as the control center for system configuration and is divided into three main sections:

1. **Templates Management**:
   - `TemplateCard.tsx`: Displays individual template cards
   - `EditTemplateDialog.tsx`: Modal for editing templates

2. **Validations Management**:
   - `ValidationManager.tsx`: Manages validation rules
   - `EditValidationDialog.tsx`: Modal for editing validations

3. **Developer Instructions**:
   - `InstructionManagementTable.tsx`: Table for managing instruction boxes
   - `InstructionModeToggle.tsx`: Toggle for instruction edit mode

#### Import Wizard Flow

The import wizard follows a sequential flow through multiple pages, with shared components across steps:

- `ImportProgress.tsx`: Progress indicator for the wizard
- `ProgressStep.tsx`: Individual step in the wizard
- `StepConnector.tsx`: Visual connector between steps

Each step has dedicated components for their specific functionality.

## State Management Strategy

### Global State

| Context | Purpose | Key Components |
|---------|---------|----------------|
| InstructionContext | Manages the instruction mode state | `InstructionProvider`, `InstructionManager` |

### Local State

Local component state is used for UI interactions and page-specific data. Examples include:

- Form inputs and validation state
- Accordion/tab open states
- Modal dialog visibility

### Data Fetching

TanStack Query is used for data fetching operations, providing:

- Automatic caching and refetching
- Loading and error states
- Optimistic updates

## Key Features and Implementation Details

### Developer Instruction System

The application includes a system for adding draggable instruction boxes to help developers understand the application:

- `InstructionBox.tsx`: Draggable instruction component
- `InstructionManager.tsx`: Manages instruction creation/editing
- `InstructionContext.tsx`: Controls instruction mode state

Instructions are stored in localStorage and can be positioned anywhere on the page. They support pointers to highlight specific UI elements.

### Template Management

Templates define the expected structure for imported data:

- System templates are pre-defined in `systemTemplates.ts`
- Templates include fields with types, descriptions, and required flags
- Templates can be applied during the column mapping phase

### Validation System

The validation system verifies imported data against configurable rules:

- Validations are categorized by stage (upload, mapping, quality)
- Each validation has a severity (critical, warning)
- Validation failures trigger appropriate responses based on severity

## Common Troubleshooting Areas

### Instruction Persistence Issues

- Instructions are stored in localStorage using the `STORAGE_KEY` constant
- The `InstructionManager` component handles loading/saving instructions
- Instructions may not persist if localStorage is cleared or unavailable

### Data Flow Issues

- Check the wizard progression state in the relevant step component
- Verify that data is being properly passed between steps
- Confirm that validation rules are correctly applied

### UI Rendering Problems

- Check for responsive design issues on different screen sizes
- Verify that conditional rendering logic is correct
- Look for CSS class conflicts with Tailwind's utility classes

## Development Guidelines

### Adding New Features

1. Maintain the existing component structure and naming conventions
2. Use TypeScript for type safety
3. Follow the existing state management patterns
4. Update this context document when adding significant features

### Code Organization

- Components should be small and focused on a single responsibility
- Shared logic should be extracted into custom hooks
- Common UI elements should use the shadcn/ui component library
- State management should follow existing patterns based on complexity

### Testing Recommendations

- Test each import wizard step with various data inputs
- Verify that validation rules correctly identify issues
- Ensure instructions persist correctly across page refreshes
- Test responsive layouts on different device sizes

## Future Development Roadmap

- Enhanced reporting and analytics
- Integration with external data sources
- Expanded template library
- Advanced data transformation capabilities
- User role management and permissions
