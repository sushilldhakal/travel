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


  
  export interface TourData {
    title: string;
    description: string;
    // Add other fields as needed
    breadcrumbs?: Breadcrumb[];
  }
  
  export interface TabContentProps {
    initialTourData?: TourData;
    onSubmit: (data: TourData) => void;
    onDelete: () => void;
    singleTour: boolean;
  }