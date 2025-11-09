# Implementation Plan

- [ ] 1. Update backend search API to support new filter criteria
  - Add duration, tour type, and date range filtering to the Tour Service
  - Extend the search controller to accept new query parameters
  - Create helper function to parse duration ranges
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 1.1 Extend Tour Service searchTours method
  - Add duration range filtering logic to query tours by days
  - Add date range overlap filtering for tourDates and dateRanges
  - Add tour type filtering using category field
  - Handle type parameter as alias for category
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 1.2 Create duration parsing utility function
  - Write parseDurationRange function to convert string ranges to min/max values
  - Handle special case "15+" for 15 or more days
  - Export function for use in Tour Service
  - _Requirements: 3.2_

- [ ] 1.3 Update search controller to accept new parameters
  - Extract type, duration, startDate, endDate from request query
  - Pass new parameters to TourService.searchTours
  - Maintain backward compatibility with existing parameters
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2. Update frontend Search component
  - Ensure all form fields properly update state
  - Build complete query string with all search parameters
  - Format dates to ISO strings for API
  - Navigate to search results with query parameters
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3_

- [ ] 2.1 Verify Search component state management
  - Confirm all form fields are connected to state variables
  - Ensure date picker updates date state correctly
  - Verify price range slider updates priceRange state
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 2.2 Update handleSearch function to include all parameters
  - Add type parameter from tourType state
  - Add duration parameter from duration state
  - Format date range to startDate and endDate ISO strings
  - Ensure all parameters are properly encoded in URL
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2_

- [ ] 3. Update SearchResults page to handle new parameters
  - Parse additional query parameters from URL
  - Update search summary to display all active filters
  - Ensure proper integration with updated API
  - Handle loading and error states
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3.1 Parse new query parameters
  - Extract type, duration, startDate, endDate from URL params
  - Store parsed parameters in component state or display variables
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3.2 Update searchSummary function
  - Include tour type in summary when present
  - Include duration range in summary when present
  - Format and include date range in summary when present
  - Improve formatting of existing summary items
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3.3 Verify SearchResults displays tours correctly
  - Confirm tour cards show all required information
  - Verify grid and list view modes work properly
  - Test sorting functionality with new filters
  - Ensure pagination works with filtered results
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 5.1, 5.4_

- [ ] 4. Add database indexes for search performance
  - Create index on tourStatus field
  - Create index on tourDates.days field
  - Create index on category.value field
  - Consider compound index for common search combinations
  - _Requirements: 3.5_

- [ ] 5. Test search functionality end-to-end
  - Test search with single filter criteria
  - Test search with multiple filter combinations
  - Test edge cases (no results, invalid dates, extreme price ranges)
  - Test navigation from Search component to SearchResults
  - Verify URL parameters are preserved and parsed correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_
