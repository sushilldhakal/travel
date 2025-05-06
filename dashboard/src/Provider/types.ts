export interface Author {
    _id: string;
    name: string;
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
  include?: string;
  exclude?: string;
  outline?: string;
  itinerary?: Itinerary[];
  facts?: FactData[];
  faqs?: FaqData[];
  dates?: TourDates;
  dates_string?: string;
  booking_close?: string;
  featured?: boolean;
  category?: Category[];
  destination?: string;
  location?: location;
  map?: string;
  pricePerType?: "person" | "group";
  basePrice?: number;
  minSize?: number;
  maxSize?: number;
  groupSize?: number;
  discountEnabled?: boolean;
  discountPrice?: number;
  discountDateRange?: DiscountDateRange;
  pricingOptionsEnabled?: boolean;
  pricingOptions?: {
    optionName: string;
    optionDescription?: string;
    optionPrice: number;
  }[];
  fixedDeparture?: boolean;
  multipleDates?: boolean;
  tourDates?: TourDate[];
  fixedDate?: Date;
  dateRanges?: {
    startDate: Date;
    endDate: Date;
    recurring?: boolean;
  }[];
  createdAt?: string;
  updatedAt?: string;
  enquiry?: boolean;
  tabsDisplay?: string[];
  downloads?: string[];
  gallery?: string[];
}

// Define the type for the Author
export interface Author {
  _id: string; // Author ID
  name: string; // Author name
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
  latitude?: number;
  longitude?: number;
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
export interface TourDates {
  tripDuration: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  roles: string;
  wishlists: string[];
  bookings: string[];
  reviews: string[];
  payment_methods: string[];
  createdAt: string;
}


export interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
      _id: string;
      name: string;
      avatar?: string;
      email?: string;
      roles?: string;
      profilePicture?: string;
  };
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
  user: {
    name: string;
    avatar?: string;
    email?: string;
    _id?: string;
  };
  createdAt: string;
  likes: number;
  views: number;
}


export interface ReviewsManagerProps {
  tourId: string;
}

export interface Category {
  categoryName: string;
  categoryId: string;
  _id?: string;
  id?: string;
  value?: string;
  label?: string;
}

export interface Breadcrumb {
  label: string;
  href?: string;
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

export interface CategoryData {
  _id: string;
  id: string | null;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  userId: string;
}

export interface FactData {
  name: string;      // Used for data from the API
  title?: string;    // Used for form input
  field_type?: string;
  value: string[] | string | { label: string; value: string }[];
  icon?: string;
}

export interface FaqData {
  _id: string;
  id: string;
  question: string;
  answer: string;
  userId: string;
}

export interface Itinerary {
  day: string;
  title: string;
  description: string;
  dateTime?: Date;
  date?: string | Date;
}

export interface TourDate {
  date: Date;
  available: boolean;
  maxParticipants?: number;
}

export interface DiscountDateRange {
  startDate: Date;
  endDate: Date;
  discountPercentage?: number;
  discountAmount?: number;
}



