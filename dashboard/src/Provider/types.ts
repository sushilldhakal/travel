
export interface Author {
    _id: string;
    name: string;
}
export interface Tour {
  id:string;
    _id: string;
    title: string;
    description: string;
    genre: string;
    author: Author;
    coverImage: string;
    file: string;
    createdAt: string;
    updatedAt: string;
    code: string,
    tourStatus: string,
    tour: string[],
    outline: string,
    category: Category[],
    itinerary: Itinerary[] | undefined,
    price: number,
    include: string,
    exclude: string,
    facts: string[],
    gallery: string[],
    location: location,
    faqs: string[],
    downloads: string[],
    tabsDisplay: string[],
    enquiry: boolean,
    dates: TourDates,
    map: string,
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
  created_at: string; // Post creation date in ISO string format
  updated_at: string; // Post last updated date in ISO string format
  __v: number; // Version key for MongoDB
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
    lat: string;
    lng: string;
    street: string;
    city: string;
    state: string;
    country: string;
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
export interface Category {
  categoryName: string;
  categoryId: string;
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

export interface Itinerary {
  day: string;
    title: string;
    description: string;
    dateTime: Date | undefined;
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
  _id: string;
  id: string | null;
  name: string;
  field_type: string;
  value?: string[] | string;
  icon: string;
  userId: string;
}

export interface FaqData {
  _id: string;
  id: string | null;
  question: string;
  answer: string;
  userId: string;
}