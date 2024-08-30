import { JSONContent } from "novel";

export interface Author {
    _id: string;
    name: string;
}
export interface Tour {
    _id: string;
    title: string;
    description: string;
    genre: string;
    author: Author;
    coverImage: string;
    file: string;
    createdAt: string;
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
    title: string,
    description: JSONContent,
    code: string,
    tourStatus: string,
    coverImage: string,
    file: string,
    tour: string[],
    breadcrumbs: string[],
    itinerary: string[],
    price: string[],
    incExc: string[],
    facts: string[],
    gallery: string[],
    locations: string[],
    faqs: string[],
    downloads: string[],
    tabsDisplay: string[],
    enquiry: string[],
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
  id: string | null;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  userId: string;
}