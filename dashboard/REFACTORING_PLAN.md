# Dashboard Refactoring Plan

## 🎯 Overview

This document outlines a comprehensive refactoring plan to reduce code repetition, remove unused code, and improve the overall structure of the dashboard application.

## 📊 Analysis Summary

### Issues Identified:

1. **Duplicate API Client Files**: Both `api.ts` and `apiClient.ts` exist
2. **Multiple Tour Context Files**: Redundant context definition files
3. **Repetitive Form Components**: Similar patterns across tour forms
4. **Unused Utility Functions**: Potential dead code in utils
5. **Inconsistent Component Structure**: Mixed patterns for similar components
6. **Duplicate Type Definitions**: Types defined in multiple places

## 🔧 Refactoring Tasks

### 1. Consolidate API Layer

#### Current Issues:
- `dashboard/src/http/api.ts` and `dashboard/src/http/apiClient.ts` both exist
- Each API file has similar error handling patterns
- Repetitive axios configuration

#### Solution:

**Create Base API Service:**
```typescript
// dashboard/src/http/baseApi.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import useTokenStore from '@/store/store';

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = useTokenStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useTokenStore.getState().clearToken();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export class BaseApiService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll<T>(params?: Record<string, any>): Promise<T> {
    const response = await apiClient.get(this.endpoint, { params });
    return response.data;
  }

  async getById<T>(id: string): Promise<T> {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create<T>(data: any): Promise<T> {
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  async update<T>(id: string, data: any): Promise<T> {
    const response = await apiClient.patch(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete<T>(id: string): Promise<T> {
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    return response.data;
  }
}

// Error handler utility
export const handleApiError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message;
    throw new Error(`${context}: ${message}`);
  }
  throw new Error(`${context}: ${String(error)}`);
};
```

**Refactor Individual API Files:**
```typescript
// dashboard/src/http/tourApi.ts
import { BaseApiService } from './baseApi';

class TourApiService extends BaseApiService {
  constructor() {
    super('/api/tours');
  }

  async search(query: string) {
    return this.getAll({ query });
  }

  async getLatest(limit: number = 10) {
    return this.getAll({ limit, sort: 'latest' });
  }
}

export const tourApi = new TourApiService();

// Export individual functions for backward compatibility
export const getTours = (params: any) => tourApi.getAll(params);
export const getSingleTour = (id: string) => tourApi.getById(id);
export const createTour = (data: any) => tourApi.create(data);
export const updateTour = (id: string, data: any) => tourApi.update(id, data);
export const deleteTour = (id: string) => tourApi.delete(id);
```

### 2. Consolidate Tour Context

#### Current Issues:
- Multiple context definition files:
  - `TourContext.tsx`
  - `TourContextDefinition.ts`
  - `TourContextDefinition.tsx`
  - `TourContextTypes.ts`

#### Solution:

**Single Unified Context File:**
```typescript
// dashboard/src/Provider/TourContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { UseFormReturn, useForm, useFieldArray } from 'react-hook-form';
import { Tour } from './types';

// Types
export interface TourContextValue {
  form: UseFormReturn<Tour>;
  onSubmit: (data: Tour) => Promise<void>;
  isEditing: boolean;
  tripCode: string;
  setTripCode: (code: string) => void;
  // Editor states
  editorContent: string;
  setEditorContent: (content: string) => void;
  inclusionsContent: string;
  setInclusionsContent: (content: string) => void;
  exclusionsContent: string;
  setExclusionsContent: (content: string) => void;
  itineraryContent: string;
  setItineraryContent: (content: string) => void;
  // Field arrays
  itineraryFields: any[];
  itineraryAppend: (value: any) => void;
  itineraryRemove: (index: number) => void;
  factsFields: any[];
  factsAppend: (value: any) => void;
  factsRemove: (index: number) => void;
  faqFields: any[];
  faqAppend: (value: any) => void;
  faqRemove: (index: number) => void;
  pricingOptionsFields: any[];
  pricingOptionsAppend: (value: any) => void;
  pricingOptionsRemove: (index: number) => void;
  dateRangeFields: any[];
  dateRangeAppend: (value: any) => void;
  dateRangeRemove: (index: number) => void;
  handleGenerateCode: () => void;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return context;
};

export const TourProvider = ({ children }: { children: ReactNode }) => {
  // Implementation here
  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};
```

**Delete These Files:**
- `TourContextDefinition.ts`
- `TourContextDefinition.tsx`
- `TourContextTypes.ts`

### 3. Create Reusable Form Components

#### Current Issues:
- Repetitive form field patterns
- Similar validation logic across forms
- Duplicate date picker implementations

#### Solution:

**Create Form Component Library:**
```typescript
// dashboard/src/components/forms/FormField.tsx
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  render: (field: any) => React.ReactNode;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  render,
}: FormFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{render(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

```typescript
// dashboard/src/components/forms/FormInput.tsx
import { Input } from '@/components/ui/input';
import { FormField } from './FormField';

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  ...props
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      render={(field) => (
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          {...props}
        />
      )}
    />
  );
}
```

### 4. Consolidate Utility Functions

#### Current Issues:
- `authUtils.ts` has functions that could be in a hook
- Token management scattered across files

#### Solution:

**Create Custom Hooks:**
```typescript
// dashboard/src/hooks/useAuth.ts
import { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import useTokenStore from '@/store/store';

export const useAuth = () => {
  const { token, clearToken } = useTokenStore();

  const decodedToken = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode<AccessTokenType>(token);
    } catch {
      return null;
    }
  }, [token]);

  const isAuthenticated = useMemo(() => {
    if (!decodedToken) return false;
    return decodedToken.exp * 1000 > Date.now();
  }, [decodedToken]);

  const userId = decodedToken?.sub || null;
  const roles = decodedToken?.roles || null;

  const logout = () => {
    clearToken();
    window.location.href = '/auth/login';
  };

  return {
    token,
    userId,
    roles,
    isAuthenticated,
    logout,
  };
};
```

### 5. Remove Unused Files

#### Files to Review/Remove:

1. **Duplicate API Files:**
   - Keep: `apiClient.ts`
   - Remove: `api.ts` (after migrating any unique functionality)

2. **Unused Assets:**
   - Review `.DS_Store` files (should be in `.gitignore`)
   - Check `react.svg` usage

3. **Redundant Components:**
   - Review if `InputWithLabel.tsx` is used (can be replaced with FormInput)
   - Check `GetTitle.tsx` usage

4. **Unused Hooks:**
   - Review `useTokenExpiration.ts` (functionality might be in useAuth)

### 6. Standardize Component Patterns

#### Current Issues:
- Mixed component export patterns
- Inconsistent prop typing
- Different state management approaches

#### Solution:

**Component Template:**
```typescript
// Standard component structure
import { FC } from 'react';

interface ComponentProps {
  // Props with clear types
  title: string;
  onAction?: () => void;
}

export const Component: FC<ComponentProps> = ({ title, onAction }) => {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Derived values
  const computed = useMemo(() => {}, []);
  
  // Event handlers
  const handleClick = () => {};
  
  // Early returns
  if (!title) return null;
  
  // Main render
  return <div>{title}</div>;
};

// Default export for lazy loading
export default Component;
```

### 7. Create Shared Constants

#### Solution:

```typescript
// dashboard/src/lib/constants.ts
export const API_ENDPOINTS = {
  TOURS: '/api/tours',
  USERS: '/api/users',
  REVIEWS: '/api/reviews',
  // ... etc
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TOURS: '/tours',
  // ... etc
} as const;

export const QUERY_KEYS = {
  TOURS: 'tours',
  TOUR: (id: string) => ['tour', id],
  USER_TOURS: (userId: string) => ['user-tours', userId],
  // ... etc
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  // ... etc
} as const;
```

### 8. Optimize React Query Usage

#### Solution:

```typescript
// dashboard/src/hooks/queries/useTours.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourApi } from '@/http/tourApi';
import { QUERY_KEYS } from '@/lib/constants';

export const useTours = (params?: any) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TOURS, params],
    queryFn: () => tourApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTour = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TOUR(id),
    queryFn: () => tourApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tourApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURS] });
    },
  });
};

export const useUpdateTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      tourApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TOURS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOUR(variables.id) });
    },
  });
};
```

## 📋 Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create `baseApi.ts` with BaseApiService
- [ ] Create `useAuth.ts` hook
- [ ] Create `constants.ts` file
- [ ] Set up form component library structure

### Phase 2: API Layer (Week 2)
- [ ] Refactor all API files to use BaseApiService
- [ ] Remove duplicate `api.ts` file
- [ ] Update all imports across the application
- [ ] Test all API endpoints

### Phase 3: Context & State (Week 3)
- [ ] Consolidate Tour Context files
- [ ] Update all context consumers
- [ ] Remove redundant context files
- [ ] Test tour form functionality

### Phase 4: Components (Week 4)
- [ ] Create reusable form components
- [ ] Refactor existing forms to use new components
- [ ] Remove duplicate components
- [ ] Update component exports

### Phase 5: Hooks & Utilities (Week 5)
- [ ] Create custom query hooks
- [ ] Migrate utility functions to hooks
- [ ] Remove unused utility files
- [ ] Update all hook consumers

### Phase 6: Cleanup (Week 6)
- [ ] Remove unused files
- [ ] Update `.gitignore` for `.DS_Store`
- [ ] Run linter and fix issues
- [ ] Update documentation

## 🎯 Expected Outcomes

1. **Code Reduction**: ~30-40% reduction in total lines of code
2. **Improved Maintainability**: Single source of truth for common patterns
3. **Better Type Safety**: Consistent typing across the application
4. **Faster Development**: Reusable components and utilities
5. **Easier Testing**: Isolated, testable units

## 📚 Additional Recommendations

1. **Add ESLint Rules:**
   - `no-unused-vars`
   - `no-duplicate-imports`
   - `import/no-duplicates`

2. **Add Pre-commit Hooks:**
   - Run linter
   - Run type check
   - Format code

3. **Documentation:**
   - Add JSDoc comments to all public APIs
   - Create component storybook
   - Document common patterns

4. **Testing:**
   - Add unit tests for utilities
   - Add integration tests for API layer
   - Add component tests for reusable components
