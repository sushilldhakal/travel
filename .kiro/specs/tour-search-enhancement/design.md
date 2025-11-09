# Design Document

## Overview

This design enhances the tour search functionality by extending the backend API to support additional search criteria (tour type, duration, date ranges) and ensuring the frontend Search component properly integrates with the SearchResults page. The solution maintains backward compatibility with existing search functionality while adding new filtering capabilities.

## Architecture

### Component Flow

```
User Input (Search.tsx)
    ↓
Query Parameters (URL)
    ↓
SearchResults Page
    ↓
API Client (tourApi.ts)
    ↓
Backend API (tourSearchRouter.ts)
    ↓
Tour Controller (tourController.ts)
    ↓
Tour Service (tourService.ts)
    ↓
Tour Model (MongoDB)
```

### Key Components

1. **Frontend Search Component** (`dashboard/src/userDefinedComponents/User/Search/Search.tsx`)
   - Collects user search criteria
   - Builds query parameters
   - Navigates to search results page

2. **Frontend SearchResults Page** (`dashboard/src/pages/FrontEnd/Tours/SearchResults.tsx`)
   - Displays search results
   - Provides sorting and filtering
   - Handles loading and error states

3. **Backend Search API** (`server/src/api/tours/`)
   - Processes search requests
   - Applies filters to tour queries
   - Returns paginated results

## Components and Interfaces

### Frontend Interfaces

#### Search Form State
```typescript
interface SearchFormState {
  keyword: string;
  destination: string;
  tourType: string;  // Maps to category
  duration: string;  // e.g., "1-3", "4-7", "8-14", "15+"
  date: DateRange | undefined;
  priceRange: [number, number];
}
```

#### Search Query Parameters
```typescript
interface SearchQueryParams {
  keyword?: string;
  destination?: string;
  type?: string;  // Category/tour type
  duration?: string;
  startDate?: string;  // ISO date string
  endDate?: string;    // ISO date string
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}
```

### Backend Interfaces

#### Search Parameters (Extended)
```typescript
interface TourSearchParams {
  keyword?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  category?: string;
  type?: string;  // Alias for category
  duration?: string;  // Duration range
  startDate?: string;  // ISO date string
  endDate?: string;    // ISO date string
}
```

## Data Models

### Tour Model (Relevant Fields)

The existing Tour model already contains the necessary fields:

```typescript
{
  title: string;
  category: Array<{value: string, label: string}>;
  tourDates: {
    days: number;
    nights: number;
    dateRange: {from: Date, to: Date};
  };
  dateRanges: Array<{
    dateRange: {from: Date, to: Date};
  }>;
  price: number;
  destination: ObjectId;
  tourStatus: string;
}
```

### Duration Mapping

Duration ranges will be mapped as follows:
- "1-3" → tours with 1-3 days
- "4-7" → tours with 4-7 days
- "8-14" → tours with 8-14 days
- "15+" → tours with 15 or more days

## Error Handling

### Frontend Error Handling

1. **Network Errors**
   - Display user-friendly error message
   - Provide retry option
   - Log error details to console

2. **No Results**
   - Display "No tours found" message
   - Suggest adjusting search criteria
   - Provide link to browse all tours

3. **Invalid Parameters**
   - Sanitize input before sending
   - Validate date ranges (from < to)
   - Ensure price ranges are valid

### Backend Error Handling

1. **Invalid Query Parameters**
   - Return 400 Bad Request with descriptive message
   - Log invalid parameters for debugging

2. **Database Errors**
   - Return 500 Internal Server Error
   - Log full error stack
   - Return generic message to client

3. **No Results**
   - Return 200 OK with empty array
   - Include pagination metadata

## Testing Strategy

### Frontend Testing

1. **Unit Tests**
   - Test query parameter building logic
   - Test date range validation
   - Test price range validation

2. **Integration Tests**
   - Test navigation from Search to SearchResults
   - Test query parameter parsing
   - Test API integration

3. **Manual Testing**
   - Test all search criteria combinations
   - Test sorting and filtering
   - Test responsive design
   - Test error states

### Backend Testing

1. **Unit Tests**
   - Test duration range parsing
   - Test date range filtering logic
   - Test query building

2. **Integration Tests**
   - Test search with single criteria
   - Test search with multiple criteria
   - Test pagination
   - Test edge cases (empty results, invalid dates)

3. **API Testing**
   - Test all search endpoints
   - Test error responses
   - Test performance with large datasets

## Implementation Details

### Frontend Changes

#### 1. Search Component Updates

The Search component already has the UI for all search criteria. Changes needed:
- Ensure all form fields are properly connected to state
- Build complete query string with all parameters
- Navigate to `/tours/search` with query parameters

#### 2. SearchResults Page Updates

The SearchResults page exists but needs:
- Parse additional query parameters (type, duration, startDate, endDate)
- Display these parameters in the search summary
- Ensure proper integration with the search API

#### 3. API Client Updates

The `searchTours` function in `tourApi.ts` already accepts a query string and passes it to the backend. No changes needed.

### Backend Changes

#### 1. Tour Controller Updates

Extend the `searchTours` controller to accept new parameters:
- Extract `type`, `duration`, `startDate`, `endDate` from query
- Pass to TourService

#### 2. Tour Service Updates

Extend the `searchTours` method in TourService:

**Duration Filtering:**
```typescript
if (searchParams.duration) {
  const [min, max] = parseDurationRange(searchParams.duration);
  query['tourDates.days'] = { $gte: min, ...(max && { $lte: max }) };
}
```

**Date Range Filtering:**
```typescript
if (searchParams.startDate && searchParams.endDate) {
  const searchStart = new Date(searchParams.startDate);
  const searchEnd = new Date(searchParams.endDate);
  
  query.$or = [
    // Check tourDates.dateRange
    {
      'tourDates.dateRange.from': { $lte: searchEnd },
      'tourDates.dateRange.to': { $gte: searchStart }
    },
    // Check dateRanges array
    {
      'dateRanges': {
        $elemMatch: {
          'dateRange.from': { $lte: searchEnd },
          'dateRange.to': { $gte: searchStart }
        }
      }
    }
  ];
}
```

**Tour Type (Category) Filtering:**
```typescript
if (searchParams.type || searchParams.category) {
  const categoryFilter = searchParams.type || searchParams.category;
  query['category'] = {
    $elemMatch: {
      $or: [
        { label: { $regex: categoryFilter, $options: 'i' } },
        { value: { $regex: categoryFilter, $options: 'i' } }
      ]
    }
  };
}
```

#### 3. Helper Functions

Add utility function to parse duration ranges:
```typescript
function parseDurationRange(duration: string): [number, number | null] {
  if (duration === '15+') return [15, null];
  const [min, max] = duration.split('-').map(Number);
  return [min, max];
}
```

## Design Decisions and Rationales

### 1. Query Parameter Approach

**Decision:** Use URL query parameters to encode search criteria

**Rationale:**
- Allows users to bookmark searches
- Enables sharing search results
- Maintains browser history
- Simplifies state management

### 2. Backend Filter Logic

**Decision:** Apply all filters using AND logic

**Rationale:**
- More intuitive for users (narrow down results)
- Matches common search behavior
- Easier to implement and test

### 3. Duration Range Mapping

**Decision:** Use string ranges like "1-3", "4-7" instead of exact days

**Rationale:**
- Matches existing UI design
- More user-friendly than exact day counts
- Reduces complexity in query building

### 4. Date Range Overlap Logic

**Decision:** Show tours where any tour date overlaps with search range

**Rationale:**
- More inclusive results
- Handles both single dates and multiple departure dates
- Matches user expectations

### 5. Backward Compatibility

**Decision:** Keep existing search parameters and add new ones

**Rationale:**
- Doesn't break existing functionality
- Allows gradual migration
- Supports both old and new search patterns

## Performance Considerations

1. **Database Indexing**
   - Ensure indexes exist on: `tourStatus`, `price`, `tourDates.days`, `category.value`
   - Consider compound index for common search combinations

2. **Query Optimization**
   - Use lean() for read-only operations
   - Limit populated fields to only what's needed
   - Implement pagination to limit result sets

3. **Caching Strategy**
   - Consider caching popular search queries
   - Cache destination and category lists
   - Implement client-side caching with React Query

## Security Considerations

1. **Input Validation**
   - Sanitize all search parameters
   - Validate date formats
   - Limit price range values
   - Prevent NoSQL injection in regex queries

2. **Rate Limiting**
   - Implement rate limiting on search endpoint
   - Prevent abuse of search functionality

3. **Data Exposure**
   - Only return published tours
   - Don't expose sensitive tour data
   - Respect user permissions
