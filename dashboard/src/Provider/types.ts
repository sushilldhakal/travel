export interface Author {
    _id: string;
    name: string;
}

export interface dateRange {
  from: Date;
  to: Date;
}

export interface Discount {
  discountEnabled: boolean;
  discountPrice: number;
  dateRange: {
    from: Date; 
    to: Date;
  };
}


export interface pricing {
  price: number,
  pricePerPerson: boolean,
  pricingOptionsEnabled: boolean,
  paxRange: [number, number],
  minSize: number,
  maxSize: number,
  groupSize: number,
  discount: {
    discountEnabled: boolean,
    discountPrice: number,
    dateRange: { from: Date; to: Date }
  },
  pricingOptions: pricingOptions[],
  priceLockedUntil: Date | undefined
}

export interface DiscountOption {
  isActive?: boolean;
  percentageOrPrice?: boolean;
  percentage?: number;
  discountPrice?: number;
  description?: string;
  discountCode?: string;
  maxDiscountAmount?: number;
  dateRange: { from: Date | string | undefined; to: Date | string | undefined };
}

export interface pricingOptions {
  id?: string;
  name: string;
  category: 'adult' | 'child' | 'senior' | 'student' | 'custom';
  customCategory?: string;
  price: number;
  discount: {
    enabled: boolean;
    options?: DiscountOption[];
  };
  paxRange?: {
    minPax: number;
    maxPax: number;
  };
}

export type TourDateMode = "flexible" | "fixed" | "multiple";

export interface dates {
  scheduleType: TourDateMode;
  days?: number;
  nights?: number;
  
  // For flexible or fixed with recurrence
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  recurrenceInterval?: number; // e.g., every 2 weeks
  recurrenceEndDate?: Date;
  
  // Pricing category (for flexible and fixed)
  selectedPricingOptions?: string[];
  
  // For fixed
  singleDateRange?: {
    from: Date;
    to: Date;
  };
  
  // For multiple
  departures?: departures[];
}

export interface departures {
  id: string;
  label: string;
  dateRange: { from: Date; to: Date };
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  recurrenceEndDate?: Date;
  selectedPricingOptions?: string[];
  capacity?: number;
}

export interface Tour {
  _id?: string;
  id?: string;
  author?: Author[];
  title?: string;
  code?: string;
  excerpt?: string;
  description?: string;
  genre?: string;
  coverImage?: string;
  tourStatus?: string;
  file?: string;
  price?: number;
  originalPrice?: number;
  include?: string;
  exclude?: string;
  itinerary?: Itinerary[];
  facts?: FactData[];
  faqs?: FaqData[];
  dates?: dates;
  booking_close?: string;
  featured?: boolean;
  category?: Category[];
  destination?: string;
  location?: location;
  pricePerType?: "person" | "group";
  pricePerPerson?: boolean;
  basePrice?: number;
  minSize?: number;
  maxSize?: number;
  groupSize?: number;
  paxRange?: { min: number; max: number };
  discount?: Discount;
  discountEnabled?: boolean;
  discountPrice?: number;
  discountDateRange?: DateRange;
  priceLockedUntil?: string;
  pricingOptionsEnabled?: boolean;
  pricingOptions?: pricingOptions[];
  fixedDeparture?: boolean;
  multipleDates?: boolean;
  tourDates?: TourDate[];
  fixedDate?: string;
  dateRanges?: DateRange[];
  isSpecialOffer?: boolean;
  gallery?: string[];
  map?: string;
  enquiry?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tabsDisplay?: string[];
  downloads?: string[];
  pricing?: pricing;
}


// Define the type for the Post
export interface Post {
  _id: string; // Post ID
  title: string; // Post title
  content: string; // Post content
  author: Author; // Author object
  tags: string[]; // Array of tags
  image: string; // URL or path to the image
  status: 'draft' | 'published' | 'archived'; // Status of the post
  likes: number; // Number of likes
  comments: string[]; // Array of comment IDs or comment objects
  enableComments: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
  __v: number; // Version key for MongoDB
}
export interface PostResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  posts: Post[];
}

// Define the type for the paginated response
export interface PaginatedPostsResponse {
  page: number; // Current page number
  limit: number; // Number of posts per page
  totalPages: number; // Total number of pages
  totalPosts: number; // Total number of posts
  posts: Post[]; // Array of Post objects
}

export interface location {
  name?: string;
  map?: string;

  placeId?: string;
  position?: {
    lat: number;
    lng: number;
  };
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  formatted_address?: string;
  lat?: number;
  lng?: number;
}

export interface Destination {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  country: string;
  region?: string;
  city?: string;
  isActive: boolean;
  featuredTours?: string[];
  popularity?: number;
  createdAt: string;
  userId?: string;
}


export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  roles: string;
  images?: string;
  wishlists: string[];
  bookings: string[];
  reviews: Review[];
  payment_methods: string[];
  createdAt: string;
}


export interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  user: User;
  status: string;
  createdAt: string;
  likes?: number;
  views?: number;
  replies?: Reply[];
  tourId?: string;
  tourTitle?: string;
}


export interface Reply {
  _id: string;
  comment: string;
  user: User;
  createdAt: string;
  likes: number;
  views: number;
}

export interface ReviewsManagerProps {
  tourId: string;
}

export interface DateRange {
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
}

export interface dates {
  singleDate?: string;
  dateType?: string;
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: DateRange;
}

export interface TourDate {
  date?: string;
  price?: number;
  discountPrice?: number;
  discountEnabled?: boolean;
  availability?: string;
  groupSize?: number;
}

export interface Category {
  name: string;
  id: string;
  _id?: string;
  value?: string;
  label?: string;
  isActive?: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
  url?: string;
  type?: 'link' | 'page';
  link?: string;
}

export interface BreadcrumbsContextType {
  breadcrumbs: Breadcrumb[];
  updateBreadcrumbs: (newBreadcrumbs: Breadcrumb[]) => void;
}



export interface TourData {
  tour: Tour;
  breadcrumbs?: Breadcrumb[],
  tours: Tour;
}

export interface PostData {
  post: Post;
  breadcrumbs?: Breadcrumb[],
  posts: Post;
}

export interface TabContentProps {
  initialTourData?: TourData;
  onSubmit: (data: TourData) => void;
  onDelete: () => void;
  singleTour: boolean;
}

export interface ImageResource {
  asset_id: string;
  secure_url: string;
  id: string;
  display_name: string;
  description: string;
  url: string;
  uploadedAt: Date;
  resource_type: string;
  title: string;
  tags: string[];
  original_filename: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  created_at: Date;
  pages: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  asset_folder: string;
  api_key: string;
}

export interface GalleryDocument {
  user: string;
  images: ImageResource[];
  videos: ImageResource[];
  PDF: ImageResource[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GalleryItem {
  _id?: string;
  id?: string;
  image: string;
  alt?: string;
  sortOrder?: number;
  isFeatured?: boolean;
  public_id?: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at?: string | Date;
  bytes?: number;
  secure_url?: string;
}

export interface CategoryData {
  _id: string;
  id: string | null;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  userId: string;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export interface FactData {
  name: string
  title?: string
  id?: string
  field_type?: string
  label: string
  icon?: string
  value: string
}

export interface FaqData {
  _id: string;
  id: string;
  question: string;
  answer: string;
  userId: string;
}

export interface ItineraryItem {
  day?: string;
  title?: string;
  description?: string;
  dateTime?: Date;
  date?: string | Date;
  destination?: string;
}

export interface Itinerary {
  outline?: string;
  options?: ItineraryItem[];
}






