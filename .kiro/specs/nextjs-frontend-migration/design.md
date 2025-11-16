# Design Document: Next.js Frontend Migration

## Overview

This document outlines the technical design for migrating the user-facing frontend from the current React dashboard application to a standalone Next.js 14+ application. The design focuses on creating a performant, SEO-friendly, and maintainable frontend that communicates with the existing Express.js backend.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │                            │
    ┌────────▼────────┐          ┌───────▼────────┐
    │  Next.js        │          │  React         │
    │  Frontend       │          │  Dashboard     │
    │  (Port 3000)    │          │  (Port 5173)   │
    └────────┬────────┘          └───────┬────────┘
             │                            │
             │                            │
             └────────────┬───────────────┘
                          │
                  ┌───────▼────────┐
                  │  Express.js    │
                  │  Backend API   │
                  │  (Port 5000)   │
                  └───────┬────────┘
                          │
                  ┌───────▼────────┐
                  │   MongoDB      │
                  │   Database     │
                  └────────────────┘
```

### Project Structure

```
project-root/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── (public)/   # Public routes group
│   │   │   │   ├── page.tsx              # Home page
│   │   │   │   ├── tours/
│   │   │   │   │   ├── page.tsx          # Tours listing
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx      # Single tour
│   │   │   │   ├── categories/
│   │   │   │   ├── destinations/
│   │   │   │   ├── blog/
│   │   │   │   └── search/
│   │   │   ├── (auth)/     # Auth routes group
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (protected)/ # Protected routes group
│   │   │   │   ├── profile/
│   │   │   │   ├── bookings/
│   │   │   │   └── checkout/
│   │   │   ├── layout.tsx
│   │   │   └── not-found.tsx
│   │   ├── components/      # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── tours/       # Tour-related components
│   │   │   ├── booking/     # Booking components
│   │   │   └── shared/      # Shared components
│   │   ├── lib/             # Utilities
│   │   │   ├── api/         # API client
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── utils/       # Helper functions
│   │   │   └── types/       # TypeScript types
│   │   ├── providers/       # Context providers
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
│
├── dashboard/               # Existing React dashboard
│   └── (existing structure)
│
└── server/                  # Existing Express backend
    └── (existing structure)
```

## Components and Interfaces

### 1. API Client Layer

#### API Client Service

```typescript
// lib/api/client.ts
class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string);
  
  // HTTP methods
  get<T>(endpoint: string, config?: RequestConfig): Promise<T>;
  post<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T>;
  put<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T>;
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T>;
  
  // Auth methods
  setToken(token: string): void;
  clearToken(): void;
  
  // Interceptors
  private handleRequest(config: RequestConfig): RequestConfig;
  private handleResponse<T>(response: Response): Promise<T>;
  private handleError(error: Error): Promise<never>;
}
```

#### API Services

```typescript
// lib/api/tours.ts
export const tourApi = {
  getAll: (params?: TourQueryParams) => Promise<ToursResponse>;
  getBySlug: (slug: string) => Promise<Tour>;
  search: (query: string, filters?: SearchFilters) => Promise<ToursResponse>;
  getCategories: () => Promise<Category[]>;
  getDestinations: () => Promise<Destination[]>;
};

// lib/api/bookings.ts
export const bookingApi = {
  create: (data: BookingData) => Promise<Booking>;
  getById: (id: string) => Promise<Booking>;
  getUserBookings: (params?: PaginationParams) => Promise<BookingsResponse>;
  cancel: (id: string, reason?: string) => Promise<void>;
};

// lib/api/auth.ts
export const authApi = {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<TokenResponse>;
  getCurrentUser: () => Promise<User>;
};
```

### 2. Data Models

```typescript
// lib/types/tour.ts
export interface Tour {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  coverImage: string;
  gallery: string[];
  price: number;
  originalPrice?: number;
  category: Category[];
  destination: string;
  location: Location;
  dates: TourDates;
  pricingOptions: PricingOption[];
  itinerary: Itinerary[];
  facts: Fact[];
  faqs: FAQ[];
  reviews: Review[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// lib/types/booking.ts
export interface Booking {
  _id: string;
  bookingReference: string;
  tourId: string;
  tourTitle: string;
  departureDate: string;
  participants: Participants;
  pricing: BookingPricing;
  contactInfo: ContactInfo;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}
```

### 3. Page Components

#### Home Page (SSR)

```typescript
// app/(public)/page.tsx
export default async function HomePage() {
  // Server-side data fetching
  const [featuredTours, categories, destinations] = await Promise.all([
    tourApi.getAll({ featured: true, limit: 6 }),
    tourApi.getCategories(),
    tourApi.getDestinations()
  ]);

  return (
    <main>
      <HeroSection />
      <FeaturedTours tours={featuredTours} />
      <ExploreCategories categories={categories} />
      <PopularDestinations destinations={destinations} />
      <WhyChooseUs />
      <LatestBlogs />
    </main>
  );
}
```

#### Tours Listing Page (SSR with ISR)

```typescript
// app/(public)/tours/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function ToursPage({
  searchParams
}: {
  searchParams: { category?: string; destination?: string; page?: string }
}) {
  const tours = await tourApi.getAll({
    category: searchParams.category,
    destination: searchParams.destination,
    page: Number(searchParams.page) || 1
  });

  return (
    <main>
      <Breadcrumbs />
      <TourFilters />
      <TourGrid tours={tours.data} />
      <Pagination totalPages={tours.totalPages} />
    </main>
  );
}
```

#### Single Tour Page (SSG with ISR)

```typescript
// app/(public)/tours/[slug]/page.tsx
export const revalidate = 3600;

export async function generateStaticParams() {
  const tours = await tourApi.getAll({ limit: 100 });
  return tours.data.map((tour) => ({
    slug: tour.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tour = await tourApi.getBySlug(params.slug);
  
  return {
    title: tour.title,
    description: tour.excerpt,
    openGraph: {
      title: tour.title,
      description: tour.excerpt,
      images: [tour.coverImage]
    }
  };
}

export default async function TourPage({ params }: Props) {
  const tour = await tourApi.getBySlug(params.slug);

  return (
    <main>
      <TourHero tour={tour} />
      <TourDetails tour={tour} />
      <TourItinerary itinerary={tour.itinerary} />
      <TourPricing pricing={tour.pricingOptions} />
      <BookingForm tour={tour} />
      <TourReviews reviews={tour.reviews} />
      <RelatedTours category={tour.category[0]} />
    </main>
  );
}
```

### 4. Client Components

#### Booking Form Component

```typescript
// components/booking/BookingForm.tsx
'use client';

export function BookingForm({ tour }: { tour: Tour }) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [participants, setParticipants] = useState({ adults: 1, children: 0 });
  
  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: bookingApi.create,
    onSuccess: (booking) => {
      router.push(`/checkout/${booking._id}`);
    }
  });

  const handleSubmit = (data: BookingFormData) => {
    createBooking({
      tourId: tour._id,
      ...data
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DatePicker
        availableDates={tour.dates.departures}
        selected={selectedDate}
        onSelect={setSelectedDate}
      />
      <ParticipantSelector
        value={participants}
        onChange={setParticipants}
      />
      <PricingSummary
        basePrice={tour.price}
        participants={participants}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Processing...' : 'Book Now'}
      </Button>
    </form>
  );
}
```

### 5. Authentication System

#### Auth Context Provider

```typescript
// providers/AuthProvider.tsx
'use client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Protected Route Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/profile') ||
                          request.nextUrl.pathname.startsWith('/bookings') ||
                          request.nextUrl.pathname.startsWith('/checkout');

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/bookings/:path*', '/checkout/:path*']
};
```

## Data Models

### Tour Data Flow

```
1. User requests tour page
   ↓
2. Next.js server fetches data from Express API
   ↓
3. Express API queries MongoDB
   ↓
4. Data flows back through Express → Next.js
   ↓
5. Next.js renders page with data
   ↓
6. HTML sent to client
   ↓
7. Client hydrates interactive components
```

### Booking Data Flow

```
1. User fills booking form (client-side)
   ↓
2. Form submission triggers API call
   ↓
3. Next.js API route forwards to Express API
   ↓
4. Express validates and creates booking
   ↓
5. Booking saved to MongoDB
   ↓
6. Response sent back to client
   ↓
7. User redirected to checkout page
```

## Error Handling

### API Error Handler

```typescript
// lib/api/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Response) {
    return new ApiError(
      error.status,
      error.statusText || 'An error occurred'
    );
  }

  return new ApiError(500, 'An unexpected error occurred');
}
```

### Error Boundary Component

```typescript
// components/ErrorBoundary.tsx
'use client';

export function ErrorBoundary({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Testing Strategy

### Unit Tests
- Test utility functions
- Test API client methods
- Test custom hooks
- Test component logic

### Integration Tests
- Test API integration
- Test authentication flow
- Test booking flow
- Test search functionality

### E2E Tests
- Test complete user journeys
- Test booking process
- Test authentication
- Test navigation

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Implement lazy loading
- Use appropriate image formats (WebP)
- Implement responsive images

### Code Splitting
- Automatic code splitting by route
- Dynamic imports for heavy components
- Lazy load non-critical components

### Caching Strategy
- ISR for semi-static pages (tours, blog)
- SSR for dynamic pages (search results)
- Client-side caching with React Query
- CDN caching for static assets

### Bundle Optimization
- Tree shaking
- Minimize dependencies
- Use dynamic imports
- Implement route-based code splitting

## SEO Implementation

### Metadata
```typescript
// app/(public)/tours/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tour = await tourApi.getBySlug(params.slug);
  
  return {
    title: `${tour.title} | Your Travel Company`,
    description: tour.excerpt,
    keywords: tour.category.map(c => c.name).join(', '),
    openGraph: {
      title: tour.title,
      description: tour.excerpt,
      images: [
        {
          url: tour.coverImage,
          width: 1200,
          height: 630,
          alt: tour.title
        }
      ],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: tour.title,
      description: tour.excerpt,
      images: [tour.coverImage]
    }
  };
}
```

### Structured Data
```typescript
// components/tours/TourStructuredData.tsx
export function TourStructuredData({ tour }: { tour: Tour }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.excerpt,
    image: tour.coverImage,
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    provider: {
      '@type': 'Organization',
      name: 'Your Travel Company'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

## Deployment

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
API_SECRET_KEY=your-secret-key
```

### Build Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif']
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
      }
    ];
  }
};
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## Security Considerations

### CORS Configuration
- Configure CORS on backend to allow Next.js domain
- Implement proper origin validation
- Use credentials: 'include' for authenticated requests

### Authentication
- Store tokens in httpOnly cookies
- Implement CSRF protection
- Use secure token refresh mechanism

### Data Validation
- Validate all user inputs
- Sanitize data before rendering
- Implement rate limiting

## Migration Strategy

### Phase 1: Setup
1. Create Next.js project structure
2. Set up API client
3. Configure environment variables
4. Set up authentication

### Phase 2: Core Pages
1. Migrate home page
2. Migrate tours listing
3. Migrate single tour page
4. Test functionality

### Phase 3: Additional Pages
1. Migrate categories and destinations
2. Migrate blog pages
3. Migrate user profile
4. Test functionality

### Phase 4: Booking Flow
1. Migrate booking form
2. Migrate checkout page
3. Integrate payment
4. Test end-to-end flow

### Phase 5: Optimization
1. Implement SEO
2. Optimize performance
3. Add analytics
4. Final testing

### Phase 6: Deployment
1. Deploy to staging
2. User acceptance testing
3. Deploy to production
4. Monitor and optimize
