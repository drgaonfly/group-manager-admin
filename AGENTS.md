# AGENTS.md - Multi-Admin Project Guidelines

## Build, Lint, and Test Commands

### Core Commands

```bash
npm run build              # Build for production
npm run dev                # Start development server (uses start:dev)
npm run start:dev          # Start dev server with REACT_APP_ENV=dev
npm run test               # Run Jest tests
npm run jest               # Alias for running tests
npm run test:coverage      # Run tests with coverage report
npm run test:update        # Update Jest snapshots
```

### Running a Single Test

```bash
# Run a single test file
npm run jest -- src/pages/__tests__/example.test.tsx

# Run tests matching a pattern
npm run jest -- -t "test name pattern"

# Run a specific test in watch mode
npm run jest -- --watch src/pages/example.test.tsx
```

### Linting Commands

```bash
npm run lint               # Run all linting (js + prettier + typescript)
npm run lint:fix           # Auto-fix ESLint issues in src/
npm run lint:js            # Run ESLint on .js/.jsx/.ts/.tsx files
npm run lint:prettier      # Check and fix Prettier formatting
npm run prettier           # Check/fix Prettier for all files
npm run tsc               # TypeScript type checking (noEmit)
```

### Other Commands

```bash
npm run analyze           # Build with bundle analysis
npm run preview           # Preview production build locally
```

## Code Style Guidelines

### Import Order

Organize imports in the following order with blank lines between groups:

1. `@umijs/max` imports (useIntl, useAccess, FormattedMessage)
2. `@ant-design/pro-components` imports (ProTable, PageContainer, etc.)
3. `antd` imports (Button, message, Modal, etc.)
4. `@ant-design/icons` imports
5. React core imports
6. Type imports
7. Local component imports (relative paths with @/)
8. Local page component imports (relative paths like ./components/)

```tsx
import { useIntl } from '@umijs/max';
import { addItem, queryList } from '@/services/ant-design-pro/api';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable, PageContainer } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import type { FormValueType } from './components/Update';
import Update from './components/Update';
import DeleteButton from '@/components/DeleteButton';
```

### TypeScript Conventions

- Enable `strict: true` in tsconfig.json
- Use explicit types for props, state, and function parameters
- Use `any` sparingly - prefer specific types or `unknown`
- Define interfaces for component props with `interface ComponentNameProps`
- Use `React.FC<Props>` for functional components
- Path aliases: `@/*` maps to `./src/*`

```tsx
interface ActionButtonProps {
  type: 'detail' | 'edit' | 'delete';
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ type, onClick }) => {
  // implementation
};
```

### Naming Conventions

- **Components**: PascalCase (e.g., `TableList`, `BotUserTable`)
- **Files**: camelCase for utility files, PascalCase for components
- **Variables/functions**: camelCase (e.g., `handleAdd`, `currentRow`)
- **Constants**: UPPER_SNAKE_CASE for global constants, camelCase for local
- **Enums**: PascalCase for enum name, UPPER_SNAKE_CASE for values
- **CSS classes**: kebab-case in CSS files

### Component Structure

Follow this pattern for page components:

1. Handler functions defined outside component (handleAdd, handleUpdate, handleRemove)
2. Component with useIntl, useAccess hooks
3. useState for modal states and data
4. useRef for action references
5. Column definitions
6. JSX return with PageContainer, ProTable, and modals

### Error Handling

Use try-catch with message.loading and message.error pattern:

```tsx
const handleAdd = async (fields: any) => {
  const hide = message.loading('Adding...');
  try {
    await addItem('/endpoint', fields);
    hide();
    message.success('Added successfully');
    return true;
  } catch (error: any) {
    hide();
    message.error(error?.response?.data?.message ?? 'Operation failed');
    return false;
  }
};
```

### Internationalization (i18n)

Use `@umijs/max` i18n utilities:

```tsx
const intl = useIntl();

// In columns
title: intl.formatMessage({ id: 'page.title' })

// In JSX
<FormattedMessage id="save" defaultMessage="Save" />

// With variables
intl.formatMessage({ id: 'greeting' }, { name: userName })
```

### API Calls Pattern

Use service layer from `@/services/ant-design-pro/api`:

```tsx
import { addItem, queryList, removeItem, updateItem } from '@/services/ant-design-pro/api';

const handleSubmit = async (values) => {
  await addItem('/endpoint', values);
  await updateItem(`/endpoint/${id}`, values);
  await removeItem('/endpoint', { ids: [id] });
};

// In ProTable request
request={async (params, sort, filter) => {
  const response = await queryList('/endpoint', params, sort, filter);
  return response;
}}
```

### State Management

- Use `useState` for component-level state
- Use `useRef` for ProTable action refs: `const actionRef = useRef<ActionType>();`
- Use `useAccess` from `@umijs/max` for permission checks
- Access control: `access.canSuperAdmin`, `access.canCreateBot`, etc.

### UI Components

- Use Ant Design Pro components: `ProTable`, `PageContainer`, `FooterToolbar`
- Use Ant Design components: `Button`, `Modal`, `Form`, `Select`, etc.
- ProTable scroll: `scroll={{ x: 'max-content' }}`
- ProTable rowKey must be set (typically `_id`)

### File Organization

```
src/
  pages/           # Route components (src/pages/PageName/index.tsx)
  components/      # Shared components (src/components/ComponentName.tsx)
  services/        # API service layer
  utils/           # Utility functions
  enums/           # TypeScript enums
  hooks/           # Custom React hooks
  locales/         # i18n translation files
config/
  config.ts        # Umi configuration
  routes.ts        # Route definitions
  defaultSettings.ts
tests/
  setupTests.jsx   # Jest setup
```

### Prohibited Patterns

- Don't use `console.log()` in production code (except debugging in dev)
- Don't use relative imports for src/ components (use `@/` alias)
- Don't bypass TypeScript strict mode
- Don't leave unused imports or variables
- Don't commit commented-out code

### Testing Guidelines

- Place tests next to components: `ComponentName.test.tsx`
- Use React Testing Library
- Setup file: `tests/setupTests.jsx`
- Jest config: `jest.config.ts`
